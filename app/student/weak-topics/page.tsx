"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Filter,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { useCampus } from "@/lib/campus-store";

export default function StudentWeakTopicsPage() {
  const { activeStudent } = useCampus();
  const [examFilter, setExamFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const allTopics = useMemo(() => {
    const rows: {
      examId: string;
      examTitle: string;
      examDate: string;
      subject: string;
      topic: string;
      total: number;
      correct: number;
      wrong: number;
      empty: number;
      percent: number;
    }[] = [];

    activeStudent.exams.forEach((ex) => {
      if (!ex.topicBreakdown || ex.topicBreakdown.length === 0) return;
      ex.topicBreakdown.forEach((t) => {
        rows.push({
          examId: ex.id,
          examTitle: ex.title,
          examDate: ex.date,
          ...t,
        });
      });
    });

    return rows;
  }, [activeStudent.exams]);

  const subjects = useMemo(
    () => Array.from(new Set(allTopics.map((t) => t.subject))),
    [allTopics]
  );

  const examsWithTopics = useMemo(
    () => activeStudent.exams.filter((e) => (e.topicBreakdown?.length ?? 0) > 0),
    [activeStudent.exams]
  );

  const filteredTopics = useMemo(() => {
    return allTopics
      .filter((t) => {
        if (examFilter !== "ALL" && t.examId !== examFilter) return false;
        if (subjectFilter !== "ALL" && t.subject !== subjectFilter) return false;
        if (onlyWeak && t.wrong === 0 && t.empty === 0) return false;
        return true;
      })
      .sort((a, b) => a.percent - b.percent || b.wrong - a.wrong);
  }, [allTopics, examFilter, subjectFilter, onlyWeak]);

  // Group by subject for card view
  const groupedBySubject = useMemo(() => {
    const map = new Map<string, typeof filteredTopics>();
    filteredTopics.forEach((row) => {
      const list = map.get(row.subject) || [];
      list.push(row);
      map.set(row.subject, list);
    });
    return Array.from(map.entries()).map(([subject, items]) => {
      const totalQ = items.reduce((acc, i) => acc + i.total, 0);
      const totalC = items.reduce((acc, i) => acc + i.correct, 0);
      const totalW = items.reduce((acc, i) => acc + i.wrong, 0);
      const totalE = items.reduce((acc, i) => acc + i.empty, 0);
      const avgPct = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
      return { subject, items, totalW, totalE, avgPct };
    });
  }, [filteredTopics]);

  const weakCount = useMemo(
    () => allTopics.filter((t) => t.wrong > 0 || t.empty > 0).length,
    [allTopics]
  );

  const weakestSubjectName = useMemo(() => {
    const map = new Map<string, { wrong: number; empty: number }>();
    allTopics.forEach((t) => {
      const cur = map.get(t.subject) || { wrong: 0, empty: 0 };
      map.set(t.subject, {
        wrong: cur.wrong + t.wrong,
        empty: cur.empty + t.empty,
      });
    });
    const sorted = Array.from(map.entries()).sort(
      (a, b) => b[1].wrong + b[1].empty - (a[1].wrong + a[1].empty)
    );
    return sorted[0]?.[0] ?? "—";
  }, [allTopics]);

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Deneme PDF Konu Analizi
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
          <AlertTriangle className="h-6 w-6 text-[#9A3412]" />
          <span>Konu Eksiklerim</span>
        </h1>
        <p className="mt-1 text-xs text-[#737B86]">
          Yüklenen deneme karnelerindeki yanlış ve boş bıraktığınız konular ders bazında analiz edilerek burada listelenir.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-3 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] sm:text-[11px]">
            Analiz Edilen Konu
          </p>
          <p className="font-editorial mt-1 text-xl font-semibold text-[#203B5C] sm:text-3xl">
            {allTopics.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#F5C6BA] bg-[#FDF0ED]/60 p-3 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A3412] sm:text-[11px]">
            Eksik / Yanlışlı
          </p>
          <p className="font-editorial mt-1 text-xl font-semibold text-[#9A3412] sm:text-3xl">
            {weakCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-[#FCFBF8] p-3 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A743E] sm:text-[11px]">
            Öncelikli Ders
          </p>
          <p className="font-editorial mt-1 truncate text-base font-semibold text-[#203B5C] sm:text-3xl">
            {weakestSubjectName}
          </p>
        </div>
      </div>

      {/* Filters + View Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE4EE] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#203B5C]">
            <Filter className="h-3.5 w-3.5 text-[#135D43]" />
            Filtrele:
          </span>
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#203B5C]"
          >
            <option value="ALL">Tüm Denemeler</option>
            {examsWithTopics.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.date})
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#203B5C]"
          >
            <option value="ALL">Tüm Dersler</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#203B5C]">
            <input
              type="checkbox"
              checked={onlyWeak}
              onChange={(e) => setOnlyWeak(e.target.checked)}
              className="rounded border-[#DCE4EE]"
            />
            Yalnızca Eksikler
          </label>
        </div>

        <div className="inline-flex rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
              viewMode === "cards"
                ? "bg-[#11284B] text-white"
                : "text-[#64748B] hover:text-[#11284B]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Ders Kartları</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
              viewMode === "table"
                ? "bg-[#11284B] text-white"
                : "text-[#64748B] hover:text-[#11284B]"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Tablo</span>
          </button>
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-10 text-center text-sm text-[#737B86]">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-[#135D43]" />
          Seçili filtreye göre konu kaydı bulunamadı.
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {groupedBySubject.map((group) => (
            <div
              key={group.subject}
              className="flex flex-col rounded-2xl border border-[#DCE4EE] bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#11284B]/10 text-[#11284B]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#11284B]">
                      {group.subject}
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      {group.items.length} konu · {group.totalW} Yanlış,{" "}
                      {group.totalE} Boş
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    group.avgPct >= 80
                      ? "bg-[#EAF6F0] text-[#0E4D3A]"
                      : group.avgPct >= 50
                      ? "bg-[#FEF7E6] text-[#8A6508]"
                      : "bg-[#FDF0ED] text-[#9A3412]"
                  }`}
                >
                  %{group.avgPct} Başarı
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {group.items.map((row, idx) => {
                  const isWeak = row.wrong > 0 || row.empty > 0;
                  return (
                    <div
                      key={`${row.examId}-${row.topic}-${idx}`}
                      className={`rounded-xl border p-3 ${
                        isWeak
                          ? "border-[#F5C6BA]/80 bg-[#FDF0ED]/35"
                          : "border-[#E9EBEE] bg-[#FAF8F5]/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#203B5C]">
                            {row.topic}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#737B86]">
                            {row.examTitle}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                            isWeak
                              ? "bg-[#FDF0ED] text-[#9A3412]"
                              : "bg-[#EAF6F0] text-[#0E4D3A]"
                          }`}
                        >
                          {isWeak ? `${row.wrong}Y ${row.empty}B` : "Tam"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className={`h-full rounded-full ${
                              row.percent >= 80
                                ? "bg-[#135D43]"
                                : row.percent >= 50
                                ? "bg-[#B8860B]"
                                : "bg-[#9A3412]"
                            }`}
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#11284B]">
                          {row.correct}/{row.total} (%{row.percent})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white shadow-xs">
          {/* Mobile Card List */}
          <div className="space-y-2.5 p-3 md:hidden">
            {filteredTopics.map((row, idx) => (
              <div
                key={`${row.examId}-${row.subject}-${row.topic}-${idx}`}
                className="rounded-xl border border-[#E2E8F0] bg-[#FAF8F5]/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-[#EEF3F9] px-2 py-0.5 text-[10px] font-bold text-[#11284B]">
                      <BookOpen className="h-3 w-3" />
                      {row.subject}
                    </span>
                    <p className="mt-1.5 text-sm font-bold text-[#203B5C]">
                      {row.topic}
                    </p>
                    <p className="text-[11px] text-[#64748B]">{row.examTitle}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold text-white ${
                      row.percent >= 80
                        ? "bg-[#135D43]"
                        : row.percent >= 50
                        ? "bg-[#B8860B]"
                        : "bg-[#9A3412]"
                    }`}
                  >
                    %{row.percent}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-3 text-xs">
                  <span className="font-medium text-[#11284B]">
                    {row.total} Soru
                  </span>
                  <span className="font-bold text-[#135D43]">
                    {row.correct}D
                  </span>
                  <span className="font-bold text-[#9A3412]">{row.wrong}Y</span>
                  <span className="text-[#64748B]">{row.empty}B</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-[#E2E8F0] bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Ders</th>
                  <th className="px-4 py-3">Konu Adı</th>
                  <th className="px-4 py-3">Deneme</th>
                  <th className="px-4 py-3 text-center">Soru</th>
                  <th className="px-4 py-3 text-center">Doğru</th>
                  <th className="px-4 py-3 text-center">Yanlış</th>
                  <th className="px-4 py-3 text-center">Boş</th>
                  <th className="px-4 py-3">Başarı Oranı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredTopics.map((row, idx) => (
                  <tr
                    key={`${row.examId}-${row.subject}-${row.topic}-${idx}`}
                    className="hover:bg-[#FAF8F5]/70"
                  >
                    <td className="px-4 py-3 font-semibold text-[#11284B]">
                      <span className="inline-flex items-center gap-1 rounded bg-[#EEF3F9] px-2 py-0.5 text-[11px] text-[#11284B]">
                        <BookOpen className="h-3 w-3" />
                        {row.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#203B5C]">
                      {row.topic}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{row.examTitle}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      {row.total}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#135D43]">
                      {row.correct}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#9A3412]">
                      {row.wrong}
                    </td>
                    <td className="px-4 py-3 text-center text-[#64748B]">
                      {row.empty}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className={`h-full rounded-full ${
                              row.percent >= 80
                                ? "bg-[#135D43]"
                                : row.percent >= 50
                                ? "bg-[#B8860B]"
                                : "bg-[#9A3412]"
                            }`}
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#203B5C]">
                          %{row.percent}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
