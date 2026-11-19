"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  CalendarCheck,
  Clock,
  LineChart,
  MapPin,
  Phone,
} from "lucide-react";
import { useCampus } from "@/lib/campus-store";

const PILLARS = [
  {
    icon: Bot,
    title: "Yapay Zeka Destekli Analiz",
    description:
      "Deneme sınavlarındaki hata örüntülerini tespit eder, net getirisi en yüksek konulara göre haftalık rota çizer.",
  },
  {
    icon: BookOpenCheck,
    title: "Gözetimli Kütüphane & Etüt",
    description:
      "Haftanın 6 günü sessiz çalışma salonları ve branş öğretmenleriyle birebir soru çözüm masaları daima açıktır.",
  },
  {
    icon: LineChart,
    title: "Anlık Veli & Öğrenci Raporu",
    description:
      "Devamsızlık bilgisi, etüt katılımı ve haftalık net grafikleri dijital portal üzerinden eş zamanlı paylaşılır.",
  },
];

const PACKAGE_PILLS = [
  "Mezun Sınıf",
  "Örgün Sınıf",
  "Hızlandırılmış",
  "Özel Matematik",
  "Deneme Kulübü",
  "Etüt & Destek",
  "Rehberlik & Koçluk",
  "Yaz Kurs",
];

export function HomeEcosystemBand() {
  const { siteContent } = useCampus();
  return (
    <section className="border-t border-[#DCE8E2] bg-gradient-to-b from-[#F2F7F4] to-[#EAF3EE] py-12 text-[#17241F] sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D2E2DA] pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#C58B3B]" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#135D43] uppercase">
                Kampüs &amp; Eğitim Ekosistemi
              </span>
            </div>
            <h2 className="font-editorial mt-3 text-3xl leading-tight font-medium tracking-tight text-[#0E3B2B] sm:text-4xl lg:text-[42px]">
              Sınıftan kütüphaneye,{" "}
              <span className="italic text-[#135D43]">bütüncül</span> hazırlık.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-[#4E5E57] md:text-right">
            Gaziantep Merkez kampüsümüzde 7 özel eğitim paketi, yapay zeka
            takibi ve birebir akademik danışmanlıkla tam donanımlı bir hazırlık
            ortamı sunuyoruz.
          </p>
        </div>

        {/* Full-Width 12-Column Balanced Bento */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Featured Campus & Packages Card (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#DCE8E2] bg-white shadow-[0_10px_28px_rgba(14,59,43,0.05)] lg:col-span-7"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12">
              <div className="relative min-h-[220px] sm:col-span-5 sm:min-h-full">
                <Image
                  src={siteContent.ecosystemBannerImage}
                  alt="DERSHANE Modern Sınıflar ve Eğitim Ortamı"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 30vw"
                />
              </div>

              <div className="flex flex-col justify-between p-6 sm:col-span-7 sm:p-7">
                <div>
                  <h3 className="font-editorial text-2xl font-medium text-[#0E3B2B]">
                    Hedefe Uygun 8 Özel Ders Paketi
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4E5E57]">
                    Mezun ve örgün sınıflardan özel matematiğe, hızlandırılmış
                    kamplardan deneme kulübüne kadar öğrencinin ihtiyacına göre
                    şekillenen programlar.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {PACKAGE_PILLS.map((pkg) => (
                      <span
                        key={pkg}
                        className="rounded border border-[#DCE8E2] bg-[#FCFBF8] px-2.5 py-1 text-[11px] font-medium text-[#17241F]"
                      >
                        {pkg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DCE8E2]/80">
                  <Link
                    href="/programlar"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#135D43] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#0E4A35] sm:w-auto sm:text-sm"
                  >
                    <span>Tüm Ders Paketlerini İncele</span>
                    <ArrowRight className="h-4 w-4 text-[#E8C483] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: 3 Structured Pillars + Campus Visit CTA (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="flex flex-col justify-between gap-4 lg:col-span-5"
          >
            <div className="space-y-3">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-start gap-4 rounded-xl border border-[#DCE8E2] bg-white p-4 transition-colors hover:border-[#135D43]/45 sm:p-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DCE8E2] bg-[#FCFBF8] text-[#135D43]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#0E3B2B] sm:text-base">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#4E5E57]">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact Campus Appointment Strip */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#135D43]/20 bg-[#0E3B2B] p-5 text-white sm:flex-row sm:items-center">
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-[#E8C483]">
                  Ücretsiz Seviye Tespiti &amp; Ön Görüşme
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#E8C483]" />
                    Gaziantep Merkez
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-[#E8C483]" />
                    +90 (342) 555 48 27
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#E8C483]" />
                    09:00 – 18:30
                  </span>
                </div>
              </div>

              <Link
                href="/iletisim"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#E8C483] px-4 py-2.5 text-xs font-semibold text-[#0E3B2B] transition-colors hover:bg-[#F2D59B]"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>Randevu Al</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
