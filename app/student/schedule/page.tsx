"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { WeeklyTimetable } from "@/components/WeeklyTimetable";

export default function StudentSchedulePage() {
  const { activeStudent, classes } = useCampus();
  const myClass = classes.find((c) => c.id === activeStudent.classId);
  const combinedSchedule = [
    ...(myClass?.schedule ?? []),
    ...activeStudent.schedule,
  ];

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          {activeStudent.className} • Sınıf &amp; Birebir Etüt
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
          <CalendarDays className="h-6 w-6 text-[#135D43]" />
          <span>Haftalık Ders Programım</span>
        </h1>
      </div>

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
  );
}
