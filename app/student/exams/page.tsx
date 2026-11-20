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
  Search,
} from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import { StudentNetCharts } from "@/components/student-net-charts";

export default function StudentExamsPage() {
  const { activeStudent } = useCampus();
  const [filter, setFilter] = useState<"Tümü" | "TYT" | "AYT">("Tümü");
  const [chartExamType, setChartExamType] = useState<"TYT" | "AYT">("TYT");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedExamIds, setExpandedExamIds] = useState<Record<string, boolean>>({});
  const [printingExamId, setPrintingExamId] = useState<string | null>(null);

  const handleFilterChange = (tab: "Tümü" | "TYT" | "AYT") => {
    setFilter(tab);
    if (tab === "TYT" || tab === "AYT") {
      setChartExamType(tab);
    }
  };

  const filteredExams = activeStudent.exams.filter((e) => {
    const matchesType = filter === "Tümü" ? true : e.type === filter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesType;
    const matchesSearch =
      e.title.toLowerCase().includes(q) ||
      e.date.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.subjects.some((s) => s.name.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const printingExam =
    activeStudent.exams.find((e) => e.id === printingExamId) ??
    filteredExams[0] ??
    activeStudent.exams[0];

  const handlePrintKarne = (examId: string) => {
    setPrintingExamId(examId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  };

  const toggleExam = (id: string, defaultOpen: boolean) => {
    setExpandedExamIds((prev) => {
      const current = prev[id] ?? defaultOpen;
      return { ...prev, [id]: !current };
    });
  };

  const printTotals = printingExam
    ? printingExam.subjects.reduce(
        (acc, s) => ({
          correct: acc.correct + s.correct,
          wrong: acc.wrong + s.wrong,
          empty: acc.empty + s.empty,
          questions: acc.questions + s.correct + s.wrong + s.empty,
        }),
        { correct: 0, wrong: 0, empty: 0, questions: 0 }
      )
    : { correct: 0, wrong: 0, empty: 0, questions: 0 };

  const printWeakTopics = (printingExam?.topicBreakdown ?? []).filter(
    (t) => t.wrong > 0 || t.empty > 0
  );

  return (
    <>
      <div className="space-y-4 sm:space-y-7 print:hidden">
      <div className="border-b border-[#E9EBEE] pb-4 sm:pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Ölçme &amp; Değerlendirme
        </p>
        <h1 className="font-editorial mt-1 text-2xl font-medium text-[#203B5C] sm:text-3xl">
          Deneme Sonuçlarım &amp; PDF Karneler
        </h1>
      </div>

      <StudentNetCharts
        exams={activeStudent.exams}
        chartType="bar"
        examType={chartExamType}
        onExamTypeChange={setChartExamType}
      />

      {/* Refined Exam List Section with Wide Search & Filter */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-[#E9EBEE] bg-[#FCFBF8] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#737B86]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Deneme adı, tarih, sınav türü veya ders ara..."
              className="w-full rounded-lg border border-[#E5DEC9] bg-white py-2 pr-3 pl-9 text-xs text-[#203B5C] placeholder:text-[#737B86] focus:border-[#135D43] focus:outline-none sm:text-sm"
            />
          </div>

          <div className="inline-flex w-fit shrink-0 rounded-lg border border-[#E5DEC9] bg-white p-1">
            {(["Tümü", "TYT", "AYT"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleFilterChange(tab)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
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

        {filteredExams.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-[#203B5C]">
              Aramanızla eşleşen deneme sonucu bulunamadı.
            </p>
            <p className="mt-1 text-xs text-[#737B86]">
              Farklı bir anahtar kelime deneyebilir veya Tümü filtresine dönebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E9EBEE]">
            {filteredExams.map((exam, index) => {
              const defaultOpen = index === 0;
              const isOpen = expandedExamIds[exam.id] ?? defaultOpen;
              const weakTopics = (exam.topicBreakdown ?? []).filter(
                (t) => t.wrong > 0 || t.empty > 0
              );

              return (
                <div key={exam.id} className="transition-colors hover:bg-[#FCFBF8]/60">
                  {/* Compact List Row */}
                  <div className="flex flex-col gap-2.5 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleExam(exam.id, defaultOpen)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <span className="shrink-0 rounded bg-[#203B5C] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#E8C483]">
                        {exam.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#203B5C] sm:text-[15px]">
                          {exam.title}
                        </p>
                        <p className="text-[11px] text-[#737B86]">{exam.date}</p>
                      </div>
                    </button>

                    <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#DCE8E2] bg-[#F7FAF8] px-2.5 py-1 text-xs font-bold text-[#135D43]">
                          {exam.totalNet}{" "}
                          <span className="font-normal text-[#737B86]">
                            / {exam.maxNet} Net
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#E5DEC9] bg-[#FCFBF8] px-2 py-1 text-xs font-semibold text-[#203B5C]">
                          <Award className="h-3.5 w-3.5 text-[#B18A52]" />
                          #{exam.rank}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePrintKarne(exam.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#135D43] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#0E4A35]"
                        >
                          <FileDown className="h-3.5 w-3.5 text-[#E8C483]" />
                          <span>PDF Karne</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExam(exam.id, defaultOpen)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#DCE4EE] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#203B5C] hover:bg-[#F8F7F3]"
                        >
                          <span>{isOpen ? "Gizle" : "Detay"}</span>
                          {isOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Compact Subject & Weak Topic Breakdown */}
                  {isOpen && (
                    <div className="border-t border-[#E9EBEE]/80 bg-[#FCFBF8]/70 px-3.5 py-3 sm:px-5 sm:py-3.5">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {exam.subjects.map((sub) => (
                          <div
                            key={sub.name}
                            className="flex items-center justify-between rounded-lg border border-[#E9EBEE] bg-white px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-[#203B5C]">
                                {sub.name}
                              </p>
                              <p className="text-[10px] text-[#737B86]">
                                {sub.correct}D · {sub.wrong}Y · {sub.empty}B
                              </p>
                            </div>
                            <span className="ml-2 shrink-0 text-sm font-bold text-[#135D43]">
                              {sub.net}
                            </span>
                          </div>
                        ))}
                      </div>

                      {weakTopics.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F5C6BA]/60 bg-[#FDF0ED]/40 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A3412]">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Eksikler ({weakTopics.length}):
                            </span>
                            {weakTopics.slice(0, 5).map((t, idx) => (
                              <span
                                key={`${t.subject}-${t.topic}-${idx}`}
                                className="rounded border border-[#F5C6BA] bg-white px-2 py-0.5 text-[10px] text-[#203B5C]"
                              >
                                <strong>{t.subject}:</strong> {t.topic}{" "}
                                <span className="font-bold text-[#9A3412]">
                                  ({t.wrong}Y {t.empty}B)
                                </span>
                              </span>
                            ))}
                          </div>
                          <Link
                            href="/student/weak-topics"
                            className="text-[11px] font-bold text-[#11284B] hover:underline"
                          >
                            Tümünü Gör →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Single-Page Bespoke A4 Printable Exam Report Card */}
      {printingExam && (
        <div
          id="printable-exam-karne"
          className="hidden bg-white text-[#17241F] print:block"
        >
          <div className="flex flex-col justify-between rounded-xl border border-[#DCE4EE] p-5">
            {/* Institutional Header */}
            <div className="flex items-start justify-between border-b-2 border-[#203B5C] pb-3.5">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#B18A52] uppercase">
                  DERSHANE ÖZEL ÖĞRETİM KURSU • ÖLÇME &amp; DEĞERLENDİRME
                </p>
                <h1 className="font-editorial mt-1 text-2xl font-semibold text-[#203B5C]">
                  {printingExam.title}
                </h1>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  Resmi Sınav Sonuç Karnesi · Tarih: {printingExam.date}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded bg-[#203B5C] px-3 py-1 text-xs font-bold tracking-wider text-[#E8C483]">
                  {printingExam.type} KARNESİ
                </span>
                <p className="mt-1.5 text-[11px] font-semibold text-[#475569]">
                  Kurum Sırası: <strong className="text-[#135D43]">#{printingExam.rank}</strong>
                </p>
              </div>
            </div>

            {/* Student Info Strip */}
            <div className="mt-3.5 grid grid-cols-4 gap-2 rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] px-3.5 py-2.5 text-xs">
              <div>
                <p className="text-[9px] font-semibold uppercase text-[#737B86]">Öğrenci</p>
                <p className="font-bold text-[#203B5C]">{activeStudent.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase text-[#737B86]">Öğrenci No</p>
                <p className="font-bold text-[#203B5C]">{activeStudent.studentNo}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase text-[#737B86]">Sınıf &amp; Alan</p>
                <p className="font-bold text-[#203B5C]">
                  {activeStudent.className} ({activeStudent.track})
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase text-[#737B86]">Danışman</p>
                <p className="font-bold text-[#203B5C]">{activeStudent.advisorName}</p>
              </div>
            </div>

            {/* 4 Summary KPIs */}
            <div className="mt-3.5 grid grid-cols-4 gap-2.5">
              <div className="rounded-lg border border-[#DCE8E2] bg-[#F7FAF8] px-3 py-2.5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#4E5E57]">
                  Toplam Net
                </p>
                <p className="font-editorial mt-0.5 text-2xl font-semibold text-[#135D43]">
                  {printingExam.totalNet}
                  <span className="text-xs font-normal text-[#737B86]">
                    {" "}
                    / {printingExam.maxNet}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] px-3 py-2.5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#737B86]">
                  Kurum Sıralaması
                </p>
                <p className="font-editorial mt-0.5 text-2xl font-semibold text-[#203B5C]">
                  #{printingExam.rank}
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE4EE] bg-white px-3 py-2.5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#737B86]">
                  Başarı Oranı
                </p>
                <p className="font-editorial mt-0.5 text-2xl font-semibold text-[#203B5C]">
                  %{Math.max(0, Math.round((printingExam.totalNet / printingExam.maxNet) * 100))}
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE4EE] bg-white px-3 py-2.5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#737B86]">
                  Doğru / Yanlış / Boş
                </p>
                <p className="mt-1 text-sm font-bold text-[#203B5C]">
                  <span className="text-[#135D43]">{printTotals.correct}D</span>{" "}
                  · <span className="text-[#9A3412]">{printTotals.wrong}Y</span>{" "}
                  · <span className="text-[#64748B]">{printTotals.empty}B</span>
                </p>
              </div>
            </div>

            {/* Subject Net & Distribution Table */}
            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-[#203B5C] uppercase">
                Ders Bazlı Net &amp; Soru Dağılımı
              </p>
              <table className="w-full border-collapse overflow-hidden rounded-lg border border-[#DCE4EE] text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DCE4EE] bg-[#203B5C] text-[10px] font-bold uppercase tracking-wider text-white">
                    <th className="px-3 py-2">Ders Adı</th>
                    <th className="px-2.5 py-2 text-center">Soru</th>
                    <th className="px-2.5 py-2 text-center">Doğru</th>
                    <th className="px-2.5 py-2 text-center">Yanlış</th>
                    <th className="px-2.5 py-2 text-center">Boş</th>
                    <th className="px-2.5 py-2 text-center">Net</th>
                    <th className="px-3 py-2 text-right">Başarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EBEE]">
                  {printingExam.subjects.map((sub) => {
                    const totalQ = sub.correct + sub.wrong + sub.empty;
                    const pct = totalQ > 0 ? Math.max(0, Math.round((sub.net / totalQ) * 100)) : 0;
                    return (
                      <tr key={sub.name} className="bg-white">
                        <td className="px-3 py-2 font-bold text-[#203B5C]">{sub.name}</td>
                        <td className="px-2.5 py-2 text-center text-[#64748B]">{totalQ}</td>
                        <td className="px-2.5 py-2 text-center font-semibold text-[#135D43]">
                          {sub.correct}
                        </td>
                        <td className="px-2.5 py-2 text-center font-semibold text-[#9A3412]">
                          {sub.wrong}
                        </td>
                        <td className="px-2.5 py-2 text-center text-[#64748B]">{sub.empty}</td>
                        <td className="px-2.5 py-2 text-center font-bold text-[#135D43]">
                          {sub.net}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-[#203B5C]">
                          %{pct}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Compact Weak Topics Summary (Fits Page 1) */}
            {printWeakTopics.length > 0 && (
              <div className="mt-4 rounded-lg border border-[#F5C6BA] bg-[#FDF0ED]/35 p-3">
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#9A3412] uppercase">
                  Öncelikli Konu Eksikleri ({printWeakTopics.length} Konu)
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  {printWeakTopics.slice(0, 14).map((t, idx) => (
                    <div
                      key={`${t.subject}-${t.topic}-${idx}`}
                      className="flex items-center justify-between border-b border-[#F5C6BA]/40 pb-0.5"
                    >
                      <span className="truncate text-[#203B5C]">
                        <strong className="text-[#11284B]">{t.subject}:</strong> {t.topic}
                      </span>
                      <span className="ml-2 shrink-0 font-bold text-[#9A3412]">
                        {t.wrong}Y {t.empty}B
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-[#E9EBEE] pt-2.5 text-[10px] text-[#737B86]">
              <span>DERSHANE Akademik Takip &amp; Mentorluk Sistemi</span>
              <span>Danışman Onayı: {activeStudent.advisorName}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
