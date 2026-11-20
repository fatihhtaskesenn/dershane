"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { useCampus } from "@/lib/campus-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useCampus();

  const [email, setEmail] = useState("yonetici@dershane.edu.tr");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = loginAdmin(email, password);
    if (!res.ok) {
      setError(res.error ?? "Yönetici bilgileri doğrulanamadı.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 200);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0A1936] via-[#0D2558] to-[#163B82] px-4 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-white text-[#17241F] shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-[#091A3A] via-[#0D2558] to-[#133372] px-8 py-7 text-center text-white">
          <div
            className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8C483] to-transparent"
            aria-hidden="true"
          />
          <Image
            src="/images/logo-light.png"
            alt="DERSHANE Özel Öğretim Kursu"
            width={240}
            height={124}
            className="mx-auto h-14 w-auto object-contain"
            priority
          />
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#E8C483]/40 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#E8C483] uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            Yönetici Portalı
          </div>
          <h1 className="font-editorial mt-3 text-2xl font-medium">
            Kurum Yönetim Girişi
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-8">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-[#17241F]"
            >
              Kullanıcı Adı veya E-posta
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#5E6A78]" />
              <input
                id="admin-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#DCE4EE] bg-[#F8FAFC] py-2.5 pr-4 pl-10 text-sm text-[#17241F] outline-none transition-all focus:border-[#0D2558] focus:bg-white focus:ring-2 focus:ring-[#0D2558]/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-[#17241F]"
            >
              Şifre
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#5E6A78]" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#DCE4EE] bg-[#F8FAFC] py-2.5 pr-4 pl-10 text-sm text-[#17241F] outline-none transition-all focus:border-[#0D2558] focus:bg-white focus:ring-2 focus:ring-[#0D2558]/10"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#091A3A] via-[#0D2558] to-[#163B82] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-60"
          >
            <span>{loading ? "Giriş Yapılıyor..." : "Yönetici Paneline Gir"}</span>
            <ArrowRight className="h-4 w-4 text-[#E8C483]" />
          </button>

          <div className="border-t border-[#E9EBEE] pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5E6A78] hover:text-[#0D2558]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kurumsal Siteye Dön</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
