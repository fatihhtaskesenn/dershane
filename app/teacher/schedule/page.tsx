"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { WeeklyTimetable, type TimetableItem } from "@/components/WeeklyTimetable";

export default function TeacherSchedulePage() {
  const { activeTeacher } = useCampus();

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
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Haftalık Ders Akışı
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
          <CalendarDays className="h-6 w-6 text-[#135D43]" />
          <span>Öğretmen Ders Programı ({activeTeacher.name})</span>
        </h1>
      </div>

      <WeeklyTimetable items={items} />
    </div>
  );
}
