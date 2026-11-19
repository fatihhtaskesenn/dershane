"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  id: string;
  targetValue: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
}

const STATS: StatItem[] = [
  {
    id: "stat-rank",
    targetValue: 42,
    decimals: 0,
    label: "Türkiye İlk 1000 Derecesi",
    note: "2026 YKS Yerleştirme Sonuçları",
  },
  {
    id: "stat-net",
    targetValue: 21.4,
    decimals: 1,
    prefix: "+",
    label: "Ortalama Net Artışı",
    note: "Eylül başlangıcı – Haziran finali",
  },
  {
    id: "stat-placement",
    targetValue: 98.4,
    decimals: 1,
    prefix: "%",
    label: "İlk 3 Tercihe Yerleşme",
    note: "Tıp, Mühendislik ve Hukuk ağırlıklı",
  },
  {
    id: "stat-top10k",
    targetValue: 312,
    decimals: 0,
    suffix: "+",
    label: "İlk 10.000 Derecesi",
    note: "2026 YKS yerleştirme başarısı",
  },
];

interface ResultsShowcaseProps {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  headingAs?: "h1" | "h2";
}

export function ResultsShowcase({
  eyebrow,
  title,
  ctaLabel,
  ctaHref,
  headingAs = "h2",
}: ResultsShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(".gsap-header-item", {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(".gsap-stat-card", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".gsap-stats-grid",
          start: "top 88%",
          once: true,
        },
      });

      STATS.forEach((stat) => {
        const numEl = el.querySelector(`[data-stat-id="${stat.id}"]`);
        if (!numEl) return;

        const counter = { val: 0 };
        gsap.to(counter, {
          val: stat.targetValue,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-stats-grid",
            start: "top 88%",
            once: true,
          },
          onUpdate: () => {
            const formatted =
              stat.decimals > 0
                ? counter.val.toFixed(stat.decimals)
                : Math.round(counter.val).toString();
            numEl.textContent = `${stat.prefix ?? ""}${formatted}${stat.suffix ?? ""}`;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current || !spotlightRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(spotlightRef.current, {
      x: x - 180,
      y: y - 180,
      opacity: 1,
      duration: 0.45,
      ease: "power2.out",
    });
  };

  const handleSectionMouseLeave = () => {
    if (!spotlightRef.current) return;
    gsap.to(spotlightRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const line = card.querySelector(".stat-accent-line");
    const num = card.querySelector(".stat-number");

    gsap.to(card, {
      y: -5,
      duration: 0.3,
      ease: "power2.out",
    });
    if (line) {
      gsap.to(line, {
        scaleX: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    }
    if (num) {
      gsap.to(num, {
        scale: 1.04,
        color: "#0E4A35",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const line = card.querySelector(".stat-accent-line");
    const num = card.querySelector(".stat-number");

    gsap.to(card, {
      y: 0,
      duration: 0.35,
      ease: "power2.out",
    });
    if (line) {
      gsap.to(line, {
        scaleX: 0.28,
        duration: 0.35,
        ease: "power2.out",
      });
    }
    if (num) {
      gsap.to(num, {
        scale: 1,
        color: "#135D43",
        duration: 0.35,
        ease: "power2.out",
      });
    }
  };

  const HeadingTag = headingAs;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      onMouseLeave={handleSectionMouseLeave}
      className="relative overflow-hidden border-b border-[#DCE8E2] bg-gradient-to-r from-[#FCFBF8] via-[#F2F7F4] to-[#EAF3EE] py-6 text-[#17241F] sm:py-8"
    >
      {/* Soft Deep-Green Mouse-Following Depth */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute top-0 left-0 h-[260px] w-[260px] rounded-full bg-[#135D43]/10 opacity-0 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left: Compact Editorial Title & CTA */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end lg:col-span-4 lg:flex-col lg:items-start">
            <div>
              <div className="gsap-header-item flex items-center gap-2.5">
                <span className="h-px w-6 bg-[#C58B3B]" aria-hidden="true" />
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#135D43] uppercase">
                  {eyebrow}
                </p>
              </div>
              <HeadingTag className="gsap-header-item font-editorial mt-1.5 text-2xl leading-tight font-medium tracking-tight text-[#0E3B2B] sm:text-3xl">
                {title}
              </HeadingTag>
            </div>

            <Link
              href={ctaHref}
              className="gsap-header-item group inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-[#135D43] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0E4A35]"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#E8C483] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Right: Compact 4-Column Eye-Catching Metrics Strip (1/3 Footprint) */}
          <div className="gsap-stats-grid grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
            {STATS.map((stat) => (
              <div
                key={stat.id}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
                className="gsap-stat-card cursor-default rounded-md border border-[#DCE8E2] bg-white/90 px-4 py-3.5 shadow-2xs backdrop-blur-xs transition-colors duration-200 hover:border-[#C58B3B] hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    data-stat-id={stat.id}
                    className="stat-number font-editorial origin-left text-2xl font-semibold text-[#135D43] sm:text-3xl"
                  >
                    {stat.prefix ?? ""}
                    {stat.targetValue}
                    {stat.suffix ?? ""}
                  </p>
                  <span
                    className="stat-accent-line h-1 w-6 origin-left scale-x-28 rounded-full bg-[#C58B3B]"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-1.5 text-xs font-semibold text-[#0E3B2B]">
                  {stat.label}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#4E5E57]">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
