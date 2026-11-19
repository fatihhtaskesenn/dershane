"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { ResultsShowcase } from "@/components/results-showcase";
import { cn } from "@/lib/utils";

type TrackFilter = "Tümü" | "SAY" | "EA" | "SÖZ";

interface HonorStudent {
  rank: string;
  name: string;
  department: string;
  track: "SAY" | "EA" | "SÖZ";
}

const RESULTS = [
  {
    figure: "42",
    label: "Türkiye İlk 1000 Derecesi",
    note: "2026 YKS Yerleştirme Sonuçları",
  },
  {
    figure: "+21.4",
    label: "Ortalama Net Artışı",
    note: "Eylül başlangıcı – Haziran finali",
  },
  {
    figure: "%98.4",
    label: "İlk 3 Tercihe Yerleşme",
    note: "Tıp, Mühendislik ve Hukuk ağırlıklı",
  },
  {
    figure: "312+",
    label: "İlk 10.000 Derecesi",
    note: "2026 YKS yerleştirme başarısı",
  },
];

const HONOR_STUDENTS: HonorStudent[] = [
  { rank: "TR 84.", name: "Defne Arslan", department: "Cerrahpaşa Tıp", track: "SAY" },
  { rank: "TR 142.", name: "Kerem Yılmaz", department: "İTÜ Bilgisayar Müh.", track: "SAY" },
  { rank: "TR 198.", name: "Zeynep Naz Kaya", department: "Galatasaray Hukuk", track: "EA" },
  { rank: "TR 245.", name: "Emirhan Demir", department: "ODTÜ Elektrik-Elektronik", track: "SAY" },
  { rank: "TR 312.", name: "Elif Sude Çelik", department: "Hacettepe Tıp", track: "SAY" },
  { rank: "TR 389.", name: "Burak Can Aydın", department: "Boğaziçi Endüstri Müh.", track: "SAY" },
  { rank: "TR 426.", name: "Sena Nur Şahin", department: "Boğaziçi İşletme", track: "EA" },
  { rank: "TR 471.", name: "Ahmet Yiğit Koç", department: "İstanbul Tıp (Çapa)", track: "SAY" },
  { rank: "TR 518.", name: "İrem Su Aksoy", department: "Koç Hukuk", track: "EA" },
  { rank: "TR 564.", name: "Mertcan Özkan", department: "Bilkent Bilgisayar Müh.", track: "SAY" },
  { rank: "TR 612.", name: "Zehra Nur Çetin", department: "Boğaziçi Tarih", track: "SÖZ" },
  { rank: "TR 649.", name: "Kaan Efe Yıldız", department: "ODTÜ Makine Müh.", track: "SAY" },
  { rank: "TR 685.", name: "Melis Karaca", department: "Ankara Tıp", track: "SAY" },
  { rank: "TR 714.", name: "Yusuf Emre Doğan", department: "İstanbul Hukuk", track: "EA" },
  { rank: "TR 748.", name: "Buse Aydınlık", department: "İTÜ Yapay Zeka Müh.", track: "SAY" },
  { rank: "TR 792.", name: "Oğuzhan Tekin", department: "Ege Tıp", track: "SAY" },
  { rank: "TR 831.", name: "Nisa Berra Polat", department: "Bilkent İktisat", track: "EA" },
  { rank: "TR 867.", name: "Taha Berk Uçar", department: "Gaziantep Tıp", track: "SAY" },
  { rank: "TR 904.", name: "Ece Su Tanrıverdi", department: "Marmara Hukuk", track: "EA" },
  { rank: "TR 942.", name: "Arda Mert Kılıç", department: "YTÜ Yazılım Müh.", track: "SAY" },
  { rank: "TR 978.", name: "Sıla Yağmur Güneş", department: "ODTÜ Psikoloji", track: "EA" },
  { rank: "TR 1.045.", name: "Furkan Alperen Taş", department: "İTÜ Uçak Müh.", track: "SAY" },
  { rank: "TR 1.120.", name: "Hira Nur Bulut", department: "İstanbul İlahiyat", track: "SÖZ" },
  { rank: "TR 1.186.", name: "Eren Can Kurt", department: "Hacettepe Diş Hek.", track: "SAY" },
  { rank: "TR 1.240.", name: "Ceren Su Yalçın", department: "Ankara SBF İktisat", track: "EA" },
];

export default function BasarilarPage() {
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("Tümü");

  const filteredStudents = HONOR_STUDENTS.filter((s) =>
    trackFilter === "Tümü" ? true : s.track === trackFilter
  );

  return (
    <div className="bg-[#F8F7F3] text-[#252A32]">
      {/* Deep Charcoal Header & GSAP Animated Metrics */}
      <ResultsShowcase
        eyebrow="2026 YKS Onur Tablosu"
        title="İstikrarlı disiplinin akademik karşılığı."
        ctaLabel="Siz de Aramıza Katılın"
        ctaHref="/iletisim"
        headingAs="h1"
      />

      {/* 5-Per-Row Compact Honor Cards */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E5DEC9] pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
                <Trophy className="h-3.5 w-3.5" />
                Derece Öğrencilerimiz
              </span>
              <h2 className="font-editorial mt-1.5 text-2xl font-medium text-[#203B5C] sm:text-3xl">
                2026 YKS Yerleştirme &amp; Sıralama Listesi
              </h2>
            </div>

            <div className="inline-flex w-fit rounded-md border border-[#E5DEC9] bg-[#FFFFFF] p-1">
              {(["Tümü", "SAY", "EA", "SÖZ"] as TrackFilter[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTrackFilter(tab)}
                  className={cn(
                    "rounded px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    trackFilter === tab
                      ? "bg-[#203B5C] text-white"
                      : "text-[#737B86] hover:text-[#203B5C]"
                  )}
                >
                  {tab === "Tümü" ? `Tümü (${HONOR_STUDENTS.length})` : tab}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Cards Per Row on Desktop */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredStudents.map((student) => (
              <div
                key={`${student.rank}-${student.name}`}
                className="group flex flex-col items-center rounded-md border border-[#E5DEC9] bg-[#FFFFFF] p-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-[#B18A52] hover:shadow-sm"
              >
                {/* Top Rank & Track Row */}
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="rounded-sm bg-[#203B5C] px-2 py-0.5 text-[11px] font-semibold text-[#E2BD82]">
                    {student.rank}
                  </span>
                  <span className="rounded-sm bg-[#F2EDE3] px-1.5 py-0.5 text-[10px] font-semibold text-[#9A743E]">
                    {student.track}
                  </span>
                </div>

                {/* Student Avatar */}
                <div className="mt-3.5 flex h-14 w-14 items-center justify-center rounded-full border border-[#E5DEC9] bg-[#F8F7F3] p-2">
                  <Image
                    src="/images/student.png"
                    alt={student.name}
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                  />
                </div>

                {/* Student Name & Department */}
                <h3 className="mt-3 text-sm font-semibold text-[#203B5C]">
                  {student.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#737B86]">
                  {student.department}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
