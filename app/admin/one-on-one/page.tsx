"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  GraduationCap,
  Pencil,
  Search,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { useCampus, type WeekDay } from "@/lib/campus-store";
import {
  ALL_PRESET_TIME_SLOTS,
  buildDailySlots,
  doesTeacherMatchSubject,
  EXAM_LEVELS,
  PRESET_SUBJECTS,
  TIMETABLE_DAYS,
  WeeklyTimetable,
  type TimetableItem,
} from "@/components/WeeklyTimetable";

export default function AdminOneOnOnePage() {
  const {
    students,
    teachers,
    classes,
    createOneOnOneSession,
    updateOneOnOneSlot,
    removeOneOnOneSlot,
  } = useCampus();

  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editOoDay, setEditOoDay] = useState<WeekDay>("Salı");
  const [editOoTime, setEditOoTime] = useState("15:20 - 16:00");
  const [editOoSubject, setEditOoSubject] = useState("");
  const [editOoNote, setEditOoNote] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id ?? ""
  );

  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    teachers[0]?.id ?? ""
  );

  const [day, setDay] = useState<WeekDay>("Salı");
  const [time, setTime] = useState("15:20 - 16:00");
  const [subject, setSubject] = useState<string>("Matematik");
  const [examLevel, setExamLevel] = useState<string>("AYT");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const [lunchBreak, setLunchBreak] = useState<50 | 60>(50);
  const [calendarView, setCalendarView] = useState<
    "combined" | "teacher" | "student"
  >("combined");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stuParam = params.get("studentId");
    const tchParam = params.get("teacherId");
    if (stuParam && students.some((s) => s.id === stuParam)) {
      setSelectedStudentId(stuParam);
    }
    if (tchParam && teachers.some((t) => t.id === tchParam)) {
      setSelectedTeacherId(tchParam);
    }
  }, [students, teachers]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (studentClassFilter !== "ALL" && s.classId !== studentClassFilter)
        return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearch, studentClassFilter]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.branch.toLowerCase().includes(q)
    );
  }, [teachers, teacherSearch]);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ?? students[0];
  const selectedTeacher =
    teachers.find((t) => t.id === selectedTeacherId) ?? teachers[0];

  const allowedSubjects = useMemo(() => {
    if (!selectedTeacher) return [...PRESET_SUBJECTS];
    const matched = PRESET_SUBJECTS.filter((sub) =>
      doesTeacherMatchSubject(selectedTeacher.branch, sub)
    );
    return matched.length > 0 ? matched : [...PRESET_SUBJECTS];
  }, [selectedTeacher]);

  const effectiveSubject = allowedSubjects.includes(
    subject as (typeof PRESET_SUBJECTS)[number]
  )
    ? subject
    : allowedSubjects[0];

  const studentClass = classes.find((c) => c.id === selectedStudent?.classId);

  const studentScheduleAll = useMemo(() => {
    if (!selectedStudent) return [];
    return [...(studentClass?.schedule ?? []), ...selectedStudent.schedule];
  }, [selectedStudent, studentClass]);

  const teacherTimetableItems: TimetableItem[] = useMemo(() => {
    if (!selectedTeacher) return [];
    return [
      ...selectedTeacher.schedule.map((item) => ({
        id: item.id,
        day: item.day,
        time: item.time,
        title: item.subject,
        subtitle: item.classGroup,
        meta: item.room,
        badge: "Sınıf Dersi",
      })),
      ...selectedTeacher.oneOnOneSlots.map((slot) => ({
        id: slot.id,
        day: slot.day,
        time: slot.time,
        title: slot.subject,
        subtitle: slot.studentName,
        meta: slot.note || "Birebir Etüt",
        badge: "Birebir",
        onDelete: () => removeOneOnOneSlot(selectedTeacher.id, slot.id),
      })),
    ];
  }, [selectedTeacher, removeOneOnOneSlot]);

  const studentTimetableItems: TimetableItem[] = useMemo(() => {
    return studentScheduleAll.map((item) => ({
      id: item.id,
      day: item.day,
      time: item.time,
      title: item.subject,
      subtitle: item.teacher,
      meta: item.room,
      badge: item.type,
      blockPeriod: item.blockPeriod,
    }));
  }, [studentScheduleAll]);

  // Helper to inspect conflicts for any (day, time)
  const getSlotStatus = (checkDay: WeekDay, checkTime: string) => {
    const tClass =
      selectedTeacher?.schedule.filter(
        (s) => s.day === checkDay && s.time.trim() === checkTime.trim()
      ) ?? [];
    const tOneOnOne =
      selectedTeacher?.oneOnOneSlots.filter(
        (o) => o.day === checkDay && o.time.trim() === checkTime.trim()
      ) ?? [];

    const isMorning = checkTime < "12:00";
    const sEvents = studentScheduleAll.filter((s) => {
      if (s.day !== checkDay) return false;
      if (s.blockPeriod === "morning" && isMorning) return true;
      if (s.blockPeriod === "afternoon" && !isMorning) return true;
      return s.time.trim() === checkTime.trim();
    });

    const isFree =
      tClass.length === 0 && tOneOnOne.length === 0 && sEvents.length === 0;

    return { tClass, tOneOnOne, sEvents, isFree };
  };

  const selectedSlotStatus = getSlotStatus(day, time);

  const { timetableRows, lunchLabel, lunchInsertIndex } = useMemo(() => {
    const generated = buildDailySlots(lunchBreak);
    const idx = generated.slots.findIndex((row) => row >= "12:00");
    return {
      timetableRows: generated.slots,
      lunchLabel: generated.lunchLabel,
      lunchInsertIndex: idx,
    };
  }, [lunchBreak]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedStudent) return;
    const fullSubject = `${examLevel} ${effectiveSubject}`.trim();
    createOneOnOneSession(
      selectedTeacher.id,
      selectedStudent.id,
      day,
      time,
      fullSubject,
      note.trim() || "Yönetici tarafından atanan birebir etüt."
    );
    setNote("");
    setFeedback(
      `${selectedStudent.name} ile ${selectedTeacher.name} için ${day} (${time}) "${fullSubject}" birebiri oluşturuldu ve her iki takvime de işlendi!`
    );
  };

  const handleSlotPick = (pickedDay: WeekDay, pickedTime: string) => {
    setDay(pickedDay);
    setTime(pickedTime);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E9EBEE] pb-4">
        <p className="text-[11px] font-bold tracking-[0.18em] text-[#B8860B] uppercase">
          Birebir Etüt Planlama
        </p>
        <h1 className="font-serif mt-1 flex items-center gap-2.5 text-3xl font-bold text-[#11284B]">
          <CalendarPlus className="h-7 w-7 text-[#0E4D3A]" />
          <span>Birebir Oluştur &amp; Ortak Müsaitlik Takvimi</span>
        </h1>
        <p className="mt-1 text-sm text-[#4B5563]">
          Öğrenci ve öğretmeni pratikçe seçin; takvimdeki ortak boşlukları görüp tek tıkla birebir oluşturun. İsterseniz sınıf dersi olan saatlere de opsiyonel olarak ekleyebilirsiniz.
        </p>
      </div>

      {/* Practical 2-Column Picker: Student (Left) + Teacher (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Student Picker */}
        <div className="space-y-3 rounded-2xl border border-[#11284B]/10 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B]">
              <UserCheck className="h-4 w-4 text-[#B8860B]" />
              <span>1. Öğrenci Seç ({filteredStudents.length})</span>
            </h2>
            {selectedStudent && (
              <span className="rounded-md bg-[#11284B] px-2.5 py-1 text-[11px] font-bold text-white">
                {selectedStudent.name} ({selectedStudent.className})
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Öğrenci adı veya numara ara..."
                className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] py-1.5 pr-3 pl-8 text-xs text-[#11284B] focus:border-[#11284B] focus:outline-none"
              />
            </div>
            <select
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
              className="rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-2.5 py-1.5 text-xs font-medium text-[#11284B]"
            >
              <option value="ALL">Tüm Sınıflar</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {filteredStudents.map((s) => {
              const active = s.id === selectedStudent?.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                    active
                      ? "border-[#0E4D3A] bg-[#EAF6F0] font-bold text-[#0E4D3A]"
                      : "border-[#E2E8F0] bg-[#FAF8F5]/60 text-[#11284B] hover:bg-white"
                  }`}
                >
                  <span>
                    {s.name}{" "}
                    <span className="font-mono text-[10px] opacity-70">
                      ({s.studentNo})
                    </span>
                  </span>
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
                    {s.className}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teacher Picker */}
        <div className="space-y-3 rounded-2xl border border-[#11284B]/10 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#11284B]">
              <GraduationCap className="h-4 w-4 text-[#0E4D3A]" />
              <span>2. Öğretmen Seç ({filteredTeachers.length})</span>
            </h2>
            {selectedTeacher && (
              <span className="rounded-md bg-[#0E4D3A] px-2.5 py-1 text-[11px] font-bold text-white">
                {selectedTeacher.name}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Öğretmen adı veya branş ara (ör. Matematik, Fizik)..."
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] py-1.5 pr-3 pl-8 text-xs text-[#11284B] focus:border-[#11284B] focus:outline-none"
            />
          </div>

          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {filteredTeachers.map((t) => {
              const active = t.id === selectedTeacher?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                    active
                      ? "border-[#0E4D3A] bg-[#EAF6F0] font-bold text-[#0E4D3A]"
                      : "border-[#E2E8F0] bg-[#FAF8F5]/60 text-[#11284B] hover:bg-white"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
                    {t.branch} ({t.oneOnOneSlots.length} Birebir)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Action Bar */}
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-2xl border border-[#11284B]/10 bg-white p-5 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-bold text-[#11284B]">
            3. Saat, Ders &amp; Onay
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold ${
              selectedSlotStatus.isFree
                ? "border-[#0E4D3A]/30 bg-[#EAF6F0] text-[#0E4D3A]"
                : "border-[#F5C6BA] bg-[#FDF0ED] text-[#9A3412]"
            }`}
          >
            {selectedSlotStatus.isFree ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            <span>
              {day} • {time} (
              {selectedSlotStatus.isFree
                ? "İkisi de Müsait"
                : "Ders/Etüt Çakışması Var — Opsiyonel Eklenebilir"}
              )
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
              Gün
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as WeekDay)}
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-2.5 py-2 text-xs text-[#11284B]"
            >
              {TIMETABLE_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
              Saat Aralığı
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-2.5 py-2 text-xs text-[#11284B]"
            >
              {ALL_PRESET_TIME_SLOTS.map((slot) => {
                const st = getSlotStatus(day, slot);
                return (
                  <option key={slot} value={slot}>
                    {slot} {st.isFree ? "✓ Boş" : "⚠ Dolu"}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
              Ders
            </label>
            <select
              value={effectiveSubject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-2.5 py-2 text-xs text-[#11284B]"
            >
              {allowedSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
              TYT / AYT
            </label>
            <select
              value={examLevel}
              onChange={(e) => setExamLevel(e.target.value)}
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-2.5 py-2 text-xs font-semibold text-[#11284B]"
            >
              {EXAM_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
              Not &amp; Oluştur
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Birebir notu..."
                className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-2.5 py-2 text-xs text-[#11284B]"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#0E4D3A] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#13664d]"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>
                  {selectedSlotStatus.isFree
                    ? "Birebir Oluştur"
                    : "Yine de Oluştur"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 rounded-xl border border-[#BBE0CE] bg-[#EAF6F0] px-4 py-2.5 text-xs font-bold text-[#0E4D3A]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </form>

      {/* Unified Availability & Schedule Section */}
      <div className="space-y-4 rounded-2xl border border-[#11284B]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#11284B]">
              {calendarView === "combined"
                ? `Ortak Müsaitlik Takvimi (${selectedTeacher?.name} & ${selectedStudent?.name})`
                : calendarView === "teacher"
                ? `Öğretmen Takvimi: ${selectedTeacher?.name}`
                : `Öğrenci Takvimi: ${selectedStudent?.name}`}
            </h3>
            <p className="text-xs text-[#64748B]">
              Yeşil hücreler hem öğretmenin hem öğrencinin boş olduğu saatlerdir. Dolu hücrelere de tıklayıp opsiyonel olarak birebir ekleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setCalendarView("combined")}
                className={`rounded-md px-2.5 py-1 transition ${
                  calendarView === "combined"
                    ? "bg-[#0E4D3A] text-white"
                    : "text-[#64748B] hover:text-[#11284B]"
                }`}
              >
                Ortak Müsaitlik
              </button>
              <button
                type="button"
                onClick={() => setCalendarView("teacher")}
                className={`rounded-md px-2.5 py-1 transition ${
                  calendarView === "teacher"
                    ? "bg-[#11284B] text-white"
                    : "text-[#64748B] hover:text-[#11284B]"
                }`}
              >
                Öğretmen Takvimi
              </button>
              <button
                type="button"
                onClick={() => setCalendarView("student")}
                className={`rounded-md px-2.5 py-1 transition ${
                  calendarView === "student"
                    ? "bg-[#11284B] text-white"
                    : "text-[#64748B] hover:text-[#11284B]"
                }`}
              >
                Öğrenci Takvimi
              </button>
            </div>
          </div>
        </div>

        {calendarView === "combined" ? (
          <div className="space-y-3">
            {/* Color Legend & Lunch Break Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#FAF8F5] px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 rounded-md border border-[#BBE0CE] bg-[#EAF6F0] px-2 py-0.5 text-[#0E4D3A]">
                  ✓ İkisi de Müsait
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[#11284B]">
                  ● Öğretmen Dolu
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[#9A3412]">
                  ● Öğrenci Dolu
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5 text-[#991B1B]">
                  ● İkisi de Dolu
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 text-[#4C1D95]">
                  ✦ Birebir
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-[#64748B]">
                  <Clock className="h-3.5 w-3.5 text-[#11284B]" />
                  08:00–21:00:
                </span>
                <button
                  type="button"
                  onClick={() => setLunchBreak(50)}
                  className={`rounded-md px-2.5 py-1 ${
                    lunchBreak === 50
                      ? "bg-[#11284B] text-white"
                      : "bg-white text-[#64748B]"
                  }`}
                >
                  50 dk Mola
                </button>
                <button
                  type="button"
                  onClick={() => setLunchBreak(60)}
                  className={`rounded-md px-2.5 py-1 ${
                    lunchBreak === 60
                      ? "bg-[#11284B] text-white"
                      : "bg-white text-[#64748B]"
                  }`}
                >
                  60 dk Mola
                </button>
              </div>
            </div>

            {/* Mobile Daily Availability Picker (< md) */}
            <div className="space-y-3 md:hidden">
              <div className="grid grid-cols-7 gap-1 rounded-xl border border-[#DCE4EE] bg-white p-1.5">
                {TIMETABLE_DAYS.map((d) => {
                  const isActiveDay = day === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={`rounded-lg py-2 text-center text-[11px] font-bold transition ${
                        isActiveDay
                          ? "bg-[#11284B] text-white"
                          : "bg-[#FAF8F5] text-[#475569]"
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {timetableRows.map((timeRow, idx) => {
                  const st = getSlotStatus(day, timeRow);
                  const isSelected = time === timeRow;
                  const teacherBusy =
                    st.tClass.length > 0 || st.tOneOnOne.length > 0;
                  const studentBusy = st.sEvents.length > 0;
                  const bothBusy = teacherBusy && studentBusy;

                  return (
                    <React.Fragment key={timeRow}>
                      {idx === lunchInsertIndex && (
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#F2DC9B] bg-[#FFFDF7] px-3 py-2 text-xs font-semibold text-[#8A6508]">
                          <Coffee className="h-3.5 w-3.5" />
                          <span>
                            {lunchLabel} • Öğle Molası ({lunchBreak} Dakika)
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-xl border p-3 transition ${
                          isSelected
                            ? "border-[#11284B] bg-[#EEF3F9]/60 ring-1 ring-[#11284B]"
                            : st.isFree
                            ? "border-[#BBE0CE] bg-[#EAF6F0]/40"
                            : bothBusy
                            ? "border-[#FECACA] bg-[#FEF2F2]/70"
                            : teacherBusy
                            ? "border-[#BFDBFE] bg-[#EFF6FF]/70"
                            : "border-[#FED7AA] bg-[#FFF7ED]/70"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#11284B] shadow-2xs">
                            {timeRow}
                          </span>
                          {st.isFree ? (
                            <button
                              type="button"
                              onClick={() => handleSlotPick(day, timeRow)}
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                isSelected
                                  ? "bg-[#0E4D3A] text-white"
                                  : "bg-[#0E4D3A]/10 text-[#0E4D3A]"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Seçildi</span>
                                </>
                              ) : (
                                <span>✓ Müsait • Seç</span>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSlotPick(day, timeRow)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold text-white ${
                                bothBusy
                                  ? "bg-[#991B1B]"
                                  : teacherBusy
                                  ? "bg-[#11284B]"
                                  : "bg-[#C2410C]"
                              }`}
                            >
                              {bothBusy
                                ? "İkisi de Dolu"
                                : teacherBusy
                                ? "Öğretmen Dolu"
                                : "Öğrenci Dolu"}
                            </button>
                          )}
                        </div>
                        {!st.isFree && (
                          <div className="mt-2 space-y-1 text-xs">
                            {st.tClass.map((tc) => (
                              <p key={tc.id} className="font-semibold text-[#11284B]">
                                Hoca: {tc.subject} ({tc.classGroup})
                              </p>
                            ))}
                            {st.tOneOnOne.map((oo) => (
                              <div
                                key={oo.id}
                                className="flex items-center justify-between gap-2 rounded bg-[#F5F3FF] px-2 py-1 font-bold text-[#4C1D95]"
                              >
                                <span>✦ Birebir: {oo.studentName}</span>
                                {selectedTeacher && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeOneOnOneSlot(selectedTeacher.id, oo.id)
                                    }
                                    className="text-red-600"
                                    title="Birebiri Sil"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {st.sEvents.map((se) => (
                              <p key={se.id} className="font-semibold text-[#9A3412]">
                                Öğr: {se.subject}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-[#DCE4EE] md:block">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#DCE4EE] bg-[#11284B] text-white">
                    <th className="w-32 px-3 py-3 text-[11px] font-bold uppercase tracking-wider">
                      Saat
                    </th>
                    {TIMETABLE_DAYS.map((d) => (
                      <th
                        key={d}
                        className="border-l border-white/10 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {timetableRows.map((timeRow, idx) => (
                    <React.Fragment key={timeRow}>
                      {idx === lunchInsertIndex && (
                        <tr className="bg-[#FFFDF7]">
                          <td className="px-3 py-2 text-xs font-bold text-[#8A6508] whitespace-nowrap">
                            {lunchLabel}
                          </td>
                          <td
                            colSpan={TIMETABLE_DAYS.length}
                            className="border-l border-[#F2DC9B]/60 px-4 py-2 text-center text-xs font-semibold text-[#8A6508]"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Coffee className="h-3.5 w-3.5" />
                              Öğle Molası ({lunchBreak} Dakika)
                            </span>
                          </td>
                        </tr>
                      )}
                      <tr className="align-top">
                        <td className="bg-[#FAF8F5] px-3 py-2.5 text-xs font-bold text-[#11284B] whitespace-nowrap">
                          {timeRow}
                        </td>
                        {TIMETABLE_DAYS.map((d) => {
                          const st = getSlotStatus(d, timeRow);
                          const isSelected = day === d && time === timeRow;

                          return (
                            <td
                              key={d}
                              className={`min-w-[130px] border-l border-[#E2E8F0] p-1.5 transition ${
                                isSelected
                                  ? "ring-2 ring-inset ring-[#11284B] bg-[#EEF3F9]"
                                  : ""
                              }`}
                            >
                              {st.isFree ? (
                                <button
                                  type="button"
                                  onClick={() => handleSlotPick(d, timeRow)}
                                  className={`flex h-12 w-full items-center justify-center gap-1 rounded-lg border text-[11px] font-semibold transition ${
                                    isSelected
                                      ? "border-[#0E4D3A] bg-[#0E4D3A] text-white"
                                      : "border-[#BBE0CE] bg-[#EAF6F0]/60 text-[#0E4D3A] hover:bg-[#EAF6F0]"
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Seçildi</span>
                                    </>
                                  ) : (
                                    <span>✓ Müsait</span>
                                  )}
                                </button>
                              ) : (
                                (() => {
                                  const teacherBusy =
                                    st.tClass.length > 0 ||
                                    st.tOneOnOne.length > 0;
                                  const studentBusy = st.sEvents.length > 0;
                                  const bothBusy = teacherBusy && studentBusy;

                                  const cellBoxStyle = bothBusy
                                    ? "border-[#FECACA] bg-[#FEF2F2]/80"
                                    : teacherBusy
                                    ? "border-[#BFDBFE] bg-[#EFF6FF]/80"
                                    : "border-[#FED7AA] bg-[#FFF7ED]/80";

                                  const statusBadgeStyle = bothBusy
                                    ? "bg-[#991B1B] text-white"
                                    : teacherBusy
                                    ? "bg-[#11284B] text-white"
                                    : "bg-[#C2410C] text-white";

                                  const statusLabel = bothBusy
                                    ? "İkisi de Dolu"
                                    : teacherBusy
                                    ? "Öğretmen Dolu"
                                    : "Öğrenci Dolu";

                                  return (
                                    <div
                                      onClick={() => handleSlotPick(d, timeRow)}
                                      className={`cursor-pointer space-y-1 rounded-lg border p-1.5 text-[10px] transition ${cellBoxStyle}`}
                                    >
                                      <span
                                        className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusBadgeStyle}`}
                                      >
                                        {statusLabel}
                                      </span>
                                      {st.tClass.map((tc) => (
                                        <p
                                          key={tc.id}
                                          className="truncate font-semibold text-[#11284B]"
                                          title={`Öğretmen Dersi: ${tc.subject} (${tc.classGroup})`}
                                        >
                                          Hoca: {tc.subject}
                                        </p>
                                      ))}
                                      {st.tOneOnOne.map((oo) => (
                                        <div
                                          key={oo.id}
                                          className="flex items-center justify-between gap-1 rounded border-l-2 border-l-[#7C3AED] bg-[#F5F3FF] px-1.5 py-0.5 font-bold text-[#4C1D95]"
                                        >
                                          <span className="truncate">
                                            ✦ Birebir: {oo.studentName}
                                          </span>
                                          {selectedTeacher && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeOneOnOneSlot(
                                                  selectedTeacher.id,
                                                  oo.id
                                                );
                                              }}
                                              className="text-red-600 hover:text-red-800"
                                              title="Birebiri Sil"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      {st.sEvents.map((se) => (
                                        <p
                                          key={se.id}
                                          className="truncate font-semibold text-[#9A3412]"
                                          title={`Öğrenci Dersi: ${se.subject}`}
                                        >
                                          Öğr: {se.subject}
                                        </p>
                                      ))}
                                      <p className="text-center font-bold text-[#475569]">
                                        {isSelected
                                          ? "✓ Seçili (Yine de Ekle)"
                                          : "+ Yine de Seç"}
                                      </p>
                                    </div>
                                  );
                                })()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : calendarView === "teacher" ? (
          <WeeklyTimetable
            editable
            selectedDay={day}
            selectedTime={time}
            onSelectSlot={handleSlotPick}
            items={teacherTimetableItems}
          />
        ) : (
          <WeeklyTimetable
            editable
            selectedDay={day}
            selectedTime={time}
            onSelectSlot={handleSlotPick}
            items={studentTimetableItems}
          />
        )}
      </div>

      {/* Active 1-on-1 Sessions List with Edit & Delete CRUD */}
      {selectedTeacher && (
        <div className="space-y-3 rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9EBEE] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#4C1D95]">
                {selectedTeacher.name} — Aktif Birebir Oturumları ({selectedTeacher.oneOnOneSlots.length})
              </h3>
              <p className="text-xs text-[#64748B]">
                Yanlış girilen birebir oturumlarını buradan düzenleyebilir veya silebilirsiniz.
              </p>
            </div>
          </div>

          {selectedTeacher.oneOnOneSlots.length === 0 ? (
            <p className="py-4 text-center text-xs text-[#64748B]">
              Bu öğretmen için henüz birebir oturumu bulunmuyor.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {selectedTeacher.oneOnOneSlots.map((slot) => {
                const isEditing = editingSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-[#DDD6FE] border-l-4 border-l-[#7C3AED] bg-[#F5F3FF]/60 p-3.5 text-xs"
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateOneOnOneSlot(selectedTeacher.id, slot.id, {
                            day: editOoDay,
                            time: editOoTime,
                            subject: editOoSubject.trim(),
                            note: editOoNote.trim(),
                          });
                          setEditingSlotId(null);
                        }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between font-bold text-[#4C1D95]">
                          <span>{slot.studentName}</span>
                          <button
                            type="button"
                            onClick={() => setEditingSlotId(null)}
                            className="text-[#64748B]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={editOoDay}
                            onChange={(e) => setEditOoDay(e.target.value as WeekDay)}
                            className="rounded border border-[#DDD6FE] bg-white px-2 py-1"
                          >
                            {TIMETABLE_DAYS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <select
                            value={editOoTime}
                            onChange={(e) => setEditOoTime(e.target.value)}
                            className="rounded border border-[#DDD6FE] bg-white px-2 py-1"
                          >
                            {ALL_PRESET_TIME_SLOTS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          required
                          value={editOoSubject}
                          onChange={(e) => setEditOoSubject(e.target.value)}
                          placeholder="Konu / Ders"
                          className="w-full rounded border border-[#DDD6FE] bg-white px-2 py-1"
                        />
                        <input
                          type="text"
                          value={editOoNote}
                          onChange={(e) => setEditOoNote(e.target.value)}
                          placeholder="Not..."
                          className="w-full rounded border border-[#DDD6FE] bg-white px-2 py-1"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingSlotId(null)}
                            className="rounded border bg-white px-2.5 py-1 font-semibold text-[#64748B]"
                          >
                            İptal
                          </button>
                          <button
                            type="submit"
                            className="rounded bg-[#7C3AED] px-3 py-1 font-semibold text-white"
                          >
                            Güncelle
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-[#4C1D95]">
                            {slot.studentName} · {slot.day} ({slot.time})
                          </p>
                          <p className="mt-0.5 font-semibold text-[#203B5C]">
                            {slot.subject}
                          </p>
                          {slot.note && (
                            <p className="mt-0.5 text-[11px] text-[#5B21B6]">
                              {slot.note}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSlotId(slot.id);
                              setEditOoDay(slot.day);
                              setEditOoTime(slot.time);
                              setEditOoSubject(slot.subject);
                              setEditOoNote(slot.note);
                            }}
                            title="Düzenle"
                            className="rounded border border-[#DDD6FE] bg-white p-1.5 text-[#4C1D95] hover:bg-[#EDE9FE]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeOneOnOneSlot(selectedTeacher.id, slot.id)}
                            title="Sil"
                            className="rounded border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
