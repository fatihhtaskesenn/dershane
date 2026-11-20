"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  FileUp,
  Loader2,
  MessageSquareHeart,
  Search,
  UserCheck,
} from "lucide-react";
import { useCampus, type WeekDay } from "@/lib/campus-store";
import { StudentNetCharts } from "@/components/student-net-charts";
import { PRESET_SUBJECTS, WeeklyTimetable } from "@/components/WeeklyTimetable";
import { parseSingleStudentKarnePdf } from "@/lib/exam-pdf-parser";

function formatIsoToTrDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type DetailTab = "exam" | "homework" | "guidance";

export default function AdminStudentsPage() {
  const {
    students,
    classes,
    addExamToStudent,
    addHomeworkToStudent,
    addGuidanceToStudent,
  } = useCampus();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id ?? ""
  );
  const [activeTab, setActiveTab] = useState<DetailTab>("exam");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam && students.some((s) => s.id === idParam)) {
      setSelectedStudentId(idParam);
    }
  }, [students]);

  // Exam Form
  const [examTitle, setExamTitle] = useState("Türkiye Geneli TYT Denemesi #7");
  const [examType, setExamType] = useState<"TYT" | "AYT">("TYT");
  const [examDate, setExamDate] = useState("2026-11-22");
  const [examRank, setExamRank] = useState("42");
  const [sub1C, setSub1C] = useState("34");
  const [sub1W, setSub1W] = useState("4");
  const [sub2C, setSub2C] = useState("30");
  const [sub2W, setSub2W] = useState("4");
  const [sub3C, setSub3C] = useState("16");
  const [sub3W, setSub3W] = useState("2");
  const [sub4C, setSub4C] = useState("16");
  const [sub4W, setSub4W] = useState("2");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState("");

  // Homework Form
  const [hwSubject, setHwSubject] = useState("Matematik");
  const [hwTitle, setHwTitle] = useState("");
  const [hwDueDate, setHwDueDate] = useState("2026-11-28");

  // Guidance Form
  const [gsDate, setGsDate] = useState("2026-11-25");
  const [gsTime, setGsTime] = useState("16:00");
  const [gsTopic, setGsTopic] = useState("");
  const [gsNote, setGsNote] = useState("");

  const filtered = students.filter((s) => {
    if (classFilter !== "ALL" && s.classId !== classFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q) ||
      s.studentNo.toLowerCase().includes(q) ||
      s.track.toLowerCase().includes(q)
    );
  });

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ?? students[0];

  const myClass = classes.find((c) => c.id === selectedStudent?.classId);
  const combinedSchedule = [
    ...(myClass?.schedule ?? []),
    ...(selectedStudent?.schedule ?? []),
  ];

  const selectedStudentSubjectCounts = useMemo(() => {
    const map = new Map<string, number>();
    combinedSchedule.forEach((slot) => {
      const key = slot.subject.replace(/\s*\(Birebir\)\s*$/i, "").trim();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [combinedSchedule]);

  const examSubjectSchema = useMemo(() => {
    if (examType === "TYT") {
      return [
        { name: "Türkçe", maxQ: 40 },
        { name: "Matematik", maxQ: 40 },
        { name: "Sosyal Bilimler", maxQ: 20 },
        { name: "Fen Bilimleri", maxQ: 20 },
      ];
    }
    if (selectedStudent?.track === "Eşit Ağırlık") {
      return [
        { name: "Matematik", maxQ: 40 },
        { name: "Edebiyat", maxQ: 24 },
        { name: "Tarih-1", maxQ: 10 },
        { name: "Coğrafya-1", maxQ: 6 },
      ];
    }
    if (selectedStudent?.track === "Sözel") {
      return [
        { name: "Edebiyat", maxQ: 24 },
        { name: "Tarih-1", maxQ: 10 },
        { name: "Coğrafya-1", maxQ: 6 },
        { name: "Sosyal-2", maxQ: 40 },
      ];
    }
    return [
      { name: "Matematik", maxQ: 40 },
      { name: "Fizik", maxQ: 14 },
      { name: "Kimya", maxQ: 13 },
      { name: "Biyoloji", maxQ: 13 },
    ];
  }, [examType, selectedStudent?.track]);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const calc = (c: number, w: number) => Number((c - w / 4).toFixed(2));
    const pairs = [
      [Number(sub1C) || 0, Number(sub1W) || 0],
      [Number(sub2C) || 0, Number(sub2W) || 0],
      [Number(sub3C) || 0, Number(sub3W) || 0],
      [Number(sub4C) || 0, Number(sub4W) || 0],
    ];
    const subjects = examSubjectSchema.map((schema, i) => {
      const correct = Math.min(schema.maxQ, Math.max(0, pairs[i][0]));
      const wrong = Math.min(schema.maxQ - correct, Math.max(0, pairs[i][1]));
      const empty = Math.max(0, schema.maxQ - correct - wrong);
      return {
        name: schema.name,
        correct,
        wrong,
        empty,
        net: calc(correct, wrong),
      };
    });
    const totalNet = Number(
      subjects.reduce((acc, s) => acc + s.net, 0).toFixed(2)
    );
    addExamToStudent(selectedStudent.id, {
      title: examTitle,
      type: examType,
      date: formatIsoToTrDate(examDate),
      totalNet,
      maxNet: examType === "TYT" ? 120 : 80,
      rank: Number(examRank) || 1,
      subjects,
    });
  };

  const handleIndividualPdfUpload = async (file: File | undefined) => {
    if (!file || !selectedStudent) return;
    setPdfUploading(true);
    setPdfFeedback("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-exam-pdf", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setPdfFeedback(data.error || "PDF okunamadı.");
        return;
      }
      const raw = String(data.text ?? "");
      if (raw.trim().length < 20) {
        setPdfFeedback(
          "Bu PDF dosyasında metin katmanı bulunamadı (taranmış görsel PDF olabilir). Dijital metin içeren bir karne PDF'i yükleyin."
        );
        return;
      }
      const parsed = parseSingleStudentKarnePdf(raw);
      if (parsed.subjects.length === 0 && parsed.topicBreakdown.length === 0) {
        setPdfFeedback(
          "PDF okundu ancak ders/konu netleri çıkarılamadı."
        );
        return;
      }
      const resolvedType = parsed.detectedType ?? examType;
      if (parsed.detectedType) setExamType(parsed.detectedType);
      addExamToStudent(selectedStudent.id, {
        title: parsed.detectedTitle || examTitle,
        type: resolvedType,
        date: parsed.detectedDate || formatIsoToTrDate(examDate),
        totalNet: parsed.totalNet,
        maxNet: resolvedType === "TYT" ? 120 : 80,
        rank: Number(examRank) || 1,
        subjects: parsed.subjects,
        topicBreakdown: parsed.topicBreakdown,
      });
      const weakCount = parsed.topicBreakdown.filter(
        (t) => t.wrong > 0 || t.empty > 0
      ).length;
      setPdfFeedback(
        `${selectedStudent.name} için "${file.name}" analiz edildi (${parsed.totalNet} Net, ${weakCount} eksik konu) ve profile işlendi!`
      );
    } catch {
      setPdfFeedback("PDF yüklenirken hata oluştu.");
    } finally {
      setPdfUploading(false);
    }
  };

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !hwTitle.trim()) return;
    addHomeworkToStudent(selectedStudent.id, {
      subject: hwSubject,
      title: hwTitle.trim(),
      dueDate: formatIsoToTrDate(hwDueDate),
      teacherName: selectedStudent.advisorName,
      status: "Bekliyor",
    });
    setHwTitle("");
  };

  const handleAddGuidance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !gsTopic.trim()) return;
    addGuidanceToStudent(selectedStudent.id, {
      date: formatIsoToTrDate(gsDate),
      time: gsTime,
      advisorName: selectedStudent.advisorName,
      topic: gsTopic.trim(),
      note: gsNote.trim(),
      status: "Planlandı",
    });
    setGsTopic("");
    setGsNote("");
  };

  return (
    <div className="space-y-7">
      {/* Header + Search */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Öğrenci Bazlı Yönetim &amp; Takip
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
            Öğrenci Durumları
          </h1>
          <p className="mt-1 text-sm text-[#737B86]">
            Bir öğrenci seçerek aktif ders programını, birebirlerini, deneme
            netlerini, ödevlerini ve rehberlik notlarını görüntüleyip yönetin.
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

      {/* Scrollable Student List Table */}
      <div className="overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E9EBEE] bg-[#FAF8F5] px-5 py-3">
          <span className="text-xs font-bold text-[#203B5C]">
            Kayıtlı Öğrenciler ({filtered.length})
          </span>
          <span className="text-[11px] text-[#737B86]">
            Yönetmek istediğiniz öğrenci satırına tıklayın
          </span>
        </div>

        {/* Mobile Student Cards */}
        <div className="max-h-[380px] space-y-2.5 overflow-y-auto p-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#737B86]">
              Aramanızla eşleşen öğrenci bulunamadı.
            </p>
          ) : (
            filtered.map((s) => {
              const active = selectedStudent?.id === s.id;
              const tyts = s.exams.filter((e) => e.type === "TYT");
              const ayts = s.exams.filter((e) => e.type === "AYT");
              const tyt = tyts[tyts.length - 1];
              const ayt = ayts[ayts.length - 1];
              const stuClass = classes.find((c) => c.id === s.classId);
              const weeklyHours = (stuClass?.schedule.length ?? 0) + s.schedule.length;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    active
                      ? "border-[#135D43] bg-[#EAF6F0] ring-1 ring-[#135D43]"
                      : "border-[#E2E8F0] bg-[#FAF8F5]/60"
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
                      className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                        active
                          ? "bg-[#135D43] text-white"
                          : "border border-[#DCE4EE] bg-white text-[#203B5C]"
                      }`}
                    >
                      {active ? "Seçili" : "Yönet"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-white px-2 py-0.5 font-bold text-[#135D43]">
                      TYT: {tyt ? `${tyt.totalNet}` : "—"}
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 font-semibold text-[#203B5C]">
                      AYT: {ayt ? `${ayt.totalNet}` : "—"}
                    </span>
                    <span className="rounded bg-[#EEF3F9] px-2 py-0.5 font-semibold text-[#11284B]">
                      {weeklyHours} Saat/Hf
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 text-[11px] text-[#64748B]">
                      {s.advisorName}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="hidden max-h-[380px] overflow-x-auto overflow-y-auto md:block">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Öğrenci No</th>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">Sınıf &amp; Alan</th>
                <th className="px-4 py-3">Son TYT</th>
                <th className="px-4 py-3">Son AYT</th>
                <th className="px-4 py-3">Haftalık Ders</th>
                <th className="px-4 py-3">Danışman</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-xs text-[#737B86]"
                  >
                    Aramanızla eşleşen öğrenci bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const active = selectedStudent?.id === s.id;
                  const tyts = s.exams.filter((e) => e.type === "TYT");
                  const ayts = s.exams.filter((e) => e.type === "AYT");
                  const tyt = tyts[tyts.length - 1];
                  const ayt = ayts[ayts.length - 1];
                  const stuClass = classes.find((c) => c.id === s.classId);
                  const classHrs = stuClass?.schedule.length ?? 0;
                  const oneOnOneHrs = s.schedule.length;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`cursor-pointer transition-colors ${
                        active ? "bg-[#EAF6F0]" : "hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-[#64748B]">
                        {s.studentNo}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#11284B]">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">
                        {s.className} ·{" "}
                        <span className="font-medium text-[#203B5C]">
                          {s.track}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#135D43]">
                        {tyt ? `${tyt.totalNet} Net` : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#203B5C]">
                        {ayt ? `${ayt.totalNet} Net` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#EEF3F9] px-2 py-0.5 text-[11px] font-bold text-[#11284B]">
                          {classHrs + oneOnOneHrs} Saat
                        </span>
                        <span className="ml-1 text-[10px] text-[#64748B]">
                          ({classHrs}+{oneOnOneHrs})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {s.advisorName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block rounded-md px-3 py-1 text-[11px] font-bold ${
                            active
                              ? "bg-[#135D43] text-white"
                              : "border border-[#DCE4EE] bg-white text-[#203B5C]"
                          }`}
                        >
                          {active ? "Seçili" : "Yönet"}
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

      {selectedStudent && (
        <div className="space-y-6">
          {/* Student Overview Card */}
          <div className="rounded-xl border border-[#DCE4EE] bg-white p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-editorial text-2xl font-semibold text-[#0D2558]">
                  {selectedStudent.name}
                </h2>
                <p className="mt-1 text-xs text-[#4E5E57]">
                  {selectedStudent.className} • {selectedStudent.track} • Veli:{" "}
                  <strong>{selectedStudent.parentName}</strong> •{" "}
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-[#135D43]" />
                    Danışman: <strong>{selectedStudent.advisorName}</strong>
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-md bg-[#F2EDE3] px-3 py-1.5 font-mono text-xs font-semibold text-[#9A743E]">
                  Giriş: {selectedStudent.username} / {selectedStudent.password}
                </div>
                <Link
                  href={`/admin/one-on-one?studentId=${selectedStudent.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6D28D9]"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Birebir Planla</span>
                </Link>
              </div>
            </div>

            {/* Slim Eye-Catching Weekly Hours & Subject Breakdown Strip */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#CCE3D8] border-l-4 border-l-[#135D43] bg-gradient-to-r from-[#F7FAF8] via-white to-[#F5F3FF]/60 px-3.5 py-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-[#135D43] px-2.5 py-1 font-bold text-white">
                  Haftalık {combinedSchedule.length} Saat
                </span>
                <span className="rounded-md border border-[#C9D8EA] bg-[#EEF3F9] px-2 py-0.5 font-semibold text-[#11284B]">
                  Sınıf: {myClass?.schedule.length ?? 0} Saat
                </span>
                <span className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 font-semibold text-[#4C1D95]">
                  ✦ Birebir: {selectedStudent.schedule.length} Saat
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedStudentSubjectCounts.map(([subj, count]) => (
                  <span
                    key={subj}
                    className="rounded-md border border-[#E5DEC9] bg-white px-2 py-0.5 text-[11px] font-medium text-[#203B5C]"
                  >
                    {subj} <strong className="text-[#135D43]">· {count}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Tabs */}
            <div className="mt-5 flex flex-wrap gap-1.5 rounded-lg border border-[#E9EBEE] bg-[#F8F7F3] p-1">
              {(
                [
                  ["exam", "Deneme Sonucu Ekle (PDF / Manuel)"],
                  ["homework", "Ödev Ata"],
                  ["guidance", "Rehberlik Görüşmesi Ekle"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === key
                      ? "bg-[#0D2558] text-white"
                      : "text-[#5E6A78] hover:text-[#0D2558]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-4">

              {activeTab === "exam" && (
                <div className="space-y-4">
                  {/* Redirect to Deneme PDF Yükle screen */}
                  <div className="rounded-lg border border-dashed border-[#0E4D3A]/40 bg-[#EAF6F0]/50 p-3.5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-bold text-[#0E4D3A]">
                          Kişi Bazlı Deneme Karnesi PDF Yükle ({selectedStudent.name})
                        </p>
                        <p className="text-[11px] text-[#4E5E57]">
                          Deneme PDF Yükle ekranında bu öğrenci seçili olarak konu analizli karne yükleyebilirsiniz.
                        </p>
                      </div>
                      <Link
                        href={`/admin/exams?mode=individual&studentId=${selectedStudent.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0E4D3A] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#13664d]"
                      >
                        <FileUp className="h-3.5 w-3.5" />
                        <span>Deneme PDF Yükle Ekranına Git</span>
                      </Link>
                    </div>
                  </div>

                  <form onSubmit={handleAddExam} className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <input
                      type="text"
                      required
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="Deneme Adı"
                      className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs sm:col-span-2"
                    />
                    <select
                      value={examType}
                      onChange={(e) =>
                        setExamType(e.target.value as "TYT" | "AYT")
                      }
                      className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs"
                    >
                      <option value="TYT">TYT</option>
                      <option value="AYT">AYT</option>
                    </select>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { ...examSubjectSchema[0], c: sub1C, sc: setSub1C, w: sub1W, sw: setSub1W },
                      { ...examSubjectSchema[1], c: sub2C, sc: setSub2C, w: sub2W, sw: setSub2W },
                      { ...examSubjectSchema[2], c: sub3C, sc: setSub3C, w: sub3W, sw: setSub3W },
                      { ...examSubjectSchema[3], c: sub4C, sc: setSub4C, w: sub4W, sw: setSub4W },
                    ].map((x) => (
                      <div key={x.name} className="rounded border border-[#E9EBEE] bg-white p-2 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate font-semibold text-[#203B5C]">{x.name}</p>
                          <span className="shrink-0 text-[10px] text-[#737B86]">{x.maxQ}S</span>
                        </div>
                        <div className="mt-1 flex gap-1">
                          <input type="number" min={0} max={x.maxQ} value={x.c} onChange={(e) => x.sc(e.target.value)} className="w-1/2 rounded border px-1.5 py-1" placeholder="D" />
                          <input type="number" min={0} max={x.maxQ} value={x.w} onChange={(e) => x.sw(e.target.value)} className="w-1/2 rounded border px-1.5 py-1" placeholder="Y" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <input type="number" value={examRank} onChange={(e) => setExamRank(e.target.value)} className="w-28 rounded border bg-white px-3 py-1.5 text-xs" placeholder="Sıra" />
                    <button type="submit" className="rounded-md bg-[#135D43] px-4 py-2 text-xs font-semibold text-white">
                      Denemeyi Kaydet
                    </button>
                  </div>
                </form>
                </div>
              )}

              {activeTab === "homework" && (
                <form
                  onSubmit={handleAddHomework}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-5"
                >
                  <select
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs"
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
                    placeholder="Ödev Başlığı"
                    className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs sm:col-span-2"
                  />
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded bg-[#0D2558] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Ödev Ata
                  </button>
                </form>
              )}

              {activeTab === "guidance" && (
                <form onSubmit={handleAddGuidance} className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input type="date" value={gsDate} onChange={(e) => setGsDate(e.target.value)} className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs" />
                    <select value={gsTime} onChange={(e) => setGsTime(e.target.value)} className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs">
                      {["09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:00", "17:00", "18:00"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input type="text" required value={gsTopic} onChange={(e) => setGsTopic(e.target.value)} className="rounded border border-[#DCE4EE] bg-white px-3 py-2 text-xs" placeholder="Görüşme Konusu" />
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={gsNote} onChange={(e) => setGsNote(e.target.value)} className="flex-1 rounded border bg-white px-3 py-2 text-xs" placeholder="Rehberlik Notu" />
                    <button type="submit" className="rounded bg-[#135D43] px-4 py-2 text-xs font-semibold text-white">Görüşme Ekle</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Student's Animated Charts */}
          {selectedStudent.exams.length > 0 && (
            <StudentNetCharts exams={selectedStudent.exams} />
          )}

          {/* Student's Full Weekly Timetable */}
          <div className="rounded-xl border border-[#E9EBEE] bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#203B5C]">
                <CalendarDays className="h-4 w-4 text-[#135D43]" />
                <span>Aktif Ders Programı &amp; Birebirler</span>
              </h3>
              <span className="rounded-md border border-[#CCE3D8] bg-[#F7FAF8] px-2.5 py-1 text-xs font-bold text-[#135D43]">
                Haftalık Toplam: {combinedSchedule.length} Saat ({myClass?.schedule.length ?? 0} Sınıf + {selectedStudent.schedule.length} Birebir)
              </span>
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

          {/* Homework & Guidance */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            <div className="rounded-xl border border-[#E9EBEE] bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#203B5C]">
                <ClipboardList className="h-4 w-4 text-[#C58B3B]" />
                <span>Ödevlendirmeler ({selectedStudent.homework.length})</span>
              </h3>
              <div className="mt-3 space-y-2">
                {selectedStudent.homework.map((hw) => (
                  <div
                    key={hw.id}
                    className="rounded border border-[#E9EBEE] bg-[#FCFBF8] p-3 text-xs"
                  >
                    <p className="font-semibold text-[#9A743E]">
                      {hw.subject} • {hw.status}
                    </p>
                    <p className="mt-0.5 font-semibold text-[#203B5C]">
                      {hw.title}
                    </p>
                    <p className="text-[#737B86]">Teslim: {hw.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E9EBEE] bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#203B5C]">
                <MessageSquareHeart className="h-4 w-4 text-[#135D43]" />
                <span>
                  Rehberlik Görüşmeleri (
                  {selectedStudent.guidanceSessions.length})
                </span>
              </h3>
              <div className="mt-3 space-y-2">
                {selectedStudent.guidanceSessions.map((gs) => (
                  <div
                    key={gs.id}
                    className="rounded border border-[#E9EBEE] bg-[#FCFBF8] p-3 text-xs"
                  >
                    <p className="font-semibold text-[#135D43]">
                      {gs.date} • {gs.time}
                    </p>
                    <p className="mt-0.5 font-semibold text-[#203B5C]">
                      {gs.topic}
                    </p>
                    <p className="mt-0.5 text-[#737B86]">{gs.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
