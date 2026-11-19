"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  FileBarChart2,
  FileDown,
} from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { StudentNetCharts } from "@/components/student-net-charts";

export default function StudentExamsPage() {
  const { activeStudent } = useCampus();
  const [filter, setFilter] = useState<"Tümü" | "TYT" | "AYT">("Tümü");
  const [expandedExamIds, setExpandedExamIds] = useState<Record<string, boolean>>({});

  const filteredExams = activeStudent.exams.filter((e) =>
    filter === "Tümü" ? true : e.type === filter
  );

  const toggleExam = (id: string, defaultOpen: boolean) => {
    setExpandedExamIds((prev) => {
      const current = prev[id] ?? defaultOpen;
      return { ...prev, [id]: !current };
    });
  };

  return (
    <div className="space-y-4 sm:space-y-7">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-end sm:gap-4 sm:pb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Ölçme &amp; Değerlendirme
          </p>
          <h1 className="font-editorial mt-1 text-2xl font-medium text-[#203B5C] sm:text-3xl">
            Deneme Sonuçlarım &amp; PDF Karneler
          </h1>
        </div>

        <div className="inline-flex w-fit rounded-md border border-[#E5DEC9] bg-white p-1">
          {(["Tümü", "TYT", "AYT"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors sm:px-3.5 sm:py-1.5 ${
                filter === tab
                  ? "bg-[#203B5C] text-white"
                  : "text-[#737B86] hover:text-[#203B5C]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <StudentNetCharts exams={activeStudent.exams} />

      <div className="space-y-3 sm:space-y-5">
        {filteredExams.map((exam, index) => {
          const defaultOpen = index === 0;
          const isMobileOpen = expandedExamIds[exam.id] ?? defaultOpen;
          const weakTopics = (exam.topicBreakdown ?? []).filter(
            (t) => t.wrong > 0 || t.empty > 0
          );

          return (
            <div
              key={exam.id}
              className="rounded-xl border border-[#E9EBEE] bg-white p-3.5 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-3 sm:flex-row sm:items-center sm:gap-4 sm:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#203B5C] px-2 py-0.5 text-[10px] font-semibold text-[#E8C483] sm:text-[11px]">
                        {exam.type}
                      </span>
                      <span className="text-[11px] text-[#737B86] sm:text-xs">
                        {exam.date}
                      </span>
                    </div>
                    <h2 className="font-editorial mt-1 text-lg font-medium text-[#203B5C] sm:mt-1.5 sm:text-2xl">
                      {exam.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExam(exam.id, defaultOpen)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#DCE4EE] bg-[#FCFBF8] px-2.5 py-1.5 text-[11px] font-bold text-[#203B5C] sm:hidden"
                  >
                    <span>{isMobileOpen ? "Gizle" : "Detay"}</span>
                    {isMobileOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <div className="rounded-md border border-[#E5DEC9] bg-[#FCFBF8] px-2.5 py-1.5 text-center sm:px-4 sm:py-2">
                    <p className="text-[9px] font-semibold text-[#737B86] uppercase sm:text-[10px]">
                      Toplam Net
                    </p>
                    <p className="font-editorial text-sm font-semibold text-[#135D43] sm:text-xl">
                      {exam.totalNet}{" "}
                      <span className="text-[10px] font-normal text-[#737B86] sm:text-sm">
                        / {exam.maxNet}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-md border border-[#E5DEC9] bg-[#FCFBF8] px-2.5 py-1.5 text-center sm:px-4 sm:py-2">
                    <p className="text-[9px] font-semibold text-[#737B86] uppercase sm:text-[10px]">
                      Kurum Sırası
                    </p>
                    <p className="font-editorial flex items-center justify-center gap-1 text-sm font-semibold text-[#203B5C] sm:text-xl">
                      <Award className="h-3.5 w-3.5 text-[#B18A52] sm:h-4 sm:w-4" />
                      #{exam.rank}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-full items-center justify-center gap-1.5 rounded-md bg-[#135D43] px-2.5 py-2 text-[11px] font-semibold text-white hover:bg-[#0E4A35] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs"
                  >
                    <FileDown className="h-3.5 w-3.5 shrink-0 text-[#E8C483] sm:h-4 sm:w-4" />
                    <span className="sm:hidden">PDF</span>
                    <span className="hidden sm:inline">PDF Karne İndir</span>
                  </button>
                </div>
              </div>

              <div className={`${isMobileOpen ? "block" : "hidden"} sm:block`}>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:grid-cols-4">
                  {exam.subjects.map((sub) => (
                    <div
                      key={sub.name}
                      className="rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-2.5 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-semibold text-[#203B5C] sm:text-sm">
                          {sub.name}
                        </span>
                        <FileBarChart2 className="h-3.5 w-3.5 shrink-0 text-[#B18A52] sm:h-4 sm:w-4" />
                      </div>
                      <p className="font-editorial mt-1 text-lg font-semibold text-[#135D43] sm:mt-2 sm:text-2xl">
                        {sub.net} Net
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#737B86] sm:mt-1 sm:text-xs">
                        D:{sub.correct} · Y:{sub.wrong} · B:{sub.empty}
                      </p>
                    </div>
                  ))}
                </div>

                {weakTopics.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#F5C6BA]/70 bg-[#FDF0ED]/40 p-3 sm:mt-4 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#9A3412] sm:text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Deneme Konu Eksikleri ({weakTopics.length} Konu)</span>
                      </p>
                      <Link
                        href="/student/weak-topics"
                        className="text-[11px] font-bold text-[#11284B] hover:underline"
                      >
                        Tümünü Gör →
                      </Link>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1 sm:mt-2.5 sm:gap-1.5">
                      {weakTopics.slice(0, 6).map((t, idx) => (
                        <span
                          key={`${t.subject}-${t.topic}-${idx}`}
                          className="inline-flex items-center gap-1 rounded-md border border-[#F5C6BA] bg-white px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
                        >
                          <strong className="text-[#11284B]">{t.subject}:</strong>
                          <span className="text-[#203B5C]">{t.topic}</span>
                          <span className="font-bold text-[#9A3412]">
                            ({t.wrong}Y {t.empty}B)
                          </span>
                        </span>
                      ))}
                      {weakTopics.length > 6 && (
                        <Link
                          href="/student/weak-topics"
                          className="inline-flex items-center rounded-md border border-[#DCE4EE] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#11284B]"
                        >
                          +{weakTopics.length - 6} konu daha
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
