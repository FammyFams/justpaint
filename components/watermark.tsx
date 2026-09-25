// Sits over a painting image. Place inside a `relative` container. Also keeps
// right-click "Save image as" off the image itself, since the overlay catches it.
export function Watermark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex select-none items-center justify-center overflow-hidden"
    >
      <span
        className={`-rotate-30 whitespace-nowrap font-heading italic tracking-tight text-white/45 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)] ${
          size === "sm" ? "text-2xl" : "text-5xl sm:text-6xl"
        }`}
      >
        justpaint.art
      </span>
    </div>
  );
}
