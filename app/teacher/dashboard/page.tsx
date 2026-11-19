"use client";

import React from "react";
import { CalendarDays, Megaphone, Users } from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { WeeklyTimetable, type TimetableItem } from "@/components/WeeklyTimetable";

export default function TeacherDashboardPage() {
  const { activeTeacher, students, announcements } = useCampus();

  const timetableItems: TimetableItem[] = [
    ...activeTeacher.schedule.map((item) => ({
      id: item.id,
      day: item.day,
      time: item.time,
      title: item.subject,
      subtitle: item.classGroup,
      meta: item.room,
      badge: "Sınıf Dersi",
    })),
    ...activeTeacher.oneOnOneSlots.map((slot) => ({
      id: slot.id,
      day: slot.day,
      time: slot.time,
      title: slot.subject,
      subtitle: slot.studentName,
      meta: slot.note || "Birebir Etüt",
      badge: "Birebir",
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          {activeTeacher.role} • {activeTeacher.branch}
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
          Hoş Geldiniz, {activeTeacher.name}
        </h1>
      </div>

      {/* 1. DERS PROGRAMIM & BİREBİRLER */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E9EBEE] pb-3">
          <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
            <CalendarDays className="h-5 w-5 text-[#135D43]" />
            <span>Haftalık Ders Programım &amp; Birebir Saatlerim</span>
          </h2>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-md bg-[#EEF3F9] px-2.5 py-1 text-[#11284B]">
              {activeTeacher.schedule.length} Sınıf Dersi
            </span>
            <span className="rounded-md bg-[#FEF7E6] px-2.5 py-1 text-[#8A6508]">
              {activeTeacher.oneOnOneSlots.length} Birebir
            </span>
          </div>
        </div>
        <WeeklyTimetable items={timetableItems} />
      </section>

      {/* 2. ÖĞRENCİLER & NET DURUMLARI */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-6">
        <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-2xl font-medium text-[#203B5C]">
          <Users className="h-5 w-5 text-[#135D43]" />
          <span>Öğrenciler &amp; Güncel Net Durumları</span>
        </h2>

        <div className="mt-4 overflow-x-auto">
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
