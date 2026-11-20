"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";
import { useCampus, type WeekDay } from "@/lib/campus-store";

const WEEKDAY_MAP: WeekDay[] = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

function parseStartMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function parseEndMinutes(timeStr: string): number {
  const matches = timeStr.match(/(\d{1,2}):(\d{2})/g);
  if (!matches || matches.length === 0) return 0;
  const last = matches[matches.length - 1];
  const [h, m] = last.split(":").map(Number);
  return h * 60 + m;
}

export default function TeacherDashboardPage() {
  const { activeTeacher, students, announcements } = useCampus();
  const [todayDay, setTodayDay] = useState<WeekDay | null>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTodayDay(WEEKDAY_MAP[now.getDay()] ?? "Pazartesi");
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  const allSlots = useMemo(() => {
    return [
      ...activeTeacher.schedule.map((item) => ({
        id: item.id,
        day: item.day,
        time: item.time,
        title: item.subject,
        subtitle: item.classGroup,
        meta: item.room,
        kind: "class" as const,
      })),
      ...activeTeacher.oneOnOneSlots.map((slot) => ({
        id: slot.id,
        day: slot.day,
        time: slot.time,
        title: slot.subject,
        subtitle: slot.studentName,
        meta: slot.note || "Birebir Etüt",
        kind: "oneOnOne" as const,
      })),
    ];
  }, [activeTeacher]);

  const todaySlots = useMemo(() => {
    if (!todayDay) return [];
    return allSlots
      .filter((s) => s.day === todayDay)
      .sort((a, b) => parseStartMinutes(a.time) - parseStartMinutes(b.time));
  }, [allSlots, todayDay]);

  const remainingTodayCount = useMemo(() => {
    if (nowMinutes === null) return 0;
    return todaySlots.filter((s) => parseEndMinutes(s.time) > nowMinutes).length;
  }, [todaySlots, nowMinutes]);

  const nextTodaySlot = useMemo(() => {
    if (nowMinutes === null) return null;
    return (
      todaySlots.find((s) => parseEndMinutes(s.time) > nowMinutes) ?? null
    );
  }, [todaySlots, nowMinutes]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="border-b border-[#E9EBEE] pb-4 sm:pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Genel Bakış • {activeTeacher.role} ({activeTeacher.branch})
        </p>
        <h1 className="font-editorial mt-1 text-2xl font-medium text-[#203B5C] sm:text-3xl">
          Hoş Geldiniz, {activeTeacher.name}
        </h1>
      </div>

      {/* 4 Eye-Catching Overview KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#DCE4EE] border-t-[3px] border-t-[#11284B] bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF3F9]/70 p-4 shadow-[0_8px_24px_rgba(17,40,75,0.06)] sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#475569] uppercase">
                Haftalık Ders Saati
              </p>
              <p className="font-editorial mt-2 text-3xl font-semibold text-[#11284B] sm:text-4xl">
                {activeTeacher.schedule.length}
                <span className="ml-1.5 text-sm font-medium text-[#64748B]">Saat</span>
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#11284B] text-[#E8C483] shadow-xs">
              <BookOpen className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0]/80 pt-2 text-[11px] font-medium text-[#475569]">
            <span>Sınıf dersleri</span>
            <span className="rounded bg-white px-2 py-0.5 font-bold text-[#11284B]">
              Toplam: {activeTeacher.schedule.length + activeTeacher.oneOnOneSlots.length} Saat
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#DDD6FE] border-t-[3px] border-t-[#7C3AED] bg-gradient-to-br from-white via-[#FAF8FF] to-[#F5F3FF] p-4 shadow-[0_8px_24px_rgba(124,58,237,0.08)] sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#5B21B6] uppercase">
                Haftalık Birebir
              </p>
              <p className="font-editorial mt-2 text-3xl font-semibold text-[#4C1D95] sm:text-4xl">
                {activeTeacher.oneOnOneSlots.length}
                <span className="ml-1.5 text-sm font-medium text-[#6D28D9]">Saat</span>
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED] text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 border-t border-[#DDD6FE]/70 pt-2 text-[11px] font-medium text-[#6D28D9]">
            Öğrenci birebir etütleri
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#CCE3D8] border-t-[3px] border-t-[#135D43] bg-gradient-to-br from-white via-[#F6FBF8] to-[#EAF6F0] p-4 shadow-[0_8px_24px_rgba(19,93,67,0.08)] sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#135D43] uppercase">
                Bugün Kalan Ders
              </p>
              <p className="font-editorial mt-2 text-3xl font-semibold text-[#0E4D3A] sm:text-4xl">
                {todayDay === null ? "—" : remainingTodayCount}
                <span className="ml-1.5 text-sm font-medium text-[#4E5E57]">Saat</span>
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#135D43] text-[#E8C483] shadow-xs">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 truncate border-t border-[#CCE3D8]/70 pt-2 text-[11px] font-medium text-[#135D43]">
            {nextTodaySlot
              ? `Sıradaki: ${nextTodaySlot.time} (${nextTodaySlot.title})`
              : todayDay
              ? `${todayDay} için kalan ders yok`
              : "Hesaplanıyor..."}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#E5DEC9] border-t-[3px] border-t-[#B18A52] bg-gradient-to-br from-white via-[#FCFBF8] to-[#FAF4E8] p-4 shadow-[0_8px_24px_rgba(177,138,82,0.08)] sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#8A6508] uppercase">
                Takip Edilen Öğrenci
              </p>
              <p className="font-editorial mt-2 text-3xl font-semibold text-[#203B5C] sm:text-4xl">
                {students.length}
                <span className="ml-1.5 text-sm font-medium text-[#737B86]">Kişi</span>
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B18A52] text-white shadow-xs">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <Link
            href="/teacher/students"
            className="mt-3 inline-flex w-full items-center justify-between border-t border-[#E5DEC9]/80 pt-2 text-[11px] font-bold text-[#135D43] hover:underline"
          >
            <span>Öğrencileri incele</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. BUGÜNKÜ DERS AKIŞI */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E9EBEE] pb-3">
          <div>
            <h2 className="font-editorial flex items-center gap-2 text-xl font-medium text-[#203B5C] sm:text-2xl">
              <CalendarDays className="h-5 w-5 text-[#135D43]" />
              <span>
                Bugünkü Ders &amp; Birebir Akışı{todayDay ? ` (${todayDay})` : ""}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-[#737B86]">
              Günün saatine göre tamamlanan ve kalan dersleriniz otomatik işaretlenir.
            </p>
          </div>
          <Link
            href="/teacher/schedule"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#203B5C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162B45]"
          >
            <span>Haftalık Takvimi Gör</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#E8C483]" />
          </Link>
        </div>

        {todaySlots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#DCE4EE] bg-[#FCFBF8] p-6 text-center text-xs text-[#737B86]">
            {todayDay
              ? `${todayDay} günü için planlanmış ders veya birebir saatiniz bulunmuyor.`
              : "Bugünkü program yükleniyor..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {todaySlots.map((slot) => {
              const endM = parseEndMinutes(slot.time);
              const isDone = nowMinutes !== null && endM <= nowMinutes;
              const isNext = nextTodaySlot?.id === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`rounded-xl border p-3.5 transition ${
                    isNext
                      ? "border-[#135D43] bg-[#EAF6F0]/60 ring-1 ring-[#135D43]"
                      : isDone
                      ? "border-[#E9EBEE] bg-[#F8FAFC] opacity-70"
                      : slot.kind === "oneOnOne"
                      ? "border-[#DDD6FE] bg-[#F5F3FF]/60"
                      : "border-[#DCE4EE] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-[#203B5C] px-2 py-0.5 text-[11px] font-bold text-white">
                      {slot.time}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        isNext
                          ? "bg-[#135D43] text-white"
                          : isDone
                          ? "bg-[#E2E8F0] text-[#475569]"
                          : slot.kind === "oneOnOne"
                          ? "bg-[#7C3AED] text-white"
                          : "bg-[#EEF3F9] text-[#11284B]"
                      }`}
                    >
                      {isNext
                        ? "Sıradaki Ders"
                        : isDone
                        ? "Tamamlandı"
                        : slot.kind === "oneOnOne"
                        ? "✦ Birebir"
                        : "Planlı"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#203B5C]">{slot.title}</p>
                  <p className="mt-0.5 text-xs text-[#4E5E57]">
                    {slot.subtitle} · {slot.meta}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. ÖĞRENCİLER & NET DURUMLARI */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-4 sm:p-6">
        <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-xl font-medium text-[#203B5C] sm:text-2xl">
          <Users className="h-5 w-5 text-[#135D43]" />
          <span>Öğrenciler &amp; Güncel Net Durumları</span>
        </h2>

        {/* Mobile Cards */}
        <div className="mt-3 space-y-2 md:hidden">
          {students.slice(0, 6).map((s) => {
            const tyt = s.exams.filter((e) => e.type === "TYT").at(-1);
            const ayt = s.exams.filter((e) => e.type === "AYT").at(-1);
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-[#203B5C]">{s.name}</p>
                  <p className="text-[11px] text-[#737B86]">
                    {s.className} · {s.track}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#135D43]">
                    TYT: {tyt ? `${tyt.totalNet}` : "—"}
                  </p>
                  <p className="font-semibold text-[#203B5C]">
                    AYT: {ayt ? `${ayt.totalNet}` : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E9EBEE] text-[11px] font-semibold text-[#737B86] uppercase">
                <th className="py-2.5 pr-4">Öğrenci</th>
                <th className="py-2.5 pr-4">Sınıf &amp; Alan</th>
                <th className="py-2.5 pr-4">Son TYT Net</th>
                <th className="py-2.5 pr-4">Son AYT Net</th>
                <th className="py-2.5">Danışman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EBEE]">
              {students.map((s) => {
                const tyt = s.exams.filter((e) => e.type === "TYT").at(-1);
                const ayt = s.exams.filter((e) => e.type === "AYT").at(-1);
                return (
                  <tr key={s.id} className="hover:bg-[#F8F7F3]">
                    <td className="py-3 pr-4 font-semibold text-[#203B5C]">
                      {s.name}
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#4E5E57]">
                      {s.className} • {s.track}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-[#135D43]">
                      {tyt ? `${tyt.totalNet} Net` : "—"}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-[#203B5C]">
                      {ayt ? `${ayt.totalNet} Net` : "—"}
                    </td>
                    <td className="py-3 text-xs text-[#737B86]">
                      {s.advisorName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. DUYURULAR */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
        <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
          <Megaphone className="h-5 w-5 text-[#B18A52]" />
          <span>Kurum Duyuruları</span>
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-4"
            >
              <p className="text-[11px] font-semibold text-[#135D43]">
                {a.category} • {a.date}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#203B5C]">
                {a.title}
              </p>
              <p className="mt-1 text-xs text-[#4E5E57]">{a.content}</p>
              {a.attachmentName && a.attachmentDataUrl && (
                <a
                  href={a.attachmentDataUrl}
                  download={a.attachmentName}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#DCE4EE] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#11284B] hover:bg-[#FAF8F5]"
                >
                  <span>📎 {a.attachmentName}</span>
                  {a.attachmentSize && (
                    <span className="text-[10px] text-[#737B86]">({a.attachmentSize})</span>
                  )}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
