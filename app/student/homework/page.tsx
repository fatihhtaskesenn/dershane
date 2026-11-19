"use client";

import React from "react";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { useCampus } from "@/lib/campus-store";

export default function StudentHomeworkPage() {
  const { activeStudent, toggleHomeworkStatus } = useCampus();

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Danışman &amp; Branş Görevleri
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
          Ödevlendirmelerim
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {activeStudent.homework.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-[#E9EBEE] bg-white p-10 text-center text-sm text-[#737B86]">
            Henüz atanmış ödev bulunmuyor.
          </div>
        ) : (
          activeStudent.homework.map((hw) => (
            <button
              key={hw.id}
              type="button"
              onClick={() => toggleHomeworkStatus(activeStudent.id, hw.id)}
              className="flex items-start gap-3.5 rounded-xl border border-[#E9EBEE] bg-white p-5 text-left transition-all hover:border-[#135D43]"
            >
              {hw.status === "Tamamlandı" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#135D43]" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#737B86]" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-[#135D43]">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {hw.subject} • {hw.teacherName}
                  </span>
                  <span className="text-[#9A743E]">{hw.status}</span>
                </div>
                <p
                  className={`mt-1.5 text-sm ${
                    hw.status === "Tamamlandı"
                      ? "text-[#737B86] line-through"
                      : "font-semibold text-[#203B5C]"
                  }`}
                >
                  {hw.title}
                </p>
                <p className="mt-1 text-xs text-[#737B86]">
                  Teslim: {hw.dueDate}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
