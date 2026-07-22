"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, margin: 0 }}>Zaypoll couldn’t start</h1>
            <p style={{ color: "#666", margin: "8px 0 24px" }}>Please refresh or try again in a moment.</p>
            <button onClick={reset} style={{ border: 0, borderRadius: 8, background: "#171717", color: "white", padding: "10px 16px", cursor: "pointer" }}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
