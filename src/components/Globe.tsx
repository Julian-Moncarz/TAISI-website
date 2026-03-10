"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

const MARKERS = [
  { location: [43.6532, -79.3832] as [number, number], size: 0.07 }, // Toronto
  { location: [42.3601, -71.0589] as [number, number], size: 0.05 }, // Boston (MIT/Harvard)
  { location: [52.2053, 0.1218] as [number, number], size: 0.05 },   // Cambridge UK
];

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    let phi = 3.8; // start facing North America
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [1, 1, 1],
      markerColor: [0.85, 0.31, 0.19], // accent #D94F30
      glowColor: [0.92, 0.92, 0.92],
      markers: MARKERS,
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003;

        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="flex justify-center -mt-8 md:-mt-12 pb-16 md:pb-24">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[420px] aspect-square"
        style={{ contain: "layout" }}
      />
    </div>
  );
}
