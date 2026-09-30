"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import EmailSignupModal from "./EmailSignupModal";
import { signupSource } from "@/lib/subscribe";

/**
 * The home page's query-string behaviour for printed QR codes: ?loc= logs a
 * scan to the QR Scans table, and ?signup=1 opens the mailing list dialog.
 * Split out so the rest of the home page can render on the server.
 */
export default function HomeQueryEffects() {
  const params = useSearchParams();
  const location = params.get("loc") || null;
  const showSignup = params.get("signup") === "1";
  const tracked = useRef(false);

  useEffect(() => {
    if (!location || tracked.current) return;
    tracked.current = true;
    fetch("/api/qr-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    }).catch(() => {});
  }, [location]);

  return showSignup ? <EmailSignupModal source={signupSource(location)} /> : null;
}
