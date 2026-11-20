"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXAM_COUNTDOWNS = [
  {
    label: "MSÜ",
    dateIso: "2027-02-28",
    dateLabel: "28 Şub 2027",
    cardClass:
      "border-[#DCE4EE] border-t-2 border-t-[#203B5C] bg-[#FCFBF8] text-[#203B5C]",
    tagClass: "text-[#203B5C]",
    numberClass: "text-[#203B5C]",
  },
  {
    label: "TYT",
    dateIso: "2027-06-19",
    dateLabel: "19 Haz 2027",
    cardClass:
      "border-[#D5E6DD] border-t-2 border-t-[#135D43] bg-[#FCFBF8] text-[#135D43]",
    tagClass: "text-[#135D43]",
    numberClass: "text-[#135D43]",
  },
  {
    label: "AYT",
    dateIso: "2027-06-20",
    dateLabel: "20 Haz 2027",
    cardClass:
      "border-[#E5DEC9] border-t-2 border-t-[#B18A52] bg-[#FCFBF8] text-[#8A6508]",
    tagClass: "text-[#9A7438]",
    numberClass: "text-[#8A6508]",
  },
] as const;

function getRemainingDays(targetIso: string, todayUtc: number | null): number | null {
  if (todayUtc === null) return null;
  const [y, m, d] = targetIso.split("-").map(Number);
  const targetUtc = Date.UTC(y, m - 1, d);
  return Math.max(0, Math.ceil((targetUtc - todayUtc) / 86400000));
}

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface PanelSidebarProps {
  portalName: string;
  userName: string;
  userMeta: string;
  items: SidebarNavItem[];
  logoutHref?: string;
  children: React.ReactNode;
}

export function PanelSidebar({
  portalName,
  userName,
  userMeta,
  items,
  logoutHref = "/login",
  children,
}: PanelSidebarProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [todayUtc, setTodayUtc] = useState<number | null>(null);
  const [todayLabel, setTodayLabel] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setTodayUtc(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    setTodayLabel(
      now.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
      })
    );
  }, []);

  const navContent = (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-4">
          <Link href="/" className="flex flex-col gap-1.5">
            <Image
              src="/images/logo-dark.png"
              alt="DERSHANE Özel Öğretim Kursu"
              width={160}
              height={82}
              className="h-9 w-auto object-contain object-left"
            />
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
              {portalName}
            </p>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-[#737B86] hover:bg-[#F8F7F3] hover:text-[#252A32] lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="mt-5 rounded-md border border-[#E9EBEE] bg-[#F8F7F3] p-3.5">
          <p className="text-sm font-semibold text-[#203B5C]">{userName}</p>
          <p className="mt-0.5 text-xs text-[#737B86]">{userMeta}</p>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1" aria-label="Panel Menüsü">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-[#203B5C] text-white"
                    : "text-[#737B86] hover:bg-[#F8F7F3] hover:text-[#203B5C]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-[#B18A52]" : "text-[#737B86]"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1 border-t border-[#E9EBEE] pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-[#737B86] transition-colors hover:bg-[#F8F7F3] hover:text-[#203B5C]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kurumsal Siteye Dön</span>
        </Link>
        <Link
          href={logoutHref}
          className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-[#737B86] transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Çıkış Yap</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F3] text-[#252A32]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-[#E9EBEE] bg-[#FFFFFF] lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {navContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#203B5C]/30 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-72 border-r border-[#E9EBEE] bg-[#FFFFFF]">
            {navContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E9EBEE] bg-[#FFFFFF]/95 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#E9EBEE] bg-[#F8F7F3] px-3 py-1.5 text-xs font-medium text-[#203B5C]"
          >
            <Menu className="h-4 w-4" />
            <span>Menü</span>
          </button>
          <span className="text-xs font-semibold tracking-wider text-[#B18A52] uppercase">
            {portalName}
          </span>
        </header>

        {/* Exam Countdown Bar (MSÜ / TYT / AYT) + Today's Date (Fixed at top of page, scrolls naturally) */}
        {isAdmin ? (
          <div className="border-b border-[#E9EBEE] bg-[#FFFFFF] px-3 py-1.5 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#203B5C]">
                <CalendarClock className="h-3.5 w-3.5 text-[#B18A52]" />
                <span className="tracking-[0.06em] uppercase text-[#737B86]">
                  Sınav Takvimi
                </span>
                {todayLabel && (
                  <span className="rounded border border-[#E5DEC9] bg-[#FCFBF8] px-2 py-0.5 text-[10px] font-medium text-[#203B5C]">
                    {todayLabel}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {EXAM_COUNTDOWNS.map((exam) => {
                  const days = getRemainingDays(exam.dateIso, todayUtc);
                  return (
                    <div
                      key={exam.label}
                      className={cn(
                        "inline-flex items-baseline gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px]",
                        exam.cardClass
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-semibold tracking-[0.12em] uppercase",
                          exam.tagClass
                        )}
                      >
                        {exam.label}
                      </span>
                      <span className={cn("font-editorial text-sm font-semibold", exam.numberClass)}>
                        {days !== null ? days : "—"}
                      </span>
                      <span className="text-[9px] font-medium tracking-[0.08em] uppercase text-[#737B86]">
                        gün
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-[#E9EBEE] bg-[#FFFFFF] px-3 py-2 sm:px-6 sm:py-4 lg:px-10 lg:py-5">
            <div className="flex flex-col gap-2 sm:gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 xl:flex-col xl:items-start xl:justify-center xl:gap-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-[#203B5C] sm:text-sm">
                  <CalendarClock className="h-4 w-4 text-[#B18A52] sm:h-4.5 sm:w-4.5" />
                  <span className="tracking-[0.12em] uppercase text-[#737B86]">
                    Sınavlara Kalan Süre
                  </span>
                </div>
                {todayLabel && (
                  <span className="inline-flex items-center rounded-md border border-[#E5DEC9] bg-[#FCFBF8] px-2.5 py-0.5 text-[10px] font-medium text-[#203B5C] sm:px-3 sm:py-1 sm:text-xs">
                    {todayLabel}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 xl:flex xl:items-stretch xl:gap-4">
                {EXAM_COUNTDOWNS.map((exam) => {
                  const days = getRemainingDays(exam.dateIso, todayUtc);
                  return (
                    <div
                      key={exam.label}
                      className={cn(
                        "flex flex-col items-center justify-between gap-0.5 rounded-lg border px-2 py-1.5 sm:flex-row sm:gap-5 sm:px-6 sm:py-3.5 xl:min-w-[215px] xl:px-7 xl:py-4",
                        exam.cardClass
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5 sm:items-start">
                        <span
                          className={cn(
                            "text-[10px] font-semibold tracking-[0.16em] uppercase sm:text-xs",
                            exam.tagClass
                          )}
                        >
                          {exam.label}
                        </span>
                        <span className="hidden text-[11px] font-normal text-[#737B86] sm:inline">
                          {exam.dateLabel}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 sm:gap-1.5">
                        <span
                          className={cn(
                            "font-editorial text-lg font-semibold leading-none tracking-tight sm:text-4xl lg:text-[42px]",
                            exam.numberClass
                          )}
                        >
                          {days !== null ? days : "—"}
                        </span>
                        <span className="text-[9px] font-medium tracking-[0.12em] uppercase text-[#737B86] sm:text-xs">
                          gün
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-3 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
