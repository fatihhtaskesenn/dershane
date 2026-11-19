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
    <div className="flex min-h-[calc(100vh-112px)] items-center justify-center bg-gradient-to-b from-[#FCFBF8] via-[#F4F7FA] to-[#EAF1F8] px-4 py-10 sm:px-6 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-[#DCE4EE] bg-white shadow-[0_24px_60px_rgba(13,37,88,0.12)] lg:grid-cols-12"
      >
        {/* Left Navy Brand Panel with Prominent DERSHANE Logo */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0D2558] via-[#163B82] to-[#1D4E9E] p-8 text-white sm:p-10 lg:col-span-5">
          {/* Subtle Gold Top Accent */}
          <div
            className="pointer-events-none absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#D4AF7A]/40 via-[#E8C483] to-[#D4AF7A]/40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-[#E8C483]/15 blur-3xl"
            aria-hidden="true"
          />

          <div>
            {/* Prominent White DERSHANE Logo */}
            <div className="inline-flex rounded-xl border border-white/15 bg-white/10 px-5 py-3.5 backdrop-blur-sm">
              <Image
                src="/images/logo-light.png"
                alt="DERSHANE Özel Öğretim Kursu"
                width={280}
                height={144}
                className="h-16 w-auto object-contain sm:h-20"
                priority
              />
            </div>

            <div className="mt-8 flex items-center gap-2.5">
              <span className="h-px w-6 bg-[#E8C483]" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#E8C483] uppercase">
                Kampüs Portalı
              </span>
            </div>

            <h2 className="font-editorial mt-3 text-2xl leading-snug font-medium text-white sm:text-3xl">
              Eğitim süreciniz{" "}
              <span className="italic text-[#E8C483]">tek ekranda.</span>
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/80 sm:text-sm">
              Öğrenciler ders programlarını, deneme netlerini, ödevlerini ve
              rehberlik notlarını; öğretmenler ise ders ve birebir etüt
              saatlerini takip eder.
            </p>
          </div>

          <div className="mt-8 space-y-2 rounded-xl border border-white/15 bg-white/10 p-4 text-[11px] backdrop-blur-xs">
            <p className="font-semibold tracking-wide text-[#E8C483] uppercase">
              Hazır Demo Hesapları
            </p>
            <p className="text-white/90">
              <span className="font-semibold">Öğrenci:</span>{" "}
              <span className="font-mono">kerem.yilmaz</span> · Şifre:{" "}
              <span className="font-mono">123456</span>
            </p>
            <p className="text-white/90">
              <span className="font-semibold">Öğretmen:</span>{" "}
              <span className="font-mono">selin.kaya</span> · Şifre:{" "}
              <span className="font-mono">123456</span>
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-7">
          <div className="border-b border-[#E9EBEE] pb-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#135D43] uppercase">
              Öğrenci &amp; Öğretmen Girişi
            </p>
            <h1 className="font-editorial mt-1.5 text-3xl font-medium tracking-tight text-[#0D2558]">
              Kampüse Giriş
            </h1>
            <p className="mt-1 text-sm text-[#5E6A78]">
              Yönetici tarafından tanımlanan kullanıcı adı ve şifrenizle giriş
              yapın.
            </p>
          </div>

          {/* Role Selector: Öğrenci / Öğretmen */}
          <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-lg border border-[#DCE4EE] bg-[#F4F7FA] p-1">
            <button
              type="button"
              onClick={() => handleRoleChange("student")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold transition-all sm:text-sm",
                role === "student"
                  ? "bg-[#0D2558] text-white shadow-sm"
                  : "text-[#5E6A78] hover:text-[#0D2558]"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Öğrenci Girişi</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("teacher")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold transition-all sm:text-sm",
                role === "teacher"
                  ? "bg-[#0D2558] text-white shadow-sm"
                  : "text-[#5E6A78] hover:text-[#0D2558]"
              )}
            >
              <BookOpenCheck className="h-4 w-4" />
              <span>Öğretmen Girişi</span>
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
                  : "Öğretmen Kullanıcı Adı"}
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
                    role === "student" ? "ör. kerem.yilmaz" : "ör. selin.kaya"
                  }
                  className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] py-3 pr-4 pl-10 text-sm text-[#17241F] outline-none transition-colors focus:border-[#163B82] focus:bg-white"
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
                  className="w-full rounded-lg border border-[#DCE4EE] bg-[#F8FAFC] py-3 pr-11 pl-10 text-sm text-[#17241F] outline-none transition-colors focus:border-[#163B82] focus:bg-white"
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
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0D2558] to-[#163B82] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-60"
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
