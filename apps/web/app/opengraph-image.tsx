import { ImageResponse } from "next/og";

export const alt = "Opplexify custom software development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        color: "white",
        background: "radial-gradient(circle at 85% 12%, #174f8f 0%, #091421 30%, #050505 68%)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 58,
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #86bdff",
            borderRadius: 999,
            color: "#86bdff",
            fontSize: 30,
            fontWeight: 700
          }}
        >
          O
        </div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: 9 }}>OPPLEXIFY</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
        <div style={{ display: "flex", width: 88, height: 6, borderRadius: 999, background: "#2a91ff", marginBottom: 28 }} />
        <div style={{ display: "flex", fontSize: 72, lineHeight: 1.04, fontWeight: 700, letterSpacing: -3 }}>
          Custom software built around your business
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 26, color: "#c7d2df" }}>
          Websites · SaaS · Web apps · Mobile apps · Dashboards · APIs · Automation
        </div>
      </div>
    </div>,
    size
  );
}
