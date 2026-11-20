"use client";

import React from "react";
import { CalendarDays, Megaphone } from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { WeeklyTimetable, type TimetableItem } from "@/components/WeeklyTimetable";

export default function TeacherSchedulePage() {
  const { activeTeacher, announcements } = useCampus();

  const items: TimetableItem[] = [
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
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Haftalık Ders &amp; Birebir Akışı
          </p>
          <h1 className="font-editorial mt-1 flex items-center gap-2 text-2xl font-medium text-[#203B5C] sm:text-3xl">
            <CalendarDays className="h-6 w-6 text-[#135D43]" />
            <span>Haftalık Takvim ({activeTeacher.name})</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-md bg-[#EEF3F9] px-2.5 py-1 text-[#11284B]">
            {activeTeacher.schedule.length} Sınıf Dersi
          </span>
          <span className="rounded-md bg-[#F5F3FF] px-2.5 py-1 text-[#4C1D95]">
            ✦ {activeTeacher.oneOnOneSlots.length} Birebir
          </span>
        </div>
      </div>

      <WeeklyTimetable items={items} />

      {/* Kurum Duyuruları */}
      <section className="rounded-xl border border-[#E9EBEE] bg-white p-4 sm:p-6">
        <h2 className="font-editorial flex items-center gap-2 border-b border-[#E9EBEE] pb-3 text-xl font-medium text-[#203B5C] sm:text-2xl">
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
                    <span className="text-[10px] text-[#737B86]">
                      ({a.attachmentSize})
                    </span>
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
