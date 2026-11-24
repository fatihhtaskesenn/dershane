"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  useCampus,
  type StudentScheduleSlot,
  type TeacherAccount,
  type WeekDay,
} from "@/lib/campus-store";
import {
  buildDailySlots,
  doesTeacherMatchSubject,
  EXAM_LEVELS,
  PRESET_SUBJECTS,
  TIMETABLE_DAYS,
  WeeklyTimetable,
} from "@/components/WeeklyTimetable";

interface CurriculumRow {
  rowId: string;
  subject: string;
  examLevel: string;
  teacherName: string;
  weeklyHours: number;
  type: "Konu Anlatımı" | "Soru Çözümü";
}

function getMatchingTeachers(teachers: TeacherAccount[], subject: string) {
  const matched = teachers.filter((t) => doesTeacherMatchSubject(t.branch, subject));
  return matched.length > 0 ? matched : teachers;
}

function buildDefaultCurriculum(
  track: string,
  teachers: TeacherAccount[]
): CurriculumRow[] {
  const pickTeacher = (sub: string) =>
    getMatchingTeachers(teachers, sub)[0]?.name ?? teachers[0]?.name ?? "";

  if (track === "Eşit Ağırlık") {
    return [
      { rowId: "r-1", subject: "Matematik", examLevel: "TYT / AYT", teacherName: pickTeacher("Matematik"), weeklyHours: 6, type: "Konu Anlatımı" },
      { rowId: "r-2", subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 4, type: "Konu Anlatımı" },
      { rowId: "r-3", subject: "Edebiyat", examLevel: "AYT", teacherName: pickTeacher("Edebiyat"), weeklyHours: 4, type: "Konu Anlatımı" },
      { rowId: "r-4", subject: "Tarih", examLevel: "TYT / AYT", teacherName: pickTeacher("Tarih"), weeklyHours: 3, type: "Konu Anlatımı" },
      { rowId: "r-5", subject: "Coğrafya", examLevel: "TYT / AYT", teacherName: pickTeacher("Coğrafya"), weeklyHours: 2, type: "Konu Anlatımı" },
      { rowId: "r-6", subject: "Geometri", examLevel: "TYT / AYT", teacherName: pickTeacher("Geometri"), weeklyHours: 2, type: "Soru Çözümü" },
    ];
  }

  if (track === "Sözel") {
    return [
      { rowId: "r-1", subject: "Edebiyat", examLevel: "AYT", teacherName: pickTeacher("Edebiyat"), weeklyHours: 6, type: "Konu Anlatımı" },
      { rowId: "r-2", subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 4, type: "Konu Anlatımı" },
      { rowId: "r-3", subject: "Tarih", examLevel: "TYT / AYT", teacherName: pickTeacher("Tarih"), weeklyHours: 4, type: "Konu Anlatımı" },
      { rowId: "r-4", subject: "Coğrafya", examLevel: "TYT / AYT", teacherName: pickTeacher("Coğrafya"), weeklyHours: 3, type: "Konu Anlatımı" },
      { rowId: "r-5", subject: "Felsefe", examLevel: "TYT / AYT", teacherName: pickTeacher("Felsefe"), weeklyHours: 2, type: "Konu Anlatımı" },
      { rowId: "r-6", subject: "Din Kültürü", examLevel: "TYT / AYT", teacherName: pickTeacher("Din Kültürü"), weeklyHours: 2, type: "Konu Anlatımı" },
    ];
  }

  // Sayısal & YKS Hazırlık default
  return [
    { rowId: "r-1", subject: "Matematik", examLevel: "TYT / AYT", teacherName: pickTeacher("Matematik"), weeklyHours: 6, type: "Konu Anlatımı" },
    { rowId: "r-2", subject: "Geometri", examLevel: "TYT / AYT", teacherName: pickTeacher("Geometri"), weeklyHours: 2, type: "Soru Çözümü" },
    { rowId: "r-3", subject: "Fizik", examLevel: "TYT / AYT", teacherName: pickTeacher("Fizik"), weeklyHours: 4, type: "Konu Anlatımı" },
    { rowId: "r-4", subject: "Kimya", examLevel: "TYT / AYT", teacherName: pickTeacher("Kimya"), weeklyHours: 3, type: "Konu Anlatımı" },
    { rowId: "r-5", subject: "Biyoloji", examLevel: "TYT / AYT", teacherName: pickTeacher("Biyoloji"), weeklyHours: 3, type: "Konu Anlatımı" },
    { rowId: "r-6", subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 3, type: "Konu Anlatımı" },
  ];
}

