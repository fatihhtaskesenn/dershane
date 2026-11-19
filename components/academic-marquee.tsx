"use client";

import React from "react";

const MARQUEE_ITEMS = [
  "Deneme Sınavları",
  "Birebir Etütler",
  "Güven",
  "Disiplin",
  "YKS",
  "TYT",
  "AYT",
  "Yapay Zeka Net Analizi",
  "Birebir Akademik Koçluk",
  "Türkiye Geneli Denemeler",
  "Rasyonel Rehberlik Sistemi",
  "12–16 Kişilik Sınıflar",
];

export function AcademicMarquee() {
  return (
    <div className="relative w-full overflow-hidden border-y border-[#DCE8E2] bg-transparent py-3.5 text-[#0E3B2B] sm:py-5">
      <div className="animate-marquee items-center">
        {[0, 1].map((dupIdx) => (
          <div key={dupIdx} className="flex shrink-0 flex-row items-center">
            {MARQUEE_ITEMS.map((item) => (
              <div
                key={`${dupIdx}-${item}`}
                className="flex shrink-0 items-center gap-5 px-3.5 sm:gap-10 sm:px-7"
              >
                <span className="font-editorial text-lg font-medium tracking-tight whitespace-nowrap text-[#0E3B2B] sm:text-2xl lg:text-3xl">
                  {item}
                </span>
                <span
                  className="text-sm text-[#C58B3B] select-none sm:text-lg"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
