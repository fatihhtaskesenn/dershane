"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyLevel {
  level: number;
  title: string;
  badge: string;
  progress: number;
  tytProjection: string;
  aytProjection: string;
  xpGain: string;
  summary: string;
  tasks: string[];
}

const LEVELS: JourneyLevel[] = [
  {
    level: 1,
    title: "Seviye Tespiti & Paket Seçimi",
    badge: "Başlangıç Kalibrasyonu",
    progress: 25,
    tytProjection: "74.5 Net",
    aytProjection: "41.0 Net",
    xpGain: "+250 XP",
    summary:
      "Kapsamlı seviye değerlendirmesiyle mevcut akademik konumunuz çıkarılır; 12–16 kişilik homojen sınıfınız ve size en uygun Ders Paketiniz tanımlanır.",
    tasks: [
      "Temel kazanım tarama sınavının tamamlanması",
      "Birebir akademik danışman eşleştirmesinin yapılması",
    ],
  },
  {
    level: 2,
    title: "Yapay Zeka Hata Haritası",
    badge: "Veri Odaklı Keşif",
    progress: 50,
    tytProjection: "86.0 Net",
    aytProjection: "52.5 Net",
    xpGain: "+600 XP",
    summary:
      "Yapay zeka analiz motoru ardışık denemelerdeki tekrar eden yanlışları, süre kayıplarını ve en hızlı net artışı getirecek kritik üniteleri işaretler.",
    tasks: [
      "Konu bazlı %94.2 hedefli soru bankası rotasının açılması",
      "Zayıf kazanımlar için otomatik etüt bildirimi",
    ],
  },
  {
    level: 3,
    title: "Kişisel Soru & Etüt Kampı",
    badge: "İvme Dönemi",
    progress: 75,
    tytProjection: "96.25 Net",
    aytProjection: "64.25 Net",
    xpGain: "+1.150 XP",
    summary:
      "Birebir etüt masaları, hızlandırılmış problem atölyeleri ve haftalık deneme analizleriyle eksik konular kapatılır, net grafiği istikrarlı yükselişe geçer.",
    tasks: [
      "Haftalık soru analizi ve kazanım haritası onayı",
      "Branş öğretmenleriyle birebir soru çözüm oturumları",
    ],
  },
  {
    level: 4,
    title: "Hedef Üniversite & Derece",
    badge: "Zirve Performans",
    progress: 100,
    tytProjection: "108.5 Net",
    aytProjection: "73.0 Net",
    xpGain: "+2.000 XP",
    summary:
      "Gerçek sınav provaları, turlama stratejisi koçluğu ve YKS tercih simülasyonu ile öğrenci hedeflediği ilk 1000–5000 bandına tam hazır hale gelir.",
    tasks: [
      "Türkiye geneli 40+ deneme maratonunun tamamlanması",
      "Birebir üniversite & bölüm tercih simülasyonu",
    ],
  },
];

export function JourneySimulator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = LEVELS[activeIndex];

  return (
    <div className="rounded-xl border border-[#DCE8E2] bg-white/85 p-6 shadow-[0_18px_45px_rgba(23,36,31,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-4 border-b border-[#DCE8E2] pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#C58B3B]" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#135D43] uppercase">
              Başarı Simülasyonu
            </span>
          </div>
          <h3 className="font-editorial mt-3 text-2xl font-medium text-[#17241F] sm:text-3xl">
            Öğrenci Gelişim Yolculuğu
          </h3>
          <p className="mt-1 text-sm text-[#4E5E57]">
            Aşamalara tıklayarak DERSHANE sistemindeki net yükselişini ve
            kazanım ilerlemesini deneyimleyin.
          </p>
        </div>

        {/* Animated Progress Pill */}
        <div className="w-full max-w-xs rounded-lg border border-[#DCE8E2] bg-[#FCFBF8] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#4E5E57]">Dönem İlerlemesi</span>
            <span className="font-semibold text-[#135D43]">
              %{current.progress}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#DCE8E2]/70">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#135D43] via-[#C58B3B] to-[#135D43]"
              initial={false}
              animate={{ width: `${current.progress}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Level Selector Tabs */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {LEVELS.map((lvl, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx <= activeIndex;
          return (
            <button
              key={lvl.level}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "group relative flex flex-col items-start rounded-lg border p-4 text-left transition-all duration-200",
                isActive
                  ? "border-[#135D43] bg-[#135D43]/[0.06] shadow-[0_8px_24px_rgba(19,93,67,0.10)]"
                  : isCompleted
                  ? "border-[#DCE8E2] bg-white hover:border-[#135D43]/40"
                  : "border-[#DCE8E2]/80 bg-[#FCFBF8]/80 hover:border-[#135D43]/30"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-xs font-semibold",
                    isActive ? "text-[#135D43]" : "text-[#C58B3B]"
                  )}
                >
                  SEVİYE 0{lvl.level}
                </span>
                <span className="rounded border border-[#DCE8E2] bg-[#FCFBF8] px-2 py-0.5 font-mono text-[10px] font-medium text-[#4E5E57]">
                  {lvl.xpGain}
                </span>
              </div>
              <span className="mt-2 text-sm font-semibold text-[#17241F]">
                {lvl.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Level Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.level}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-6 grid grid-cols-1 gap-6 rounded-lg border border-[#DCE8E2] bg-[#FCFBF8]/90 p-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E6B24]">
              <Award className="h-4 w-4 text-[#C58B3B]" />
              <span>{current.badge}</span>
            </div>
            <h4 className="font-editorial mt-2 text-2xl font-medium text-[#17241F]">
              {current.title}
            </h4>
            <p className="mt-2.5 text-sm leading-relaxed text-[#4E5E57]">
              {current.summary}
            </p>

            <ul className="mt-5 space-y-2.5">
              {current.tasks.map((task) => (
                <li
                  key={task}
                  className="flex items-center gap-2.5 text-xs font-medium text-[#17241F] sm:text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#135D43]" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            <div className="flex flex-col justify-between rounded-lg border border-[#135D43]/20 bg-[#135D43]/[0.05] p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#135D43]">
                <span>TYT Projeksiyonu</span>
                <TrendingUp className="h-4 w-4 text-[#135D43]" />
              </div>
              <p className="font-editorial mt-4 text-3xl font-medium text-[#17241F]">
                {current.tytProjection}
              </p>
              <span className="mt-1 text-[11px] text-[#4E5E57]">
                120 Soru Üzerinden
              </span>
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-[#C58B3B]/30 bg-[#C58B3B]/[0.07] p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#9E6B24]">
                <span>AYT Projeksiyonu</span>
                <Sparkles className="h-4 w-4 text-[#C58B3B]" />
              </div>
              <p className="font-editorial mt-4 text-3xl font-medium text-[#17241F]">
                {current.aytProjection}
              </p>
              <span className="mt-1 text-[11px] text-[#4E5E57]">
                80 Soru Üzerinden
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
