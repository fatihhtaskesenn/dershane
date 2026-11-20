"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AcademicMarquee } from "@/components/academic-marquee";
import { HomeEcosystemBand } from "@/components/home-ecosystem-band";
import { WhyDershaneSection } from "@/components/why-dershane-section";
import { InstagramReelsSection } from "@/components/instagram-reels-section";
import { useCampus } from "@/lib/campus-store";

interface FeaturedStudent {
  rank: string;
  name: string;
  department: string;
  track: "SAY" | "EA" | "SÖZ";
  image: string;
}

const FEATURED_HONOR_STUDENTS: FeaturedStudent[] = [
  {
    rank: "TR 84.",
    name: "Defne Arslan",
    department: "Cerrahpaşa Tıp",
    track: "SAY",
    image: "/images/ogrenciler/ogr6.png",
  },
  {
    rank: "TR 142.",
    name: "Kerem Yılmaz",
    department: "İTÜ Bilgisayar Müh.",
    track: "SAY",
    image: "/images/ogrenciler/ogr1.png",
  },
  {
    rank: "TR 198.",
    name: "Zeynep Naz Kaya",
    department: "Galatasaray Hukuk",
    track: "EA",
    image: "/images/ogrenciler/ogr2.png",
  },
  {
    rank: "TR 245.",
    name: "Emirhan Demir",
    department: "ODTÜ Elektrik-Elektronik",
    track: "SAY",
    image: "/images/ogrenciler/ogr3.png",
  },
  {
    rank: "TR 312.",
    name: "Elif Sude Çelik",
    department: "Hacettepe Tıp",
    track: "SAY",
    image: "/images/ogrenciler/ogr4.png",
  },
];

