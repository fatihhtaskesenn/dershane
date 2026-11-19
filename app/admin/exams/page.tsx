"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileDown,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useCampus } from "@/lib/campus-store";
import {
  parseExamPdfText,
  parseSingleStudentKarnePdf,
  type ParsedStudentExam,
  type SingleKarneParseResult,
} from "@/lib/exam-pdf-parser";
import {
  buildSampleExamPdfBlob,
  buildSampleIndividualKarnePdfBlob,
} from "@/lib/sample-exam-pdf";

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

function parseDetectedDateToIso(str: string): string | null {
  const m = str.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export default function AdminExamsUploadPage() {
  const { students, addBulkExamsToStudents, addExamToStudent } = useCampus();

  const [mode, setMode] = useState<"bulk" | "individual">("bulk");

  const [examTitle, setExamTitle] = useState(
    "Türkiye Geneli TYT Denemesi #7"
  );
  const [examType, setExamType] = useState<"TYT" | "AYT">("TYT");
  const [examDate, setExamDate] = useState("2026-11-19");

  // Individual mode target student
  const [targetStudentId, setTargetStudentId] = useState(
    students[0]?.id ?? ""
  );
  const [individualResult, setIndividualResult] =
    useState<SingleKarneParseResult | null>(null);

  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [rawText, setRawText] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentExam[]>([]);
  const [unmatchedCount, setUnmatchedCount] = useState(0);
  const [savedMessage, setSavedMessage] = useState("");

  const targetStudent =
    students.find((s) => s.id === targetStudentId) ?? students[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const studentParam = params.get("studentId");
    if (modeParam === "individual") {
      setMode("individual");
    }
    if (studentParam && students.some((s) => s.id === studentParam)) {
      setTargetStudentId(studentParam);
    }
  }, [students]);

  const handleDownloadSamplePdf = () => {
    const blob =
      mode === "bulk"
        ? buildSampleExamPdfBlob(students)
        : buildSampleIndividualKarnePdfBlob(targetStudent);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      mode === "bulk"
        ? "ornek-toplu-deneme-listesi.pdf"
        : `ornek-karne-${targetStudent.studentNo}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePdfUpload = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setSavedMessage("");
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-exam-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setParseError(data.error || "PDF çözümlenemedi.");
        setParsedRows([]);
        setIndividualResult(null);
        return;
      }

      const text = String(data.text ?? "");
      setRawText(text);

      if (text.trim().length < 20) {
        setParsedRows([]);
        setIndividualResult(null);
        setParseError(
          "Bu PDF dosyasında metin katmanı bulunamadı (taranmış/resim PDF olabilir). Metin içeren dijital karne PDF'i yükleyin veya test için sağ üstten 'Örnek Bireysel Karne PDF İndir' butonunu kullanın."
        );
        return;
      }

      if (mode === "bulk") {
        setIndividualResult(null);
        const result = parseExamPdfText(text, students);
        setParsedRows(result.matched);
        setUnmatchedCount(result.unmatchedLines.length);

        if (result.matched.length === 0) {
          setShowRawText(true);
          setParseError(
            "PDF okundu ancak sistemdeki kayıtlı öğrencilerle eşleşen ders/net satırı bulunamadı. Çıkarılan metni aşağıda görebilirsiniz."
          );
        }
      } else {
        setParsedRows([]);
        const karne = parseSingleStudentKarnePdf(text);
        setIndividualResult(karne);
        if (karne.detectedTitle) setExamTitle(karne.detectedTitle);
        if (karne.detectedDate) {
          const iso = parseDetectedDateToIso(karne.detectedDate);
          if (iso) setExamDate(iso);
        }
        if (karne.detectedType) setExamType(karne.detectedType);
        if (
          karne.subjects.length === 0 &&
          karne.topicBreakdown.length === 0
        ) {
          setShowRawText(true);
          setParseError(
            "Karne PDF okundu ancak ders/konu satırları tespit edilemedi. Çıkarılan metni aşağıda görebilir veya Örnek Bireysel Karne PDF'i indirip deneyebilirsiniz."
          );
        }
      }
    } catch (err) {
      console.error(err);
      setParseError("PDF yüklenirken bir hata oluştu.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveRow = (studentId: string) => {
    setParsedRows((prev) => prev.filter((r) => r.studentId !== studentId));
  };

  const handleApplyAllBulk = () => {
    if (parsedRows.length === 0) return;

    addBulkExamsToStudents(
      parsedRows.map((row) => ({
        studentId: row.studentId,
        exam: {
          title: examTitle.trim() || "Deneme Sınavı",
          type: examType,
          date: formatIsoToTrDate(examDate) || "19 Kas 2026",
          totalNet: row.totalNet,
          maxNet: examType === "TYT" ? 120 : 80,
          rank: row.rank,
          subjects: row.subjects,
        },
      }))
    );

    setSavedMessage(
      `${parsedRows.length} öğrencinin "${examTitle}" deneme sonuçları sisteme işlendi!`
    );
  };

  const handleApplyIndividual = () => {
    if (!targetStudent || !individualResult) return;

    addExamToStudent(targetStudent.id, {
      title: examTitle.trim() || "Deneme Sınavı",
      type: examType,
      date: formatIsoToTrDate(examDate) || "19 Kas 2026",
      totalNet: individualResult.totalNet,
      maxNet: examType === "TYT" ? 120 : 80,
      rank: 1,
      subjects: individualResult.subjects,
      topicBreakdown: individualResult.topicBreakdown,
    });

    const weakTopics = individualResult.topicBreakdown.filter(
      (t) => t.wrong > 0 || t.empty > 0
    ).length;

    setSavedMessage(
      `${targetStudent.name} için "${examTitle}" sonucu (${individualResult.totalNet} Net, ${weakTopics} eksik konu) öğrencinin profiline ve "Konu Eksiklerim" bölümüne işlendi!`
    );
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Otomatik Ölçme &amp; Değerlendirme
          </p>
          <h1 className="font-editorial mt-1 flex items-center gap-2.5 text-3xl font-medium text-[#203B5C]">
            <FileUp className="h-7 w-7 text-[#135D43]" />
            <span>Deneme Sonucu (PDF) Yükle &amp; Konu Analizi</span>
          </h1>
          <p className="mt-1 text-xs text-[#737B86]">
            İster tüm öğrencilerin yer aldığı toplu listeyi, isterseniz tek bir öğrencinin konu konu analizli deneme karnesini yükleyin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSamplePdf}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#11284B]/20 bg-white px-4 py-2.5 text-xs font-semibold text-[#11284B] shadow-2xs transition hover:bg-[#FAF8F5]"
        >
          <FileDown className="h-4 w-4 text-[#0E4D3A]" />
          <span>
            {mode === "bulk"
              ? "Örnek Toplu Liste PDF İndir"
              : "Örnek Bireysel Karne PDF İndir"}
          </span>
        </button>
      </div>

      {/* 2 Upload Modes Switcher */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setMode("bulk");
            setParseError("");
            setSavedMessage("");
          }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
            mode === "bulk"
              ? "border-[#11284B] bg-[#11284B] text-white shadow-sm"
              : "border-[#DCE4EE] bg-white text-[#11284B] hover:bg-[#FAF8F5]"
          }`}
        >
          <Users className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">1. Toplu Liste PDF Yükle</p>
            <p
              className={`text-xs ${
                mode === "bulk" ? "text-white/80" : "text-[#64748B]"
              }`}
            >
              Kurumdaki tüm öğrencilerin netlerini tek PDF&apos;ten otomatik dağıtır
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("individual");
            setParseError("");
            setSavedMessage("");
          }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
            mode === "individual"
              ? "border-[#0E4D3A] bg-[#0E4D3A] text-white shadow-sm"
              : "border-[#DCE4EE] bg-white text-[#11284B] hover:bg-[#FAF8F5]"
          }`}
        >
          <UserCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">
              2. Kişi Bazlı Karne PDF Yükle (Konu Analizli)
            </p>
            <p
              className={`text-xs ${
                mode === "individual" ? "text-white/80" : "text-[#64748B]"
              }`}
            >
              Seçili öğrencinin karnesinden ders + konu eksiklerini otomatik çıkarır
            </p>
          </div>
        </button>
      </div>

      {/* Exam Metadata + Upload Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-xs lg:col-span-5">
          <h2 className="font-editorial text-xl font-medium text-[#203B5C]">
            1. Sınav &amp; Öğrenci Bilgileri
          </h2>

          {mode === "individual" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#0E4D3A]">
                Karnesi Yüklenecek Öğrenci
              </label>
              <select
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full rounded-lg border border-[#0E4D3A]/30 bg-[#EAF6F0]/50 px-3 py-2 text-sm font-semibold text-[#11284B] outline-none focus:border-[#0E4D3A]"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentNo} — {s.name} ({s.className})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#203B5C]">
              Deneme Adı
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] outline-none focus:border-[#11284B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#203B5C]">
                Sınav Türü
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as "TYT" | "AYT")}
                className="w-full rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] outline-none focus:border-[#11284B]"
              >
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#203B5C]">
                Sınav Tarihi
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] outline-none focus:border-[#11284B]"
              />
            </div>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-xs lg:col-span-7">
          <div>
            <h2 className="font-editorial text-xl font-medium text-[#203B5C]">
              2.{" "}
              {mode === "bulk"
                ? "Toplu Deneme Liste PDF'ini Yükle"
                : "Bireysel Konu Analizli Karne PDF'ini Yükle"}
            </h2>
            <p className="mt-0.5 text-xs text-[#737B86]">
              {mode === "bulk"
                ? "PDF yüklendiği anda sistem öğrenci numarası/adına göre tüm satırları eşleştirir."
                : "Karne PDF'indeki ders netleri ve KONU ADI | SS | D | Y | % satırları otomatik ayrıştırılır."}
            </p>
          </div>

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#11284B]/25 bg-[#FAF8F5] px-6 py-10 text-center transition hover:border-[#0E4D3A] hover:bg-[#F2FAF6]">
            {isParsing ? (
              <>
                <Loader2 className="h-9 w-9 animate-spin text-[#0E4D3A]" />
                <p className="mt-3 text-sm font-bold text-[#11284B]">
                  PDF Analiz Ediliyor...
                </p>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#11284B]/10 text-[#11284B]">
                  <FileUp className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#11284B]">
                  {fileName
                    ? `Seçili Dosya: ${fileName}`
                    : "PDF Dosyasını Seçin veya Sürükleyin"}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Yalnızca .pdf dosyaları • Ders ve konu bazlı otomatik analiz
                </p>
              </>
            )}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handlePdfUpload(e.target.files?.[0])}
            />
          </label>

          {rawText && (
            <div className="mt-3 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowRawText((v) => !v)}
                className="font-semibold text-[#11284B] hover:underline"
              >
                {showRawText
                  ? "Ham PDF Metnini Gizle"
                  : "Çıkarılan Ham PDF Metnini İncele"}
              </button>
              {mode === "bulk" && unmatchedCount > 0 && (
                <span className="text-[#9A3412]">
                  {unmatchedCount} satır sistemdeki öğrenciyle eşleşmedi
                </span>
              )}
            </div>
          )}

          {showRawText && rawText && (
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[11px] text-[#334155]">
              {rawText}
            </pre>
          )}
        </div>
      </div>

      {/* Feedback Alerts */}
      {parseError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#F5C6BA] bg-[#FDF0ED] p-4 text-xs font-medium text-[#9A3412]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {savedMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#BBE0CE] bg-[#EAF6F0] p-4 text-xs font-bold text-[#0E4D3A]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Bulk Preview Table */}
      {mode === "bulk" && parsedRows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] bg-[#FAF8F5] px-6 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-[#11284B]">
                <Sparkles className="h-4 w-4 text-[#B8860B]" />
                <span>
                  Toplu PDF Analiz Sonucu — Eşleşen Öğrenciler ({parsedRows.length})
                </span>
              </h2>
            </div>

            <button
              type="button"
              onClick={handleApplyAllBulk}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E4D3A] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#13664d]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Tüm Sonuçları Öğrencilere İşle ({parsedRows.length} Öğrenci)
              </span>
            </button>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 p-3 md:hidden">
            {parsedRows.map((row) => (
              <div
                key={row.studentId}
                className="rounded-xl border border-[#DCE4EE] bg-[#FAF8F5]/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#11284B]">
                      #{row.rank} · {row.studentName}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      #{row.studentNo} · {row.className}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#EAF6F0] px-2.5 py-1 text-xs font-bold text-[#0E4D3A]">
                      {row.totalNet} Net
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.studentId)}
                      className="rounded p-1.5 text-[#64748B] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {row.subjects.map((sub) => (
                    <span
                      key={sub.name}
                      className="inline-flex items-center gap-1 rounded-md border border-[#DCE4EE] bg-white px-2 py-0.5 text-[11px]"
                    >
                      <strong className="text-[#11284B]">{sub.name}:</strong>
                      <span className="font-bold text-[#0E4D3A]">{sub.net}</span>
                      <span className="text-[#64748B]">
                        ({sub.correct}D/{sub.wrong}Y)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="border-b border-[#E2E8F0] bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Sıra</th>
                  <th className="px-4 py-3">Öğrenci No</th>
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">Sınıf</th>
                  <th className="px-4 py-3">Ders Bazlı Netler</th>
                  <th className="px-4 py-3">Toplam Net</th>
                  <th className="px-4 py-3 text-right">Kaldır</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {parsedRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-[#FAF8F5]/70">
                    <td className="px-4 py-3 font-bold text-[#11284B]">
                      #{row.rank}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#64748B]">
                      {row.studentNo}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#11284B]">
                      {row.studentName}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {row.className}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.subjects.map((sub) => (
                          <span
                            key={sub.name}
                            className="inline-flex items-center gap-1 rounded-md border border-[#DCE4EE] bg-[#FAF8F5] px-2 py-0.5 text-[11px]"
                          >
                            <FileText className="h-3 w-3 text-[#11284B]" />
                            <strong className="text-[#11284B]">
                              {sub.name}:
                            </strong>{" "}
                            <span className="font-bold text-[#0E4D3A]">
                              {sub.net}
                            </span>{" "}
                            <span className="text-[#64748B]">
                              ({sub.correct}D/{sub.wrong}Y)
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#0E4D3A]">
                      {row.totalNet} Net
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.studentId)}
                        className="rounded p-1.5 text-[#64748B] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Karne Preview */}
      {mode === "individual" &&
        individualResult &&
        (individualResult.subjects.length > 0 ||
          individualResult.topicBreakdown.length > 0) && (
          <div className="space-y-5 rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-[#11284B]">
                  <Sparkles className="h-4 w-4 text-[#B8860B]" />
                  <span>
                    {targetStudent?.name} — Karne &amp; Konu Analizi (
                    {individualResult.totalNet} Net)
                  </span>
                </h2>
                <p className="text-xs text-[#64748B]">
                  {individualResult.topicBreakdown.filter((t) => t.wrong > 0 || t.empty > 0).length}{" "}
                  konuda yanlış/boş tespit edildi. Onayladığınızda öğrencinin &quot;Konu Eksiklerim&quot; sekmesine işlenir.
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyIndividual}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E4D3A] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#13664d]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Öğrencinin Profiline İşle</span>
              </button>
            </div>

            {/* Subject Pills */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {individualResult.subjects.map((sub) => (
                <div
                  key={sub.name}
                  className="rounded-xl border border-[#DCE4EE] bg-[#FAF8F5] p-3"
                >
                  <p className="text-xs font-bold text-[#11284B]">{sub.name}</p>
                  <p className="mt-1 text-lg font-bold text-[#0E4D3A]">
                    {sub.net} Net
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {sub.correct}D · {sub.wrong}Y · {sub.empty}B
                  </p>
                </div>
              ))}
            </div>

            {/* Topic Breakdown Preview */}
            {individualResult.topicBreakdown.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8F0] bg-[#FAF8F5] text-[10px] font-bold uppercase text-[#64748B]">
                    <tr>
                      <th className="px-4 py-2.5">Ders</th>
                      <th className="px-4 py-2.5">Konu Adı</th>
                      <th className="px-4 py-2.5 text-center">SS</th>
                      <th className="px-4 py-2.5 text-center">D</th>
                      <th className="px-4 py-2.5 text-center">Y</th>
                      <th className="px-4 py-2.5 text-center">%</th>
                      <th className="px-4 py-2.5">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {individualResult.topicBreakdown.map((t, i) => {
                      const isWeak = t.wrong > 0 || t.empty > 0;
                      return (
                        <tr key={`${t.subject}-${t.topic}-${i}`}>
                          <td className="px-4 py-2 font-semibold text-[#11284B]">
                            {t.subject}
                          </td>
                          <td className="px-4 py-2 font-medium text-[#203B5C]">
                            {t.topic}
                          </td>
                          <td className="px-4 py-2 text-center">{t.total}</td>
                          <td className="px-4 py-2 text-center font-bold text-[#0E4D3A]">
                            {t.correct}
                          </td>
                          <td className="px-4 py-2 text-center font-bold text-[#9A3412]">
                            {t.wrong}
                          </td>
                          <td className="px-4 py-2 text-center font-bold">
                            %{t.percent}
                          </td>
                          <td className="px-4 py-2">
                            {isWeak ? (
                              <span className="inline-flex items-center gap-1 rounded bg-[#FDF0ED] px-2 py-0.5 text-[10px] font-bold text-[#9A3412]">
                                <AlertTriangle className="h-3 w-3" /> Eksik Konu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-[#EAF6F0] px-2 py-0.5 text-[10px] font-bold text-[#0E4D3A]">
                                Tam
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
