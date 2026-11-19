"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Award, FileBarChart2, FileDown } from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { StudentNetCharts } from "@/components/student-net-charts";

export default function StudentExamsPage() {
  const { activeStudent } = useCampus();
  const [filter, setFilter] = useState<"Tümü" | "TYT" | "AYT">("Tümü");

  const filteredExams = activeStudent.exams.filter((e) =>
    filter === "Tümü" ? true : e.type === filter
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Ölçme &amp; Değerlendirme
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
            Deneme Sonuçlarım &amp; PDF Karneler
          </h1>
        </div>

        <div className="inline-flex w-fit rounded-md border border-[#E5DEC9] bg-white p-1">
          {(["Tümü", "TYT", "AYT"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded px-3.5 py-1.5 text-xs font-semibold transition-colors ${
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

      <div className="space-y-5">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-xl border border-[#E9EBEE] bg-white p-6"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#203B5C] px-2 py-0.5 text-[11px] font-semibold text-[#E8C483]">
                    {exam.type}
                  </span>
                  <span className="text-xs text-[#737B86]">{exam.date}</span>
                </div>
                <h2 className="font-editorial mt-1.5 text-2xl font-medium text-[#203B5C]">
                  {exam.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-md border border-[#E5DEC9] bg-[#FCFBF8] px-4 py-2 text-center">
                  <p className="text-[10px] font-semibold text-[#737B86] uppercase">
                    Toplam Net
                  </p>
                  <p className="font-editorial text-xl font-semibold text-[#135D43]">
                    {exam.totalNet} / {exam.maxNet}
                  </p>
                </div>
                <div className="rounded-md border border-[#E5DEC9] bg-[#FCFBF8] px-4 py-2 text-center">
                  <p className="text-[10px] font-semibold text-[#737B86] uppercase">
                    Kurum Sırası
                  </p>
                  <p className="font-editorial flex items-center justify-center gap-1 text-xl font-semibold text-[#203B5C]">
                    <Award className="h-4 w-4 text-[#B18A52]" />#{exam.rank}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-md bg-[#135D43] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0E4A35]"
                >
                  <FileDown className="h-4 w-4 text-[#E8C483]" />
                  <span>PDF Karne İndir</span>
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {exam.subjects.map((sub) => (
                <div
                  key={sub.name}
                  className="rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#203B5C]">
                      {sub.name}
                    </span>
                    <FileBarChart2 className="h-4 w-4 text-[#B18A52]" />
                  </div>
                  <p className="font-editorial mt-2 text-2xl font-semibold text-[#135D43]">
                    {sub.net} Net
                  </p>
                  <p className="mt-1 text-xs text-[#737B86]">
                    D: {sub.correct} • Y: {sub.wrong} • B: {sub.empty}
                  </p>
                </div>
              ))}
            </div>

            {exam.topicBreakdown && exam.topicBreakdown.length > 0 && (
              <div className="mt-4 rounded-lg border border-[#F5C6BA]/70 bg-[#FDF0ED]/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#9A3412]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>
                      Deneme Konu Eksikleri (
                      {
                        exam.topicBreakdown.filter(
                          (t) => t.wrong > 0 || t.empty > 0
                        ).length
                      }{" "}
                      Konu)
                    </span>
                  </p>
                  <Link
                    href="/student/weak-topics"
                    className="text-[11px] font-bold text-[#11284B] hover:underline"
                  >
                    Tüm Konu Eksiklerimi Gör →
                  </Link>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {exam.topicBreakdown
                    .filter((t) => t.wrong > 0 || t.empty > 0)
                    .slice(0, 12)
                    .map((t, idx) => (
                      <span
                        key={`${t.subject}-${t.topic}-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md border border-[#F5C6BA] bg-white px-2.5 py-1 text-[11px]"
                      >
                        <strong className="text-[#11284B]">{t.subject}:</strong>
                        <span className="text-[#203B5C]">{t.topic}</span>
                        <span className="font-bold text-[#9A3412]">
                          ({t.wrong}Y {t.empty}B)
                        </span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
