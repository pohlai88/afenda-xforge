import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 64,
          color: "#e2e8f0",
          background:
            "radial-gradient(circle at top left, rgba(59,130,246,0.35), transparent 36%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #111827 100%)",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #0f172a, #334155)",
              color: "#f8fafc",
              fontSize: 36,
            }}
          >
            X
          </div>
          <span>XForge</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              maxWidth: 760,
              fontSize: 74,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            ERP shell for controlled finance and operations workflows.
          </div>
          <div
            style={{
              maxWidth: 680,
              fontSize: 28,
              lineHeight: 1.35,
              color: "#cbd5e1",
            }}
          >
            Supabase auth, shared design system, and a monorepo app shell tuned
            for tenant-aware execution.
          </div>
        </div>
      </div>
    ),
    size
  );
}
