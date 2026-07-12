"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const links = [
  { href: "/", label: "Home" },
  { href: "/summer-intensive", label: "Summer Intensive" },
  { href: "/fellowships", label: "Fellowships" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-[100] border-b border-black/10 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-16 lg:px-24">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="TAISI"
              width={155}
              height={193}
              priority
              className="h-[28px] w-auto translate-y-[2px] sm:h-[32px]"
            />

            <span className="text-[15px] font-normal tracking-tight text-text sm:text-[17px]">
              Toronto AI Safety Initiative
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-[15px] font-medium md:flex">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`nav-link ${
                    isActive
                      ? "nav-link-active"
                      : "text-text-secondary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="relative z-[100] -mr-2 p-2 md:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[90] bg-white pt-[76px] md:hidden">
            <div className="flex flex-col gap-3 px-5 pt-6 text-[17px] font-medium">
              {links.map(({ href, label }) => {
                const isActive = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`mobile-nav-link ${
                      isActive
                        ? "mobile-nav-link-active"
                        : "text-text-secondary"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
