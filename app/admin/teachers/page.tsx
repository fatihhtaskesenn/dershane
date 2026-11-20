"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarDays, CalendarPlus, Check, Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCampus, type WeekDay } from "@/lib/campus-store";
import {
  ALL_PRESET_TIME_SLOTS,
  doesTeacherMatchSubject,
  EXAM_LEVELS,
  PRESET_SUBJECTS,
  TIMETABLE_DAYS,
  WeeklyTimetable,
  type TimetableItem,
} from "@/components/WeeklyTimetable";

const DAYS = TIMETABLE_DAYS;

export default function AdminTeachersPage() {
  const {
    teachers,
    students,
    classes,
    addScheduleToTeacher,
    removeTeacherScheduleSlot,
    createOneOnOneSession,
    removeOneOnOneSlot,
  } = useCampus();

  const [mounted, setMounted] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    teachers[0]?.id ?? ""
  );

  // Schedule Form
  const [schDay, setSchDay] = useState<WeekDay>("Pazartesi");
  const [schTime, setSchTime] = useState("08:00 - 08:40");
  const [schClass, setSchClass] = useState(classes[0]?.name ?? "12-A Sayısal");
  const [schSubject, setSchSubject] = useState<string>("Matematik");
  const [schExamLevel, setSchExamLevel] = useState<string>("AYT");
  const [schRoom, setSchRoom] = useState("Derslik 204");

  // 1-on-1 Form
  const [ooStudentId, setOoStudentId] = useState(students[0]?.id ?? "");
  const [ooDay, setOoDay] = useState<WeekDay>("Salı");
  const [ooTime, setOoTime] = useState("15:30 - 16:10");
  const [ooSubject, setOoSubject] = useState("Birebir Soru Çözümü");
  const [ooNote, setOoNote] = useState("");

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam && teachers.some((t) => t.id === idParam)) {
      setSelectedTeacherId(idParam);
    }
  }, [teachers]);

  const selectedTeacher =
    teachers.find((t) => t.id === selectedTeacherId) ?? teachers[0];

  const teacherAllowedSubjects = useMemo(() => {
    if (!selectedTeacher) return [...PRESET_SUBJECTS];
    const matched = PRESET_SUBJECTS.filter((sub) =>
      doesTeacherMatchSubject(selectedTeacher.branch, sub)
    );
    return matched.length > 0 ? matched : [...PRESET_SUBJECTS];
  }, [selectedTeacher]);

  const effectiveSchSubject = teacherAllowedSubjects.includes(
    schSubject as (typeof PRESET_SUBJECTS)[number]
  )
    ? schSubject
    : teacherAllowedSubjects[0];

  const selectedClassObj = useMemo(
    () => classes.find((c) => c.name === schClass),
    [classes, schClass]
  );

  const selectedClassOtherSlots = useMemo(() => {
    if (!selectedClassObj || !selectedTeacher) return [];
    return selectedClassObj.schedule.filter((cSlot) => {
      // Skip if this exact slot is already in selectedTeacher.schedule
      if (cSlot.teacher === selectedTeacher.name) return false;
      return true;
    });
  }, [selectedClassObj, selectedTeacher]);

  const slotConflictMessage = useMemo(() => {
    if (!selectedTeacher) return null;
    const teacherBusyClass = selectedTeacher.schedule.find(
      (s) => s.day === schDay && s.time.trim() === schTime.trim()
    );
    if (teacherBusyClass) {
      return `Öğretmen bu saatte zaten ${teacherBusyClass.classGroup} sınıfında (${teacherBusyClass.subject}) derste.`;
    }
    const teacherBusyOneOnOne = selectedTeacher.oneOnOneSlots.find(
      (o) => o.day === schDay && o.time.trim() === schTime.trim()
    );
    if (teacherBusyOneOnOne) {
      return `Öğretmenin bu saatte ${teacherBusyOneOnOne.studentName} ile birebir etüdü var.`;
    }
    const classBusy = selectedClassOtherSlots.find((cSlot) => {
      if (cSlot.day !== schDay) return false;
      if (cSlot.blockPeriod === "morning") return schTime < "12:00";
      if (cSlot.blockPeriod === "afternoon") return schTime >= "12:00";
      return cSlot.time.trim() === schTime.trim();
    });
    if (classBusy) {
      return `${schClass} sınıfının bu saatte başka bir dersi var: ${classBusy.subject} (${classBusy.teacher}).`;
    }
    return null;
  }, [selectedTeacher, selectedClassOtherSlots, schClass, schDay, schTime]);

  const occupancyData = useMemo(() => {
    if (!selectedTeacher) return [];
    return DAYS.map((day) => ({
      day: day.slice(0, 3),
      SinifDersi: selectedTeacher.schedule.filter((s) => s.day === day).length,
      Birebir: selectedTeacher.oneOnOneSlots.filter((o) => o.day === day)
        .length,
    }));
  }, [selectedTeacher]);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    addScheduleToTeacher(selectedTeacher.id, {
      day: schDay,
      time: schTime,
      classGroup: schClass,
      subject: `${schExamLevel} ${effectiveSchSubject}`.trim(),
      room: schRoom,
    });
  };

  const handleAddOneOnOne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !ooStudentId) return;
    createOneOnOneSession(
      selectedTeacher.id,
      ooStudentId,
      ooDay,
      ooTime,
      ooSubject,
      ooNote.trim()
    );
    setOoNote("");
  };

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Öğretmen Yoğunluk &amp; Takvim Kontrolü
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
          Öğretmen Durumları
        </h1>
        <p className="mt-1 text-sm text-[#737B86]">
          Her öğretmenin hafta içi/gün içi doluluk oranlarını, ders programını
          ve birebir öğrenci saatlerini görüntüleyip düzenleyin.
        </p>
      </div>

      {/* Teacher Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {teachers.map((t) => {
          const active = selectedTeacher?.id === t.id;
          const totalHours = t.schedule.length + t.oneOnOneSlots.length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTeacherId(t.id)}
              className={`rounded-lg border px-4 py-2.5 text-left text-xs transition-all ${
                active
                  ? "border-[#0D2558] bg-[#0D2558] text-white shadow-xs"
                  : "border-[#DCE4EE] bg-white text-[#203B5C] hover:border-[#B18A52]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{t.name}</p>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    active
                      ? "bg-white/15 text-[#E8C483]"
                      : "bg-[#EEF3F9] text-[#11284B]"
                  }`}
                >
                  {totalHours} Saat/Hf
                </span>
              </div>
              <p
                className={`mt-0.5 text-[10px] ${
                  active ? "text-white/80" : "text-[#737B86]"
                }`}
              >
                {t.role} • {t.branch} · {t.schedule.length} Ders + {t.oneOnOneSlots.length} Birebir
              </p>
            </button>
          );
        })}
      </div>

      {selectedTeacher && (
        <div className="space-y-6">
          {/* Teacher Occupancy Chart */}
          <div className="rounded-xl border border-[#DCE4EE] bg-white p-6">
            <div className="flex flex-col justify-between gap-2 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-editorial text-2xl font-semibold text-[#0D2558]">
                  {selectedTeacher.name} — Gün İçi Doluluk Oranı
                </h2>
                <p className="text-xs text-[#737B86]">
                  {selectedTeacher.role} • {selectedTeacher.branch} • Giriş:{" "}
                  <span className="font-mono">
                    {selectedTeacher.username} / {selectedTeacher.password}
                  </span>
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-[#135D43]" />
            </div>

            <div className="mt-4 h-[220px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="SinifDersi"
                      name="Sınıf Dersi"
                      fill="#0D2558"
                      radius={[4, 4, 0, 0]}
                      animationDuration={900}
                    />
                    <Bar
                      dataKey="Birebir"
                      name="Birebir Etüt"
                      fill="#135D43"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1100}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Schedule & 1-on-1 Management */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Class Schedule */}
            <div className="rounded-xl border border-[#E9EBEE] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-3">
                <h3 className="font-editorial text-xl font-medium text-[#203B5C]">
                  Ders Programı ({selectedTeacher.schedule.length})
                </h3>
                <CalendarDays className="h-4 w-4 text-[#B18A52]" />
              </div>

              <form
                onSubmit={handleAddSchedule}
                className="mt-4 grid grid-cols-2 gap-2"
              >
                <select
                  value={schDay}
                  onChange={(e) => setSchDay(e.target.value as WeekDay)}
                  className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2.5 py-2 text-xs"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={schTime}
                  onChange={(e) => setSchTime(e.target.value)}
                  className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2.5 py-2 text-xs"
                >
                  {!ALL_PRESET_TIME_SLOTS.includes(schTime) && (
                    <option value={schTime}>{schTime}</option>
                  )}
                  {ALL_PRESET_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <select
                  value={schClass}
                  onChange={(e) => setSchClass(e.target.value)}
                  className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2.5 py-2 text-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={effectiveSchSubject}
                    onChange={(e) => setSchSubject(e.target.value)}
                    className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2 py-2 text-xs"
                  >
                    {teacherAllowedSubjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <select
                    value={schExamLevel}
                    onChange={(e) => setSchExamLevel(e.target.value)}
                    className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2 py-2 text-xs font-semibold"
                  >
                    {EXAM_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={schRoom}
                  onChange={(e) => setSchRoom(e.target.value)}
                  className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-2.5 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded bg-[#0D2558] px-3 py-2 text-xs font-semibold text-white"
                >
                  Derse Ekle
                </button>
              </form>
              {slotConflictMessage && (
                <p className="mt-2.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[11px] font-semibold text-[#92400E]">
                  ⚠ Çakışma Uyarısı: {slotConflictMessage}
                </p>
              )}
            </div>

            {/* 1-on-1 Summary & Deep-Link to One-on-One Planner */}
            <div className="flex flex-col justify-between rounded-xl border border-[#E9EBEE] bg-white p-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-3">
                  <h3 className="font-editorial text-xl font-medium text-[#203B5C]">
                    Birebir Öğrenci Saatleri ({selectedTeacher.oneOnOneSlots.length})
                  </h3>
                  <Clock className="h-4 w-4 text-[#7C3AED]" />
                </div>

                <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">
                  {selectedTeacher.oneOnOneSlots.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[#737B86]">
                      Bu öğretmen için henüz birebir saat planlanmamış.
                    </p>
                  ) : (
                    selectedTeacher.oneOnOneSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border border-[#DDD6FE] border-l-4 border-l-[#7C3AED] bg-[#F5F3FF] px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#4C1D95]">
                            {slot.studentName} • {slot.day} ({slot.time})
                          </p>
                          <p className="text-[11px] text-[#5B21B6]">
                            {slot.subject}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeOneOnOneSlot(selectedTeacher.id, slot.id)
                          }
                          className="text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          Kaldır
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                href={`/admin/one-on-one?teacherId=${selectedTeacher.id}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#6D28D9]"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>Ortak Müsaitlik Takviminden Birebir Planla</span>
              </Link>
            </div>
          </div>

          {/* Full Weekly Teacher Timetable */}
          <div className="rounded-xl border border-[#E9EBEE] bg-white p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-editorial text-xl font-medium text-[#203B5C]">
                  Haftalık Ders &amp; Birebir Programı Tablosu
                </h3>
                <p className="text-xs text-[#737B86]">
                  Tablodan bir hücreye tıklayarak yukarıdaki formlar için gün ve saati hızlıca seçebilirsiniz. Seçili sınıfın (<strong>{schClass}</strong>) mevcut dersleri de çakışma olmaması için tabloda gösterilir.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1.5 text-xs font-bold text-[#92400E]">
                  Sınıf: {schClass} ({selectedClassOtherSlots.length} mevcut ders)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#0E4D3A]/30 bg-[#EAF6F0] px-3 py-1.5 text-xs font-bold text-[#0E4D3A]">
                  <Check className="h-3.5 w-3.5" />
                  Seçili Slot: {schDay} • {schTime}
                </span>
              </div>
            </div>
            <WeeklyTimetable
              editable
              selectedDay={schDay}
              selectedTime={schTime}
              onSelectSlot={(day, time) => {
                setSchDay(day);
                setSchTime(time);
                setOoDay(day);
                setOoTime(time);
              }}
              items={
                [
                  ...selectedTeacher.schedule.map((item) => ({
                    id: item.id,
                    day: item.day,
                    time: item.time,
                    title: item.subject,
                    subtitle: item.classGroup,
                    meta: item.room,
                    badge: "Sınıf Dersi",
                    onDelete: () =>
                      removeTeacherScheduleSlot(selectedTeacher.id, item.id),
                  })),
                  ...selectedTeacher.oneOnOneSlots.map((slot) => ({
                    id: slot.id,
                    day: slot.day,
                    time: slot.time,
                    title: slot.subject,
                    subtitle: slot.studentName,
                    meta: slot.note || "Birebir Etüt",
                    badge: "Birebir",
                    onDelete: () =>
                      removeOneOnOneSlot(selectedTeacher.id, slot.id),
                  })),
                  ...selectedClassOtherSlots.map((cSlot) => ({
                    id: `cls-${cSlot.id}`,
                    day: cSlot.day,
                    time: cSlot.time,
                    title: `${cSlot.subject}`,
                    subtitle: `${schClass} · ${cSlot.teacher}`,
                    meta: cSlot.room,
                    badge: cSlot.type === "Deneme" ? "Deneme" : "Sınıf Dolu",
                    blockPeriod: cSlot.blockPeriod,
                  })),
                ] satisfies TimetableItem[]
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
