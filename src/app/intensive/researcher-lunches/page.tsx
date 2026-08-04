"use client";

import { useEffect, useRef, useState } from "react";
import { FormField } from "@/components/FormControls";

type DateStatus = "" | "yes" | "maybe";

const COHORTS = [
  {
    month: "June 2026",
    pairs: [
      {
        id: "jun-sat",
        label: "Saturdays",
        dates: [
          { day: "6",  month: "Jun", field: "Jun6"  },
          { day: "13", month: "Jun", field: "Jun13" },
          { day: "20", month: "Jun", field: "Jun20" },
          { day: "27", month: "Jun", field: "Jun27" },
        ],
      },
      {
        id: "jun-sun",
        label: "Sundays",
        dates: [
          { day: "7",  month: "Jun", field: "Jun7"  },
          { day: "14", month: "Jun", field: "Jun14" },
          { day: "21", month: "Jun", field: "Jun21" },
          { day: "28", month: "Jun", field: "Jun28" },
        ],
      },
    ],
  },
  {
    month: "July 2026",
    pairs: [
      {
        id: "jul-sat",
        label: "Saturdays",
        dates: [
          { day: "4",  month: "Jul", field: "Jul4"  },
          { day: "11", month: "Jul", field: "Jul11" },
          { day: "18", month: "Jul", field: "Jul18" },
          { day: "25", month: "Jul", field: "Jul25" },
        ],
      },
      {
        id: "jul-sun",
        label: "Sundays",
        dates: [
          { day: "5",  month: "Jul", field: "Jul5"  },
          { day: "12", month: "Jul", field: "Jul12" },
          { day: "19", month: "Jul", field: "Jul19" },
          { day: "26", month: "Jul", field: "Jul26" },
        ],
      },
    ],
  },
];

const ALL_FIELDS = COHORTS.flatMap(m => m.pairs.flatMap(p => p.dates.map(d => d.field)));

