// The painting page shows images at most ~700 CSS px wide, so 1600 px still
// looks sharp on 2x screens.
const MAX_EDGE = 1600;
const QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/**
 * Scales a photo down to at most MAX_EDGE px on its longest side and re-encodes
 * it as WebP (JPEG where WebP encoding isn't supported). Returns the original file for GIFs (to keep animation), when the
 * image can't be decoded, or when compressing wouldn't make it smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  // Flatten see-through PNGs onto white so they match in either format.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

  // Browsers that can't encode WebP (older Safari) silently hand back a PNG,
  // so check the result's type and fall back to JPEG.
  let blob = await encode("image/webp");
  if (blob?.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type: blob.type, lastModified: Date.now() });
}
