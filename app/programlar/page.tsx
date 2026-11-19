"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { COURSE_PACKAGES } from "@/lib/packages-data";
import { TiltCard } from "@/components/tilt-card";
import { cn } from "@/lib/utils";
import { useCampus } from "@/lib/campus-store";

type PackageCategory = "Tümü" | "Sınıf Paketleri" | "Destek & Sınav";

const SYSTEM_PILLARS = [
  {
    icon: BarChart3,
    title: "Anlık Net & Kazanım Analizi",
    detail:
      "Her deneme sonrasında TYT ve AYT netleriniz, ders bazlı doğru/yanlış dağılımınız ve geçmiş sınavlara göre gelişim grafiğiniz sisteme işlenir.",
  },
  {
    icon: CalendarDays,
    title: "Dinamik Ders & Etüt Takvimi",
    detail:
      "Haftalık ders programınız, birebir etüt randevularınız ve yaklaşan kurumsal sınav tarihleriniz tek bir panelde düzenli olarak görünür.",
  },
  {
    icon: ShieldCheck,
    title: "Öğrenci, Veli & Yönetici Şeffaflığı",
    detail:
      "Devamsızlık durumu, danışman notları ve kurum duyuruları anlık güncellenir; öğrenci ve kurum yönetimi aynı veri üzerinden ilerler.",
  },
];

