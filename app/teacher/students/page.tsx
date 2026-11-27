"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  MessageSquareHeart,
  Phone,
  Plus,
  Search,
  Target,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { isGuidanceRole, useCampus, type StudentExamRecord } from "@/lib/campus-store";
import { StudentNetCharts } from "@/components/student-net-charts";
import { PRESET_SUBJECTS, WeeklyTimetable } from "@/components/WeeklyTimetable";

const SUBJECT_MAX_QUESTIONS: Record<string, number> = {
  Türkçe: 40,
  Matematik: 40,
  "Sosyal Bilimler": 20,
  "Fen Bilimleri": 20,
  Fizik: 14,
  Kimya: 13,
  Biyoloji: 13,
  Edebiyat: 24,
  "Türk Dili ve Edebiyatı": 24,
  "Tarih-1": 10,
  "Coğrafya-1": 6,
  "Tarih-2": 11,
  "Coğrafya-2": 11,
  "Felsefe Grubu": 12,
  "Din Kültürü": 6,
  "Sosyal-2": 40,
};

function getWeakestSubject(exam?: StudentExamRecord) {
  if (!exam || exam.subjects.length === 0) return null;
  const ranked = exam.subjects
    .map((sub) => {
      const maxQ = SUBJECT_MAX_QUESTIONS[sub.name] ?? 20;
      const ratio = sub.net / maxQ;
      return {
        ...sub,
        maxQ,
        percent: Math.max(0, Math.round(ratio * 100)),
      };
    })
    .sort((a, b) => a.percent - b.percent);
  return ranked[0] ?? null;
}