export default function AdminScheduleBuilderPage() {
  const {
    classes,
    teachers,
    addBulkScheduleToClass,
    clearClassSchedule,
    removeClassScheduleSlot,
  } = useCampus();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const selectedClass =
    classes.find((c) => c.id === selectedClassId) ?? classes[0];

  const [curriculum, setCurriculum] = useState<CurriculumRow[]>(() =>
    buildDefaultCurriculum(classes[0]?.track ?? "Sayısal", teachers)
  );
  const [daysScope, setDaysScope] = useState<"weekdays" | "sixdays">("weekdays");
  const [timeWindow, setTimeWindow] = useState<"morning" | "afternoon" | "fullday">("fullday");
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [resultBanner, setResultBanner] = useState<{
    ok: boolean;
    message: string;
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    if (!selectedClass) return;
    setCurriculum(buildDefaultCurriculum(selectedClass.track, teachers));
    setResultBanner(null);
  }, [selectedClassId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalRequestedHours = useMemo(
    () => curriculum.reduce((acc, row) => acc + Math.max(0, row.weeklyHours), 0),
    [curriculum]
  );

  const handleAddRow = () => {
    const defaultSub = PRESET_SUBJECTS[0];
    const teacherName = getMatchingTeachers(teachers, defaultSub)[0]?.name ?? "";
    setCurriculum((prev) => [
      ...prev,
      {
        rowId: `r-${Date.now()}`,
        subject: defaultSub,
        examLevel: "AYT",
        teacherName,
        weeklyHours: 2,
        type: "Konu Anlatımı",
      },
    ]);
  };

  const handleUpdateRow = (rowId: string, patch: Partial<CurriculumRow>) => {
    setCurriculum((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const next = { ...row, ...patch };
        if (patch.subject && !patch.teacherName) {
          next.teacherName =
            getMatchingTeachers(teachers, patch.subject)[0]?.name ??
            row.teacherName;
        }
        return next;
      })
    );
  };

  const handleRemoveRow = (rowId: string) => {
    setCurriculum((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const handleGenerateSchedule = () => {
    if (!selectedClass) return;

    const candidateDays: WeekDay[] =
      daysScope === "weekdays"
        ? ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"]
        : ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

    const allSlots = buildDailySlots(50).slots;
    const candidateTimes = allSlots.filter((t) => {
      if (timeWindow === "morning") return t < "12:00";
      if (timeWindow === "afternoon") return t >= "12:00" && t <= "17:10";
      return t <= "17:10";
    });

    // Track busy slots for this class
    const classBusyKeys = new Set<string>();
    const classExamBlocks = selectedClass.schedule.filter((s) => s.blockPeriod);

    if (!replaceExisting) {
      selectedClass.schedule.forEach((s) => {
        if (!s.blockPeriod) {
          classBusyKeys.add(`${s.day}|${s.time.trim()}`);
        }
      });
    }

    // Check if class has a morning/afternoon exam block
    const isClassExamBlocked = (day: WeekDay, time: string) => {
      if (replaceExisting) return false;
      return classExamBlocks.some((b) => {
        if (b.day !== day) return false;
        if (b.blockPeriod === "morning") return time < "12:00";
        if (b.blockPeriod === "afternoon") return time >= "12:00";
        return false;
      });
    };

    // Track busy slots per teacher (from ALL other classes + 1-on-1 slots)
    const teacherBusyMap = new Map<string, Set<string>>();
    teachers.forEach((t) => {
      const set = new Set<string>();
      t.schedule.forEach((ts) => {
        if (replaceExisting && ts.classGroup === selectedClass.name) return;
        set.add(`${ts.day}|${ts.time.trim()}`);
      });
      t.oneOnOneSlots.forEach((oo) => {
        set.add(`${oo.day}|${oo.time.trim()}`);
      });
      teacherBusyMap.set(t.name, set);
    });

    const newSlots: Omit<StudentScheduleSlot, "id">[] = [];
    const warnings: string[] = [];

    // Sort rows descending by weeklyHours so harder-to-place subjects go first
    const sortedRows = [...curriculum]
      .filter((r) => r.weeklyHours > 0 && r.teacherName)
      .sort((a, b) => b.weeklyHours - a.weeklyHours);

    sortedRows.forEach((row) => {
      const fullSubject = `${row.examLevel} ${row.subject}`.trim();
      const teacherSet = teacherBusyMap.get(row.teacherName) ?? new Set<string>();
      let remaining = row.weeklyHours;

      // Count how many hours of this subject are placed on each day to spread evenly
      const dayCount: Record<string, number> = {};
      candidateDays.forEach((d) => {
        dayCount[d] = 0;
      });

      // Pass 1: Max 2 lessons per day of same subject, spreading across least-loaded days
      let safety = 0;
      while (remaining > 0 && safety < 200) {
        safety += 1;
        const orderedDays = [...candidateDays].sort(
          (a, b) => (dayCount[a] ?? 0) - (dayCount[b] ?? 0)
        );

        let placedOne = false;
        for (const day of orderedDays) {
          if ((dayCount[day] ?? 0) >= 2 && safety < 100) continue;

          for (const time of candidateTimes) {
            const key = `${day}|${time}`;
            if (classBusyKeys.has(key)) continue;
            if (isClassExamBlocked(day, time)) continue;
            if (teacherSet.has(key)) continue;

            // Place slot!
            classBusyKeys.add(key);
            teacherSet.add(key);
            dayCount[day] = (dayCount[day] ?? 0) + 1;
            newSlots.push({
              day,
              time,
              subject: fullSubject,
              teacher: row.teacherName,
              room: selectedClass.room,
              type: row.type,
            });
            remaining -= 1;
            placedOne = true;
            break;
          }
          if (placedOne) break;
        }

        if (!placedOne && safety >= 100) break;
      }

      if (remaining > 0) {
        warnings.push(
          `${fullSubject} (${row.teacherName}): ${remaining} saat için çakışmasız boş slot bulunamadı.`
        );
      }
    });

    if (replaceExisting) {
      clearClassSchedule(selectedClass.id);
    }
    if (newSlots.length > 0) {
      addBulkScheduleToClass(selectedClass.id, newSlots);
    }

    setResultBanner({
      ok: warnings.length === 0,
      message: `${selectedClass.name} sınıfı için ${newSlots.length} ders saati çakışmasız olarak oluşturuldu ve öğretmen takvimlerine işlendi.`,
      warnings,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Otomatik Çakışmasız Planlama
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-2xl font-medium text-[#203B5C] sm:text-3xl">
          <CalendarDays className="h-6 w-6 text-[#135D43]" />
          <span>Ders Programı Oluştur</span>
        </h1>
        <p className="mt-1 text-xs text-[#737B86] sm:text-sm">
          Sınıfı seçin, her dersten haftalık kaç saat olacağını ve branş öğretmenini
          belirleyin; sistem tüm öğretmen ve birebir çakışmalarını kontrol ederek
          otomatik ders programını oluştursun.
        </p>
      </div>

      {/* Step 1: Class Selector */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B]">
            <Layers className="h-4 w-4 text-[#135D43]" />
            <span>1. Program Oluşturulacak Sınıfı Seçin</span>
          </h2>
          <span className="text-[11px] text-[#64748B]">
            Toplam {classes.length} aktif sınıf
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((cls) => {
            const active = selectedClass?.id === cls.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-xl border p-3 text-left text-xs transition-all ${
                  active
                    ? "border-[#135D43] bg-[#EAF6F0] ring-1 ring-[#135D43]"
                    : "border-[#E2E8F0] bg-[#FCFBF8] hover:border-[#B18A52]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#11284B]">{cls.name}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-[#135D43] text-white"
                        : "bg-white text-[#4E5E57]"
                    }`}
                  >
                    {cls.schedule.length} Saat
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#64748B]">
                  {cls.track} · {cls.room}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Curriculum & Teacher Assignment */}
      {selectedClass && (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B] sm:text-base">
                <Sparkles className="h-4 w-4 text-[#B18A52]" />
                <span>
                  2. {selectedClass.name} — Haftalık Ders, Saat ve Öğretmen Dağılımı
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Toplam Talep Edilen Haftalık Ders: <strong className="text-[#135D43]">{totalRequestedHours} Saat</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(["Sayısal", "Eşit Ağırlık", "Sözel"] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() =>
                    setCurriculum(buildDefaultCurriculum(tmpl, teachers))
                  }
                  className="rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] px-2.5 py-1.5 text-[11px] font-semibold text-[#203B5C] hover:border-[#B18A52] hover:bg-white"
                >
                  {tmpl} Şablonu
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 rounded-lg bg-[#203B5C] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#162B45]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ders Ekle</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {curriculum.map((row) => {
              const matchingTeachers = getMatchingTeachers(teachers, row.subject);
              return (
                <div
                  key={row.rowId}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-[#E2E8F0] bg-[#FAF8F5]/70 p-3 text-xs sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B] sm:hidden">
                      Ders
                    </label>
                    <select
                      value={row.subject}
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, { subject: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-2 font-semibold text-[#11284B]"
                    >
                      {PRESET_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B] sm:hidden">
                      Düzey
                    </label>
                    <select
                      value={row.examLevel}
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, { examLevel: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-2 font-semibold text-[#203B5C]"
                    >
                      {EXAM_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B] sm:hidden">
                      Öğretmen
                    </label>
                    <select
                      value={row.teacherName}
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, {
                          teacherName: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-2 text-[#11284B]"
                    >
                      {matchingTeachers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.schedule.length + t.oneOnOneSlots.length} Saat)
                        </option>
                      ))}
                      {teachers
                        .filter((t) => !matchingTeachers.some((m) => m.id === t.id))
                        .map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name} — {t.branch}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B] sm:hidden">
                      Haftalık Saat
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={row.weeklyHours}
                        onChange={(e) =>
                          handleUpdateRow(row.rowId, {
                            weeklyHours: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-2 text-center font-bold text-[#135D43]"
                      />
                      <span className="shrink-0 text-[11px] font-semibold text-[#64748B]">
                        Saat
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <select
                      value={row.type}
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, {
                          type: e.target.value as "Konu Anlatımı" | "Soru Çözümü",
                        })
                      }
                      className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2 py-2 text-[11px] text-[#203B5C]"
                    >
                      <option value="Konu Anlatımı">Konu</option>
                      <option value="Soru Çözümü">Soru</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.rowId)}
                      title="Dersi Kaldır"
                      className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 3: Scheduling Preferences & Generate Button */}
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-[#DCE8E2] bg-[#F7FAF8] p-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={daysScope}
                onChange={(e) =>
                  setDaysScope(e.target.value as "weekdays" | "sixdays")
                }
                className="rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-semibold text-[#11284B]"
              >
                <option value="weekdays">Günler: Hafta İçi (Pzt–Cum)</option>
                <option value="sixdays">Günler: 6 Gün (Pzt–Cmt)</option>
              </select>

              <select
                value={timeWindow}
                onChange={(e) =>
                  setTimeWindow(
                    e.target.value as "morning" | "afternoon" | "fullday"
                  )
                }
                className="rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-semibold text-[#11284B]"
              >
                <option value="fullday">Saat: Tam Gün (08:00–17:00)</option>
                <option value="morning">Saat: Sadece Sabah (08:00–12:00)</option>
                <option value="afternoon">Saat: Öğleden Sonra (12:50–17:00)</option>
              </select>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-medium text-[#203B5C]">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="accent-[#135D43]"
                />
                <span>Sıfırdan oluştur (mevcutları değiştir)</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleGenerateSchedule}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#135D43] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#0E4A35] sm:text-sm"
            >
              <Wand2 className="h-4 w-4 text-[#E8C483]" />
              <span>Otomatik Ders Programı Oluştur</span>
            </button>
          </div>

          {resultBanner && (
            <div
              className={`mt-4 rounded-xl border p-3.5 text-xs ${
                resultBanner.ok
                  ? "border-[#BBE0CE] bg-[#EAF6F0] text-[#0E4D3A]"
                  : "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
              }`}
            >
              <p className="flex items-center gap-2 font-bold">
                {resultBanner.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{resultBanner.message}</span>
              </p>
              {resultBanner.warnings.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-0.5 text-[11px]">
                  {resultBanner.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Live Class Timetable Preview */}
      {selectedClass && (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#11284B] sm:text-2xl">
                {selectedClass.name} — Oluşturulan Haftalık Ders Programı ({selectedClass.schedule.length} Saat)
              </h2>
              <p className="text-xs text-[#64748B]">
                İstemediğiniz bir ders saatini çöp kutusu simgesine basarak tek tek kaldırabilirsiniz.
              </p>
            </div>
            {selectedClass.schedule.length > 0 && (
              <button
                type="button"
                onClick={() => clearClassSchedule(selectedClass.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Programı Temizle</span>
              </button>
            )}
          </div>

          <WeeklyTimetable
            items={selectedClass.schedule.map((slot) => ({
              id: slot.id,
              day: slot.day,
              time: slot.time,
              title: slot.subject,
              subtitle: slot.teacher,
              meta: slot.room,
              badge: slot.type,
              blockPeriod: slot.blockPeriod,
              onDelete: () => removeClassScheduleSlot(selectedClass.id, slot.id),
            }))}
          />
        </div>
      )}
    </div>
  );
}
