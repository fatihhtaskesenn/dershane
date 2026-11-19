"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, UserPlus } from "lucide-react";
import { useCampus, type StudentAccount } from "@/lib/campus-store";

function toSlugUsername(fullName: string) {
  return fullName
    .trim()
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
}

export default function AdminCreateStudentPage() {
  const { students, teachers, classes, addStudent } = useCampus();

  const [stuSearch, setStuSearch] = useState("");
  const [stuName, setStuName] = useState("");
  const [stuNo, setStuNo] = useState("2026-1099");
  const [stuUsername, setStuUsername] = useState("");
  const [stuUsernameEdited, setStuUsernameEdited] = useState(false);
  const [stuPassword, setStuPassword] = useState("123456");
  const [stuGrade, setStuGrade] =
    useState<StudentAccount["grade"]>("12. Sınıf (YKS)");
  const [stuTrack, setStuTrack] = useState<StudentAccount["track"]>("Sayısal");
  const [stuParent, setStuParent] = useState("");
  const [stuPhone, setStuPhone] = useState("+90 532 000 00 00");
  const [stuTarget, setStuTarget] = useState("");
  const [stuClassId, setStuClassId] = useState(classes[0]?.id ?? "");
  const [stuAdvisorId, setStuAdvisorId] = useState(teachers[0]?.id ?? "");

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(stuSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(stuSearch.toLowerCase()) ||
      s.studentNo.toLowerCase().includes(stuSearch.toLowerCase()) ||
      s.parentName.toLowerCase().includes(stuSearch.toLowerCase())
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim() || !stuUsername.trim() || !stuPassword.trim()) return;
    const adv = teachers.find((t) => t.id === stuAdvisorId) ?? teachers[0];
    const cls = classes.find((c) => c.id === stuClassId) ?? classes[0];
    addStudent({
      name: stuName.trim(),
      studentNo: stuNo.trim(),
      username: stuUsername.trim().toLowerCase(),
      password: stuPassword.trim(),
      classId: cls?.id ?? "cls-1",
      className: cls?.name ?? "12-A Sayısal",
      grade: stuGrade,
      track: stuTrack,
      parentName: stuParent.trim() || "Belirtilmedi",
      target: stuTarget.trim() || "Hedef Belirleniyor",
      advisorTeacherId: adv?.id ?? "",
      advisorName: adv?.name ?? "Atanmadı",
      phone: stuPhone.trim(),
      attendance: 100,
      status: "Aktif",
    });
    setStuName("");
    setStuUsername("");
    setStuUsernameEdited(false);
    setStuParent("");
    setStuTarget("");
  };

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Öğrenci Kayıt &amp; Erişim
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
          <UserPlus className="h-6 w-6 text-[#135D43]" />
          <span>Öğrenci Oluştur</span>
        </h1>
        <p className="mt-1 text-sm text-[#737B86]">
          Yeni öğrenci kaydı oluşturun, alan/veli/danışman bilgilerini ve
          kampüse giriş yapacağı kullanıcı adı–şifreyi belirleyin.
        </p>
      </div>

      {/* Create Student Form */}
      <form
        onSubmit={handleCreateStudent}
        className="grid grid-cols-1 gap-3 rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-xs sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          type="text"
          required
          placeholder="Öğrenci Ad Soyad"
          value={stuName}
          onChange={(e) => {
            setStuName(e.target.value);
            if (!stuUsernameEdited) setStuUsername(toSlugUsername(e.target.value));
          }}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <select
          value={stuTrack}
          onChange={(e) =>
            setStuTrack(e.target.value as StudentAccount["track"])
          }
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        >
          <option value="Sayısal">Alan: Sayısal (SAY)</option>
          <option value="Eşit Ağırlık">Alan: Eşit Ağırlık (EA)</option>
          <option value="Sözel">Alan: Sözel (SÖZ)</option>
        </select>
        <select
          value={stuGrade}
          onChange={(e) =>
            setStuGrade(e.target.value as StudentAccount["grade"])
          }
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        >
          <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
          <option value="Mezun (YKS)">Mezun (YKS)</option>
          <option value="11. Sınıf">11. Sınıf</option>
        </select>
        <input
          type="text"
          required
          placeholder="Veli İsmi"
          value={stuParent}
          onChange={(e) => setStuParent(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <input
          type="text"
          placeholder="Telefon"
          value={stuPhone}
          onChange={(e) => setStuPhone(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <input
          type="text"
          required
          placeholder="Öğrenci No"
          value={stuNo}
          onChange={(e) => setStuNo(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <input
          type="text"
          required
          placeholder="Kullanıcı Adı"
          value={stuUsername}
          onChange={(e) => {
            setStuUsernameEdited(true);
            setStuUsername(e.target.value);
          }}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 font-mono text-xs"
        />
        <input
          type="text"
          required
          placeholder="Kampüs Şifresi"
          value={stuPassword}
          onChange={(e) => setStuPassword(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 font-mono text-xs"
        />
        <select
          value={stuClassId}
          onChange={(e) => setStuClassId(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Sınıf: {c.name}
            </option>
          ))}
        </select>
        <select
          value={stuAdvisorId}
          onChange={(e) => setStuAdvisorId(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              Danışman: {t.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Hedef Bölüm"
          value={stuTarget}
          onChange={(e) => setStuTarget(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs sm:col-span-2 lg:col-span-4"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#0D2558] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163B82]"
        >
          <Plus className="h-4 w-4 text-[#E8C483]" />
          <span>Öğrenci Ekle</span>
        </button>
      </form>

      {/* Searchable List */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-4 sm:flex-row sm:items-center">
          <h2 className="font-editorial text-xl font-medium text-[#203B5C]">
            Tüm Öğrenciler ({filteredStudents.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#737B86]" />
            <input
              type="text"
              value={stuSearch}
              onChange={(e) => setStuSearch(e.target.value)}
              placeholder="Öğrenci, veli veya kullanıcı adı ara..."
              className="w-full rounded-md border border-[#DCE4EE] bg-[#F8FAFC] py-2 pr-3 pl-9 text-xs outline-none focus:border-[#203B5C]"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E9EBEE] text-[11px] font-semibold text-[#737B86] uppercase">
                <th className="py-2.5 pr-4">Öğrenci</th>
                <th className="py-2.5 pr-4">Alan &amp; Sınıf</th>
                <th className="py-2.5 pr-4">Veli İsmi</th>
                <th className="py-2.5 pr-4">Kullanıcı Adı / Şifre</th>
                <th className="py-2.5 pr-4">Danışman</th>
                <th className="py-2.5 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EBEE]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8F7F3]">
                  <td className="py-2.5 pr-4 font-semibold text-[#203B5C]">
                    {s.name}{" "}
                    <span className="text-xs font-normal text-[#737B86]">
                      ({s.studentNo})
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs">
                    {s.track} • {s.className}
                  </td>
                  <td className="py-2.5 pr-4 text-xs">{s.parentName}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    {s.username} /{" "}
                    <span className="rounded bg-[#F2EDE3] px-1.5 py-0.5 font-semibold text-[#9A743E]">
                      {s.password}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs">{s.advisorName}</td>
                  <td className="py-2.5 text-right">
                    <Link
                      href={`/admin/students?id=${s.id}`}
                      className="rounded border border-[#DCE4EE] px-2.5 py-1 text-xs font-semibold text-[#203B5C] hover:border-[#135D43] hover:text-[#135D43]"
                    >
                      Durumu Gör →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
