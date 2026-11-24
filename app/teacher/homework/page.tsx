"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { isGuidanceRole, useCampus } from "@/lib/campus-store";
import { PRESET_SUBJECTS } from "@/components/WeeklyTimetable";

export default function TeacherHomeworkPage() {
  const {
    students,
    classes,
    activeTeacher,
    addHomeworkToStudent,
    toggleHomeworkStatus,
    deleteHomeworkFromStudent,
  } = useCampus();

  const canAssignHomework = isGuidanceRole(activeTeacher);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id ?? ""
  );
  const [hwSubject, setHwSubject] = useState<string>("Matematik");
  const [hwTitle, setHwTitle] = useState("");
  const [hwDueDate, setHwDueDate] = useState("2026-11-28");

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== "ALL" && s.classId !== classFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    });
  }, [students, search, classFilter]);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ??
    filteredStudents[0] ??
    students[0];

  if (!canAssignHomework) {
    return (
      <div className="rounded-xl border border-[#F5C6BA] bg-white p-8 text-center shadow-2xs">
        <ShieldAlert className="mx-auto h-8 w-8 text-[#9A3412]" />
        <h1 className="font-editorial mt-3 text-2xl font-medium text-[#203B5C]">
          Yetki Kısıtlaması
        </h1>
        <p className="mt-1.5 text-xs text-[#64748B] sm:text-sm">
          Ödevlendirme bölümü yalnızca <strong>Rehberlik Hocası</strong> rolüne
          sahip öğretmenler için aktiftir.
        </p>
      </div>
    );
  }

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !hwTitle.trim()) return;
    addHomeworkToStudent(selectedStudent.id, {
      subject: hwSubject,
      title: hwTitle.trim(),
      dueDate: hwDueDate,
      teacherName: activeTeacher.name,
      status: "Bekliyor",
    });
    setHwTitle("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Rehberlik Ödevlendirme Merkezi • {activeTeacher.name}
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-2xl font-medium text-[#203B5C] sm:text-3xl">
          <ClipboardList className="h-6 w-6 text-[#135D43]" />
          <span>Öğrencilere Ödev Ver</span>
        </h1>
        <p className="mt-1 text-xs text-[#737B86] sm:text-sm">
          Öğrenci seçin, ders ve ödev konusunu belirleyip son teslim tarihiyle
          ödev atayın; verilen ödevleri buradan takip edin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Student Selector */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-2xs lg:col-span-5">
          <div className="space-y-2.5 border-b border-[#E9EBEE] pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#737B86]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Öğrenci adı, no veya sınıf ara..."
                className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] py-2 pr-3 pl-8 text-xs text-[#203B5C] outline-none focus:border-[#135D43] focus:bg-white"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#203B5C]"
            >
              <option value="ALL">Tüm Sınıflar ({students.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
            {filteredStudents.map((stu) => {
              const active = selectedStudent?.id === stu.id;
              const pendingCount = stu.homework.filter(
                (h) => h.status === "Bekliyor"
              ).length;
              return (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => setSelectedStudentId(stu.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition ${
                    active
                      ? "border-[#135D43] bg-[#EAF6F0] ring-1 ring-[#135D43]"
                      : "border-[#E9EBEE] bg-[#FCFBF8] hover:border-[#B18A52]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#11284B]">{stu.name}</p>
                    <p className="truncate text-[11px] text-[#64748B]">
                      {stu.className} · #{stu.studentNo}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#9A743E]">
                    {pendingCount} Bekleyen
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Assign Homework Form & List */}
        {selectedStudent && (
          <div className="space-y-5 lg:col-span-7">
            <form
              onSubmit={handleAssign}
              className="space-y-3 rounded-xl border border-[#DCE4EE] bg-white p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-3">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[#135D43] uppercase">
                    Seçili Öğrenci
                  </p>
                  <h2 className="font-editorial text-xl font-semibold text-[#203B5C]">
                    {selectedStudent.name} ({selectedStudent.className})
                  </h2>
                </div>
                <span className="rounded-md bg-[#F7FAF8] px-2.5 py-1 text-xs font-semibold text-[#135D43]">
                  Danışman: {selectedStudent.advisorName}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">
                    Ders Seçimi
                  </label>
                  <select
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#203B5C]"
                  >
                    {PRESET_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">
                    Son Teslim Tarihi
                  </label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-xs text-[#203B5C]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">
                  Ödev Konusu &amp; Açıklama
                </label>
                <input
                  type="text"
                  required
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="Örn: Türev Karma Test 1-2-3 (60 soru)"
                  className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#203B5C] outline-none focus:border-[#135D43] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#135D43] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0E4A35]"
              >
                <Plus className="h-4 w-4 text-[#E8C483]" />
                <span>Ödev Gönder</span>
              </button>
            </form>

            {/* Student Homework History */}
            <div className="rounded-xl border border-[#DCE4EE] bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-[#203B5C]">
                {selectedStudent.name} — Verilen Ödevler ({selectedStudent.homework.length})
              </h3>
              <div className="mt-3 space-y-2">
                {selectedStudent.homework.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#737B86]">
                    Bu öğrenciye henüz ödev atanmamış.
                  </p>
                ) : (
                  selectedStudent.homework.map((hw) => (
                    <div
                      key={hw.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-[#E9EBEE] bg-[#FCFBF8] p-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        {hw.status === "Tamamlandı" ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#135D43]" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#C58B3B]" />
                        )}
                        <div>
                          <p className="font-bold text-[#135D43]">
                            {hw.subject}{" "}
                            <span className="font-normal text-[#737B86]">
                              · Son: {hw.dueDate}
                            </span>
                          </p>
                          <p className="mt-0.5 font-semibold text-[#203B5C]">
                            {hw.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            toggleHomeworkStatus(selectedStudent.id, hw.id)
                          }
                          className="rounded border border-[#DCE4EE] bg-white px-2 py-1 text-[10px] font-semibold text-[#135D43] hover:bg-[#EAF6F0]"
                        >
                          {hw.status === "Tamamlandı" ? "Geri Al" : "Tamamla"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            deleteHomeworkFromStudent(selectedStudent.id, hw.id)
                          }
                          title="Ödevi Sil"
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
