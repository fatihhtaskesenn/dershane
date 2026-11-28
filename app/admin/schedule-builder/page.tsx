"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Plus,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Wand2,
} from "lucide-react";
import {
  useCampus,
  type ClassroomRecord,
  type TeacherAccount,
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
  type ClassTimeProfile,
  type OptimizationIntensity,
  type OptimizationMetrics,
  type OptimizerCurriculumRow,
} from "@/lib/timetable-optimizer";

const TIME_PROFILE_OPTIONS: {
  value: ClassTimeProfile;
  label: string;
  short: string;
}[] = [
  { value: "fullday", label: "Tam Gün (08:00 – 21:00)", short: "08:00–21:00" },
  { value: "daytime", label: "Gündüz / Mezun (08:00 – 17:40)", short: "08:00–17:40" },
  { value: "morning", label: "Sabah Grubu (08:00 – 12:00)", short: "08:00–12:00" },
  { value: "afternoon", label: "Öğle Sonrası (13:00 – 21:00)", short: "13:00–21:00" },
  { value: "after_school", label: "Okul Sonrası (16:10 – 21:00)", short: "16:10+" },
  { value: "evening", label: "Akşam Grubu (17:00 – 21:00)", short: "17:00+" },
];

function buildInitialTimeProfiles(
  classes: ClassroomRecord[]
): Record<string, ClassTimeProfile> {
  const map: Record<string, ClassTimeProfile> = {};
  classes.forEach((cls) => {
    map[cls.id] =
      cls.timeProfile ??
      (cls.isSchoolStudentClass
        ? "after_school"
        : cls.name.toLowerCase().includes("mezun")
        ? "daytime"
        : "fullday");
  });
  return map;
}

function getMatchingTeachers(teachers: TeacherAccount[], subject: string) {
  return teachers.filter((t) => doesTeacherMatchSubject(t.branch, subject));
}

function countOpenSlotsInProfile(
  teacher: TeacherAccount,
  profile: ClassTimeProfile
): number {
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const allSlots = buildDailySlots(60).slots.filter((tm) => {
    if (profile === "morning") return tm < "12:00";
    if (profile === "daytime") return tm <= "17:40";
    if (profile === "afternoon") return tm >= "12:00";
    if (profile === "after_school") return tm >= "16:10";
    if (profile === "evening") return tm >= "17:00";
    return true;
  });
  const closed = new Set(teacher.unavailableSlots ?? []);
  let open = 0;
  days.forEach((d) => {
    allSlots.forEach((t) => {
      if (!closed.has(`${d}|${t}`)) open += 1;
    });
  });
  return open;
}

