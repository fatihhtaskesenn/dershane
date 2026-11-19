"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";

const WHY_ITEMS = [
  {
    num: "01",
    tag: "Butik Sınıflar",
    title: "12–16 Kişilik Homojen Sınıflar",
    detail:
      "Kalabalık amfiler yerine her öğrencinin seviyesine göre oluşturulan sınıflarda birebir ilgi ve yüksek ders verimi.",
  },
  {
    num: "02",
    tag: "Yapay Zeka",
    title: "Yapay Zeka Destekli Net & Hata Analizi",
    detail:
      "Her deneme sonrasında konu bazlı eksik haritası çıkarılır; tekrar eden yanlışlara göre akıllı çalışma rotası oluşturulur.",
  },
  {
    num: "03",
    tag: "Birebir Takip",
    title: "Zorunlu Akademik Mentorluk",
    detail:
      "Her 8 öğrenciye atanan uzman danışman öğretmenle haftalık program takibi, motivasyon ve sınav stratejisi görüşmeleri.",
  },
  {
    num: "04",
    tag: "Ölçme Sistemi",
    title: "Türkiye Geneli Haftalık Deneme Maratonu",
    detail:
      "Gerçek sınav atmosferinde düzenli TYT–AYT provaları, aynı gün dijital karne ve Türkiye geneli yüzdelik dilim takibi.",
  },
  {
    num: "05",
    tag: "Etüt Disiplini",
    title: "Gözetimli Kütüphane ve Birebir Etüt",
    detail:
      "Çözülemeyen sorular için branş öğretmenleriyle birebir etüt masaları ve sessiz, ergonomik çalışma salonları.",
  },
  {
    num: "06",
    tag: "Dijital LMS",
    title: "Şeffaf Öğrenci, Veli & Yönetici Portalı",
    detail:
      "Devamsızlık, deneme grafikleri ve ders programı bilgilerine veli ve öğrenciler tarafından tek tıkla anlık erişim.",
  },
];

export function WhyDershaneSection() {
  const listRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 80%", "end 70%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <section className="border-b border-[#DCE8E2] bg-[#FCFBF8] py-12 sm:py-16 lg:py-24">
      <div className="w-full px-5 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-16">
          {/* Left Sticky Editorial Anchor */}
          <div className="lg:sticky lg:top-32 lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#C58B3B]" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#135D43] uppercase">
                Kurumsal Farkımız
              </span>
            </div>
            <h2 className="font-editorial mt-3.5 text-3xl leading-[1.12] font-medium tracking-tight text-[#0E3B2B] sm:mt-4 sm:text-5xl lg:text-[54px]">
              Neden{" "}
              <span className="italic text-[#135D43]">DERSHANE</span>{" "}
              Kurumları?
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#4E5E57] sm:mt-5 sm:text-base">
              Sıradan dershane kalıplarını geride bırakan; disiplini, yapay zeka
              destekli ölçmeyi ve birebir ilgiyi aynı çatı altında buluşturan
              eğitim sistemimizle tanışın.
            </p>

            <div className="mt-6 sm:mt-8">
              <Link
                href="/yaklasim"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-[#135D43] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E4A35] sm:w-auto"
              >
                <span>Akademik Yaklaşımımızı İncele</span>
                <ArrowRight className="h-4 w-4 text-[#E8C483] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Sequential Flowing List */}
          <div ref={listRef} className="relative pl-5 sm:pl-8 lg:col-span-7">
            {/* Background Track + Butter-Smooth Spring Progress Line */}
            <div
              className="absolute top-2 bottom-2 left-0 w-[2px] bg-[#DCE8E2]"
              aria-hidden="true"
            />
            <motion.div
              style={{ scaleY: smoothProgress }}
              className="absolute top-2 bottom-2 left-0 w-[2px] origin-top bg-gradient-to-b from-[#135D43] via-[#C58B3B] to-[#4E203D]"
              aria-hidden="true"
            />

            <div className="space-y-3.5 sm:space-y-4">
              {WHY_ITEMS.map((item) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative rounded-md border border-[#DCE8E2] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#135D43]/60 hover:shadow-[0_12px_28px_rgba(19,93,67,0.08)] sm:p-6 lg:p-7"
                >
                  {/* Timeline Node Dot */}
                  <span
                    className="absolute top-6 -left-[25px] h-3 w-3 rounded-full border-2 border-[#FCFBF8] bg-[#C58B3B] transition-colors group-hover:bg-[#135D43] sm:top-8 sm:-left-[37px]"
                    aria-hidden="true"
                  />

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="font-editorial text-xl font-medium text-[#C58B3B] transition-colors group-hover:text-[#135D43] sm:text-2xl">
                        {item.num}
                      </span>
                      <h3 className="text-base font-semibold tracking-tight text-[#0E3B2B] sm:text-lg lg:text-xl">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-[#4E5E57] uppercase">
                      {item.tag}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[#4E5E57] sm:mt-2.5 sm:text-sm">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
