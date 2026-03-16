import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }) {
  const category = params.category
    ?.replace(/-/g, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = params.slug
    .replace(/-/g, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#020617",
        color: "white",
      }}
    >
      {/* Category */}
      <div
        style={{
          fontSize: 28,
          marginTop: 30,
          color: "#4ade80",
          textTransformm: "uppercase",
        }}
      >
        {category}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          maxWidth: "900px",
          textAlign: "center",
        }}
      >
        {title}
      </div>

      {/* Brand */}
      <div
        style={{
          marginTop: 40,
          fontSize: 36,
          color: "#4ade80",
        }}
      >
        ShedBody
      </div>
    </div>,
    { ...size },
  );
}
