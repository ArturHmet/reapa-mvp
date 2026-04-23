import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "REAPA Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at top right, #1e3a5f 0%, #0f172a 60%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            REAPA
          </div>
          <div
            style={{
              background: "rgba(99,102,241,0.3)",
              border: "1px solid rgba(99,102,241,0.5)",
              borderRadius: "8px",
              padding: "6px 14px",
              color: "#a5b4fc",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            BLOG
          </div>
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            maxWidth: "900px",
            position: "relative",
          }}
        >
          AI Insights for Malta Real Estate Agents
        </div>
        <div
          style={{
            marginTop: "32px",
            color: "#94a3b8",
            fontSize: "20px",
            position: "relative",
          }}
        >
          reapa-mvp.vercel.app/blog
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
