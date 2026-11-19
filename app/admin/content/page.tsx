"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Image as ImageIcon,
  Mail,
  Package,
  Phone,
  Sparkles,
  Video,
} from "lucide-react";
import {
  useCampus,
  type FeaturedHonorStudent,
  type InstagramReelItem,
} from "@/lib/campus-store";

const CAMPUS_IMAGES = [
  { label: "Derslik 1", value: "/images/1dershane.jpeg" },
  { label: "Sınıf Ortamı", value: "/images/2dershane.jpeg" },
  { label: "Birebir Danışmanlık", value: "/images/3dershane.jpeg" },
  { label: "Kampüs Koridoru", value: "/images/4dershane.jpeg" },
];

const STUDENT_PORTRAITS = [
  { label: "Portre 1 (Erkek)", value: "/images/ogrenciler/ogr1.png" },
  { label: "Portre 2 (Kadın)", value: "/images/ogrenciler/ogr2.png" },
  { label: "Portre 3 (Erkek)", value: "/images/ogrenciler/ogr3.png" },
  { label: "Portre 4 (Kadın)", value: "/images/ogrenciler/ogr4.png" },
  { label: "Portre 5 (Kadın)", value: "/images/ogrenciler/ogr6.png" },
];

export default function AdminSiteManagePage() {
  const {
    siteContent,
    packages,
    contactMessages,
    updateSiteContent,
    updatePackage,
    toggleContactMessageStatus,
  } = useCampus();

  const [selectedSlug, setSelectedSlug] = useState(packages[0]?.slug ?? "");
  const selectedPkg =
    packages.find((p) => p.slug === selectedSlug) ?? packages[0];

  const handleHonorChange = (
    idx: number,
    patch: Partial<FeaturedHonorStudent>
  ) => {
    const next = siteContent.honorStudents.map((item, i) =>
      i === idx ? { ...item, ...patch } : item
    );
    updateSiteContent({ honorStudents: next });
  };

  const reelsList: InstagramReelItem[] = siteContent.instagramReels ?? [
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

  const handleReelChange = (
    idx: number,
    patch: Partial<InstagramReelItem>
  ) => {
    const next = reelsList.map((item, i) =>
      i === idx ? { ...item, ...patch } : item
    );
    updateSiteContent({ instagramReels: next });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Siteyi Yönet &amp; Gelen Talepler
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
          Site Görselleri, Paketler &amp; İletişim Mesajları
        </h1>
      </div>

      {/* 1. Incoming Contact Messages from /iletisim */}
      <section className="rounded-xl border border-[#DCE4EE] bg-white p-6">
        <div className="flex items-center justify-between border-b border-[#E9EBEE] pb-3">
          <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
            <Mail className="h-5 w-5 text-[#135D43]" />
            <span>
              İletişim Sayfasından Gelen Mesajlar ({contactMessages.length})
            </span>
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {contactMessages.map((msg) => (
            <div
              key={msg.id}
              className="flex flex-col justify-between rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] p-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#9A743E]">
                    {msg.grade}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      msg.status === "Yeni"
                        ? "bg-[#135D43] text-white"
                        : "bg-[#EBF5F0] text-[#1E6B52]"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-[#203B5C]">{msg.name}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#135D43]">
                  <Phone className="h-3 w-3" />
                  {msg.phone}
                </p>
                <p className="mt-2 rounded bg-white p-2.5 text-xs text-[#252A32]">
                  {msg.note || "Not bırakılmadı."}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#737B86]">
                <span>{msg.createdAt}</span>
                <button
                  type="button"
                  onClick={() => toggleContactMessageStatus(msg.id)}
                  className="inline-flex items-center gap-1 rounded border border-[#DCE4EE] bg-white px-2.5 py-1 font-semibold text-[#203B5C] hover:border-[#135D43]"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    {msg.status === "Yeni"
                      ? "Görüşüldü İşaretle"
                      : "Yeni Yap"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Site Photos & Honor Students */}
      <section className="rounded-xl border border-[#DCE4EE] bg-white p-6">
        <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
          <Sparkles className="h-5 w-5 text-[#B18A52]" />
          <span>Ana Sayfa Görselleri &amp; Derece Öğrencileri</span>
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CAMPUS_IMAGES.map((img) => {
            const active = siteContent.ecosystemBannerImage === img.value;
            return (
              <button
                key={img.value}
                type="button"
                onClick={() =>
                  updateSiteContent({ ecosystemBannerImage: img.value })
                }
                className={`overflow-hidden rounded-lg border p-1.5 text-left ${
                  active
                    ? "border-[#135D43] bg-[#F0F7F4]"
                    : "border-[#E9EBEE] bg-white"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded">
                  <Image
                    src={img.value}
                    alt={img.label}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <p className="mt-1 text-center text-[11px] font-semibold text-[#203B5C]">
                  {img.label}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {siteContent.honorStudents.map((stu, idx) => (
            <div
              key={idx}
              className="space-y-2 rounded-lg border border-[#E5DEC9] bg-[#FCFBF8] p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border bg-white">
                  <Image
                    src={stu.image}
                    alt={stu.name}
                    fill
                    className="object-cover object-top"
                    sizes="44px"
                  />
                </div>
                <select
                  value={stu.image}
                  onChange={(e) =>
                    handleHonorChange(idx, { image: e.target.value })
                  }
                  className="flex-1 rounded border border-[#DCE4EE] bg-white px-2 py-1 text-xs"
                >
                  {STUDENT_PORTRAITS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={stu.rank}
                  onChange={(e) =>
                    handleHonorChange(idx, { rank: e.target.value })
                  }
                  className="rounded border bg-white px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  value={stu.name}
                  onChange={(e) =>
                    handleHonorChange(idx, { name: e.target.value })
                  }
                  className="rounded border bg-white px-2 py-1 text-xs"
                />
              </div>
              <input
                type="text"
                value={stu.department}
                onChange={(e) =>
                  handleHonorChange(idx, { department: e.target.value })
                }
                className="w-full rounded border bg-white px-2 py-1 text-xs"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Education Packages Editor */}
      <section className="rounded-xl border border-[#DCE4EE] bg-white p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E9EBEE] pb-3 sm:flex-row sm:items-center">
          <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
            <Package className="h-5 w-5 text-[#135D43]" />
            <span>Eğitim Paketlerini Düzenle</span>
          </h2>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold"
          >
            {packages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.code} — {p.title}
              </option>
            ))}
          </select>
        </div>

        {selectedPkg && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={selectedPkg.title}
              onChange={(e) =>
                updatePackage(selectedPkg.slug, { title: e.target.value })
              }
              className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={selectedPkg.scope}
              onChange={(e) =>
                updatePackage(selectedPkg.slug, { scope: e.target.value })
              }
              className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              value={selectedPkg.shortDescription}
              onChange={(e) =>
                updatePackage(selectedPkg.slug, {
                  shortDescription: e.target.value,
                })
              }
              className="rounded border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2 text-sm sm:col-span-2"
            />
          </div>
        )}
      </section>

      {/* 4. Instagram Reels Videos (4 Slots) */}
      <section className="rounded-xl border border-[#DCE4EE] bg-white p-6">
        <div className="flex flex-col justify-between gap-2 border-b border-[#E9EBEE] pb-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
              <Video className="h-5 w-5 text-[#135D43]" />
              <span>Anasayfa Instagram Reels Videoları (4 Bölüm)</span>
            </h2>
            <p className="mt-0.5 text-xs text-[#737B86]">
              Her bölüm için doğrudan <code>.mp4</code> video yolu/linki veya{" "}
              <code>https://www.instagram.com/reel/...</code> bağlantısı girebilirsiniz. Değişiklikler anında anasayfaya yansır.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {reelsList.slice(0, 4).map((reel, idx) => (
            <div
              key={reel.id}
              className="space-y-2.5 rounded-xl border border-[#E5DEC9] bg-[#FCFBF8] p-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#11284B] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {idx + 1}. Video Bölümü
                </span>
                <span className="text-[11px] text-[#737B86]">
                  {reel.views} izlenme
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                    Video Başlığı
                  </label>
                  <input
                    type="text"
                    value={reel.title}
                    onChange={(e) =>
                      handleReelChange(idx, { title: e.target.value })
                    }
                    className="w-full rounded border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                    Kategori Etiketi
                  </label>
                  <input
                    type="text"
                    value={reel.category}
                    onChange={(e) =>
                      handleReelChange(idx, { category: e.target.value })
                    }
                    className="w-full rounded border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                  Video Linki (.mp4 veya Instagram Reel URL)
                </label>
                <input
                  type="text"
                  value={reel.videoSrc}
                  onChange={(e) =>
                    handleReelChange(idx, { videoSrc: e.target.value })
                  }
                  placeholder="/videos/girisvideo.mp4 veya https://www.instagram.com/reel/..."
                  className="w-full rounded border border-[#DCE4EE] bg-white px-2.5 py-1.5 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                    Instagram Reels Bağlantısı
                  </label>
                  <input
                    type="text"
                    value={reel.instagramUrl}
                    onChange={(e) =>
                      handleReelChange(idx, { instagramUrl: e.target.value })
                    }
                    className="w-full rounded border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-[11px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-[#64748B]">
                    Kapak Görseli
                  </label>
                  <select
                    value={reel.poster}
                    onChange={(e) =>
                      handleReelChange(idx, { poster: e.target.value })
                    }
                    className="w-full rounded border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-[11px]"
                  >
                    {CAMPUS_IMAGES.map((img) => (
                      <option key={img.value} value={img.value}>
                        {img.label}
                      </option>
                    ))}
                    <option value="/images/mentoring-session.jpg">
                      Akademik Danışmanlık
                    </option>
                    <option value="/images/hero-academy.jpg">
                      Akademi Kampüs
                    </option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
