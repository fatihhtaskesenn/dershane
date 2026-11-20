"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { WeeklyTimetable } from "@/components/WeeklyTimetable";

export default function StudentSchedulePage() {
  const { activeStudent, classes } = useCampus();
  const myClass = classes.find((c) => c.id === activeStudent.classId);
  const classSlots = myClass?.schedule ?? [];
  const personalSlots = activeStudent.schedule;
  const combinedSchedule = [...classSlots, ...personalSlots];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            {activeStudent.className} • Sınıf Programı &amp; Kişisel Birebirler
          </p>
          <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
            <CalendarDays className="h-6 w-6 text-[#135D43]" />
            <span>Haftalık Ders Programım</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-[#C9D8EA] bg-[#EEF3F9] px-2.5 py-1 font-semibold text-[#11284B]">
            Sınıf Dersi: {classSlots.length}
          </span>
          <span className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 font-semibold text-[#4C1D95]">
            ✦ Kişiye Özel Birebir: {personalSlots.length}
          </span>
        </div>
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
