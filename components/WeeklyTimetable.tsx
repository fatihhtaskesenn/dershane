"use client";

import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Clock,
  Coffee,
  GraduationCap,
  MapPin,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { WeekDay } from "@/lib/campus-store";

export const TIMETABLE_DAYS: WeekDay[] = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export const PRESET_SUBJECTS = [
  "Matematik",
  "Geometri",
  "Türkçe",
  "Edebiyat",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
  "Genel Deneme",
  "Rehberlik",
] as const;

export const EXAM_LEVELS = ["TYT", "AYT", "TYT / AYT"] as const;

export function doesTeacherMatchSubject(
  teacherBranch: string,
  subject: string
): boolean {
  const b = teacherBranch.toLowerCase();
  const s = subject.toLowerCase();

  if (s === "genel deneme") return false;
  if (s === "rehberlik") {
    return b.includes("rehberlik") || b.includes("danışman") || b.includes("koçluk");
  }
  if (s === "matematik") return b.includes("matematik");
  if (s === "geometri") return b.includes("geometri");
  if (s === "türkçe") return b.includes("türkçe") || b.includes("paragraf");
  if (s === "edebiyat") return b.includes("edebiyat");
  if (s === "fizik") return b.includes("fizik");
  if (s === "kimya") return b.includes("kimya");
  if (s === "biyoloji") return b.includes("biyoloji");
  if (s === "tarih") return b.includes("tarih");
  if (s === "coğrafya") return b.includes("coğrafya");
  if (s === "felsefe") return b.includes("felsefe");
  if (s === "din kültürü") return b.includes("din");

  return b.includes(s);
}

function formatTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function buildDailySlots(lunchBreakMinutes: 50 | 60): {
  slots: string[];
  lunchLabel: string;
} {
  const morning: string[] = [];
  let cursor = 8 * 60; // 08:00
  // Morning 5 lessons: 08:00 -> 12:00 (40 min lesson + 10 min break)
  while (cursor + 40 <= 12 * 60) {
    morning.push(`${formatTime(cursor)} - ${formatTime(cursor + 40)}`);
    cursor += 50;
  }

  const lunchStart = 12 * 60;
  const lunchEnd = lunchStart + lunchBreakMinutes;
  const lunchLabel = `${formatTime(lunchStart)} - ${formatTime(lunchEnd)}`;

  const afternoon: string[] = [];
  cursor = lunchEnd;
  // Afternoon lessons: 40 min lesson + 10 min break until ~21:00
  while (cursor + 40 <= 21 * 60 + 10) {
    afternoon.push(`${formatTime(cursor)} - ${formatTime(cursor + 40)}`);
    cursor += 50;
  }

  return {
    slots: [...morning, ...afternoon],
    lunchLabel,
  };
}

export const ALL_PRESET_TIME_SLOTS: string[] = Array.from(
  new Set([
    ...buildDailySlots(50).slots,
    ...buildDailySlots(60).slots,
  ])
).sort((a, b) => a.localeCompare(b));

export type TimetableBadgeType =
  | "Konu Anlatımı"
  | "Soru Çözümü"
  | "Etüt"
  | "Deneme"
  | "Sınıf Dersi"
  | "Birebir";

export interface TimetableItem {
  id: string;
  day: WeekDay;
  time: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: TimetableBadgeType | string;
  blockPeriod?: "morning" | "afternoon";
  onDelete?: () => void;
}

const BADGE_STYLES: Record<string, string> = {
  "Konu Anlatımı": "bg-[#EEF3F9] text-[#11284B] border-[#C9D8EA]",
  "Sınıf Dersi": "bg-[#EEF3F9] text-[#11284B] border-[#C9D8EA]",
  "Soru Çözümü": "bg-[#EAF6F0] text-[#0E4D3A] border-[#BBE0CE]",
  Etüt: "border-l-4 border-l-[#7C3AED] border-[#DDD6FE] bg-[#F5F3FF] text-[#4C1D95]",
  Birebir: "border-l-4 border-l-[#7C3AED] border-[#DDD6FE] bg-[#F5F3FF] text-[#4C1D95]",
  Deneme: "bg-[#FDF0ED] text-[#9A3412] border-[#F5C6BA]",
};

interface WeeklyTimetableProps {
  items: TimetableItem[];
  editable?: boolean;
  selectedDay?: WeekDay;
  selectedTime?: string;
  onSelectSlot?: (day: WeekDay, time: string) => void;
}

