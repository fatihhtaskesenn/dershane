"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";
import { useCampus, type TeacherRole } from "@/lib/campus-store";

const TEACHER_BRANCHES = [
  "Matematik & Geometri",
  "Matematik",
  "Geometri",
  "Türkçe & Edebiyat",
  "Türkçe",
  "Edebiyat",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
  "Rehberlik & Danışmanlık",
] as const;

const TEACHER_ROLES: TeacherRole[] = [
  "Branş Öğretmeni",
  "Akademik Danışman",
  "Rehberlik Uzmanı",
  "Zümre Başkanı",
  "Etüt Öğretmeni",
];

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

export default function AdminCreateTeacherPage() {
  const { teachers, addTeacher } = useCampus();

  const [tchName, setTchName] = useState("");
  const [tchRole, setTchRole] = useState<TeacherRole>("Branş Öğretmeni");
  const [tchBranch, setTchBranch] = useState("Matematik & Geometri");
  const [tchUsername, setTchUsername] = useState("");
  const [tchUsernameEdited, setTchUsernameEdited] = useState(false);
  const [tchPassword, setTchPassword] = useState("123456");
  const [tchEmail, setTchEmail] = useState("");
  const [tchPhone, setTchPhone] = useState("+90 532 000 00 00");

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName.trim() || !tchUsername.trim() || !tchPassword.trim()) return;
    addTeacher({
      name: tchName.trim(),
      role: tchRole,
      branch: tchBranch.trim(),
      username: tchUsername.trim().toLowerCase(),
      password: tchPassword.trim(),
      email:
        tchEmail.trim() || `${tchUsername.trim().toLowerCase()}@dershane.edu.tr`,
      phone: tchPhone.trim(),
    });
    setTchName("");
    setTchUsername("");
    setTchUsernameEdited(false);
    setTchEmail("");
  };

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Öğretmen Kayıt &amp; Erişim
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
          <GraduationCap className="h-6 w-6 text-[#135D43]" />
          <span>Öğretmen Oluştur</span>
        </h1>
        <p className="mt-1 text-sm text-[#737B86]">
          Kuruma yeni öğretmen ekleyin, branş/rol bilgilerini ve kampüs giriş
          kullanıcı adı–şifresini tanımlayın.
        </p>
      </div>

      <form
        onSubmit={handleCreateTeacher}
        className="grid grid-cols-1 gap-3 rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-xs sm:grid-cols-2 lg:grid-cols-4"
      >
        <input
          type="text"
          required
          placeholder="Öğretmen Ad Soyad"
          value={tchName}
          onChange={(e) => {
            setTchName(e.target.value);
            if (!tchUsernameEdited)
              setTchUsername(toSlugUsername(e.target.value));
          }}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <select
          required
          value={tchBranch}
          onChange={(e) => setTchBranch(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs font-medium text-[#203B5C]"
        >
          {TEACHER_BRANCHES.map((branch) => (
            <option key={branch} value={branch}>
              Branş: {branch}
            </option>
          ))}
        </select>
        <select
          value={tchRole}
          onChange={(e) => setTchRole(e.target.value as TeacherRole)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        >
          {TEACHER_ROLES.map((r) => (
            <option key={r} value={r}>
              Rol: {r}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Telefon"
          value={tchPhone}
          onChange={(e) => setTchPhone(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <input
          type="text"
          required
          placeholder="Kullanıcı Adı"
          value={tchUsername}
          onChange={(e) => {
            setTchUsernameEdited(true);
            setTchUsername(e.target.value);
          }}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 font-mono text-xs"
        />
        <input
          type="text"
          required
          placeholder="Kampüs Şifresi"
          value={tchPassword}
          onChange={(e) => setTchPassword(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 font-mono text-xs"
        />
        <input
          type="email"
          placeholder="E-posta"
          value={tchEmail}
          onChange={(e) => setTchEmail(e.target.value)}
          className="rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5 text-xs"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#135D43] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0E4A35]"
        >
          <Plus className="h-4 w-4" />
          <span>Öğretmen Ekle</span>
        </button>
      </form>

      <div className="rounded-xl border border-[#DCE4EE] bg-white p-6">
        <h2 className="font-editorial border-b border-[#E9EBEE] pb-3 text-xl font-medium text-[#203B5C]">
          Kurumdaki Tüm Öğretmenler ({teachers.length})
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E9EBEE] text-[11px] font-semibold text-[#737B86] uppercase">
                <th className="py-2.5 pr-4">Öğretmen</th>
                <th className="py-2.5 pr-4">Rol &amp; Branş</th>
                <th className="py-2.5 pr-4">Kullanıcı Adı / Şifre</th>
                <th className="py-2.5 pr-4">Yoğunluk</th>
                <th className="py-2.5 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EBEE]">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-[#F8F7F3]">
                  <td className="py-2.5 pr-4 font-semibold text-[#203B5C]">
                    {t.name}
                  </td>
                  <td className="py-2.5 pr-4 text-xs">
                    <span className="rounded bg-[#EEF2F6] px-2 py-0.5 font-semibold text-[#203B5C]">
                      {t.role}
                    </span>{" "}
                    <span className="ml-1 text-[#737B86]">{t.branch}</span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    {t.username} /{" "}
                    <span className="rounded bg-[#F2EDE3] px-1.5 py-0.5 font-semibold text-[#9A743E]">
                      {t.password}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-[#737B86]">
                    {t.schedule.length} sınıf dersi • {t.oneOnOneSlots.length}{" "}
                    birebir
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      href={`/admin/teachers?id=${t.id}`}
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