function buildDefaultCurriculum(
  track: string,
  teachers: TeacherAccount[],
  prefix: string,
  timeProfile: ClassTimeProfile = "fullday"
): OptimizerCurriculumRow[] {
  const pickTeacher = (sub: string) => {
    const matched = getMatchingTeachers(teachers, sub);
    if (matched.length === 0) return "";
    const sorted = [...matched].sort(
      (a, b) =>
        countOpenSlotsInProfile(b, timeProfile) -
        countOpenSlotsInProfile(a, timeProfile)
    );
    return sorted[0]?.name ?? "";
  };

  if (track === "Eşit Ağırlık") {
    return [
      { rowId: `${prefix}-1`, subject: "Matematik", examLevel: "TYT / AYT", teacherName: pickTeacher("Matematik"), weeklyHours: 6, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-2`, subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-3`, subject: "Edebiyat", examLevel: "AYT", teacherName: pickTeacher("Edebiyat"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-4`, subject: "Tarih", examLevel: "TYT / AYT", teacherName: pickTeacher("Tarih"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-5`, subject: "Coğrafya", examLevel: "TYT / AYT", teacherName: pickTeacher("Coğrafya"), weeklyHours: 2, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-6`, subject: "Geometri", examLevel: "TYT / AYT", teacherName: pickTeacher("Geometri"), weeklyHours: 2, type: "Soru Çözümü", blockMode: "auto" },
    ];
  }

  if (track === "Sözel") {
    return [
      { rowId: `${prefix}-1`, subject: "Edebiyat", examLevel: "AYT", teacherName: pickTeacher("Edebiyat"), weeklyHours: 6, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-2`, subject: "Türkçe", examLevel: "TYT", teacherName: pickTeacher("Türkçe"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-3`, subject: "Tarih", examLevel: "TYT / AYT", teacherName: pickTeacher("Tarih"), weeklyHours: 4, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-4`, subject: "Coğrafya", examLevel: "TYT / AYT", teacherName: pickTeacher("Coğrafya"), weeklyHours: 3, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-5`, subject: "Felsefe", examLevel: "TYT / AYT", teacherName: pickTeacher("Felsefe"), weeklyHours: 2, type: "Konu Anlatımı", blockMode: "auto" },
      { rowId: `${prefix}-6`, subject: "Din Kültürü", examLevel: "TYT / AYT", teacherName: pickTeacher("Din Kültürü"), weeklyHours: 2, type: "Konu Anlatımı", blockMode: "auto" },
    ];
  }

  return [
    { rowId: `${prefix}-1`, subject: "Matematik", examLevel: "TYT / AYT", teacherName: pickTeacher("Matematik"), weeklyHours: 6, type: "Konu Anlatımı", blockMode: "auto" },
    { rowId: `${prefix}-2`, subject: "Geometri", examLevel: "TYT / AYT", teacherName: pickTeacher("Geometri"), weeklyHours: 2, type: "Soru Çözümü", blockMode: "auto" },
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
    const prof: ClassTimeProfile =
      cls.timeProfile ??
      (cls.isSchoolStudentClass
        ? "after_school"
        : cls.name.toLowerCase().includes("mezun")
        ? "daytime"
        : "fullday");
    map[cls.id] = buildDefaultCurriculum(cls.track, teachers, cls.id, prof);
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
  } = useCampus();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [curriculumsByClass, setCurriculumsByClass] = useState<
    Record<string, OptimizerCurriculumRow[]>
  >(() => buildInitialCurriculums(classes, teachers));
  const [timeProfileByClass, setTimeProfileByClass] = useState<
    Record<string, ClassTimeProfile>
  >(() => buildInitialTimeProfiles(classes));

  // Scheduling controls (smart defaults, advanced options tucked away)
  const [daysScope, setDaysScope] = useState<"weekdays" | "sixdays">("weekdays");
  const [timeWindow, setTimeWindow] = useState<
    "morning" | "afternoon" | "fullday"
  >("fullday");
  const [preserveExamBlocks, setPreserveExamBlocks] = useState<boolean>(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [minimizeTeacherGaps, setMinimizeTeacherGaps] = useState<boolean>(true);
  const [balanceDailySubjects, setBalanceDailySubjects] = useState<boolean>(true);
  const [morningCorePriority, setMorningCorePriority] = useState<boolean>(true);
  const [enableSwapChains, setEnableSwapChains] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<OptimizationIntensity>("high");

  // Preview mode
  const [previewMode, setPreviewMode] = useState<"class" | "teacher">("class");
  const [previewTeacherId, setPreviewTeacherId] = useState<string>(
    teachers[0]?.id ?? ""
  );

  // Result & collapsible teacher report
  const [resultBanner, setResultBanner] = useState<{
    ok: boolean;
    message: string;
    warnings: string[];
    metrics: OptimizationMetrics;
  } | null>(null);
  const [showTeacherReport, setShowTeacherReport] = useState<boolean>(false);
  const [expandedTeacherCard, setExpandedTeacherCard] = useState<string | null>(
    null
  );

  const selectedClass =
    classes.find((c) => c.id === selectedClassId) ?? classes[0];
  const previewTeacher =
    teachers.find((t) => t.id === previewTeacherId) ?? teachers[0];

  const activeCurriculum = useMemo(() => {
    if (!selectedClass) return [];
    const prof =
      timeProfileByClass[selectedClass.id] ??
      selectedClass.timeProfile ??
      "fullday";
    return (
      curriculumsByClass[selectedClass.id] ??
      buildDefaultCurriculum(selectedClass.track, teachers, selectedClass.id, prof)
    );
  }, [selectedClass, curriculumsByClass, teachers, timeProfileByClass]);

  const setActiveCurriculum = (
    updater: (prev: OptimizerCurriculumRow[]) => OptimizerCurriculumRow[]
  ) => {
    if (!selectedClass) return;
    setCurriculumsByClass((prev) => {
      const prof =
        timeProfileByClass[selectedClass.id] ??
        selectedClass.timeProfile ??
        "fullday";
      const current =
        prev[selectedClass.id] ??
        buildDefaultCurriculum(
          selectedClass.track,
          teachers,
          selectedClass.id,
          prof
        );
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
    const preparedProfiles: Record<string, ClassTimeProfile> = {};

    targetClasses.forEach((cls) => {
      const prof: ClassTimeProfile =
        timeProfileByClass[cls.id] ??
        cls.timeProfile ??
        (cls.isSchoolStudentClass ? "after_school" : "fullday");
      preparedProfiles[cls.id] = prof;
      preparedCurriculums[cls.id] =
        curriculumsByClass[cls.id] ??
        buildDefaultCurriculum(cls.track, teachers, cls.id, prof);
    });

    const result = runOptimizedTimetableSolver(
      targetClasses,
      preparedCurriculums,
      teachers,
      {
        daysScope,
        timeWindow,
        classTimeProfiles: preparedProfiles,
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
      message: `${targetClasses.length} sınıf için ${result.metrics.placedHours}/${result.metrics.requestedHours} ders saati (%${result.metrics.placementRate}) çakışmasız dağıtıldı.`,
      warnings: result.warnings,
      metrics: result.metrics,
    });
  };

  const selectedTimeProfile = selectedClass
    ? timeProfileByClass[selectedClass.id] ??
      selectedClass.timeProfile ??
      "fullday"
    : "fullday";

  return (
    <div className="space-y-6">
      {/* Clean Header with Quick Bulk Action */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
            Akıllı Çizelgeleme
          </p>
          <h1 className="font-editorial mt-1 flex items-center gap-2 text-2xl font-medium text-[#203B5C] sm:text-3xl">
            <CalendarDays className="h-6 w-6 text-[#135D43]" />
            <span>Ders Programı Oluştur</span>
          </h1>
          <p className="mt-1 text-xs text-[#737B86] sm:text-sm">
            Sınıfların ders ve öğretmen planını kontrol edin, ardından tek tıkla
            çakışmasız dağıtımı başlatın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-[#EEF3F9] px-3 py-2 text-xs font-bold text-[#11284B]">
            Toplam: {totalHoursAllClasses} Saat ({classes.length} Sınıf)
          </span>
          <button
            type="button"
            onClick={() => runSchedulerForClasses(classes)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#135D43] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0E4A35] sm:text-sm"
          >
            <Wand2 className="h-4 w-4 text-[#E8C483]" />
            <span>Tüm Sınıflara Dağıt ({classes.length})</span>
          </button>
        </div>
      </div>

      {/* Step 1: Compact Class Switcher Strip */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-[#475569] uppercase">
            <Layers className="h-3.5 w-3.5 text-[#135D43]" />
            <span>1. Sınıf Seçimi</span>
          </h2>
          <button
            type="button"
            onClick={() => {
              setCurriculumsByClass(buildInitialCurriculums(classes, teachers));
              setResultBanner(null);
            }}
            className="text-[11px] font-semibold text-[#64748B] hover:text-[#11284B] hover:underline"
          >
            Varsayılan Şablonlara Sıfırla
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {classes.map((cls) => {
            const active = selectedClass?.id === cls.id;
            const rows =
              curriculumsByClass[cls.id] ??
              buildDefaultCurriculum(cls.track, teachers, cls.id);
            const plannedHrs = rows.reduce(
              (s, r) => s + Math.max(0, r.weeklyHours),
              0
            );
            const assignedHrs = cls.schedule.filter((s) => !s.blockPeriod).length;
            const prof =
              timeProfileByClass[cls.id] ??
              cls.timeProfile ??
              (cls.isSchoolStudentClass ? "after_school" : "fullday");
            const profShort =
              TIME_PROFILE_OPTIONS.find((o) => o.value === prof)?.short ??
              "08:00–21:00";

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-[#135D43] bg-[#EAF6F0]/80 shadow-2xs ring-1 ring-[#135D43]"
                    : "border-[#DCE4EE] bg-white hover:border-[#B18A52]"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-bold text-[#11284B]">
                    {cls.name}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-[#135D43] text-white"
                        : "bg-[#F1F5F9] text-[#11284B]"
                    }`}
                  >
                    {plannedHrs}s
                  </span>
                </div>
                <p className="mt-1 truncate text-[10px] text-[#64748B]">
                  {profShort} · Atanan: {assignedHrs}s
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Clean Table Curriculum Editor */}
      {selectedClass && (
        <section className="overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white shadow-2xs">
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] bg-[#FCFBF8] px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm font-bold text-[#11284B] sm:text-base">
                2. {selectedClass.name}
              </h2>
              <span className="rounded-md bg-[#EEF3F9] px-2 py-0.5 text-[11px] font-semibold text-[#203B5C]">
                {selectedClass.track} · {totalRequestedForSelected} Saat
              </span>
              <select
                value={selectedTimeProfile}
                onChange={(e) =>
                  setTimeProfileByClass((prev) => ({
                    ...prev,
                    [selectedClass.id]: e.target.value as ClassTimeProfile,
                  }))
                }
                className="rounded-lg border border-[#135D43]/30 bg-[#EAF6F0] px-2.5 py-1 text-[11px] font-bold text-[#135D43] focus:outline-none"
              >
                {TIME_PROFILE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(["Sayısal", "Eşit Ağırlık", "Sözel"] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() =>
                    setActiveCurriculum(() =>
                      buildDefaultCurriculum(
                        tmpl,
                        teachers,
                        selectedClass.id,
                        selectedTimeProfile
                      )
                    )
                  }
                  className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#475569] hover:border-[#B18A52] hover:text-[#11284B]"
                >
                  {tmpl}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 rounded-lg bg-[#11284B] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1a3a6b]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ders Ekle</span>
              </button>
            </div>
          </div>

          {/* Crisp Single-Table Curriculum */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-[#E9EBEE] bg-[#F8FAFC] text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Ders</th>
                  <th className="px-3 py-2.5">Düzey</th>
                  <th className="px-3 py-2.5">Öğretmen</th>
                  <th className="w-24 px-3 py-2.5 text-center">Haftalık Saat</th>
                  <th className="px-3 py-2.5">Blok</th>
                  <th className="px-3 py-2.5">Tür</th>
                  <th className="w-12 px-3 py-2.5 text-center">Sil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {activeCurriculum.map((row) => {
                  const matchingTeachers = getMatchingTeachers(
                    teachers,
                    row.subject
                  );
                  return (
                    <tr
                      key={row.rowId}
                      className="transition-colors hover:bg-[#FAF8F5]/70"
                    >
                      <td className="px-4 py-2">
                        <select
                          value={row.subject}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              subject: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-semibold text-[#11284B] hover:border-[#DCE4EE] focus:border-[#135D43] focus:bg-white focus:outline-none"
                        >
                          {PRESET_SUBJECTS.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.examLevel}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              examLevel: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-medium text-[#475569] hover:border-[#DCE4EE] focus:border-[#135D43] focus:bg-white focus:outline-none"
                        >
                          {EXAM_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={
                            matchingTeachers.some(
                              (t) => t.name === row.teacherName
                            )
                              ? row.teacherName
                              : ""
                          }
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              teacherName: e.target.value,
                            })
                          }
                          className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 hover:border-[#DCE4EE] focus:border-[#135D43] focus:bg-white focus:outline-none ${
                            matchingTeachers.length === 0
                              ? "font-semibold text-rose-600"
                              : "font-medium text-[#11284B]"
                          }`}
                        >
                          {matchingTeachers.length === 0 ? (
                            <option value="">
                              {row.subject} branşında öğretmen yok
                            </option>
                          ) : (
                            matchingTeachers.map((t) => (
                              <option key={t.id} value={t.name}>
                                {t.name} ({teacherDemandMap.get(t.name) ?? 0}s)
                              </option>
                            ))
                          )}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          max={16}
                          value={row.weeklyHours}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              weeklyHours: Math.max(
                                1,
                                Number(e.target.value) || 1
                              ),
                            })
                          }
                          className="w-16 rounded-lg border border-[#DCE4EE] bg-[#FCFBF8] px-2 py-1 text-center font-bold text-[#135D43] focus:border-[#135D43] focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.blockMode ?? "auto"}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              blockMode: e.target.value as BlockMode,
                            })
                          }
                          className="rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#475569] hover:border-[#DCE4EE] focus:border-[#135D43] focus:bg-white focus:outline-none"
                        >
                          <option value="auto">Otomatik</option>
                          <option value="double">2&apos;li Blok (2+2+2)</option>
                          <option value="triple">3&apos;lü Blok (3+3)</option>
                          <option value="single">Tekli Yay</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={row.type}
                          onChange={(e) =>
                            handleUpdateRow(row.rowId, {
                              type: e.target.value as
                                | "Konu Anlatımı"
                                | "Soru Çözümü",
                            })
                          }
                          className="rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#475569] hover:border-[#DCE4EE] focus:border-[#135D43] focus:bg-white focus:outline-none"
                        >
                          <option value="Konu Anlatımı">Konu</option>
                          <option value="Soru Çözümü">Soru</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.rowId)}
                          title="Dersi Kaldır"
                          className="inline-flex rounded-lg p-1.5 text-[#94A3B8] transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clean Action Bar + Collapsible Advanced Options */}
          <div className="border-t border-[#E9EBEE] bg-[#F8FAFC] px-4 py-3.5 sm:px-5">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={daysScope}
                  onChange={(e) =>
                    setDaysScope(e.target.value as "weekdays" | "sixdays")
                  }
                  className="rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 font-semibold text-[#11284B]"
                >
                  <option value="weekdays">Hafta İçi (Pzt–Cum)</option>
                  <option value="sixdays">6 Gün (Pzt–Cmt)</option>
                </select>

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 font-medium text-[#203B5C]">
                  <input
                    type="checkbox"
                    checked={preserveExamBlocks}
                    onChange={(e) => setPreserveExamBlocks(e.target.checked)}
                    className="accent-[#135D43]"
                  />
                  <span>Denemeleri koru</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 font-semibold text-[#64748B] hover:text-[#11284B]"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Gelişmiş Ayarlar</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => runSchedulerForClasses([selectedClass])}
                  className="rounded-xl border border-[#203B5C]/30 bg-white px-4 py-2 text-xs font-bold text-[#203B5C] transition hover:bg-[#EEF3F9]"
                >
                  Sadece {selectedClass.name} İçin Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => runSchedulerForClasses(classes)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#135D43] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0E4A35]"
                >
                  <Wand2 className="h-4 w-4 text-[#E8C483]" />
                  <span>Tüm Sınıflar İçin Dağıt ({classes.length} Sınıf)</span>
                </button>
              </div>
            </div>

            {showAdvancedOptions && (
              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[#E2E8F0] pt-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={timeWindow}
                  onChange={(e) =>
                    setTimeWindow(
                      e.target.value as "morning" | "afternoon" | "fullday"
                    )
                  }
                  className="rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 font-medium text-[#11284B]"
                >
                  <option value="fullday">Genel Pencere: Tam Gün</option>
                  <option value="morning">Genel Pencere: Sabah</option>
                  <option value="afternoon">Genel Pencere: Öğleden Sonra</option>
                </select>

                <select
                  value={intensity}
                  onChange={(e) =>
                    setIntensity(e.target.value as OptimizationIntensity)
                  }
                  className="rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 font-medium text-[#135D43]"
                >
                  <option value="standard">Optimizasyon: Standart</option>
                  <option value="high">Optimizasyon: Yüksek</option>
                  <option value="max">Optimizasyon: Maksimum</option>
                </select>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-[#203B5C]">
                  <input
                    type="checkbox"
                    checked={minimizeTeacherGaps}
                    onChange={(e) => setMinimizeTeacherGaps(e.target.checked)}
                    className="accent-[#135D43]"
                  />
                  <span>Ara boşluğu azalt</span>
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-[#203B5C]">
                  <input
                    type="checkbox"
                    checked={balanceDailySubjects}
                    onChange={(e) => setBalanceDailySubjects(e.target.checked)}
                    className="accent-[#135D43]"
                  />
                  <span>Günlere dengeli yay</span>
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-[#203B5C]">
                  <input
                    type="checkbox"
                    checked={morningCorePriority}
                    onChange={(e) => setMorningCorePriority(e.target.checked)}
                    className="accent-[#135D43]"
                  />
                  <span>Sabah önceliği</span>
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-[#203B5C]">
                  <input
                    type="checkbox"
                    checked={enableSwapChains}
                    onChange={(e) => setEnableSwapChains(e.target.checked)}
                    className="accent-[#135D43]"
                  />
                  <span>Takas kurtarma (Swap)</span>
                </label>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Distribution Result & Collapsible Teacher Status Report */}
      {resultBanner && (
        <section className="space-y-3 rounded-2xl border border-[#DCE4EE] bg-white p-4 text-xs shadow-2xs sm:p-5">
          <div
            className={`flex flex-col justify-between gap-2 rounded-xl border p-3.5 sm:flex-row sm:items-center ${
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
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="rounded-md bg-white/80 px-2.5 py-1 text-[#135D43]">
                Yerleşen: {resultBanner.metrics.placedHours} /{" "}
                {resultBanner.metrics.requestedHours} Saat (%
                {resultBanner.metrics.placementRate})
              </span>
              {resultBanner.metrics.requestedHours -
                resultBanner.metrics.placedHours >
                0 && (
                <span className="rounded-md bg-rose-100 px-2.5 py-1 text-rose-700">
                  Boşta Kalan:{" "}
                  {resultBanner.metrics.requestedHours -
                    resultBanner.metrics.placedHours}{" "}
                  Saat
                </span>
              )}
            </div>
          </div>

          {resultBanner.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[#92400E]">
              <p className="mb-1.5 font-bold">Yerleştirilemeyen Dersler:</p>
              <ul className="list-inside list-disc space-y-0.5 text-[11px]">
                {resultBanner.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {resultBanner.metrics.teacherReports.length > 0 && (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FCFBF8]">
              <button
                type="button"
                onClick={() => setShowTeacherReport((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-[#F8FAFC]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Clock className="h-4 w-4 text-[#135D43]" />
                  <span className="text-xs font-bold text-[#11284B] sm:text-sm">
                    Öğretmen Durum Raporu &amp; Boş Vakitler (
                    {resultBanner.metrics.teacherReports.length} Hoca)
                  </span>
                  <span className="rounded bg-[#EEF3F9] px-2 py-0.5 text-[10px] font-semibold text-[#203B5C]">
                    Toplam Boş Kapasite:{" "}
                    {resultBanner.metrics.teacherReports.reduce(
                      (s, r) => s + r.remainingFreeCount,
                      0
                    )}{" "}
                    Saat
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#135D43]">
                  <span>{showTeacherReport ? "Gizle" : "Detayları Aç"}</span>
                  {showTeacherReport ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </button>

              {showTeacherReport && (
                <div className="grid grid-cols-1 gap-2.5 border-t border-[#E2E8F0] p-3.5 md:grid-cols-2 xl:grid-cols-3">
                  {resultBanner.metrics.teacherReports.map((rep) => {
                    const fillPct =
                      rep.openSlotCount > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (rep.assignedHours / rep.openSlotCount) * 100
                            )
                          )
                        : 0;
                    const isExpanded = expandedTeacherCard === rep.teacherName;

                    return (
                      <div
                        key={rep.teacherName}
                        className="rounded-xl border border-[#E2E8F0] bg-white p-3 transition hover:border-[#B18A52]/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#11284B]">
                              {rep.teacherName}
                            </p>
                            <p className="truncate text-[10px] text-[#64748B]">
                              {rep.branch}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold">
                            <span className="rounded bg-[#EAF6F0] px-1.5 py-0.5 text-[#135D43]">
                              {rep.assignedHours}/{rep.openSlotCount}s (%{fillPct})
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 ${
                                rep.idleGaps === 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {rep.idleGaps}s ara
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className="h-full rounded-full bg-[#135D43]"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                          {rep.freeSlotsByDay.length === 0 ? (
                            <span className="text-[10px] text-[#94A3B8]">
                              Boş vakit kalmadı
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {rep.freeSlotsByDay.map((dInfo) => (
                                <span
                                  key={dInfo.day}
                                  title={`${dInfo.day}: ${dInfo.freeTimes.join(", ")}`}
                                  className="rounded border border-[#DCE4EE] bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-medium text-[#203B5C]"
                                >
                                  <strong className="text-[#11284B]">
                                    {dInfo.day.slice(0, 3)}:
                                  </strong>{" "}
                                  {dInfo.freeTimes.length} boş
                                </span>
                              ))}
                            </div>
                          )}

                          {rep.freeSlotsByDay.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedTeacherCard(
                                  isExpanded ? null : rep.teacherName
                                )
                              }
                              className="text-[10px] font-bold text-[#135D43] hover:underline"
                            >
                              {isExpanded ? "Gizle" : "Saatleri Gör"}
                            </button>
                          )}
                        </div>

                        {isExpanded && rep.freeSlotsByDay.length > 0 && (
                          <div className="mt-2 space-y-1 border-t border-[#E2E8F0] pt-2 text-[10px] text-[#475569]">
                            {rep.freeSlotsByDay.map((dInfo) => (
                              <p key={dInfo.day}>
                                <strong className="text-[#11284B]">
                                  {dInfo.day}:
                                </strong>{" "}
                                {dInfo.freeTimes
                                  .map((t) => t.split(" - ")[0])
                                  .join(", ")}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Step 3: Live Class or Teacher Timetable Preview */}
      {selectedClass && (
        <section className="rounded-2xl border border-[#DCE4EE] bg-white p-4 shadow-2xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#11284B] sm:text-2xl">
                {previewMode === "class"
                  ? `${selectedClass.name} — Haftalık Ders Programı (${selectedClass.schedule.length} Saat)`
                  : `${previewTeacher?.name ?? "Öğretmen"} — Haftalık Ders Programı (${previewTeacher?.schedule.length ?? 0} Saat)`}
              </h2>
              <p className="text-xs text-[#64748B]">
                Sınıf veya öğretmen görünümüne geçerek programı kontrol
                edebilirsiniz.
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
                  <span>Temizle</span>
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
        </section>
      )}
    </div>
  );
}