export default function ResearcherLunches() {
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [org,      setOrg]      = useState("");
  const [avail,    setAvail]    = useState<Record<string, DateStatus>>(
    () => Object.fromEntries(ALL_FIELDS.map(f => [f, "" as DateStatus]))
  );
  const [counts,   setCounts]   = useState<Record<string, number>>(
    () => Object.fromEntries(ALL_FIELDS.map(f => [f, 0]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [editLink,   setEditLink]   = useState("");
  const [saved,      setSaved]      = useState(false);
  const [isEditing,  setIsEditing]  = useState(false);

  const tokenRef    = useRef<string | null>(null);
  const recordIdRef = useRef<string | null>(null);
  const copyBtnRef  = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    const url   = token ? `/api/lunches?token=${encodeURIComponent(token)}` : "/api/lunches";

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.counts) setCounts(data.counts);
        if (data.record) {
          const f = data.record.fields as Record<string, string>;
          setName(f.Name  ?? "");
          setEmail(f.Email ?? "");
          setOrg(f.Organization ?? "");
          setAvail(prev => {
            const next = { ...prev };
            for (const field of ALL_FIELDS) next[field] = (f[field] as DateStatus) ?? "";
            return next;
          });
          tokenRef.current    = token;
          recordIdRef.current = data.record.id as string;
          setIsEditing(true);
          setEditLink(`${window.location.origin}${window.location.pathname}?token=${token}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function cycleDate(field: string) {
    setAvail(prev => ({
      ...prev,
      [field]: prev[field] === "" ? "yes" : prev[field] === "yes" ? "maybe" : "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim())  return setError("Please enter your name.");
    if (!email.trim() || !email.includes("@")) return setError("Please enter a valid email address.");

    setSubmitting(true);

    try {
      const isUpdate = !!recordIdRef.current;
      const token    = tokenRef.current ?? crypto.randomUUID();

      const res = await fetch("/api/lunches", {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isUpdate
            ? { recordId: recordIdRef.current, name: name.trim(), email: email.trim(), org: org.trim(), availability: avail }
            : { name: name.trim(), email: email.trim(), org: org.trim(), availability: avail, token }
        ),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();

      if (!isUpdate) {
        tokenRef.current    = token;
        recordIdRef.current = data.id as string;
      }

      const link = `${window.location.origin}${window.location.pathname}?token=${token}`;
      setEditLink(link);
      setSaved(true);
      setIsEditing(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(editLink).then(() => {
      if (!copyBtnRef.current) return;
      copyBtnRef.current.textContent = "Copied!";
      setTimeout(() => { if (copyBtnRef.current) copyBtnRef.current.textContent = "Copy link"; }, 2000);
    });
  }

  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">

        <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] leading-[0.98] tracking-normal mb-4 sm:mb-5 font-semibold">
          Researcher <span className="text-accent">lunch availability</span>
        </h1>

        <div className="max-w-[620px] text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary space-y-3 mb-8">
          <p>
            TAISI cohorts share a free lunch with researchers and Trajectory Labs staff once a week
            throughout the summer. There are six cohorts — two per month, one running on Saturdays
            and one on Sundays.
          </p>
          <p>
            <strong className="text-text">Click a date to mark it:</strong>{" "}
            once for <span className="font-semibold text-accent">yes</span>, again
            for <span className="font-semibold text-accent/60">maybe</span>, again to clear.
            The number in the corner shows how many others have already said yes.
          </p>
        </div>

        {loading ? (
          <p className="text-[15px] text-text-secondary">Loading availability data…</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* ── Edit mode banner ──────────────────────────────────────── */}
            {isEditing && !saved && (
              <div className="mb-8 border border-black/15 p-4 sm:p-5 max-w-[640px]">
                <p className="text-[14px] text-text-secondary leading-[1.6]">
                  <strong className="text-text">Editing your response.</strong>{" "}
                  Update your selections and click <em>Update response</em> to save.
                </p>
              </div>
            )}

            {/* ── Info fields ───────────────────────────────────────────── */}
            <div className="max-w-[640px] mb-10">
              <div className="grid sm:grid-cols-3 gap-4">
                <FormField label="Name" required>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </FormField>
                <FormField label="Email" required>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </FormField>
                <FormField label="Organization">
                  <input
                    type="text"
                    className="form-input"
                    value={org}
                    onChange={e => setOrg(e.target.value)}
                    placeholder="Trajectory Labs, etc."
                  />
                </FormField>
              </div>
            </div>

            {/* ── Date grid ─────────────────────────────────────────────── */}
            <div className="max-w-[900px] space-y-8 mb-10">
              {COHORTS.map(monthGroup => (
                <div key={monthGroup.month}>
                  <h2 className="section-header mb-4">{monthGroup.month}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {monthGroup.pairs.map(cohort => (
                      <div key={cohort.id} className="border border-black/10 p-4 sm:p-5">
                        <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-widest mb-3">
                          {cohort.label}
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {cohort.dates.map(d => (
                            <DateSquare
                              key={d.field}
                              day={d.day}
                              month={d.month}
                              status={avail[d.field]}
                              count={counts[d.field] ?? 0}
                              onClick={() => cycleDate(d.field)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <div className="max-w-[640px] space-y-4">
              {error && (
                <p className="text-[14px] text-accent">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="primary-cta px-8 py-3 text-[15px]"
              >
                {submitting
                  ? "Saving…"
                  : isEditing
                  ? "Update response"
                  : "Submit availability"}
              </button>

              {saved && editLink && (
                <div className="mt-2 border border-black/15 p-4 sm:p-5">
                  <p className="text-[14px] font-semibold text-text mb-1">
                    {isEditing ? "Response updated ✓" : "Response saved ✓"}
                  </p>
                  <p className="text-[13px] text-text-secondary mb-3">
                    Use this link to update your availability at any time:
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[11px] text-text break-all flex-1 leading-relaxed">
                      {editLink}
                    </span>
                    <button
                      ref={copyBtnRef}
                      type="button"
                      onClick={copyLink}
                      className="primary-cta px-4 py-2 text-[13px] shrink-0"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              )}
            </div>

          </form>
        )}
      </section>
    </main>
  );
}

function DateSquare({
  day, month, status, count, onClick,
}: {
  day: string;
  month: string;
  status: DateStatus;
  count: number;
  onClick: () => void;
}) {
  const isYes   = status === "yes";
  const isMaybe = status === "maybe";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative aspect-square flex flex-col items-center justify-center",
        "border transition-colors duration-100 select-none cursor-pointer",
        isYes
          ? "bg-accent border-accent text-white"
          : isMaybe
          ? "bg-accent/15 border-accent/30 text-accent"
          : "bg-white border-black/20 text-text hover:bg-gray-50",
      ].join(" ")}
    >
      <span className="text-[0.9rem] font-semibold leading-none">{day}</span>
      <span className={[
        "text-[0.58rem] font-medium mt-[3px]",
        isYes ? "text-white/75" : isMaybe ? "text-accent/70" : "text-text-secondary",
      ].join(" ")}>
        {month}
      </span>
      {count > 0 && (
        <span className={[
          "absolute top-[3px] right-[5px] text-[0.58rem] font-bold tabular-nums",
          isYes ? "text-white/75" : isMaybe ? "text-accent/70" : "text-text-secondary",
        ].join(" ")}>
          {count}
        </span>
      )}
    </button>
  );
}
