"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Layers,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  useCampus,
  type ClassroomRecord,
  type StudentScheduleSlot,
  type WeekDay,
} from "@/lib/campus-store";
import {
  ALL_PRESET_TIME_SLOTS,
  doesTeacherMatchSubject,
  EXAM_LEVELS,
  PRESET_SUBJECTS,
  TIMETABLE_DAYS,
  WeeklyTimetable,
} from "@/components/WeeklyTimetable";

const DAYS = TIMETABLE_DAYS;

export default function AdminClassesPage() {
  const {
    classes,
    students,
    teachers,
    addClass,
    updateClass,
    deleteClass,
    assignStudentToClass,
    addScheduleToClass,
    addBulkScheduleToClass,
    removeClassScheduleSlot,
  } = useCampus();

  // Create class form state
  const [clsName, setClsName] = useState("");
  const [clsTrack, setClsTrack] =
    useState<ClassroomRecord["track"]>("Sayısal");
  const [clsRoom, setClsRoom] = useState("Derslik 205");
  const [clsIsSchoolStudents, setClsIsSchoolStudents] = useState(false);
  const [stuCreateSearch, setStuCreateSearch] = useState("");
  const [clsInitialStudents, setClsInitialStudents] = useState<string[]>([]);

  // Right list search & selection
  const [classSearch, setClassSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");

  // Selected class student assign
  const [assignSearch, setAssignSearch] = useState("");
  const [assignStuId, setAssignStuId] = useState("");

  // Schedule builder form
  const [csDay, setCsDay] = useState<WeekDay>("Pazartesi");
  const [csTime, setCsTime] = useState("08:00 - 08:40");
  const [csSubject, setCsSubject] = useState<string>("Matematik");
  const [csExamLevel, setCsExamLevel] = useState<string>("AYT");
  const [csTeacher, setCsTeacher] = useState(teachers[0]?.name ?? "");
  const [csType, setCsType] =
    useState<StudentScheduleSlot["type"]>("Konu Anlatımı");

  // Deneme block builder
  const [denemeDay, setDenemeDay] = useState<WeekDay>("Cumartesi");
  const [denemePeriod, setDenemePeriod] = useState<"morning" | "afternoon">(
    "morning"
  );
  const [denemeTitle, setDenemeTitle] = useState("TYT Genel Deneme");
  const [editingClass, setEditingClass] = useState(false);
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(false);
  const [editClsName, setEditClsName] = useState("");
  const [editClsTrack, setEditClsTrack] = useState<ClassroomRecord["track"]>("Sayısal");
  const [editClsRoom, setEditClsRoom] = useState("");
  const [editClsIsSchoolStudents, setEditClsIsSchoolStudents] = useState(false);

  const selectedClass =
    classes.find((c) => c.id === selectedClassId) ?? classes[0];

  const filteredCreateStudents = useMemo(() => {
    const q = stuCreateSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        s.track.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
    );
  }, [students, stuCreateSearch]);

  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.track.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
    );
  }, [classes, classSearch]);

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClass?.id),
    [students, selectedClass?.id]
  );

  const availableStudentsToAssign = useMemo(() => {
    const q = assignSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (s.classId === selectedClass?.id) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    });
  }, [students, selectedClass?.id, assignSearch]);

  const matchingTeachers = useMemo(() => {
    const matched = teachers.filter((t) =>
      doesTeacherMatchSubject(t.branch, csSubject)
    );
    return matched;
  }, [teachers, csSubject]);

  const handleSubjectChange = (nextSubject: string) => {
    setCsSubject(nextSubject);
    const nextTeachers = teachers.filter((t) =>
      doesTeacherMatchSubject(t.branch, nextSubject)
    );
    setCsTeacher(nextTeachers[0]?.name ?? "Ölçme Birimi");
  };

  const toggleInitialStudent = (id: string) => {
    setClsInitialStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsName.trim()) return;
    const newId = addClass(
      {
        name: clsName.trim(),
        track: clsTrack,
        room: clsRoom.trim() || "Derslik",
        isSchoolStudentClass: clsIsSchoolStudents,
        timeProfile: clsIsSchoolStudents ? "after_school" : "daytime",
      },
      clsInitialStudents
    );
    setSelectedClassId(newId);
    setClsName("");
    setClsIsSchoolStudents(false);
    setClsInitialStudents([]);
    setStuCreateSearch("");
  };

  const handleAssignStudent = () => {
    if (!selectedClass) return;
    const targetId = assignStuId || availableStudentsToAssign[0]?.id;
    if (!targetId) return;
    assignStudentToClass(targetId, selectedClass.id);
    setAssignStuId("");
  };

  const handleAddClassSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !csSubject.trim() || !csTime.trim()) return;
    const fullSubject = `${csExamLevel} ${csSubject}`.trim();
    addScheduleToClass(selectedClass.id, {
      day: csDay,
      time: csTime.trim(),
      subject: fullSubject,
      teacher: csTeacher,
      room: selectedClass.room,
      type: csType,
    });
  };

  const handleQuickSelectCell = (day: WeekDay, time: string) => {
    setCsDay(day);
    setCsTime(time);
  };

  const handleAddDenemeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    addScheduleToClass(selectedClass.id, {
      day: denemeDay,
      time: denemePeriod === "morning" ? "08:00 - 12:00" : "13:00 - 21:00",
      subject: denemeTitle,
      teacher: "Ölçme Birimi",
      room: "Deneme Salonu",
      type: "Deneme",
      blockPeriod: denemePeriod,
    });
  };

  return (
    <div className="space-y-8">
      <datalist id="cls-subjects">
        <option value="AYT Matematik" />
        <option value="TYT Matematik & Problem" />
        <option value="TYT Türkçe & Paragraf" />
        <option value="AYT Fizik" />
        <option value="AYT Kimya" />
        <option value="AYT Biyoloji" />
        <option value="AYT Edebiyat" />
        <option value="TYT Tarih & Coğrafya" />
        <option value="Türkiye Geneli TYT Denemesi" />
      </datalist>
      <datalist id="cls-times">
        <option value="08:00 - 08:40" />
        <option value="08:50 - 09:30" />
        <option value="09:40 - 10:20" />
        <option value="10:30 - 11:10" />
        <option value="11:20 - 12:00" />
        <option value="12:50 - 13:30" />
        <option value="13:00 - 13:40" />
        <option value="13:50 - 14:30" />
        <option value="14:40 - 15:20" />
        <option value="15:30 - 16:10" />
        <option value="16:20 - 17:00" />
        <option value="17:10 - 17:50" />
        <option value="18:00 - 18:40" />
        <option value="18:50 - 19:30" />
        <option value="19:40 - 20:20" />
        <option value="20:20 - 21:00" />
      </datalist>

      {/* Header */}
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-bold tracking-[0.18em] text-[#B8860B] uppercase">
          Sınıf Bazlı Organizasyon
        </p>
        <h1 className="font-serif mt-1 flex items-center gap-2.5 text-3xl font-bold text-[#11284B]">
          <Layers className="h-7 w-7 text-[#0E4D3A]" />
          <span>Sınıflar, Öğrenci Yerleştirme &amp; Ders Programı</span>
        </h1>
        <p className="mt-1 text-sm text-[#4B5563]">
          Sol bölümden kurumdaki öğrencileri arayarak yeni sınıf oluşturun, sağ listeden bir sınıf seçip altta tüm detaylarını ve haftalık tablo ders programını yönetin.
        </p>
      </div>

      {/* Top Grid: Create Class (Left) + Vertical Classes List (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Create Class with Full Searchable Student List */}
        <form
          onSubmit={handleCreateClass}
          className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#11284B]/10 bg-white p-6 shadow-sm lg:col-span-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#11284B]">
                  Yeni Sınıf Oluştur
                </h2>
                <p className="text-xs text-[#64748B]">
                  Sınıf bilgilerini girin ve kurumdaki öğrencilerden arayarak seçim yapın.
                </p>
              </div>
              <span className="rounded-full bg-[#0E4D3A]/10 px-2.5 py-1 text-[11px] font-bold text-[#0E4D3A]">
                {clsInitialStudents.length} Öğrenci Seçili
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#11284B]">
                  Sınıf Adı
                </label>
                <input
                  type="text"
                  required
                  value={clsName}
                  onChange={(e) => setClsName(e.target.value)}
                  placeholder="Örn: 12-C Sayısal"
                  className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] focus:border-[#11284B] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#11284B]">
                  Alan
                </label>
                <select
                  value={clsTrack}
                  onChange={(e) =>
                    setClsTrack(e.target.value as ClassroomRecord["track"])
                  }
                  className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] focus:border-[#11284B] focus:outline-none"
                >
                  <option value="Sayısal">Sayısal</option>
                  <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                  <option value="Sözel">Sözel</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#11284B]">
                  Derslik
                </label>
                <input
                  type="text"
                  value={clsRoom}
                  onChange={(e) => setClsRoom(e.target.value)}
                  placeholder="Derslik 205"
                  className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] focus:border-[#11284B] focus:outline-none"
                />
              </div>
            </div>

            {/* Okula Giden Öğrenci Sınıfı Seçeneği */}
            <button
              type="button"
              onClick={() => setClsIsSchoolStudents((v) => !v)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
                clsIsSchoolStudents
                  ? "border-[#B8860B] bg-[#FFFBEB] text-[#11284B]"
                  : "border-[#11284B]/15 bg-[#FAF8F5] text-[#4B5563] hover:border-[#11284B]/30"
              }`}
            >
              <div>
                <p className="font-bold text-[#11284B]">
                  Okula Giden Öğrenci Sınıfı (16:10 / 16:30 Sonrası)
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Aktif edilirse ders programı oluşturulurken bu sınıfa yalnızca
                  16:10 sonrası akşam saatlerine ders atanır.
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                  clsIsSchoolStudents
                    ? "bg-[#B8860B] text-white"
                    : "border border-[#CBD5E1] bg-white text-[#64748B]"
                }`}
              >
                {clsIsSchoolStudents ? "Aktif (16:10+)" : "Tam / Gündüz"}
              </span>
            </button>

            {/* Searchable Institution Student List */}
            <div className="rounded-xl border border-[#11284B]/10 bg-[#FAF8F5] p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#11284B]">
                  Kurumdaki Tüm Öğrenciler ({students.length})
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      setClsInitialStudents(
                        filteredCreateStudents.map((s) => s.id)
                      )
                    }
                    className="font-semibold text-[#0E4D3A] hover:underline"
                  >
                    Listelenenleri Seç
                  </button>
                  <span className="text-[#CBD5E1]">|</span>
                  <button
                    type="button"
                    onClick={() => setClsInitialStudents([])}
                    className="font-semibold text-[#64748B] hover:text-red-600"
                  >
                    Seçimi Temizle
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={stuCreateSearch}
                  onChange={(e) => setStuCreateSearch(e.target.value)}
                  placeholder="Ad soyad, öğrenci no, alan veya mevcut sınıf ara..."
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white py-1.5 pr-3 pl-8 text-xs text-[#11284B] focus:border-[#11284B] focus:outline-none"
                />
              </div>

              <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {filteredCreateStudents.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#64748B]">
                    Aramanızla eşleşen öğrenci bulunamadı.
                  </p>
                ) : (
                  filteredCreateStudents.map((stu) => {
                    const checked = clsInitialStudents.includes(stu.id);
                    return (
                      <button
                        key={stu.id}
                        type="button"
                        onClick={() => toggleInitialStudent(stu.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                          checked
                            ? "border-[#0E4D3A] bg-[#EAF6F0]"
                            : "border-[#E2E8F0] bg-white hover:border-[#11284B]/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked
                                ? "border-[#0E4D3A] bg-[#0E4D3A] text-white"
                                : "border-[#CBD5E1] bg-white"
                            }`}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#11284B]">
                              {stu.name}
                            </p>
                            <p className="truncate text-[11px] text-[#64748B]">
                              No: {stu.studentNo} · {stu.track}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-md bg-[#11284B]/5 px-2 py-0.5 text-[10px] font-semibold text-[#11284B]">
                          {stu.className}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#11284B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a6b]"
          >
            <Plus className="h-4 w-4" />
            <span>Sınıfı Oluştur ({clsInitialStudents.length} Öğrenci ile)</span>
          </button>
        </form>

        {/* Right: Vertical List of Classes */}
        <div className="flex flex-col space-y-4 rounded-2xl border border-[#11284B]/10 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#11284B]">
                Kurumdaki Sınıflar ({classes.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                Detaylarını ve ders programını görmek istediğiniz sınıfa tıklayın.
              </p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                placeholder="Sınıf veya derslik ara..."
                className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] py-1.5 pr-3 pl-8 text-xs text-[#11284B] focus:border-[#11284B] focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[410px] space-y-2.5 overflow-y-auto pr-1">
            {filteredClasses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#11284B]/15 p-8 text-center text-xs text-[#64748B]">
                Aramanızla eşleşen sınıf bulunamadı.
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const count = students.filter((s) => s.classId === cls.id).length;
                const isSelected = cls.id === selectedClass?.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#0E4D3A] bg-[#F2FAF6] shadow-xs ring-1 ring-[#0E4D3A]/20"
                        : "border-[#E2E8F0] bg-[#FAF8F5]/60 hover:border-[#11284B]/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-[#0E4D3A] text-white"
                            : "bg-[#11284B]/10 text-[#11284B]"
                        }`}
                      >
                        <Layers className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[#11284B]">
                            {cls.name}
                          </h3>
                          <span className="rounded-md bg-[#11284B]/10 px-2 py-0.5 text-[10px] font-bold text-[#11284B]">
                            {cls.track}
                          </span>
                          {(cls.isSchoolStudentClass ||
                            cls.timeProfile === "after_school" ||
                            cls.timeProfile === "evening") && (
                            <span className="rounded-md bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-[#B45309] ring-1 ring-[#FDE68A]">
                              Okul Sonrası (16:10+)
                            </span>
                          )}
                          {isSelected && (
                            <span className="rounded-md bg-[#0E4D3A] px-2 py-0.5 text-[10px] font-bold text-white">
                              Seçili
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {cls.room}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {count} Öğrenci
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />{" "}
                            {cls.schedule.length} Ders Oturumu
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Section: Selected Class Details + Timetable */}
      {selectedClass && (
        <div className="space-y-6 rounded-2xl border border-[#11284B]/15 bg-white p-6 shadow-sm">
          {/* Selected Class Banner */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E9EBEE] pb-5 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#B8860B]/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8A6508]">
                  Seçili Sınıf Detayları
                </span>
                <span className="rounded-md bg-[#11284B]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#11284B]">
                  {selectedClass.track}
                </span>
                <span className="rounded-md bg-[#FAF8F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#4B5563]">
                  {selectedClass.room}
                </span>
                {(selectedClass.isSchoolStudentClass ||
                  selectedClass.timeProfile === "after_school" ||
                  selectedClass.timeProfile === "evening") && (
                  <span className="rounded-md bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-bold text-[#B45309] ring-1 ring-[#FDE68A]">
                    Okula Giden Öğrenciler · 16:10+
                  </span>
                )}
              </div>
              <h2 className="font-serif mt-2 text-2xl font-bold text-[#11284B]">
                {selectedClass.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-[#11284B]/10 bg-[#FAF8F5] px-4 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Kayıtlı Öğrenci
                </p>
                <p className="text-lg font-bold text-[#11284B]">
                  {classStudents.length} Kişi
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditClsName(selectedClass.name);
                  setEditClsTrack(selectedClass.track);
                  setEditClsRoom(selectedClass.room);
                  setEditClsIsSchoolStudents(
                    Boolean(
                      selectedClass.isSchoolStudentClass ||
                        selectedClass.timeProfile === "after_school"
                    )
                  );
                  setEditingClass((prev) => !prev);
                  setConfirmDeleteClass(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-semibold text-[#11284B] hover:bg-[#F8FAFC]"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Sınıfı Düzenle</span>
              </button>
              {confirmDeleteClass ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      deleteClass(selectedClass.id);
                      setConfirmDeleteClass(false);
                      setEditingClass(false);
                    }}
                    className="font-bold text-rose-700 hover:underline"
                  >
                    Silmeyi Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteClass(false)}
                    className="text-[#64748B]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteClass(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Sınıfı Sil</span>
                </button>
              )}
              <div className="rounded-xl border border-[#11284B]/10 bg-[#FAF8F5] px-4 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Haftalık Ders
                </p>
                <p className="text-lg font-bold text-[#0E4D3A]">
                  {selectedClass.schedule.length} Oturum
                </p>
              </div>
            </div>
          </div>

          {editingClass && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateClass(selectedClass.id, {
                  name: editClsName.trim(),
                  track: editClsTrack,
                  room: editClsRoom.trim(),
                  isSchoolStudentClass: editClsIsSchoolStudents,
                  timeProfile: editClsIsSchoolStudents
                    ? "after_school"
                    : "daytime",
                });
                setEditingClass(false);
              }}
              className="grid grid-cols-1 gap-2 rounded-xl border border-[#DCE4EE] bg-[#F8FAFC] p-4 text-xs sm:grid-cols-5"
            >
              <input type="text" required value={editClsName} onChange={(e) => setEditClsName(e.target.value)} placeholder="Sınıf Adı" className="rounded border border-[#DCE4EE] bg-white px-3 py-2" />
              <select value={editClsTrack} onChange={(e) => setEditClsTrack(e.target.value as ClassroomRecord["track"])} className="rounded border border-[#DCE4EE] bg-white px-3 py-2">
                <option value="Sayısal">Sayısal</option>
                <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                <option value="Sözel">Sözel</option>
                <option value="YKS Hazırlık">YKS Hazırlık</option>
              </select>
              <input type="text" required value={editClsRoom} onChange={(e) => setEditClsRoom(e.target.value)} placeholder="Derslik" className="rounded border border-[#DCE4EE] bg-white px-3 py-2" />
              <label className="flex cursor-pointer items-center gap-2 rounded border border-[#DCE4EE] bg-white px-3 py-2 font-semibold text-[#11284B]">
                <input
                  type="checkbox"
                  checked={editClsIsSchoolStudents}
                  onChange={(e) => setEditClsIsSchoolStudents(e.target.checked)}
                  className="accent-[#B8860B]"
                />
                <span>Okul Sonrası (16:10+)</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded bg-[#135D43] px-3 py-2 font-semibold text-white">Kaydet</button>
                <button type="button" onClick={() => setEditingClass(false)} className="rounded border border-[#DCE4EE] bg-white px-3 py-2 font-semibold text-[#64748B]">İptal</button>
              </div>
            </form>
          )}

          {/* Class Students & Quick Assign */}
          <div className="space-y-4 rounded-xl border border-[#11284B]/10 bg-[#FAF8F5]/70 p-5">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-[#11284B]">
                  <Users className="h-4 w-4 text-[#0E4D3A]" />
                  <span>Sınıf Öğrenci Kadrosu ({classStudents.length})</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Bu sınıfta kayıtlı öğrenciler ve kurumdaki diğer öğrencilerden sınıfa transfer işlemleri.
                </p>
              </div>

              {/* Add student to this class */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    placeholder="Öğrenci filtrele..."
                    className="w-40 rounded-lg border border-[#11284B]/15 bg-white py-1.5 pr-2.5 pl-8 text-xs text-[#11284B] focus:border-[#11284B] focus:outline-none"
                  />
                </div>
                <select
                  value={assignStuId || availableStudentsToAssign[0]?.id || ""}
                  onChange={(e) => setAssignStuId(e.target.value)}
                  className="rounded-lg border border-[#11284B]/15 bg-white px-3 py-1.5 text-xs text-[#11284B] focus:border-[#11284B] focus:outline-none"
                >
                  {availableStudentsToAssign.length === 0 ? (
                    <option value="">Eklenecek başka öğrenci yok</option>
                  ) : (
                    availableStudentsToAssign.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className})
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  disabled={availableStudentsToAssign.length === 0}
                  onClick={handleAssignStudent}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#11284B] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1a3a6b] disabled:opacity-40"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sınıfa Al</span>
                </button>
              </div>
            </div>

            {classStudents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#11284B]/15 bg-white p-5 text-center text-xs text-[#64748B]">
                Bu sınıfa henüz öğrenci atanmamış. Yukarıdan öğrenci seçip &quot;Sınıfa Al&quot; butonuna basabilirsiniz.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8F0] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <tr>
                      <th className="px-4 py-2.5">Öğrenci No</th>
                      <th className="px-4 py-2.5">Ad Soyad</th>
                      <th className="px-4 py-2.5">Alan / Düzey</th>
                      <th className="px-4 py-2.5">Danışman Öğretmen</th>
                      <th className="px-4 py-2.5">Son TYT Neti</th>
                      <th className="px-4 py-2.5">Hedef</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {classStudents.map((stu) => {
                      const tytExams = stu.exams.filter((e) => e.type === "TYT");
                      const latestTyt = tytExams[tytExams.length - 1];
                      return (
                        <tr key={stu.id} className="hover:bg-[#FAF8F5]/70">
                          <td className="px-4 py-2.5 font-mono text-[#64748B]">
                            {stu.studentNo}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-[#11284B]">
                            {stu.name}
                          </td>
                          <td className="px-4 py-2.5 text-[#4B5563]">
                            {stu.track} · {stu.grade}
                          </td>
                          <td className="px-4 py-2.5 text-[#4B5563]">
                            {stu.advisorName}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-[#0E4D3A]">
                            {latestTyt ? `${latestTyt.totalNet} Net` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-[#4B5563]">
                            {stu.target}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Schedule Builder + Weekly Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-[#11284B]">
                  <CalendarDays className="h-4 w-4 text-[#0E4D3A]" />
                  <span>Haftalık Ders Programı Tablosu</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Aşağıdaki formdan ders ekleyin veya tablodaki bir hücreye tıklayıp gün/saati seçin.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#0E4D3A]/30 bg-[#EAF6F0] px-3 py-1.5 text-xs font-bold text-[#0E4D3A]">
                <Check className="h-3.5 w-3.5" />
                <span>Seçili Slot: {csDay} • {csTime}</span>
              </div>
            </div>

            {/* Add Lesson to Schedule Form */}
            <form
              onSubmit={handleAddClassSchedule}
              className="grid grid-cols-1 gap-2.5 rounded-xl border border-[#11284B]/10 bg-[#FAF8F5] p-4 sm:grid-cols-2 lg:grid-cols-7"
            >
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                  Gün
                </label>
                <select
                  value={csDay}
                  onChange={(e) => setCsDay(e.target.value as WeekDay)}
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  {DAYS.map((d) => (
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
                  value={csTime}
                  onChange={(e) => setCsTime(e.target.value)}
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  {!ALL_PRESET_TIME_SLOTS.includes(csTime) && (
                    <option value={csTime}>{csTime}</option>
                  )}
                  {ALL_PRESET_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                  Ders
                </label>
                <select
                  value={csSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  {PRESET_SUBJECTS.map((sub) => (
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
                  value={csExamLevel}
                  onChange={(e) => setCsExamLevel(e.target.value)}
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white px-2.5 py-2 text-xs font-semibold text-[#11284B]"
                >
                  {EXAM_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                  Öğretmen ({csSubject} Branşı)
                </label>
                <select
                  value={
                    matchingTeachers.some((t) => t.name === csTeacher)
                      ? csTeacher
                      : matchingTeachers[0]?.name ?? "Ölçme Birimi"
                  }
                  onChange={(e) => setCsTeacher(e.target.value)}
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  {matchingTeachers.length > 0 ? (
                    matchingTeachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.branch})
                      </option>
                    ))
                  ) : (
                    <option value="Ölçme Birimi">Ölçme Birimi</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                  Oturum Türü
                </label>
                <select
                  value={csType}
                  onChange={(e) =>
                    setCsType(e.target.value as StudentScheduleSlot["type"])
                  }
                  className="w-full rounded-lg border border-[#11284B]/15 bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  <option value="Konu Anlatımı">Konu Anlatımı</option>
                  <option value="Soru Çözümü">Soru Çözümü</option>
                  <option value="Deneme">Deneme</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0E4D3A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#13664d]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Programa Ekle</span>
                </button>
              </div>
            </form>

            {/* Deneme Bloğu Ata (Öğleden Önce / Öğleden Sonra) */}
            <form
              onSubmit={handleAddDenemeBlock}
              className="grid grid-cols-1 gap-2.5 rounded-xl border border-[#F5C6BA] bg-[#FDF0ED]/60 p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#9A3412]">
                  Deneme Günü
                </label>
                <select
                  value={denemeDay}
                  onChange={(e) => setDenemeDay(e.target.value as WeekDay)}
                  className="w-full rounded-lg border border-[#F5C6BA] bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#9A3412]">
                  Zaman Dilimi
                </label>
                <select
                  value={denemePeriod}
                  onChange={(e) =>
                    setDenemePeriod(e.target.value as "morning" | "afternoon")
                  }
                  className="w-full rounded-lg border border-[#F5C6BA] bg-white px-2.5 py-2 text-xs font-semibold text-[#11284B]"
                >
                  <option value="morning">
                    Öğleden Önce (08:50 – 12:00)
                  </option>
                  <option value="afternoon">
                    Öğleden Sonra (13:40 – 16:50)
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#9A3412]">
                  Deneme Türü
                </label>
                <select
                  value={denemeTitle}
                  onChange={(e) => setDenemeTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#F5C6BA] bg-white px-2.5 py-2 text-xs text-[#11284B]"
                >
                  <option value="TYT Genel Deneme">TYT Genel Deneme</option>
                  <option value="AYT Sayısal Deneme">AYT Sayısal Deneme</option>
                  <option value="AYT Eşit Ağırlık Deneme">
                    AYT Eşit Ağırlık Deneme
                  </option>
                  <option value="AYT Sözel Deneme">AYT Sözel Deneme</option>
                  <option value="Branş Denemesi">Branş Denemesi</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#9A3412] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#7c290d]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Deneme Bloğu Ekle</span>
                </button>
              </div>
            </form>

            {/* Timetable Grid Table */}
            <WeeklyTimetable
              editable
              selectedDay={csDay}
              selectedTime={csTime}
              onSelectSlot={handleQuickSelectCell}
              items={selectedClass.schedule.map((slot) => ({
                id: slot.id,
                day: slot.day,
                time: slot.time,
                title: slot.subject,
                subtitle: slot.teacher,
                badge: slot.type,
                blockPeriod: slot.blockPeriod,
                onDelete: () =>
                  removeClassScheduleSlot(selectedClass.id, slot.id),
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
