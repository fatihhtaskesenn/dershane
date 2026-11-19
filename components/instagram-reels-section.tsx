"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface ReelItem {
  id: string;
  title: string;
  category: string;
  views: string;
  videoSrc: string;
  poster: string;
  instagramUrl: string;
}

const DERSHANE_REELS: ReelItem[] = [
  {
    id: "reel-1",
    title: "Sabah Etüt & Soru Çözüm Maratonu",
    category: "Kampüs Yaşamı",
    views: "18.4B",
    videoSrc: "/videos/girisvideo.mp4",
    poster: "/images/1dershane.jpeg",
    instagramUrl: "https://www.instagram.com/reels/",
  },
  {
    id: "reel-2",
    title: "Türkiye Geneli TYT Deneme Günü",
    category: "Ölçme & Analiz",
    views: "24.1B",
    videoSrc: "/videos/dershanevideogiris.mp4",
    poster: "/images/2dershane.jpeg",
    instagramUrl: "https://www.instagram.com/reels/",
  },
  {
    id: "reel-3",
    title: "Birebir Akademik Koçluk & Konu Takibi",
    category: "Rehberlik",
    views: "15.9B",
    videoSrc: "/videos/girisvideo.mp4",
    poster: "/images/mentoring-session.jpg",
    instagramUrl: "https://www.instagram.com/reels/",
  },
  {
    id: "reel-4",
    title: "2026 YKS Derece Öğrencilerimizden Notlar",
    category: "Başarı Hikayesi",
    views: "32.7B",
    videoSrc: "/videos/dershanevideogiris.mp4",
    poster: "/images/hero-academy.jpg",
    instagramUrl: "https://www.instagram.com/reels/",
  },
];

export function InstagramReelsSection() {
  const [unmutedId, setUnmutedId] = useState<string | null>(null);

  return (
    <section className="border-b border-[#DCE8E2] bg-[#FCFBF8] py-10 sm:py-14">
      <div className="w-full px-5 sm:px-10 lg:px-14">
        {/* Section Header */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">
                <InstagramIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#135D43] uppercase">
                @dershane.kurumlari • Instagram Reels
              </span>
            </div>
            <h2 className="font-editorial mt-1.5 text-2xl font-medium text-[#11284B] sm:text-3xl">
              Kampüsten Günlük Kesitler
            </h2>
          </div>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#11284B]/15 bg-white px-4 py-2 text-xs font-semibold text-[#11284B] shadow-2xs transition hover:border-[#DD2A7B]/40 hover:text-[#DD2A7B]"
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            <span>Instagram&apos;da Takip Et</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>

        {/* 4 Vertical 9:16 Looping Reel Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {DERSHANE_REELS.map((reel, idx) => {
            const isMuted = unmutedId !== reel.id;
            return (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-[#11284B]/10 bg-[#18191C] shadow-sm"
              >
                <video
                  src={reel.videoSrc}
                  poster={reel.poster}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Top & Bottom Gradients */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80"
                  aria-hidden="true"
                />

                {/* Top Controls */}
                <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <Play className="h-2.5 w-2.5 fill-white" />
                    <span>{reel.category}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setUnmutedId((prev) =>
                        prev === reel.id ? null : reel.id
                      )
                    }
                    aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70"
                  >
                    {isMuted ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5 text-[#E2BD82]" />
                    )}
                  </button>
                </div>

                {/* Bottom Caption & Link */}
                <div className="absolute inset-x-3 bottom-3 space-y-1.5 text-white sm:inset-x-4 sm:bottom-4">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm">
                    {reel.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-white/80 sm:text-[11px]">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Play className="h-3 w-3" /> {reel.views} izlenme
                    </span>
                    <a
                      href={reel.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#E2BD82] hover:underline"
                    >
                      <span>Reels</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
