"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampus } from "@/lib/campus-store";

type PortalRole = "student" | "teacher";

export default function LoginPage() {
  const router = useRouter();
  const { loginStudent, loginTeacher } = useCampus();

  const [role, setRole] = useState<PortalRole>("student");
  const [identifier, setIdentifier] = useState("kerem.yilmaz");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (nextRole: PortalRole) => {
    setRole(nextRole);
    setError("");
    if (nextRole === "student") {
      setIdentifier("kerem.yilmaz");
    } else {
      setIdentifier("selin.kaya");
    }
    setPassword("123456");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res =
      role === "student"
        ? loginStudent(identifier, password)
        : loginTeacher(identifier, password);

    if (!res.ok) {
      setError(res.error ?? "Giriş bilgileri doğrulanamadı.");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      router.push(
        role === "student" ? "/student/dashboard" : "/teacher/dashboard"
      );
    }, 220);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-112px)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#07152E] via-[#0F2D5E] to-[#0D4A3B] px-4 py-10 sm:px-6 lg:py-14">
      {/* Classy Animated Ambient Gradient Glows */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#1E4E9E]/35 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="pointer-events-none absolute -right-24 -bottom-32 h-[28rem] w-[28rem] rounded-full bg-[#E8C483]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,196,131,0.12),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(19,93,67,0.28),transparent_50%)]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_30px_80px_rgba(4,12,28,0.45)] lg:grid-cols-12"
      >
        {/* Left Midnight Navy Editorial Brand Panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#091A3A] via-[#0D2558] to-[#133372] p-8 text-white sm:p-11 lg:col-span-5">
          <div
            className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8C483] to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-16 -bottom-16 h-60 w-60 rounded-full bg-[#E8C483]/12 blur-3xl"
            aria-hidden="true"
          />

          <div>
            <Image
              src="/images/logo-light.png"
              alt="DERSHANE Özel Öğretim Kursu"
              width={260}
              height={134}
              className="h-14 w-auto object-contain sm:h-16"
              priority
            />

            <div className="mt-10 flex items-center gap-2.5">
              <span className="h-px w-6 bg-[#E8C483]" aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-[0.22em] text-[#E8C483] uppercase">
                Kampüs Portalı
              </span>
            </div>

            <h2 className="font-editorial mt-3 text-3xl leading-tight font-medium text-white">
              Akademik takip,{" "}
              <span className="italic text-[#E8C483]">tek merkezde.</span>
            </h2>
          </div>

          <div className="mt-10 border-t border-white/15 pt-5">
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/65 uppercase">
              DERSHANE Özel Öğretim Kursu
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-center p-7 sm:p-11 lg:col-span-7">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#135D43] uppercase">
              Öğrenci &amp; Öğretmen
            </p>
            <h1 className="font-editorial mt-1.5 text-3xl font-medium tracking-tight text-[#0D2558]">
              Kampüse Giriş
            </h1>
          </div>

          {/* Role Selector: Öğrenci / Öğretmen */}
          <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-xl border border-[#E5DEC9] bg-[#FCFBF8] p-1">
            <button
              type="button"
              onClick={() => handleRoleChange("student")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all sm:text-sm",
                role === "student"
                  ? "bg-[#0D2558] text-white shadow-sm"
                  : "text-[#5E6A78] hover:text-[#0D2558]"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Öğrenci</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("teacher")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all sm:text-sm",
                role === "teacher"
                  ? "bg-[#0D2558] text-white shadow-sm"
                  : "text-[#5E6A78] hover:text-[#0D2558]"
              )}
            >
              <BookOpenCheck className="h-4 w-4" />
              <span>Öğretmen</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="login-identifier"
                className="block text-xs font-semibold text-[#17241F]"
              >
                {role === "student"
                  ? "Kullanıcı Adı veya Öğrenci No"
                  : "Kullanıcı Adı"}
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#5E6A78]" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === "student" ? "kerem.yilmaz" : "selin.kaya"
                  }
                  className="w-full rounded-xl border border-[#DCE4EE] bg-[#F8FAFC] py-3 pr-4 pl-10 text-sm text-[#17241F] outline-none transition-all focus:border-[#0D2558] focus:bg-white focus:ring-2 focus:ring-[#0D2558]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#17241F]"
              >
                Şifre
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#5E6A78]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE4EE] bg-[#F8FAFC] py-3 pr-11 pl-10 text-sm text-[#17241F] outline-none transition-all focus:border-[#0D2558] focus:bg-white focus:ring-2 focus:ring-[#0D2558]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#5E6A78] hover:text-[#0D2558]"
                  aria-label="Şifreyi göster/gizle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#091A3A] via-[#0D2558] to-[#163B82] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-60"
            >
              <span>
                {isLoading
                  ? "Giriş Yapılıyor..."
                  : role === "student"
                  ? "Öğrenci Paneline Gir"
                  : "Öğretmen Paneline Gir"}
              </span>
              <ArrowRight className="h-4 w-4 text-[#E8C483] transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
