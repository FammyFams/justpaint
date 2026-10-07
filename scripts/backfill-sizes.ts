// Makes the 640 and 256 copies (lib/painting-sizes.ts) for paintings posted
// before uploads made them. Safe to run again: copies that already exist are
// skipped. From the repo root, with the live keys in .env.local:
//   node --env-file=.env.local scripts/backfill-sizes.ts --dry-run   (count only)
//   node --env-file=.env.local scripts/backfill-sizes.ts
import { createClient } from "@supabase/supabase-js";
import { SMALL_WIDTHS, sizedImagePath } from "../lib/painting-sizes.ts";
import { makeSmallCopies } from "../lib/resize-painting.ts";
import type { Database } from "../lib/supabase/database.types.ts";

const dryRun = process.argv.includes("--dry-run");
const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const bucket = admin.storage.from("paintings");

const paths: string[] = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await admin
    .from("paintings")
    .select("image_path")
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  paths.push(...data.map((p) => p.image_path));
  if (data.length < 1000) break;
}

// Files already in each painting's folder, so finished paintings cost no
// download.
const folderOf = (path: string) => path.split("/").slice(0, -1).join("/");
const existing = new Set<string>();
for (const folder of new Set(paths.map(folderOf))) {
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await bucket.list(folder, { limit: 100, offset });
    if (error) throw error;
    for (const file of data) existing.add(folder ? `${folder}/${file.name}` : file.name);
    if (data.length < 100) break;
  }
}

const todo = paths.filter((p) => SMALL_WIDTHS.some((w) => !existing.has(sizedImagePath(p, w))));
console.log(`${paths.length} paintings, ${todo.length} need copies.`);

let failed = 0;
for (const [i, path] of (dryRun ? [] : todo).entries()) {
  const copyPaths = SMALL_WIDTHS.map((w) => sizedImagePath(path, w));
  try {
    const { data: file, error } = await bucket.download(path);
    if (error) throw error;
    const copies = await makeSmallCopies(Buffer.from(await file.arrayBuffer()), SMALL_WIDTHS);
    for (const copy of copies) {
      const { error: uploadError } = await bucket.upload(sizedImagePath(path, copy.width), copy.data, {
        contentType: "image/webp",
        upsert: true,
      });
      if (uploadError) throw uploadError;
    }
    // A painting deleted while this ran mustn't leave copies behind.
    const { data: still } = await admin
      .from("paintings")
      .select("id")
      .eq("image_path", path)
      .maybeSingle();
    if (!still) await bucket.remove(copyPaths);
    console.log(`${i + 1}/${todo.length} ${path}${still ? "" : " (deleted meanwhile, copies removed)"}`);
  } catch (e) {
    failed++;
    console.error(`${i + 1}/${todo.length} ${path} failed:`, e);
  }
}
if (failed) {
  console.error(`${failed} failed. Run it again to retry them.`);
  process.exitCode = 1;
}
