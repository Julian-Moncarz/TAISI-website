import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The link preview for every page: the lockup and the home page headline.
// Rendered once at build time. Jost is read from src/app/_fonts (OFL, see
// OFL.txt there) because the preview renderer cannot use next/font. Its
// renderer takes hex rather than oklch, so the colours are the hex values
// listed on /design-system.

export const alt = "TAISI, Toronto AI Safety Initiative";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#2B1A4D";
const HEADLINE = ["We’re a group of U of T students", "working to reduce risks from", "advanced AI."];
const MUTE = "#565360";

export default async function Image() {
  const [light, regular, mark] = await Promise.all([
    readFile(join(process.cwd(), "src/app/_fonts/jost-latin-300-normal.woff")),
    readFile(join(process.cwd(), "src/app/_fonts/jost-latin-400-normal.woff")),
    readFile(join(process.cwd(), "public/brand/taisi-mark.svg")),
  ]);
  const markSrc = `data:image/svg+xml;base64,${mark.toString("base64")}`;

  // Lockup proportions match <Lockup /> in src/components/Logo.tsx.
  const h = 96;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          padding: "80px 96px",
          fontFamily: "Jost",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={Math.round((h * 102) / 98.76)} height={h} alt="" />
          <div style={{ width: h * 0.4, display: "flex" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: h * 0.17 }}>
            <span style={{ fontWeight: 300, fontSize: h * 0.39, letterSpacing: "0.26em", lineHeight: 0.75 }}>
              TAISI
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: h * 0.15,
                letterSpacing: "0.2em",
                lineHeight: 0.8,
                textTransform: "uppercase",
                color: MUTE,
              }}
            >
              Toronto AI Safety Initiative
            </span>
          </div>
        </div>
        {/* Set line by line with non-breaking spaces: the renderer widens
            the first ordinary space in a wrapped block of text. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontWeight: 300,
            fontSize: 64,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {HEADLINE.map((line) => (
            <span key={line}>{line.replace(/ /g, "\u00a0")}</span>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Jost", data: light, weight: 300, style: "normal" },
        { name: "Jost", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