export function WeeklyTimetable({
  items,
  editable = false,
  selectedDay,
  selectedTime,
  onSelectSlot,
}: WeeklyTimetableProps) {
  const [lunchBreak, setLunchBreak] = useState<50 | 60>(50);

  const { timetableRows, lunchLabel } = useMemo(() => {
    const generated = buildDailySlots(lunchBreak);
    const set = new Set<string>(generated.slots);
    items.forEach((slot) => {
      if (!slot.blockPeriod && slot.time.trim()) set.add(slot.time.trim());
    });
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    return { timetableRows: sorted, lunchLabel: generated.lunchLabel };
  }, [items, lunchBreak]);

  const lunchInsertIndex = useMemo(() => {
    return timetableRows.findIndex((row) => row >= "12:00");
  }, [timetableRows]);

  const morningRowCount = lunchInsertIndex > 0 ? lunchInsertIndex : 5;
  const afternoonRowCount =
    lunchInsertIndex >= 0
      ? timetableRows.length - lunchInsertIndex
      : timetableRows.length;

  return (
    <div className="space-y-3">
      {/* Schedule Meta & Lunch Break Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#FAF8F5] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-[#475569]">
          <Clock className="h-3.5 w-3.5 text-[#11284B]" />
          <span>
            <strong className="text-[#11284B]">08:00 – 21:00</strong> · 40 dk Ders / 10 dk Teneffüs
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B]">
            <Coffee className="h-3.5 w-3.5 text-[#B8860B]" />
            Öğle Molası (12:00–13:00):
          </span>
          <div className="inline-flex rounded-lg border border-[#DCE4EE] bg-white p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setLunchBreak(50)}
              className={`rounded-md px-2.5 py-1 transition ${
                lunchBreak === 50
                  ? "bg-[#11284B] text-white"
                  : "text-[#64748B] hover:text-[#11284B]"
              }`}
            >
              50 dk (12:00 - 12:50)
            </button>
            <button
              type="button"
              onClick={() => setLunchBreak(60)}
              className={`rounded-md px-2.5 py-1 transition ${
                lunchBreak === 60
                  ? "bg-[#11284B] text-white"
                  : "text-[#64748B] hover:text-[#11284B]"
              }`}
            >
              60 dk (12:00 - 13:00)
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#DCE4EE] bg-white">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#DCE4EE] bg-[#11284B] text-white">
              <th className="w-32 px-3 py-3 text-[11px] font-bold uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#D4AF37]" /> Saat
                </span>
              </th>
              {TIMETABLE_DAYS.map((day) => (
                <th
                  key={day}
                  className="border-l border-white/10 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {timetableRows.map((timeRow, idx) => (
              <React.Fragment key={timeRow}>
                {idx === lunchInsertIndex && (
                  <tr className="bg-[#FFFDF7]">
                    <td className="px-3 py-2 text-xs font-bold text-[#8A6508] whitespace-nowrap">
                      {lunchLabel}
                    </td>
                    <td
                      colSpan={TIMETABLE_DAYS.length}
                      className="border-l border-[#F2DC9B]/60 px-4 py-2 text-center text-xs font-semibold text-[#8A6508]"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Coffee className="h-3.5 w-3.5" />
                        Öğle Molası ({lunchBreak} Dakika)
                      </span>
                    </td>
                  </tr>
                )}
                <tr className="align-top">
                  <td className="bg-[#FAF8F5] px-3 py-2.5 text-xs font-bold text-[#11284B] whitespace-nowrap">
                    {timeRow}
                  </td>
                  {TIMETABLE_DAYS.map((day) => {
                    const morningBlock = items.find(
                      (slot) =>
                        slot.day === day && slot.blockPeriod === "morning"
                    );
                    const afternoonBlock = items.find(
                      (slot) =>
                        slot.day === day && slot.blockPeriod === "afternoon"
                    );

                    const isMorningRow = idx < lunchInsertIndex;
                    const isAfternoonRow = idx >= lunchInsertIndex;

                    if (isMorningRow && morningBlock) {
                      if (idx > 0) return null;
                      return (
                        <td
                          key={day}
                          rowSpan={morningRowCount}
                          className="min-w-[130px] border-l border-[#E2E8F0] p-1.5 align-middle"
                        >
                          <div className="relative flex h-full min-h-[250px] flex-col items-center justify-center rounded-xl border-2 border-[#F5C6BA] bg-[#FDF0ED] p-3 text-center text-[#9A3412] shadow-xs">
                            {morningBlock.onDelete && (
                              <button
                                type="button"
                                onClick={morningBlock.onDelete}
                                title="Deneme Bloğunu Kaldır"
                                className="absolute top-2 right-2 rounded p-1 text-[#9A3412]/70 transition hover:bg-white hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9A3412] shadow-2xs">
                              Öğleden Önce • Deneme
                            </span>
                            <p className="mt-2.5 text-sm font-bold leading-snug">
                              {morningBlock.title}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold opacity-85">
                              08:00 – 12:00 (Tüm Sabah Slotları)
                            </p>
                            {morningBlock.subtitle && (
                              <p className="mt-2 flex items-center justify-center gap-1 text-[11px] opacity-80">
                                <GraduationCap className="h-3 w-3 shrink-0" />
                                <span>{morningBlock.subtitle}</span>
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    }

                    if (isAfternoonRow && afternoonBlock) {
                      if (idx > lunchInsertIndex) return null;
                      return (
                        <td
                          key={day}
                          rowSpan={afternoonRowCount}
                          className="min-w-[130px] border-l border-[#E2E8F0] p-1.5 align-middle"
                        >
                          <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border-2 border-[#F5C6BA] bg-[#FDF0ED] p-3 text-center text-[#9A3412] shadow-xs">
                            {afternoonBlock.onDelete && (
                              <button
                                type="button"
                                onClick={afternoonBlock.onDelete}
                                title="Deneme Bloğunu Kaldır"
                                className="absolute top-2 right-2 rounded p-1 text-[#9A3412]/70 transition hover:bg-white hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9A3412] shadow-2xs">
                              Öğleden Sonra • Deneme
                            </span>
                            <p className="mt-2.5 text-sm font-bold leading-snug">
                              {afternoonBlock.title}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold opacity-85">
                              {lunchBreak === 50 ? "12:50" : "13:00"} – 21:00 (Tüm Öğleden Sonra)
                            </p>
                            {afternoonBlock.subtitle && (
                              <p className="mt-2 flex items-center justify-center gap-1 text-[11px] opacity-80">
                                <GraduationCap className="h-3 w-3 shrink-0" />
                                <span>{afternoonBlock.subtitle}</span>
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    }

                    const cellSlots = items.filter(
                      (slot) =>
                        !slot.blockPeriod &&
                        slot.day === day &&
                        slot.time.trim() === timeRow
                    );
                    const isSelected =
                      editable &&
                      selectedDay === day &&
                      selectedTime?.trim() === timeRow;

                    return (
                      <td
                        key={day}
                        className={`min-w-[130px] border-l border-[#E2E8F0] p-1.5 transition-colors ${
                          isSelected
                            ? "bg-[#EAF6F0]/70 ring-2 ring-inset ring-[#0E4D3A]"
                            : ""
                        }`}
                      >
                        {cellSlots.length === 0 ? (
                          editable ? (
                            <button
                              type="button"
                              onClick={() => onSelectSlot?.(day, timeRow)}
                              title={`${day} ${timeRow} seç`}
                              className={`flex h-12 w-full items-center justify-center gap-1 rounded-lg text-[11px] transition ${
                                isSelected
                                  ? "border-2 border-[#0E4D3A] bg-white font-bold text-[#0E4D3A] shadow-xs"
                                  : "border border-dashed border-transparent text-[#94A3B8] hover:border-[#11284B]/25 hover:bg-[#FAF8F5] hover:text-[#11284B]"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Seçili Slot</span>
                                </>
                              ) : (
                                <span>+ Ders Seç</span>
                              )}
                            </button>
                          ) : (
                            <div className="flex h-11 items-center justify-center text-xs text-[#CBD5E1]">
                              —
                            </div>
                          )
                        ) : (
                          <div className="space-y-1.5">
                            {cellSlots.map((slot) => {
                              const isOneOnOne =
                                slot.badge === "Birebir" ||
                                slot.badge === "Etüt" ||
                                slot.title.toLowerCase().includes("birebir");
                              const style =
                                BADGE_STYLES[
                                  isOneOnOne
                                    ? "Birebir"
                                    : slot.badge || "Konu Anlatımı"
                                ] || BADGE_STYLES["Konu Anlatımı"];
                              return (
                                <div
                                  key={slot.id}
                                  onClick={
                                    editable
                                      ? () => onSelectSlot?.(day, timeRow)
                                      : undefined
                                  }
                                  className={`group relative rounded-lg border p-2 text-xs ${style} ${
                                    editable ? "cursor-pointer" : ""
                                  }`}
                                >
                                  {slot.onDelete && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        slot.onDelete?.();
                                      }}
                                      title="Kaldır"
                                      className="absolute top-1.5 right-1.5 rounded p-0.5 text-current opacity-50 transition hover:bg-white/70 hover:text-red-600 hover:opacity-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <p className="pr-5 font-bold leading-snug">
                                    {isOneOnOne ? (
                                      <Sparkles className="mr-1 inline h-3 w-3 text-[#7C3AED]" />
                                    ) : (
                                      <BookOpen className="mr-1 inline h-3 w-3" />
                                    )}
                                    {slot.title}
                                  </p>
                                  {slot.subtitle && (
                                    <p className="mt-1 flex items-center gap-1 text-[11px] opacity-85">
                                      <GraduationCap className="h-3 w-3 shrink-0" />
                                      <span className="truncate">
                                        {slot.subtitle}
                                      </span>
                                    </p>
                                  )}
                                  {slot.meta && (
                                    <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-80">
                                      <MapPin className="h-3 w-3 shrink-0" />
                                      <span className="truncate">
                                        {slot.meta}
                                      </span>
                                    </p>
                                  )}
                                  {slot.badge && (
                                    <span
                                      className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        isOneOnOne
                                          ? "bg-[#7C3AED] text-white"
                                          : "bg-white/75"
                                      }`}
                                    >
                                      {isOneOnOne ? "✦ Birebir" : slot.badge}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {isSelected && (
                              <p className="text-center text-[10px] font-bold text-[#0E4D3A]">
                                ✓ Seçili Slot
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
