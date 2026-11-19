"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Akademik Yaklaşım", href: "/yaklasim" },
  { label: "Başarılar", href: "/basarilar" },
  { label: "Ders Paketleri", href: "/programlar" },
  { label: "İletişim", href: "/iletisim" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-gradient-to-r from-[#0D2558] via-[#163B82] to-[#1D4E9E] backdrop-blur-md">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#D4AF7A]/40 via-[#E8C483] to-[#D4AF7A]/40" />
      <div className="flex h-20 w-full items-center justify-between gap-2 px-4 sm:h-24 sm:px-8 lg:h-28 lg:px-14">
        {/* Far Left: White DERSHANE Logo on Navy */}
        <Link href="/" className="group flex shrink-0 items-center">
          <Image
            src="/images/logo-light.png"
            alt="DERSHANE Özel Öğretim Kursu"
            width={340}
            height={174}
            className="h-12 w-auto object-contain transition-opacity group-hover:opacity-90 sm:h-20 lg:h-24"
            priority
          />
        </Link>

        {/* Center: Cohesive Editorial Menu Links */}
        <nav
          className="hidden items-center gap-8 md:flex lg:gap-12 xl:gap-14"
          aria-label="Ana Menü"
        >
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-2 text-[15px] font-medium tracking-wide transition-colors duration-150 lg:text-base",
                  isActive
                    ? "text-white"
                    : "text-white/80 hover:text-white"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute right-0 -bottom-[2px] left-0 h-[2px] bg-[#E8C483]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Far Right: Social Links + Refined Champagne-Gold Kampüse Giriş Pill */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Desktop Social Media Links */}
          <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-xs xl:flex">
            <a
              href="https://instagram.com/dershane"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram @dershane"
              className="text-white/85 transition-colors hover:text-[#E8C483]"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com/dershane"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook @dershane"
              className="text-white/85 transition-colors hover:text-[#E8C483]"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-white/90">
              @dershane
            </span>
          </div>

          <Link
            href="/login"
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-200 sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm",
              pathname === "/login"
                ? "border-[#F5DFB0] bg-[#F2D59B] text-[#0D2558] shadow-[0_6px_22px_rgba(232,196,131,0.4)]"
                : "border-[#E8C483]/70 bg-gradient-to-r from-[#E8C483] via-[#F2D59B] to-[#D4AF7A] text-[#0D2558] shadow-[0_4px_16px_rgba(232,196,131,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,196,131,0.42)] hover:brightness-105"
            )}
          >
            <GraduationCap className="h-3.5 w-3.5 text-[#0D2558] transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4" />
            <span>Kampüse Giriş</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
            aria-label="Menüyü aç/kapat"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/15 bg-[#0D2558] px-5 py-4 md:hidden">
          <nav className="flex flex-col divide-y divide-white/10">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium text-white/90 transition-colors hover:text-[#E8C483]"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3 text-white/85">
              <a
                href="https://instagram.com/dershane"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram @dershane"
                className="transition-colors hover:text-[#E8C483]"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/dershane"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook @dershane"
                className="transition-colors hover:text-[#E8C483]"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <span className="text-xs font-medium text-white/90">
                @dershane
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