export default function ProgramlarPage() {
  const { packages } = useCampus();
  const [selectedCategory, setSelectedCategory] =
    useState<PackageCategory>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPackages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return packages.filter((pkg) => {
      const matchesCat =
        selectedCategory === "Tümü" ? true : pkg.category === selectedCategory;
      const matchesQuery =
        !q ||
        pkg.title.toLowerCase().includes(q) ||
        pkg.shortDescription.toLowerCase().includes(q) ||
        pkg.accent.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [packages, selectedCategory, searchQuery]);

  return (
    <div className="bg-[#FCFBF8] text-[#17241F]">
      {/* Welcoming Deep-Green Tinted Header + Search & Filter */}
      <section className="border-b border-[#DCE8E2] bg-gradient-to-r from-[#F0F7F4] via-[#F7FAF8] to-[#ECF5F1] py-10 lg:py-14">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-sm border border-[#135D43]/25 bg-white px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-[#C58B3B]" />
                <span className="text-[11px] font-semibold tracking-[0.16em] text-[#135D43] uppercase">
                  Ders Paketleri • 2026–2027
                </span>
              </div>
              <h1 className="font-editorial mt-3.5 text-3xl leading-tight font-medium tracking-tight text-[#0E3B2B] sm:text-4xl lg:text-5xl">
                Hedefinize özel{" "}
                <span className="italic text-[#135D43]">ders paketini</span>{" "}
                keşfedin.
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4E5E57] sm:text-base">
                Sınıf eğitiminden özel matematiğe, deneme kulübünden birebir
                koçluğa kadar tüm paketlerimizi inceleyin; detaylı müfredat
                için dilediğiniz pakete tıklayın.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium text-[#135D43]">
                <span className="rounded-sm border border-[#DCE8E2] bg-white px-3 py-1">
                  8 Özel Paket
                </span>
                <span className="rounded-sm border border-[#DCE8E2] bg-white px-3 py-1">
                  12–16 Kişilik Sınıflar
                </span>
                <span className="rounded-sm border border-[#DCE8E2] bg-white px-3 py-1">
                  Yapay Zeka &amp; LMS Dahil
                </span>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#4E5E57]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Paket ara (örn. Matematik, Mezun)..."
                  className="w-full rounded-md border border-[#DCE8E2] bg-white py-2.5 pr-4 pl-10 text-sm text-[#17241F] placeholder-[#4E5E57]/70 outline-none transition-colors focus:border-[#135D43]"
                />
              </div>

              <div className="inline-flex w-fit rounded-md border border-[#DCE8E2] bg-white p-1">
                {(
                  [
                    "Tümü",
                    "Sınıf Paketleri",
                    "Destek & Sınav",
                  ] as PackageCategory[]
                ).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedCategory(tab)}
                    className={cn(
                      "rounded px-4 py-2 text-xs font-semibold transition-all",
                      selectedCategory === tab
                        ? "bg-[#135D43] text-white"
                        : "text-[#4E5E57] hover:text-[#135D43]"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Square Package Cards Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          {filteredPackages.length === 0 ? (
            <div className="rounded-md border border-[#DCE8E2] bg-white p-12 text-center">
              <p className="font-editorial text-xl text-[#0E3B2B]">
                Aradığınız kriterlere uygun paket bulunamadı.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tümü");
                }}
                className="mt-4 rounded-md bg-[#135D43] px-4 py-2 text-xs font-semibold text-white"
              >
                Tüm Paketleri Göster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPackages.map((pkg, idx) => {
                const themeCycle = [
                  {
                    bar: "bg-[#135D43]",
                    badge: "bg-[#135D43] text-white",
                    cta: "bg-[#135D43] group-hover:bg-[#0E4A35]",
                    arrow: "text-[#E8C483]",
                  },
                  {
                    bar: "bg-[#C58B3B]",
                    badge: "bg-[#C58B3B] text-white",
                    cta: "bg-[#C58B3B] group-hover:bg-[#B07A31]",
                    arrow: "text-white",
                  },
                  {
                    bar: "bg-[#4E203D]",
                    badge: "bg-[#4E203D] text-white",
                    cta: "bg-[#4E203D] group-hover:bg-[#3D172F]",
                    arrow: "text-[#E8C483]",
                  },
                ][idx % 3];

                return (
                  <TiltCard key={pkg.slug} delay={idx * 0.04}>
                    <Link
                      href={`/programlar/${pkg.slug}`}
                      className="group flex h-full flex-col"
                    >
                      <div className={`h-1.5 w-full ${themeCycle.bar}`} />

                      {/* Square Package Image */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#EAF3EE]">
                        <Image
                          src={pkg.image}
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute top-3.5 left-3.5">
                          <span
                            className={`rounded-sm px-3 py-1 text-[10px] font-semibold tracking-wider uppercase shadow-sm ${themeCycle.badge}`}
                          >
                            {pkg.accent}
                          </span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#0E241C]/90 via-[#0E241C]/50 to-transparent px-4 pt-10 pb-3 text-white">
                          <span className="text-[11px] font-semibold tracking-[0.14em] text-[#E8C483] uppercase">
                            {pkg.code}
                          </span>
                          <span className="rounded-sm border border-white/30 bg-black/30 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-xs">
                            {pkg.scope}
                          </span>
                        </div>
                      </div>

                      {/* Richer, High-Contrast Card Body */}
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <h2 className="font-editorial text-2xl font-medium text-[#0E3B2B] transition-colors group-hover:text-[#135D43]">
                            {pkg.title}
                          </h2>

                          <p className="mt-1.5 text-[11px] font-semibold tracking-wide text-[#9A6822]">
                            {pkg.targetAudience}
                          </p>

                          <p className="mt-2.5 text-[13px] leading-relaxed text-[#4E5E57]">
                            {pkg.shortDescription}
                          </p>

                          {/* Course Hours Breakdown */}
                          <div className="mt-4 rounded-md border border-[#DCE8E2] bg-[#FCFBF8] p-3">
                            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#135D43] uppercase">
                              Ders &amp; Saat İçeriği
                            </p>
                            <div className="mt-2 space-y-1.5">
                              {pkg.courseHours.map((ch) => (
                                <div
                                  key={ch.subject}
                                  className="flex items-center justify-between gap-2 text-[11px]"
                                >
                                  <span className="truncate font-medium text-[#17241F]">
                                    {ch.subject}
                                  </span>
                                  <span className="shrink-0 font-semibold text-[#9A6822]">
                                    {ch.hours}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <ul className="mt-4 space-y-2 border-t border-[#DCE8E2] pt-4">
                            {pkg.highlights.slice(0, 3).map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-xs font-medium text-[#17241F]"
                              >
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#135D43]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Bold Campaign-Style CTA Bar */}
                        <div
                          className={`mt-6 flex items-center justify-between rounded-md px-4 py-3 text-xs font-semibold text-white transition-colors ${themeCycle.cta}`}
                        >
                          <span>Paketi İncele</span>
                          <ArrowRight
                            className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${themeCycle.arrow}`}
                          />
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Dijital Öğrenci & Yönetim Sistemi (LMS) Section */}
      <section className="border-t border-[#DCE8E2] bg-gradient-to-b from-[#FCFBF8] to-[#EAF3EE] py-20 text-[#17241F]">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="border-b border-[#D2E2DA] pb-10">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[#C58B3B] uppercase">
                Entegre Dijital Altyapı
              </p>
              <h2 className="font-editorial mt-3 text-3xl font-medium tracking-tight text-[#0E3B2B] sm:text-4xl">
                Tüm paketlere dahil: DERSHANE Akıllı Takip Sistemi.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4E5E57] sm:text-base">
                Kurumumuzda aldığınız her ders paketi, web tabanlı Öğrenci ve
                Yönetim Portalımız ile entegre çalışır. Gelişiminizi yalnızca
                sınıfta değil, dijital ortamda da adım adım izlersiniz.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {SYSTEM_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-md border border-[#DCE8E2] bg-white p-7"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-[#135D43]/25 bg-[#E7F3EE] text-[#135D43]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-editorial mt-5 text-xl font-medium text-[#0E3B2B]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#4E5E57]">
                    {pillar.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