export default function TeacherStudentsPage() {
  const {
    students,
    classes,
    activeTeacher,
    addHomeworkToStudent,
    toggleHomeworkStatus,
    deleteHomeworkFromStudent,
  } = useCampus();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id ?? ""
  );
  const [hwSubject, setHwSubject] = useState<string>("Matematik");
  const [hwTitle, setHwTitle] = useState("");
  const [hwDueDate, setHwDueDate] = useState("2026-11-28");

  const isGuidanceTeacher = isGuidanceRole(activeTeacher);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== "ALL" && s.classId !== classFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        s.track.toLowerCase().includes(q)
      );
    });
  }, [students, search, classFilter]);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ??
    filtered[0] ??
    students[0];

  const myClass = classes.find((c) => c.id === selectedStudent?.classId);
  const combinedSchedule = [
    ...(myClass?.schedule ?? []),
    ...(selectedStudent?.schedule ?? []),
  ];

  const latestTyt = useMemo(() => {
    if (!selectedStudent) return undefined;
    const tyts = selectedStudent.exams.filter((e) => e.type === "TYT");
    return tyts[tyts.length - 1];
  }, [selectedStudent]);

  const latestAyt = useMemo(() => {
    if (!selectedStudent) return undefined;
    const ayts = selectedStudent.exams.filter((e) => e.type === "AYT");
    return ayts[ayts.length - 1];
  }, [selectedStudent]);

  const weakestSubject = useMemo(
    () => getWeakestSubject(latestTyt),
    [latestTyt]
  );

  return (
    <div className="space-y-7">
      {/* Header + Filters */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Akademik Takip ({students.length} Öğrenci)
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
            Öğrenciler &amp; Detaylı Net Durumları
          </h1>
          <p className="mt-1 text-xs text-[#737B86]">
            Listeden bir öğrenciye tıklayarak deneme analizlerini, ödev durumunu ve haftalık ders programını inceleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-md border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-medium text-[#203B5C] outline-none focus:border-[#203B5C]"
          >
            <option value="ALL">Tüm Sınıflar ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#737B86]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Öğrenci adı, no veya sınıf ara..."
              className="w-full rounded-md border border-[#DCE4EE] bg-white py-2 pr-3 pl-9 text-xs outline-none focus:border-[#203B5C]"
            />
          </div>
        </div>
      </div>

      {/* Top: Larger & Wider Scrollable List Table */}
      <div className="overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E9EBEE] bg-[#FAF8F5] px-6 py-4">
          <span className="flex items-center gap-2 text-sm font-bold text-[#203B5C]">
            <Users className="h-4 w-4 text-[#135D43]" />
            Kayıtlı Öğrenci Listesi ({filtered.length})
          </span>
          <span className="text-xs text-[#737B86]">
            Detay ve eksik ders analizi için satıra tıklayın
          </span>
        </div>

        {/* Mobile Student Cards */}
        <div className="max-h-[420px] space-y-2.5 overflow-y-auto p-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#737B86]">
              Aramanızla eşleşen öğrenci bulunamadı.
            </p>
          ) : (
            filtered.map((s) => {
              const tyts = s.exams.filter((e) => e.type === "TYT");
              const ayts = s.exams.filter((e) => e.type === "AYT");
              const tyt = tyts[tyts.length - 1];
              const ayt = ayts[ayts.length - 1];
              const weak = getWeakestSubject(tyt);
              const isSelected = s.id === selectedStudent?.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? "border-[#135D43] bg-[#EAF6F0] ring-1 ring-[#135D43]"
                      : "border-[#E2E8F0] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#11284B]">
                        {s.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#64748B]">
                        #{s.studentNo} · {s.className} ({s.track})
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        isSelected
                          ? "bg-[#135D43] text-white"
                          : "border border-[#DCE4EE] bg-white text-[#203B5C]"
                      }`}
                    >
                      {isSelected ? "Seçili" : "İncele"}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-white px-2 py-0.5 font-bold text-[#135D43]">
                      TYT: {tyt ? `${tyt.totalNet}` : "—"}
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 font-semibold text-[#203B5C]">
                      AYT: {ayt ? `${ayt.totalNet}` : "—"}
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[#4B5563]">
                      Devam: %{s.attendance}
                    </span>
                    {weak && (
                      <span className="rounded-md bg-[#FDF0ED] px-2 py-0.5 text-[11px] font-semibold text-[#9A3412]">
                        {weak.name} (%{weak.percent})
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="hidden max-h-[540px] overflow-x-auto overflow-y-auto md:block">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="px-5 py-3.5">Öğrenci No</th>
                <th className="px-5 py-3.5">Ad Soyad</th>
                <th className="px-5 py-3.5">Sınıf &amp; Alan</th>
                <th className="px-5 py-3.5">Son TYT</th>
                <th className="px-5 py-3.5">Son AYT</th>
                <th className="px-5 py-3.5">Eksik Ders</th>
                <th className="px-5 py-3.5">Devam</th>
                <th className="px-5 py-3.5">Danışman</th>
                <th className="px-5 py-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-sm text-[#737B86]"
                  >
                    Aramanızla eşleşen öğrenci bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const tyts = s.exams.filter((e) => e.type === "TYT");
                  const ayts = s.exams.filter((e) => e.type === "AYT");
                  const tyt = tyts[tyts.length - 1];
                  const ayt = ayts[ayts.length - 1];
                  const weak = getWeakestSubject(tyt);
                  const isSelected = s.id === selectedStudent?.id;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#EAF6F0]"
                          : "hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-[#64748B]">
                        {s.studentNo}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#11284B]">
                        {s.name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#4B5563]">
                        {s.className} ·{" "}
                        <span className="font-semibold text-[#203B5C]">
                          {s.track}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#135D43]">
                        {tyt ? `${tyt.totalNet} Net` : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#203B5C]">
                        {ayt ? `${ayt.totalNet} Net` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {weak ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#FDF0ED] px-2.5 py-1 text-[11px] font-semibold text-[#9A3412]">
                            {weak.name} (%{weak.percent})
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#4B5563]">
                        %{s.attendance}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#64748B]">
                        {s.advisorName}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-block rounded-lg px-3 py-1.5 text-xs font-bold ${
                            isSelected
                              ? "bg-[#135D43] text-white"
                              : "border border-[#DCE4EE] bg-white text-[#203B5C]"
                          }`}
                        >
                          {isSelected ? "Seçili" : "İncele"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom: Selected Student Full Details */}
      {selectedStudent && (
        <div className="space-y-6 rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-xs">
          {/* Student Banner */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#135D43] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Seçili Öğrenci Detayı
                </span>
                <span className="rounded bg-[#EEF3F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#11284B]">
                  {selectedStudent.className} • {selectedStudent.track}
                </span>
                <span className="font-mono text-xs text-[#737B86]">
                  No: {selectedStudent.studentNo}
                </span>
              </div>
              <h2 className="font-editorial mt-2 text-2xl font-medium text-[#203B5C]">
                {selectedStudent.name}
              </h2>
              <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-[#4E5E57]">
                <span className="inline-flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-[#B18A52]" />
                  Hedef: <strong className="text-[#203B5C]">{selectedStudent.target}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-[#135D43]" />
                  Danışman: {selectedStudent.advisorName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-[#64748B]" />
                  Veli: {selectedStudent.parentName} ({selectedStudent.phone})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-[#DCE8E2] bg-[#F0F7F4] px-4 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase text-[#135D43]">
                  Son TYT Neti
                </p>
                <p className="font-editorial text-2xl font-semibold text-[#135D43]">
                  {latestTyt ? latestTyt.totalNet : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#E5DEC9] bg-[#FCFBF8] px-4 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase text-[#9A743E]">
                  Son AYT Neti
                </p>
                <p className="font-editorial text-2xl font-semibold text-[#203B5C]">
                  {latestAyt ? latestAyt.totalNet : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#FAF8F5] px-4 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">
                  Devam Oranı
                </p>
                <p className="font-editorial text-2xl font-semibold text-[#203B5C]">
                  %{selectedStudent.attendance}
                </p>
              </div>
            </div>
          </div>

          {/* Weakest Subject Alert */}
          {weakestSubject && (
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#F5C6BA] bg-[#FDF0ED]/70 p-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3 sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9A3412]/15 text-[#9A3412]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A3412]">
                    Öğrencinin Eksik Olduğu Ders
                  </p>
                  <p className="mt-0.5 text-sm text-[#11284B]">
                    Son TYT denemesinde en düşük başarı oranı{" "}
                    <strong className="font-bold text-[#9A3412]">
                      {weakestSubject.name}
                    </strong>{" "}
                    dersinde (
                    <strong>
                      {weakestSubject.net} / {weakestSubject.maxQ} Net — %
                      {weakestSubject.percent}
                    </strong>
                    ) ölçüldü. {weakestSubject.wrong} yanlış,{" "}
                    {weakestSubject.empty} boş bulunuyor; öncelikli birebir etüt
                    önerilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Animated Net Charts */}
          {selectedStudent.exams.length > 0 && (
            <StudentNetCharts exams={selectedStudent.exams} />
          )}

          {/* Exam Breakdown Cards */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#203B5C]">
              <Award className="h-4 w-4 text-[#B18A52]" />
              <span>Deneme Sınavı Geçmişi &amp; Ders Bazlı Net Kırılımı</span>
            </h3>
            {selectedStudent.exams.length === 0 ? (
              <p className="text-xs text-[#737B86]">
                Henüz kayıtlı deneme sınavı bulunmuyor.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedStudent.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-[#E9EBEE] bg-[#FCFBF8] p-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-2.5">
                      <div>
                        <span className="rounded bg-[#203B5C] px-2 py-0.5 text-[10px] font-semibold text-[#E8C483]">
                          {exam.type}
                        </span>
                        <span className="ml-2 text-[11px] text-[#737B86]">
                          {exam.date}
                        </span>
                        <p className="mt-1 text-sm font-semibold text-[#203B5C]">
                          {exam.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-editorial text-xl font-semibold text-[#135D43]">
                          {exam.totalNet} Net
                        </p>
                        <p className="text-[10px] text-[#737B86]">
                          Sıralama: #{exam.rank}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {exam.subjects.map((sub) => (
                        <div
                          key={sub.name}
                          className="flex items-center justify-between rounded bg-white px-2.5 py-1.5 border border-[#E9EBEE]"
                        >
                          <span className="text-[#4E5E57]">{sub.name}</span>
                          <span className="font-bold text-[#203B5C]">
                            {sub.net} ({sub.correct}D/{sub.wrong}Y)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Homework & Guidance */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-[#E9EBEE] bg-[#FAF8F5]/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#203B5C]">
                  <ClipboardList className="h-4 w-4 text-[#C58B3B]" />
                  <span>Ödevlendirmeler ({selectedStudent.homework.length})</span>
                </h3>
                {isGuidanceTeacher ? (
                  <span className="rounded bg-[#EAF6F0] px-2 py-0.5 text-[10px] font-bold text-[#135D43]">
                    Rehberlik Ödev Yetkisi Aktif
                  </span>
                ) : (
                  <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
                    Salt Okunur (Branş)
                  </span>
                )}
              </div>

              {isGuidanceTeacher ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!hwTitle.trim()) return;
                    addHomeworkToStudent(selectedStudent.id, {
                      subject: hwSubject,
                      title: hwTitle.trim(),
                      dueDate: hwDueDate,
                      teacherName: activeTeacher?.name ?? "Rehber Öğretmen",
                      status: "Bekliyor",
                    });
                    setHwTitle("");
                  }}
                  className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs sm:grid-cols-4"
                >
                  <select
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2 py-1.5"
                  >
                    {PRESET_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="Ödev konusu / soru sayısı..."
                    className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2.5 py-1.5 sm:col-span-2"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2 py-1.5"
                    />
                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center gap-1 rounded bg-[#135D43] px-3 py-1.5 font-semibold text-white hover:bg-[#0E4A35]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Ata</span>
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-2 rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] text-[#64748B]">
                  Ödevlendirme yetkisi yalnızca Rehberlik / Danışman öğretmenlere aittir.
                </p>
              )}

              <div className="mt-3 space-y-2">
                {selectedStudent.homework.length === 0 ? (
                  <p className="text-xs text-[#737B86]">
                    Atanmış ödev bulunmuyor.
                  </p>
                ) : (
                  selectedStudent.homework.map((hw) => (
                    <div
                      key={hw.id}
                      className="flex items-start gap-2.5 rounded-lg border border-[#E9EBEE] bg-white p-3 text-xs"
                    >
                      {hw.status === "Tamamlandı" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#135D43]" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#737B86]" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#135D43]">
                            {hw.subject}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-[#9A743E]">
                              {hw.status} • {hw.dueDate}
                            </span>
                            {isGuidanceTeacher && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleHomeworkStatus(selectedStudent.id, hw.id)
                                  }
                                  className="rounded border border-[#DCE4EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#135D43] hover:bg-[#EAF6F0]"
                                >
                                  {hw.status === "Tamamlandı" ? "Geri Al" : "Tamamla"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteHomeworkFromStudent(selectedStudent.id, hw.id)
                                  }
                                  title="Ödevi Sil"
                                  className="rounded p-0.5 text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="mt-0.5 font-medium text-[#203B5C]">
                          {hw.title}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#E9EBEE] bg-[#FAF8F5]/70 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#203B5C]">
                <MessageSquareHeart className="h-4 w-4 text-[#9A743E]" />
                <span>
                  Rehberlik Görüşmeleri ({selectedStudent.guidanceSessions.length})
                </span>
              </h3>
              <div className="mt-3 space-y-2">
                {selectedStudent.guidanceSessions.length === 0 ? (
                  <p className="text-xs text-[#737B86]">
                    Kayıtlı rehberlik görüşmesi bulunmuyor.
                  </p>
                ) : (
                  selectedStudent.guidanceSessions.map((gs) => (
                    <div
                      key={gs.id}
                      className="rounded-lg border border-[#E9EBEE] bg-white p-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#9A743E]">
                        <span>
                          {gs.date} • {gs.time}
                        </span>
                        <span>{gs.status}</span>
                      </div>
                      <p className="mt-1 font-semibold text-[#203B5C]">
                        {gs.topic}
                      </p>
                      {gs.note && (
                        <p className="mt-0.5 text-[#737B86]">{gs.note}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Student Weekly Timetable */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#203B5C]">
              <CalendarDays className="h-4 w-4 text-[#135D43]" />
              <span>
                <BookOpen className="mr-1 inline h-3.5 w-3.5" />
                Öğrencinin Haftalık Ders Programı ({selectedStudent.className})
              </span>
            </h3>
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
        </div>
      )}
    </div>
  );
}