export default function HomePage() {
  const { siteContent } = useCampus();
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasLeftHeroRef = useRef(false);

  useEffect(() => {
    const heroEl = heroRef.current;
    const videoEl = videoRef.current;
    if (!heroEl || !videoEl) return;

    // Start video from the beginning on mount/refresh
    videoEl.currentTime = 0;
    videoEl.play().catch(() => {});

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          hasLeftHeroRef.current = true;
          videoEl.pause();
        } else if (hasLeftHeroRef.current) {
          hasLeftHeroRef.current = false;
          videoEl.currentTime = 0;
          videoEl.play().catch(() => {});
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#FCFBF8] text-[#1E242E]">
      {/* HERO: Full-Bleed Intro Video — Holds Final Frame, Replays on Refresh or Scroll Back Up */}
      <section
        ref={heroRef}
        className="relative flex min-h-[70svh] w-full items-end overflow-hidden bg-[#18191C] sm:min-h-[calc(100svh-98px)] lg:min-h-[calc(100svh-114px)]"
      >
        <video
          ref={videoRef}
          src="/videos/dershanevideogiris.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* Soft Feathered Bottom Dissolve Into Trust Ribbon (#F0F7F4) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[#F0F7F4]/55 to-[#F0F7F4] sm:h-40"
          aria-hidden="true"
        />

        {/* Minimal Single-Line Headline Directly Over Video */}
        <div className="relative z-10 w-full px-5 pb-10 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-editorial max-w-3xl border-l-2 border-[#D4AF7A] pl-3.5 text-2xl leading-tight font-medium tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:pl-4 sm:text-4xl lg:text-[42px]"
          >
            {siteContent.heroTitlePrefix}{" "}
            <span className="italic text-[#E2BD82]">
              {siteContent.heroTitleAccent}
            </span>{" "}
            {siteContent.heroTitleSuffix}
          </motion.h1>
        </div>
      </section>

      {/* INFINITE SCROLLING MARQUEE RIGHT BELOW VIDEO */}
      <AcademicMarquee />

      {/* INSTAGRAM REELS LOOPING SHOWCASE */}
      <InstagramReelsSection />

      {/* NEDEN DERSHANE KURUMLARI? SEQUENTIAL FLOWING SECTION */}
      <WhyDershaneSection />

      {/* BELOW-THE-VIDEO CLEAN & CLASSY FLOW */}
      <div className="bg-gradient-to-b from-[#FCFBF8] via-[#F7FAF8] to-[#F2F7F4]">
        {/* FEATURED HONOR STUDENTS SHOWCASE */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="w-full px-5 sm:px-10 lg:px-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-between gap-5 border-b border-[#DCE8E2] pb-6 sm:pb-8 md:flex-row md:items-end"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-7 bg-[#C58B3B]" aria-hidden="true" />
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-[#135D43] uppercase">
                    2026 YKS Onur Tablosu
                  </span>
                </div>
                <h2 className="font-editorial mt-3 text-3xl font-medium tracking-tight text-[#0E3B2B] sm:text-4xl lg:text-5xl">
                  Derece Öğrencilerimiz.
                </h2>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className="max-w-md text-sm leading-relaxed text-[#4E5E57] md:text-right">
                  Disiplinli çalışma ve birebir akademik mentorluk ile Türkiye
                  derecesi elde eden öğrencilerimizden öne çıkanlar.
                </p>
                <Link
                  href="/basarilar"
                  className="inline-flex items-center gap-2 rounded-md border border-[#135D43]/25 bg-[#135D43] px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[#0E4A35]"
                >
                  <span>Tüm Başarıları İncele</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#E8C483]" />
                </Link>
              </div>
            </motion.div>

            {/* Mobile Continuous Marquee Strip (< md) */}
            <div className="relative -mx-5 mt-7 overflow-hidden py-2 md:hidden">
              <div className="animate-marquee items-stretch">
                {[...siteContent.honorStudents, ...siteContent.honorStudents].map(
                  (student, idx) => (
                    <div
                      key={`mobile-marquee-${idx}-${student.rank}-${student.name}`}
                      className="mr-3.5 flex w-[210px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#DCE8E2] bg-white shadow-[0_10px_28px_rgba(14,59,43,0.06)]"
                    >
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#135D43] via-[#C58B3B] to-[#135D43]" />
                      <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-gradient-to-b from-[#EDF5F1] via-[#F7FAF8] to-[#FFFFFF]">
                        <div className="absolute top-2.5 right-2.5 left-2.5 z-10 flex items-center justify-between gap-1.5">
                          <span className="rounded-md bg-[#0E3B2B] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#E8C483] shadow-sm">
                            {student.rank}
                          </span>
                          <span className="rounded-md border border-[#DCE8E2] bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#135D43] backdrop-blur-sm">
                            {student.track}
                          </span>
                        </div>
                        <Image
                          src={student.image}
                          alt={student.name}
                          fill
                          className="object-cover object-top pt-3"
                          sizes="210px"
                        />
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between border-t border-[#DCE8E2]/60 bg-white px-3 pt-2.5 pb-3.5 text-center">
                        <h3 className="font-editorial text-base font-semibold tracking-tight text-[#0E3B2B]">
                          {student.name}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#C58B3B]">
                          {student.department}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Large Eye-Catching Honor Cards — 3-up on Tablet, 5-up on Desktop */}
            <div className="mt-8 hidden gap-5 sm:mt-10 md:grid md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
              {siteContent.honorStudents.map((student, idx) => (
                <motion.div
                  key={`${student.rank}-${student.name}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-[#DCE8E2] bg-white shadow-[0_10px_28px_rgba(14,59,43,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C58B3B] hover:shadow-[0_22px_44px_rgba(19,93,67,0.14)]"
                >
                  {/* Top Gold & Emerald Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#135D43] via-[#C58B3B] to-[#135D43]" />

                  {/* Large Portrait Showcase Area */}
                  <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-gradient-to-b from-[#EDF5F1] via-[#F7FAF8] to-[#FFFFFF]">
                    {/* Subtle Studio Spotlight Behind Portrait */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(19,93,67,0.12),rgba(197,139,59,0.06)_55%,transparent_80%)]"
                      aria-hidden="true"
                    />

                    {/* Top Rank & Track Badges */}
                    <div className="absolute top-2.5 right-2.5 left-2.5 z-10 flex items-center justify-between gap-1.5 sm:top-3.5 sm:right-3.5 sm:left-3.5 sm:gap-2">
                      <span className="rounded-md bg-[#0E3B2B] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#E8C483] shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
                        {student.rank}
                      </span>
                      <span className="rounded-md border border-[#DCE8E2] bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#135D43] backdrop-blur-sm sm:px-2 sm:text-[11px]">
                        {student.track}
                      </span>
                    </div>

                    <Image
                      src={student.image}
                      alt={student.name}
                      fill
                      className="object-cover object-top pt-3 transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Soft Bottom Fade Into Card Info */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent sm:h-10"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Student Name & Department */}
                  <div className="flex flex-1 flex-col justify-between border-t border-[#DCE8E2]/60 bg-white px-3 pt-2.5 pb-4 text-center sm:px-5 sm:pt-3 sm:pb-5">
                    <h3 className="font-editorial text-base font-semibold tracking-tight text-[#0E3B2B] transition-colors group-hover:text-[#135D43] sm:text-xl">
                      {student.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#C58B3B] sm:text-sm">
                      {student.department}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AESTHETIC INSTITUTIONAL ECOSYSTEM BAND */}
        <HomeEcosystemBand />
      </div>
    </div>
  );
}
