"use client";

// Last resort when even the site layout fails (app/error.tsx can't catch
// that), so it brings its own <html> and plain styles.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fbf5f3",
          color: "#000022",
          textAlign: "center",
          padding: "96px 16px",
        }}
      >
        <title>Server busy | justpaint</title>
        <h1 style={{ fontSize: 28 }}>The server is busy</h1>
        <p>We can&apos;t load justpaint right now. Try again in a few minutes.</p>
        <button
          onClick={() => retry()}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            border: 0,
            borderRadius: 999,
            background: "#c42847",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
