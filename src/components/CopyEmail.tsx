"use client";

import { useState } from "react";

// The address is copied rather than opening a mail client: most people are
// not set up to handle a mailto link, and this works the same everywhere.
export default function CopyEmail({ email, name }: { email: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard access is refused outside a secure context, so fall back
      // to a hidden field and the old copy command.
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
      } catch {}
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="icon-btn"
        aria-label={`Copy email address for ${name}`}
        title={copied ? "Copied" : email}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
            <rect x="2.5" y="5" width="19" height="14" />
            <path d="M3 6l9 7 9-7" />
          </svg>
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? `${email} copied` : ""}
      </span>
    </>
  );
}
