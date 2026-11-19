"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Target,
} from "lucide-react";
import { AcademicParallaxBg } from "@/components/academic-parallax-bg";
import { JourneySimulator } from "@/components/journey-simulator";
import { TiltCard } from "@/components/tilt-card";

const PACKAGES_HIGHLIGHT = [
  "Mezun Sınıf Paketi",
  "Örgün Sınıf Paketi",
  "Hızlandırılmış Sınıf Paketi",
  "Özel Matematik Paketi",
  "Deneme Paketi",
  "Etüt ve Destek Paketi",
  "Rehberlik ve Koçluk Paketi",
];

export default function YaklasimPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FCFBF8] text-[#17241F]">
      {/* Thematic Educational 3D Mouse Parallax Background */}
      <AcademicParallaxBg />

      {/* STUDENT & ADMIN PANEL VISUAL SHOWCASE (FIRST SECTION) */}
      <section className="relative z-10 border-b border-[#DCE8E2] py-12 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-[#DCE8E2] pb-8"
          >
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] text-[#135D43] uppercase">
                <ShieldCheck className="h-4 w-4 text-[#C58B3B]" />
                DERSHANE • Canlı Sistem Arayüzleri
              </span>
              <h1 className="font-editorial mt-2 text-3xl font-medium text-[#17241F] sm:text-4xl lg:text-5xl">
                Öğrenci ve Yönetici Panellerinden Görünümler
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#4E5E57] sm:text-base">
                Yapay zeka analizli öğrenci portalımız ve kurum yönetim
                altyapımızla her adımı şeffaf ve ölçülebilir biçimde takip edin.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Student Panel Visual */}
            <div className="rounded-xl border border-[#DCE8E2] bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <div className="border-b border-[#DCE8E2] pb-4">
                <span className="text-[11px] font-semibold tracking-wider text-[#C58B3B] uppercase">
                  Öğrenci Portalı
                </span>
                <h2 className="font-editorial mt-1 text-2xl font-medium text-[#17241F]">
                  Net Analizi &amp; Yapay Zeka Takibi
                </h2>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-[#DCE8E2]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/student-panel-preview.jpg"
                    alt="DERSHANE Öğrenci Paneli Net Analizi Görseli"
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#4E5E57]">
                Öğrenciler kendi panellerinden TYT/AYT net gelişim grafiklerini,
                ders bazlı doğru-yanlış dağılımlarını, haftalık ders
                programlarını ve yapay zeka destekli konu önceliklerini anlık
                takip eder.
              </p>
            </div>

            {/* Admin Panel Visual */}
            <div className="rounded-xl border border-[#DCE8E2] bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <div className="border-b border-[#DCE8E2] pb-4">
                <span className="text-[11px] font-semibold tracking-wider text-[#C58B3B] uppercase">
                  Yönetici (Admin) Portalı
                </span>
                <h2 className="font-editorial mt-1 text-2xl font-medium text-[#17241F]">
                  Kurum İstatistikleri &amp; Öğrenci Yönetimi
                </h2>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-[#DCE8E2]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/admin-panel-preview.jpg"
                    alt="DERSHANE Yönetici Admin Paneli Görseli"
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#4E5E57]">
                Kurum yöneticileri tüm öğrencilerin devamlılık oranlarını, aylık
                kurum TYT/AYT ortalamalarını, danışman öğretmen atamalarını ve
                yeni öğrenci kayıt işlemlerini tek merkezden yönetir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STEP-BY-STEP ACADEMIC APPROACH: 3D Tilt + Glowing Academic Modules */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl border-b border-[#DCE8E2] pb-6"
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-[#C58B3B] uppercase">
              Adım Adım Akademik Yaklaşımımız
            </p>
            <h2 className="font-editorial mt-2 text-3xl font-medium text-[#17241F] sm:text-4xl">
              Ölçülebilir Gelişim Ekosistemi
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4E5E57] sm:text-base">
              Seviye tespitinden yapay zeka destekli koçluğa, haftalık soru
              analizinden birebir mentorluğa kadar başarıyı adım adım inşa eden
              eğitim modelimiz.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
            {/* Bento 1 (5 cols): Kişiselleştirilmiş Soru Bankası Çözüm Oranı: %94.2 */}
            <div className="lg:col-span-5">
              <TiltCard
                delay={0}
                className="border-[#DCE8E2] bg-white/85 shadow-sm backdrop-blur-xl hover:border-[#135D43]/45 hover:shadow-[0_16px_40px_rgba(19,93,67,0.10)]"
              >
                <div className="flex h-full flex-col justify-between p-7">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#DCE8E2]/80 pb-3.5">
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#135D43] uppercase">
                        <Target className="h-3.5 w-3.5 text-[#C58B3B]" />
                        Hedefli Pratik
                      </span>
                      <span className="font-mono text-xs text-[#4E5E57]">
                        MODÜL 01
                      </span>
                    </div>

                    <p className="font-editorial mt-6 text-5xl font-medium text-[#17241F]">
                      %94.2
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#135D43]">
                      Kişiselleştirilmiş Soru Bankası Çözüm Oranı
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4E5E57]">
                      Öğrencinin seviyesine ve yanlış yaptığı konulara göre
                      filtrelenen akıllı soru setleri sayesinde gereksiz soru
                      yükü yerine tam isabetli pratik sağlanır.
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE8E2]/70">
                      <div className="h-full w-[94.2%] rounded-full bg-gradient-to-r from-[#135D43] to-[#C58B3B]" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Bento 2 (7 cols): Yapay Zeka Destekli Koçluk Sistemi */}
            <div className="lg:col-span-7">
              <TiltCard
                delay={0.08}
                className="border-[#DCE8E2] bg-white/85 shadow-sm backdrop-blur-xl hover:border-[#C58B3B]/55 hover:shadow-[0_16px_40px_rgba(197,139,59,0.12)]"
              >
                <div className="flex h-full flex-col justify-between p-7">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#DCE8E2]/80 pb-3.5">
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#9E6B24] uppercase">
                        <Bot className="h-3.5 w-3.5 text-[#C58B3B]" />
                        AI Akademik Motor
                      </span>
                      <span className="font-mono text-xs text-[#4E5E57]">
                        MODÜL 02
                      </span>
                    </div>

                    <h3 className="font-editorial mt-6 text-3xl font-medium text-[#17241F]">
                      Yapay Zeka Destekli Koçluk Sistemi
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#4E5E57] sm:text-base">
                      Her deneme sınavı sonrası öğrencinin tekrar eden hata
                      örüntülerini, süre yönetimi darboğazlarını ve net getiri
                      potansiyeli en yüksek konuları saniyeler içinde analiz
                      ederek danışman öğretmenle ortak haftalık rota çizer.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#DCE8E2] pt-5 sm:grid-cols-2">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-[#17241F]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#135D43]" />
                      <span>Otomatik Eksik Konu Önceliklendirme</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium text-[#17241F]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#135D43]" />
                      <span>Hedef Sıralama &amp; Net Simülasyonu</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Bento 3 (7 cols): Haftalık Soru Analizi ve Kazanım Haritası */}
            <div className="lg:col-span-7">
              <TiltCard
                delay={0.14}
                className="border-[#DCE8E2] bg-white/85 shadow-sm backdrop-blur-xl hover:border-[#4E203D]/40 hover:shadow-[0_16px_40px_rgba(78,32,61,0.10)]"
              >
                <div className="flex h-full flex-col justify-between p-7">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#DCE8E2]/80 pb-3.5">
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#4E203D] uppercase">
                        <BarChart3 className="h-3.5 w-3.5 text-[#4E203D]" />
                        Mikro Ölçme
                      </span>
                      <span className="font-mono text-xs text-[#4E5E57]">
                        MODÜL 03
                      </span>
                    </div>

                    <h3 className="font-editorial mt-6 text-3xl font-medium text-[#17241F]">
                      Haftalık Soru Analizi ve Kazanım Haritası
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#4E5E57] sm:text-base">
                      Türkiye geneli ve kurum içi denemelerde yalnızca toplam net
                      değil; ders ve alt kazanım bazlı doğru/yanlış/boş dağılımı
                      çıkarılır. Çözülemeyen sorular otomatik etüt listesine
                      aktarılır.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5 border-t border-[#DCE8E2] pt-5 text-xs">
                    <span className="rounded border border-[#135D43]/20 bg-[#135D43]/[0.06] px-3 py-1 font-medium text-[#135D43]">
                      TYT &amp; AYT Ayrıntılı Karne
                    </span>
                    <span className="rounded border border-[#C58B3B]/30 bg-[#C58B3B]/[0.08] px-3 py-1 font-medium text-[#9E6B24]">
                      Otomatik Etüt Eşleştirmesi
                    </span>
                    <span className="rounded border border-[#DCE8E2] bg-[#FCFBF8] px-3 py-1 font-medium text-[#17241F]">
                      Anlık Veli Bildirimi
                    </span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Bento 4 (5 cols): Birebir Akademik Kadro & 7 Ders Paketi */}
            <div className="lg:col-span-5">
              <TiltCard
                delay={0.2}
                className="border-[#DCE8E2] bg-white/85 shadow-sm backdrop-blur-xl hover:border-[#135D43]/45 hover:shadow-[0_16px_40px_rgba(19,93,67,0.10)]"
              >
                <div className="flex h-full flex-col justify-between p-7">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#DCE8E2]/80 pb-3.5">
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[#135D43] uppercase">
                        <Compass className="h-3.5 w-3.5 text-[#C58B3B]" />
                        Birebir Mentorluk &amp; Paketler
                      </span>
                      <span className="font-mono text-xs text-[#4E5E57]">
                        MODÜL 04
                      </span>
                    </div>

                    <h3 className="font-editorial mt-6 text-2xl font-medium text-[#17241F]">
                      7 Özel Ders Paketi ile Tam Uyum
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#4E5E57]">
                      Her 8 öğrenciye atanan uzman danışman ile haftalık birebir
                      değerlendirme; Mezun, Örgün, Hızlandırılmış, Özel Matematik,
                      Deneme, Etüt ve Koçluk paketlerinin tamamında standarttır.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-[#DCE8E2] pt-5">
                    {PACKAGES_HIGHLIGHT.slice(0, 5).map((name) => (
                      <span
                        key={name}
                        className="rounded border border-[#DCE8E2] bg-[#FCFBF8] px-2.5 py-1 text-[11px] text-[#4E5E57]"
                      >
                        {name}
                      </span>
                    ))}
                    <Link
                      href="/programlar"
                      className="rounded border border-[#135D43]/30 bg-[#135D43]/[0.08] px-2.5 py-1 text-[11px] font-semibold text-[#135D43] hover:bg-[#135D43]/[0.14]"
                    >
                      +2 Paket Daha →
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* GAMIFIED INTERACTIVE SIMULATOR */}
      <section className="relative z-10 pt-4 pb-16 lg:pt-6 lg:pb-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <JourneySimulator />
        </div>
      </section>
    </div>
  );
}
