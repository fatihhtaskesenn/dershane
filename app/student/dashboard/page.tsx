"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  FileDown,
  Megaphone,
  Plus,
  StickyNote,
  Trash2,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { StudentNetCharts } from "@/components/student-net-charts";
import { WeeklyTimetable } from "@/components/WeeklyTimetable";

export default function StudentDashboardPage() {
  const {
    activeStudent,
    classes,
    announcements,
    toggleHomeworkStatus,
    addPersonalNote,
    deletePersonalNote,
  } = useCampus();

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [todayDay, setTodayDay] = useState<string | null>(null);
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);

  useEffect(() => {
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const updateClock = () => {
      const now = new Date();
      setTodayDay(days[now.getDay()] ?? "Pazartesi");
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  const myClass = classes.find((c) => c.id === activeStudent.classId);
  const classLessonsCount = myClass?.schedule.length ?? 0;
  const personalOneOnOneCount = activeStudent.schedule.length;
  const combinedSchedule = [
    ...(myClass?.schedule ?? []),
    ...activeStudent.schedule,
  ];
  const subjectHourSummary = Array.from(
    combinedSchedule.reduce((map, slot) => {
      const key = slot.subject.replace(/\s*\(Birebir\)\s*$/i, "").trim();
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);
  const remainingTodayLessons =
    todayDay && nowMinutes !== null
      ? combinedSchedule.filter((slot) => {
          if (slot.day !== todayDay) return false;
          const matches = slot.time.match(/(\d{1,2}):(\d{2})/g);
          if (!matches || matches.length === 0) return false;
          const [h, m] = matches[matches.length - 1].split(":").map(Number);
          return h * 60 + m > nowMinutes;
        }).length
      : null;
  const latestTyt = activeStudent.exams.filter((e) => e.type === "TYT").at(-1);
  const latestAyt = activeStudent.exams.filter((e) => e.type === "AYT").at(-1);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    addPersonalNote(activeStudent.id, noteTitle.trim(), noteContent.trim());
    setNoteTitle("");
    setNoteContent("");
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2.5 border-b border-[#E9EBEE] pb-3 sm:flex-row sm:items-end sm:gap-4 sm:pb-5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase sm:text-[11px]">
            {activeStudent.className} • {activeStudent.track}
          </p>
          <h1 className="font-editorial mt-0.5 text-xl font-medium text-[#203B5C] sm:mt-1 sm:text-3xl">
            Hoş Geldin, {activeStudent.name}
          </h1>
          <p className="mt-0.5 text-xs text-[#737B86] sm:mt-1 sm:text-sm">
            Hedef: <strong>{activeStudent.target}</strong>
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#E5DEC9] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#203B5C] sm:px-4 sm:py-2 sm:text-xs">
          <UserCheck className="h-3.5 w-3.5 text-[#135D43] sm:h-4 sm:w-4" />
          <span>Danışman: {activeStudent.advisorName}</span>
        </div>
      </div>

      {/* 1. BAKIŞ & GRAFİKSEL NET VE İLERLEYİŞ DURUMU */}
      <section className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-[#E9EBEE] bg-white p-2.5 sm:p-4">
            <p className="text-[11px] text-[#737B86] sm:text-xs">Son TYT Neti</p>
            <p className="font-editorial mt-0.5 text-lg font-semibold text-[#135D43] sm:mt-1 sm:text-2xl">
              {latestTyt ? latestTyt.totalNet : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-[#E9EBEE] bg-white p-2.5 sm:p-4">
            <p className="text-[11px] text-[#737B86] sm:text-xs">Son AYT Neti</p>
            <p className="font-editorial mt-0.5 text-lg font-semibold text-[#203B5C] sm:mt-1 sm:text-2xl">
              {latestAyt ? latestAyt.totalNet : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-[#E9EBEE] bg-white p-2.5 sm:p-4">
            <p className="text-[11px] text-[#737B86] sm:text-xs">Bekleyen Ödev</p>
            <p className="font-editorial mt-0.5 text-lg font-semibold text-[#C58B3B] sm:mt-1 sm:text-2xl">
              {
                activeStudent.homework.filter((h) => h.status === "Bekliyor")
                  .length
              }{" "}
              Görev
            </p>
          </div>
          <div className="rounded-lg border border-[#E9EBEE] bg-white p-2.5 sm:p-4">
            <p className="text-[11px] text-[#737B86] sm:text-xs">Devamlılık</p>
            <p className="font-editorial mt-0.5 flex items-center gap-1 text-lg font-semibold text-[#135D43] sm:mt-1 sm:gap-1.5 sm:text-2xl">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />%{activeStudent.attendance}
            </p>
          </div>
        </div>

        {/* Weekly Hours & Subject Breakdown Slim Strip */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-[#CCE3D8] border-l-4 border-l-[#135D43] bg-gradient-to-r from-[#F7FAF8] via-white to-[#F5F3FF]/60 px-4 py-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#135D43] px-2.5 py-1 font-bold text-white">
                <Clock className="h-3.5 w-3.5 text-[#E8C483]" />
                Haftalık {combinedSchedule.length} Saat
              </span>
              <span className="rounded-md border border-[#C9D8EA] bg-[#EEF3F9] px-2 py-0.5 font-semibold text-[#11284B]">
                Sınıf: {classLessonsCount} Saat
              </span>
              <span className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 font-semibold text-[#4C1D95]">
                ✦ Birebir: {personalOneOnOneCount} Saat
              </span>
            </div>
            {remainingTodayLessons !== null && (
              <span className="rounded-md border border-[#DCE8E2] bg-white px-2.5 py-1 text-[11px] font-bold text-[#135D43]">
                Bugün Kalan ({todayDay}): {remainingTodayLessons} Saat
              </span>
            )}
          </div>
          {subjectHourSummary.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E2ECE7] pt-2">
              <span className="mr-1 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                Aldığın Dersler:
              </span>
              {subjectHourSummary.map(([subj, count]) => (
                <span
                  key={subj}
                  className="rounded-md border border-[#E5DEC9] bg-white px-2 py-0.5 text-[11px] font-medium text-[#203B5C]"
                >
                  {subj} <strong className="text-[#135D43]">· {count}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        <StudentNetCharts exams={activeStudent.exams} />
      </section>

      {/* 2. DERS PROGRAMIM & BİREBİRLERİM */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
        <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
          <CalendarDays className="h-5 w-5 text-[#135D43]" />
          <span>Ders Programım &amp; Birebirlerim</span>
        </h2>

        <div className="mt-4">
          <WeeklyTimetable
            items={combinedSchedule.map((item) => ({
              id: item.id,
              day: item.day,
              time: item.time,
              title: item.subject,
              subtitle: item.teacher,
              meta: item.room,
              badge: item.type,
              blockPeriod: item.blockPeriod,
            }))}
          />
        </div>
      </section>

      {/* 3. DENEME SONUÇLARIM (PDF) */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
        <h2 className="font-editorial border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
          Deneme Sonuçlarım
        </h2>

        {activeStudent.exams.length === 0 ? (
          <p className="py-6 text-sm text-[#737B86]">
            Henüz deneme sonucu bulunmuyor.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {activeStudent.exams.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <span className="rounded bg-[#203B5C] px-2 py-0.5 text-[10px] font-semibold text-[#E8C483]">
                    {exam.type}
                  </span>
                  <span className="ml-2 text-xs text-[#737B86]">
                    {exam.date}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-[#203B5C]">
                    {exam.title}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-editorial text-xl font-semibold text-[#135D43]">
                    {exam.totalNet} Net
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#135D43] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0E4A35]"
                  >
                    <FileDown className="h-3.5 w-3.5 text-[#E8C483]" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ÖDEVLENDİRMELERİM & 5. KENDİ NOTLARIM */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Homework */}
        <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
          <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
            <ClipboardList className="h-5 w-5 text-[#C58B3B]" />
            <span>Ödevlendirmelerim</span>
          </h2>

          <div className="mt-4 space-y-2.5">
            {activeStudent.homework.length === 0 ? (
              <p className="py-4 text-xs text-[#737B86]">
                Atanmış ödev bulunmuyor.
              </p>
            ) : (
              activeStudent.homework.map((hw) => (
                <button
                  key={hw.id}
                  type="button"
                  onClick={() => toggleHomeworkStatus(activeStudent.id, hw.id)}
                  className="flex w-full items-start gap-3 rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-3.5 text-left hover:border-[#135D43]"
                >
                  {hw.status === "Tamamlandı" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#135D43]" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#737B86]" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-[#135D43]">
                        {hw.subject} • {hw.teacherName}
                      </span>
                      <span className="text-[#9A743E]">{hw.status}</span>
                    </div>
                    <p
                      className={`mt-1 text-sm ${
                        hw.status === "Tamamlandı"
                          ? "text-[#737B86] line-through"
                          : "font-semibold text-[#203B5C]"
                      }`}
                    >
                      {hw.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#737B86]">
                      Teslim: {hw.dueDate}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Personal Notes */}
        <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
          <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
            <StickyNote className="h-5 w-5 text-[#135D43]" />
            <span>Kendi Notlarım</span>
          </h2>

          <form onSubmit={handleAddNote} className="mt-4 space-y-2">
            <input
              type="text"
              required
              placeholder="Not Başlığı..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-xs"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Kendin için hatırlatma veya formül yaz..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="flex-1 rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md bg-[#0D2558] px-3.5 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ekle</span>
              </button>
            </div>
          </form>

          <div className="mt-4 space-y-2">
            {(activeStudent.personalNotes ?? []).map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] p-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-[#203B5C]">
                    {n.title}{" "}
                    <span className="ml-1 font-normal text-[#737B86]">
                      ({n.date})
                    </span>
                  </p>
                  <p className="mt-0.5 text-[#4E5E57]">{n.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deletePersonalNote(activeStudent.id, n.id)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 6. DUYURULAR */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
        <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
          <Megaphone className="h-5 w-5 text-[#135D43]" />
          <span>Kurum Duyuruları</span>
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-4"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="rounded bg-[#E7F3EE] px-2 py-0.5 text-[#135D43]">
                  {a.category}
                </span>
                <span className="text-[#737B86]">{a.date}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#203B5C]">
                {a.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#4E5E57]">
                {a.content}
              </p>
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
