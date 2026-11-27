"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Layers,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  UserCheck,
  Wand2,
} from "lucide-react";
import {
  useCampus,
  type ClassroomRecord,
  type TeacherAccount,
  type WeekDay,
} from "@/lib/campus-store";
import {
  buildDailySlots,
  doesTeacherMatchSubject,
  EXAM_LEVELS,
  PRESET_SUBJECTS,
  WeeklyTimetable,
} from "@/components/WeeklyTimetable";
import {
  runOptimizedTimetableSolver,
  type BlockMode,
  type OptimizationIntensity,
  type OptimizationMetrics,
  type OptimizerCurriculumRow,
} from "@/lib/timetable-optimizer";

function getMatchingTeachers(teachers: TeacherAccount[], subject: string) {
  return teachers.filter((t) => doesTeacherMatchSubject(t.branch, subject));
}

function buildDefaultCurriculum(
  track: string,
  teachers: TeacherAccount[],
  prefix: string
): OptimizerCurriculumRow[] {
  const pickTeacher = (sub: string) =>
    getMatchingTeachers(teachers, sub)[0]?.name ?? "";

  if (track === "Eşit Ağırlık") {
    return [
      { rowId: `${prefix}-1`, subject: "Matematik", examLevel: "TYT / AYT", teacherName: pickTeacher("Matematik"), weeklyHours: 6, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-2`, subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-3`, subject: "Edebiyat", examLevel: "AYT", teacherName: pickTeacher("Edebiyat"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-4`, subject: "Tarih", examLevel: "TYT / AYT", teacherName: pickTeacher("Tarih"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-5`, subject: "Coğrafya", examLevel: "TYT / AYT", teacherName: pickTeacher("Coğrafya"), weeklyHours: 2, type: "Konu Anlatımı", blockMode: "single" },
      { rowId: `${prefix}-6`, subject: "Geometri", examLevel: "TYT / AYT", teacherName: pickTeacher("Geometri"), weeklyHours: 2, type: "Soru Çözümü", blockMode: "single" },
    ];
  }

  if (track === "Sözel") {
    return [
      { rowId: `${prefix}-1`, subject: "Edebiyat", examLevel: "AYT", teacherName: pickTeacher("Edebiyat"), weeklyHours: 6, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-2`, subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-3`, subject: "Tarih", examLevel: "TYT / AYT", teacherName: pickTeacher("Tarih"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-4`, subject: "Coğrafya", examLevel: "TYT / AYT", teacherName: pickTeacher("Coğrafya"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-5`, subject: "Felsefe", examLevel: "TYT / AYT", teacherName: pickTeacher("Felsefe"), weeklyHours: 2, type: "Konu Anlatımı", blockMode: "single" },
      { rowId: `${prefix}-6`, subject: "Din Kültürü", examLevel: "TYT / AYT", teacherName: pickTeacher("Din Kültürü"), weeklyHours: 2, type: "Konu Anlatımı", blockMode: "single" },
    ];
  }

  return [
    { rowId: `${prefix}-1`, subject: "Matematik", examLevel: "TYT / AYT", teacherName: pickTeacher("Matematik"), weeklyHours: 6, type: "Konu Anlatımı", blockMode: "auto" },
    { rowId: `${prefix}-2`, subject: "Geometri", examLevel: "TYT / AYT", teacherName: pickTeacher("Geometri"), weeklyHours: 2, type: "Soru Çözümü", blockMode: "single" },
    { rowId: `${prefix}-3`, subject: "Fizik", examLevel: "TYT / AYT", teacherName: pickTeacher("Fizik"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
    { rowId: `${prefix}-4`, subject: "Kimya", examLevel: "TYT / AYT", teacherName: pickTeacher("Kimya"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
    { rowId: `${prefix}-5`, subject: "Biyoloji", examLevel: "TYT / AYT", teacherName: pickTeacher("Biyoloji"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
    { rowId: `${prefix}-6`, subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
  ];
}

function buildInitialCurriculums(
  classes: ClassroomRecord[],
  teachers: TeacherAccount[]
): Record<string, OptimizerCurriculumRow[]> {
  const map: Record<string, OptimizerCurriculumRow[]> = {};
  classes.forEach((cls) => {
    map[cls.id] = buildDefaultCurriculum(cls.track, teachers, cls.id);
  });
  return map;
}

export default function AdminScheduleBuilderPage() {
  const {
    classes,
    teachers,
    replaceAllClassSchedules,
    clearClassSchedule,
    removeClassScheduleSlot,
    updateTeacherUnavailableSlots,
  } = useCampus();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [curriculumsByClass, setCurriculumsByClass] = useState<
    Record<string, OptimizerCurriculumRow[]>
  >(() => buildInitialCurriculums(classes, teachers));

  // Hard & Soft constraint controls
  const [daysScope, setDaysScope] = useState<"weekdays" | "sixdays">("weekdays");
  const [timeWindow, setTimeWindow] = useState<
    "morning" | "afternoon" | "fullday"
  >("fullday");
  const [preserveExamBlocks, setPreserveExamBlocks] = useState<boolean>(true);
  const [minimizeTeacherGaps, setMinimizeTeacherGaps] = useState<boolean>(true);
  const [balanceDailySubjects, setBalanceDailySubjects] = useState<boolean>(true);
  const [morningCorePriority, setMorningCorePriority] = useState<boolean>(true);
  const [enableSwapChains, setEnableSwapChains] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<OptimizationIntensity>("high");

  // Teacher availability matrix state
  const [showAvailabilityPanel, setShowAvailabilityPanel] = useState<boolean>(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id ?? ""
  );

  // Preview mode: Class vs Teacher
  const [previewMode, setPreviewMode] = useState<"class" | "teacher">("class");
  const [previewTeacherId, setPreviewTeacherId] = useState<string>(
    teachers[0]?.id ?? ""
  );

  const [resultBanner, setResultBanner] = useState<{
    ok: boolean;
    message: string;
    warnings: string[];
    metrics: OptimizationMetrics;
  } | null>(null);
  const [showTeacherReport, setShowTeacherReport] = useState<boolean>(false);

  const selectedClass =
    classes.find((c) => c.id === selectedClassId) ?? classes[0];
  const selectedTeacher =
    teachers.find((t) => t.id === selectedTeacherId) ?? teachers[0];
  const previewTeacher =
    teachers.find((t) => t.id === previewTeacherId) ?? teachers[0];

  const activeCurriculum = useMemo(() => {
    if (!selectedClass) return [];
    return (
      curriculumsByClass[selectedClass.id] ??
      buildDefaultCurriculum(selectedClass.track, teachers, selectedClass.id)
    );
  }, [selectedClass, curriculumsByClass, teachers]);

  const setActiveCurriculum = (
    updater: (prev: OptimizerCurriculumRow[]) => OptimizerCurriculumRow[]
  ) => {
    if (!selectedClass) return;
    setCurriculumsByClass((prev) => {
      const current =
        prev[selectedClass.id] ??
        buildDefaultCurriculum(selectedClass.track, teachers, selectedClass.id);
      return {
        ...prev,
        [selectedClass.id]: updater(current),
      };
    });
  };

  const totalHoursAllClasses = useMemo(
    () =>
      classes.reduce((sum, cls) => {
        const rows =
          curriculumsByClass[cls.id] ??
          buildDefaultCurriculum(cls.track, teachers, cls.id);
        return sum + rows.reduce((s, r) => s + Math.max(0, r.weeklyHours), 0);
      }, 0),
    [classes, curriculumsByClass, teachers]
  );

  const totalRequestedForSelected = useMemo(
    () => activeCurriculum.reduce((acc, r) => acc + Math.max(0, r.weeklyHours), 0),
    [activeCurriculum]
  );

  // Requested hours per teacher across ALL classes (for capacity check)
  const teacherDemandMap = useMemo(() => {
    const map = new Map<string, number>();
    classes.forEach((cls) => {
      const rows =
        curriculumsByClass[cls.id] ??
        buildDefaultCurriculum(cls.track, teachers, cls.id);
      rows.forEach((r) => {
        if (!r.teacherName) return;
        map.set(
          r.teacherName,
          (map.get(r.teacherName) ?? 0) + Math.max(0, r.weeklyHours)
        );
      });
    });
    return map;
  }, [classes, curriculumsByClass, teachers]);

  const matrixDays: WeekDay[] = useMemo(
    () =>
      daysScope === "weekdays"
        ? ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"]
        : ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
    [daysScope]
  );

  const matrixTimes = useMemo(() => {
    const all = buildDailySlots(50).slots;
    return all.filter((t) => {
      if (timeWindow === "morning") return t < "12:00";
      if (timeWindow === "afternoon") return t >= "12:00" && t <= "17:10";
      return t <= "17:10";
    });
  }, [timeWindow]);

  const handleToggleUnavailableSlot = (day: WeekDay, time: string) => {
    if (!selectedTeacher) return;
    const key = `${day}|${time.trim()}`;
    const current = new Set(selectedTeacher.unavailableSlots ?? []);
    if (current.has(key)) current.delete(key);
    else current.add(key);
    updateTeacherUnavailableSlots(selectedTeacher.id, Array.from(current));
  };

  const handleToggleWholeDay = (day: WeekDay) => {
    if (!selectedTeacher) return;
    const current = new Set(selectedTeacher.unavailableSlots ?? []);
    const dayKeys = matrixTimes.map((t) => `${day}|${t.trim()}`);
    const allClosed = dayKeys.every((k) => current.has(k));
    if (allClosed) {
      dayKeys.forEach((k) => current.delete(k));
    } else {
      dayKeys.forEach((k) => current.add(k));
    }
    updateTeacherUnavailableSlots(selectedTeacher.id, Array.from(current));
  };

  const handleTogglePeriodBlock = (period: "morning" | "afternoon") => {
    if (!selectedTeacher) return;
    const current = new Set(selectedTeacher.unavailableSlots ?? []);
    const targetTimes = matrixTimes.filter((t) =>
      period === "morning" ? t < "12:00" : t >= "12:00"
    );
    const keys: string[] = [];
    matrixDays.forEach((d) => {
      targetTimes.forEach((t) => keys.push(`${d}|${t.trim()}`));
    });
    const allClosed = keys.length > 0 && keys.every((k) => current.has(k));
    if (allClosed) keys.forEach((k) => current.delete(k));
    else keys.forEach((k) => current.add(k));
    updateTeacherUnavailableSlots(selectedTeacher.id, Array.from(current));
  };

  const handleAddRow = () => {
    const defaultSub = PRESET_SUBJECTS[0];
    const teacherName = getMatchingTeachers(teachers, defaultSub)[0]?.name ?? "";
    setActiveCurriculum((prev) => [
      ...prev,
      {
        rowId: `r-${Date.now()}`,
        subject: defaultSub,
        examLevel: "AYT",
        teacherName,
        weeklyHours: 2,
        type: "Konu Anlatımı",
        blockMode: "auto",
      },
    ]);
  };

  const handleUpdateRow = (
    rowId: string,
    patch: Partial<OptimizerCurriculumRow>
  ) => {
    setActiveCurriculum((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const next = { ...row, ...patch };
        if (patch.subject && !patch.teacherName) {
          const matched = getMatchingTeachers(teachers, patch.subject);
          const currentStillMatches = matched.some(
            (t) => t.name === row.teacherName
          );
          next.teacherName = currentStillMatches
            ? row.teacherName
            : matched[0]?.name ?? "";
        }
        return next;
      })
    );
  };

  const handleRemoveRow = (rowId: string) => {
    setActiveCurriculum((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const runSchedulerForClasses = (targetClasses: ClassroomRecord[]) => {
    if (targetClasses.length === 0) return;

    const preparedCurriculums: Record<string, OptimizerCurriculumRow[]> = {};
    targetClasses.forEach((cls) => {
      preparedCurriculums[cls.id] =
        curriculumsByClass[cls.id] ??
        buildDefaultCurriculum(cls.track, teachers, cls.id);
    });

    const result = runOptimizedTimetableSolver(
      targetClasses,
      preparedCurriculums,
      teachers,
      {
        daysScope,
        timeWindow,
        preserveExamBlocks,
        minimizeTeacherGaps,
        balanceDailySubjects,
        morningCorePriority,
        enableSwapChains,
        intensity,
      }
    );

    replaceAllClassSchedules(result.entries, preserveExamBlocks);

    setResultBanner({
      ok: result.warnings.length === 0,
      message: `${targetClasses.length} sınıf için ${result.metrics.placedHours}/${result.metrics.requestedHours} ders saati (%${result.metrics.placementRate}) optimize edilerek dağıtıldı.`,
      warnings: result.warnings,
      metrics: result.metrics,
    });
  };

  const selectedTeacherUnavailableSet = useMemo(
    () => new Set(selectedTeacher?.unavailableSlots ?? []),
    [selectedTeacher]
  );

  const selectedTeacherTotalGridSlots = matrixDays.length * matrixTimes.length;
  const selectedTeacherClosedInView = useMemo(() => {
    let cnt = 0;
    matrixDays.forEach((d) => {
      matrixTimes.forEach((t) => {
        if (selectedTeacherUnavailableSet.has(`${d}|${t.trim()}`)) cnt += 1;
      });
    });
    return cnt;
  }, [matrixDays, matrixTimes, selectedTeacherUnavailableSet]);

  const selectedTeacherOpenInView =
    selectedTeacherTotalGridSlots - selectedTeacherClosedInView;
  const selectedTeacherDemand = selectedTeacher
    ? teacherDemandMap.get(selectedTeacher.name) ?? 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          MRV + Zincirleme Takas + Simulated Annealing Dağıtım Motoru
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-2xl font-medium text-[#203B5C] sm:text-3xl">
          <CalendarDays className="h-6 w-6 text-[#135D43]" />
          <span>Akıllı Ders Programı Oluşturucu</span>
        </h1>
        <p className="mt-1 text-xs text-[#737B86] sm:text-sm">
          Sınıfların haftalık ders/blok planlarını ve öğretmenlerin kapalı/izinli
          saatlerini tanımlayın; optimizasyon motoru{" "}
          <strong>çakışmasız, en az öğretmen boşluklu ve günlere dengeli</strong>{" "}
          programı otomatik üretsin.
        </p>
      </div>

      {/* Step 1: Class Selector Tabs */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B]">
            <Layers className="h-4 w-4 text-[#135D43]" />
            <span>1. Tüm Sınıfların Ders &amp; Saat Planını Ayarlayın</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#EEF3F9] px-2.5 py-1 text-[11px] font-bold text-[#11284B]">
              Toplam Talep: {totalHoursAllClasses} Ders Saati ({classes.length} Sınıf)
            </span>
            <button
              type="button"
              onClick={() => {
                setCurriculumsByClass(buildInitialCurriculums(classes, teachers));
                setResultBanner(null);
              }}
              className="rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] px-2.5 py-1 text-[11px] font-semibold text-[#203B5C] hover:border-[#B18A52]"
            >
              Tüm Sınıfları Alanına Göre Sıfırla
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {classes.map((cls) => {
            const active = selectedClass?.id === cls.id;
            const rows =
              curriculumsByClass[cls.id] ??
              buildDefaultCurriculum(cls.track, teachers, cls.id);
            const plannedHrs = rows.reduce((s, r) => s + Math.max(0, r.weeklyHours), 0);
            const assignedHrs = cls.schedule.filter((s) => !s.blockPeriod).length;

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
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate font-bold text-[#11284B]">
                    {cls.name}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-[#135D43] text-white"
                        : "bg-white text-[#135D43]"
                    }`}
                  >
                    {plannedHrs} Saat
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#64748B]">
                  {cls.track} · Atanan: {assignedHrs} Saat
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Selected Class Curriculum Editor */}
      {selectedClass && (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B] sm:text-base">
                <Sparkles className="h-4 w-4 text-[#B18A52]" />
                <span>
                  2. {selectedClass.name} ({selectedClass.track}) — Ders, Blok &amp;
                  Öğretmen Planı
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Bu sınıf için belirlenen haftalık ders:{" "}
                <strong className="text-[#135D43]">
                  {totalRequestedForSelected} Saat
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(["Sayısal", "Eşit Ağırlık", "Sözel"] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() =>
                    setActiveCurriculum(() =>
                      buildDefaultCurriculum(tmpl, teachers, selectedClass.id)
                    )
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
            {activeCurriculum.map((row) => {
              const matchingTeachers = getMatchingTeachers(teachers, row.subject);
              return (
                <div
                  key={row.rowId}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-[#E2E8F0] bg-[#FAF8F5]/70 p-3 text-xs sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-2">
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
                    <select
                      value={
                        matchingTeachers.some((t) => t.name === row.teacherName)
                          ? row.teacherName
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, {
                          teacherName: e.target.value,
                        })
                      }
                      className={`w-full rounded-lg border bg-white px-2.5 py-2 ${
                        matchingTeachers.length === 0
                          ? "border-rose-300 text-rose-600"
                          : "border-[#DCE4EE] text-[#11284B]"
                      }`}
                    >
                      {matchingTeachers.length === 0 ? (
                        <option value="">
                          {row.subject} branşında öğretmen yok
                        </option>
                      ) : (
                        matchingTeachers.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name} (Talep: {teacherDemandMap.get(t.name) ?? 0}s)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
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
                        className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2 py-2 text-center font-bold text-[#135D43]"
                      />
                      <span className="shrink-0 text-[11px] font-semibold text-[#64748B]">
                        Saat
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={row.blockMode ?? "auto"}
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, {
                          blockMode: e.target.value as BlockMode,
                        })
                      }
                      title="Blok Dağıtım Tercihi"
                      className="w-full rounded-lg border border-[#DCE4EE] bg-white px-2 py-2 text-[11px] font-medium text-[#203B5C]"
                    >
                      <option value="auto">Blok: Otomatik</option>
                      <option value="double">Blok: 2&apos;li Ders</option>
                      <option value="single">Blok: Tekli Yay</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 sm:col-span-1">
                    <select
                      value={row.type}
                      onChange={(e) =>
                        handleUpdateRow(row.rowId, {
                          type: e.target.value as "Konu Anlatımı" | "Soru Çözümü",
                        })
                      }
                      className="w-full rounded-lg border border-[#DCE4EE] bg-white px-1.5 py-2 text-[11px] text-[#203B5C]"
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
        </div>
      )}

      {/* Step 3: Teacher Availability Matrix */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B] sm:text-base">
              <Lock className="h-4 w-4 text-[#B18A52]" />
              <span>3. Öğretmen Müsaitlik Matrisi (Kapalı / İzinli Saatler)</span>
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Öğretmenlerin ders veremeyeceği gün veya saatleri kapatın; motor bu
              saatlere kesinlikle ders atamaz.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAvailabilityPanel((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-[#FCFBF8] px-3 py-1.5 text-xs font-semibold text-[#203B5C] hover:border-[#B18A52]"
          >
            {showAvailabilityPanel ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Matrisi Gizle</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Matrisi Aç</span>
              </>
            )}
          </button>
        </div>

        {showAvailabilityPanel && selectedTeacher && (
          <div className="mt-4 space-y-4 border-t border-[#E9EBEE] pt-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedTeacher.id}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-bold text-[#11284B]"
                >
                  {teachers.map((t) => {
                    const closedCnt = (t.unavailableSlots ?? []).length;
                    const demand = teacherDemandMap.get(t.name) ?? 0;
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.branch}) — Talep: {demand}s · Kapalı:{" "}
                        {closedCnt}s
                      </option>
                    );
                  })}
                </select>

                <span
                  className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold ${
                    selectedTeacherDemand > selectedTeacherOpenInView
                      ? "bg-rose-50 text-rose-700"
                      : "bg-[#EAF6F0] text-[#135D43]"
                  }`}
                >
                  Açık Kapasite: {selectedTeacherOpenInView} Saat / Talep:{" "}
                  {selectedTeacherDemand} Saat
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleTogglePeriodBlock("morning")}
                  className="rounded-lg border border-[#DCE4EE] bg-[#FCFBF8] px-2.5 py-1.5 font-semibold text-[#203B5C] hover:border-[#B18A52]"
                >
                  Sabahları Kapat / Aç
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePeriodBlock("afternoon")}
                  className="rounded-lg border border-[#DCE4EE] bg-[#FCFBF8] px-2.5 py-1.5 font-semibold text-[#203B5C] hover:border-[#B18A52]"
                >
                  Öğleden Sonrayı Kapat / Aç
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateTeacherUnavailableSlots(selectedTeacher.id, [])
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Tümünü Açık Yap
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 text-left font-bold text-[#203B5C]">
                      Saat
                    </th>
                    {matrixDays.map((day) => (
                      <th
                        key={day}
                        className="border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleWholeDay(day)}
                          title="Tüm günü kapat / aç"
                          className="font-bold text-[#11284B] hover:text-[#135D43]"
                        >
                          {day}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixTimes.map((time) => (
                    <tr key={time}>
                      <td className="border border-[#E2E8F0] bg-[#FCFBF8] px-2.5 py-1.5 font-semibold text-[#475569]">
                        {time}
                      </td>
                      {matrixDays.map((day) => {
                        const key = `${day}|${time.trim()}`;
                        const isClosed = selectedTeacherUnavailableSet.has(key);
                        return (
                          <td
                            key={key}
                            className="border border-[#E2E8F0] p-1 text-center"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleUnavailableSlot(day, time)
                              }
                              className={`w-full rounded-md py-1.5 font-semibold transition ${
                                isClosed
                                  ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                  : "bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {isClosed ? "Kapalı" : "Müsait"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Optimization Engine & Constraints */}
      {selectedClass && (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B] sm:text-base">
                <Cpu className="h-4 w-4 text-[#135D43]" />
                <span>4. Optimizasyon Kısıtları ve Akıllı Dağıtım</span>
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Sert kısıtlar asla çiğnenmez; esnek kısıtlar Simulated Annealing
                motoruyla puanlanarak en verimli tablo seçilir.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-[#DCE8E2] bg-[#F7FAF8] p-4">
            {/* Hard Constraints Row */}
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
                <option value="afternoon">
                  Saat: Öğleden Sonra (12:50–17:00)
                </option>
              </select>

              <select
                value={intensity}
                onChange={(e) =>
                  setIntensity(e.target.value as OptimizationIntensity)
                }
                className="rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-semibold text-[#135D43]"
              >
                <option value="standard">Optimizasyon: Standart (700 Tur)</option>
                <option value="high">Optimizasyon: Yüksek (1.800 Tur)</option>
                <option value="max">Optimizasyon: Maksimum (3.500 Tur)</option>
              </select>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-medium text-[#203B5C]">
                <input
                  type="checkbox"
                  checked={preserveExamBlocks}
                  onChange={(e) => setPreserveExamBlocks(e.target.checked)}
                  className="accent-[#135D43]"
                />
                <span>Deneme bloklarını koru</span>
              </label>
            </div>

            {/* Soft Constraints Checkboxes */}
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-medium text-[#203B5C]">
                <input
                  type="checkbox"
                  checked={minimizeTeacherGaps}
                  onChange={(e) => setMinimizeTeacherGaps(e.target.checked)}
                  className="accent-[#135D43]"
                />
                <span>Öğretmen boş saatini azalt</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-medium text-[#203B5C]">
                <input
                  type="checkbox"
                  checked={balanceDailySubjects}
                  onChange={(e) => setBalanceDailySubjects(e.target.checked)}
                  className="accent-[#135D43]"
                />
                <span>Dersleri günlere dengeli yay</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-medium text-[#203B5C]">
                <input
                  type="checkbox"
                  checked={morningCorePriority}
                  onChange={(e) => setMorningCorePriority(e.target.checked)}
                  className="accent-[#135D43]"
                />
                <span>Ağır derslere sabah önceliği</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 font-medium text-[#203B5C]">
                <input
                  type="checkbox"
                  checked={enableSwapChains}
                  onChange={(e) => setEnableSwapChains(e.target.checked)}
                  className="accent-[#135D43]"
                />
                <span>Zincirleme takas (Swap) kurtarma</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#DCE8E2] pt-3">
              <button
                type="button"
                onClick={() => runSchedulerForClasses([selectedClass])}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#203B5C] bg-white px-4 py-2.5 text-xs font-bold text-[#203B5C] transition hover:bg-[#EEF3F9]"
              >
                <span>Sadece {selectedClass.name} İçin Optimize Et</span>
              </button>
              <button
                type="button"
                onClick={() => runSchedulerForClasses(classes)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#135D43] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0E4A35] sm:text-sm"
              >
                <Wand2 className="h-4 w-4 text-[#E8C483]" />
                <span>
                  Tüm Sınıflar İçin Optimize Et &amp; Dağıt ({classes.length} Sınıf)
                </span>
              </button>
            </div>
          </div>

          {/* Optimization Result & Metrics */}
          {resultBanner && (
            <div
              className={`mt-4 rounded-xl border p-4 text-xs ${
                resultBanner.ok
                  ? "border-[#BBE0CE] bg-[#EAF6F0] text-[#0E4D3A]"
                  : "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-bold">
                  {resultBanner.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{resultBanner.message}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowTeacherReport((v) => !v)}
                  className="rounded-lg border border-current/20 bg-white/70 px-2.5 py-1 text-[11px] font-bold hover:bg-white"
                >
                  {showTeacherReport
                    ? "Öğretmen Raporunu Gizle"
                    : "Öğretmen Yük & Boşluk Raporu"}
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <div className="rounded-lg bg-white/80 p-2.5">
                  <p className="text-[10px] opacity-75">Optimizasyon Puanı</p>
                  <p className="mt-0.5 text-base font-bold text-[#11284B]">
                    {resultBanner.metrics.optimizationScore} / 100
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-2.5">
                  <p className="text-[10px] opacity-75">Yerleşim Oranı</p>
                  <p className="mt-0.5 text-base font-bold text-[#135D43]">
                    %{resultBanner.metrics.placementRate}
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-2.5">
                  <p className="text-[10px] opacity-75">Öğretmen Pencere (Boşluk)</p>
                  <p className="mt-0.5 text-base font-bold text-[#11284B]">
                    {resultBanner.metrics.initialTeacherGaps} →{" "}
                    {resultBanner.metrics.finalTeacherGaps} saat
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-2.5">
                  <p className="text-[10px] opacity-75">Swap Kurtarma / Bölme</p>
                  <p className="mt-0.5 text-base font-bold text-[#203B5C]">
                    {resultBanner.metrics.swapRescues} /{" "}
                    {resultBanner.metrics.splitFallbacks}
                  </p>
                </div>
                <div className="rounded-lg bg-white/80 p-2.5">
                  <p className="text-[10px] opacity-75">Çözüm Süresi</p>
                  <p className="mt-0.5 flex items-center gap-1 text-base font-bold text-[#11284B]">
                    <Clock className="h-3.5 w-3.5 text-[#B18A52]" />
                    <span>{resultBanner.metrics.durationMs} ms</span>
                  </p>
                </div>
              </div>

              {resultBanner.warnings.length > 0 && (
                <ul className="mt-3 list-inside list-disc space-y-0.5 text-[11px]">
                  {resultBanner.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}

              {showTeacherReport &&
                resultBanner.metrics.teacherReports.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-black/10 bg-white">
                    <table className="w-full text-left text-[11px] text-[#11284B]">
                      <thead className="bg-[#F8FAFC] text-[#475569]">
                        <tr>
                          <th className="px-3 py-2">Öğretmen</th>
                          <th className="px-3 py-2">Branş</th>
                          <th className="px-3 py-2">Atanan Saat</th>
                          <th className="px-3 py-2">Açık / Kapalı Slot</th>
                          <th className="px-3 py-2">Günlük Boşluk (Pencere)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {resultBanner.metrics.teacherReports.map((rep) => (
                          <tr key={rep.teacherName}>
                            <td className="px-3 py-1.5 font-bold">
                              {rep.teacherName}
                            </td>
                            <td className="px-3 py-1.5 text-[#64748B]">
                              {rep.branch}
                            </td>
                            <td className="px-3 py-1.5 font-semibold text-[#135D43]">
                              {rep.assignedHours} Saat
                            </td>
                            <td className="px-3 py-1.5">
                              {rep.openSlotCount} açık / {rep.closedSlotCount}{" "}
                              kapalı
                            </td>
                            <td className="px-3 py-1.5 font-semibold">
                              {rep.idleGaps} saat
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Live Class or Teacher Timetable Preview */}
      {selectedClass && (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#11284B] sm:text-2xl">
                {previewMode === "class"
                  ? `${selectedClass.name} — Oluşturulan Haftalık Ders Programı (${selectedClass.schedule.length} Saat)`
                  : `${previewTeacher?.name ?? "Öğretmen"} — Haftalık Ders Programı (${previewTeacher?.schedule.length ?? 0} Saat)`}
              </h2>
              <p className="text-xs text-[#64748B]">
                Sınıf veya öğretmen görünümüne geçerek çakışmasız dağılımı ve
                boşluk durumunu doğrulayabilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-[#DCE4EE] bg-[#FCFBF8] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode("class")}
                  className={`rounded-md px-3 py-1.5 font-semibold transition ${
                    previewMode === "class"
                      ? "bg-[#11284B] text-white"
                      : "text-[#64748B] hover:text-[#11284B]"
                  }`}
                >
                  Sınıf Görünümü
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("teacher")}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-semibold transition ${
                    previewMode === "teacher"
                      ? "bg-[#11284B] text-white"
                      : "text-[#64748B] hover:text-[#11284B]"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Öğretmen Görünümü</span>
                </button>
              </div>

              {previewMode === "teacher" && (
                <select
                  value={previewTeacher?.id ?? ""}
                  onChange={(e) => setPreviewTeacherId(e.target.value)}
                  className="rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#11284B]"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.schedule.length}s)
                    </option>
                  ))}
                </select>
              )}

              {previewMode === "class" && selectedClass.schedule.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearClassSchedule(selectedClass.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Bu Sınıfın Programını Temizle</span>
                </button>
              )}
            </div>
          </div>

          {previewMode === "class" ? (
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
                onDelete: () =>
                  removeClassScheduleSlot(selectedClass.id, slot.id),
              }))}
            />
          ) : (
            <WeeklyTimetable
              items={(previewTeacher?.schedule ?? []).map((slot) => ({
                id: slot.id,
                day: slot.day,
                time: slot.time,
                title: `${slot.classGroup} · ${slot.subject}`,
                subtitle: previewTeacher?.name ?? "",
                meta: slot.room,
                badge: "Ders",
              }))}
            />
          )}
        </div>
      )}
    </div>
  );
}
