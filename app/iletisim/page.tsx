"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useCampus } from "@/lib/campus-store";

const CAMPUS_GALLERY = [
  {
    src: "/images/1dershane.jpeg",
    title: "Modern Derslikler & Akıllı Tahta",
    tag: "Eğitim Ortamı",
  },
  {
    src: "/images/2dershane.jpeg",
    title: "Homojen Grup Dersleri",
    tag: "Sınıf İçi Etkileşim",
  },
  {
    src: "/images/3dershane.jpeg",
    title: "Birebir Akademik Danışmanlık",
    tag: "Koçluk & Takip",
  },
  {
    src: "/images/4dershane.jpeg",
    title: "Gaziantep Merkez Kampüs",
    tag: "Öğrenci Yaşam Alanı",
  },
];

export default function IletisimPage() {
  const { addContactMessage } = useCampus();
  const [submitted, setSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGrade, setFormGrade] = useState("12. Sınıf (YKS)");
  const [formNote, setFormNote] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAMPUS_GALLERY.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    addContactMessage({
      name: formName.trim(),
      phone: formPhone.trim(),
      grade: formGrade,
      note: formNote.trim(),
    });
    setSubmitted(true);
  };

  const currentSlide = CAMPUS_GALLERY[activeSlide];

  return (
    <div className="bg-[#FFFFFF] text-[#252A32]">
      {/* Top Seamless Auto-Sliding Campus Visuals */}
      <section className="bg-[#FFFFFF]">
        <div className="mx-auto max-w-[1440px] px-0 sm:px-6 lg:px-14">
          <div className="relative h-[300px] w-full overflow-hidden bg-[#FFFFFF] sm:h-[420px] lg:h-[520px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.src}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={currentSlide.src}
                  alt={currentSlide.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1440px) 100vw, 1440px"
                />
              </motion.div>
            </AnimatePresence>

            {/* Feathered Transparent Edge Masks Blending Seamlessly Into #FFFFFF */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-[#FFFFFF]/80 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/65 to-transparent sm:h-40"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#FFFFFF] to-transparent sm:w-28"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#FFFFFF] to-transparent sm:w-28"
              aria-hidden="true"
            />

            {/* Editorial Caption & Minimal Dot Indicators */}
            <div className="absolute right-6 bottom-5 left-6 z-20 flex items-end justify-between gap-4 sm:right-10 sm:bottom-7 sm:left-10">
              <p className="font-editorial text-xl font-medium tracking-tight text-[#203B5C] sm:text-2xl lg:text-3xl">
                {currentSlide.title}
              </p>

              <div className="flex items-center gap-1.5 pb-1">
                {CAMPUS_GALLERY.map((slide, idx) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`${slide.title} görseline geç`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide
                        ? "w-7 bg-[#135D43]"
                        : "w-1.5 bg-[#203B5C]/25 hover:bg-[#B18A52]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form & Campus Info */}
      <section className="bg-[#FFFFFF] py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left: Contact Details + Gaziantep Merkez Map + Photo */}
            <div className="space-y-7 lg:col-span-5">
              <div className="space-y-3.5 border-b border-[#E9EBEE] pb-6 text-sm text-[#252A32]">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B18A52]" />
                  <span>
                    <span className="font-semibold text-[#203B5C]">Konum:</span>{" "}
                    Gaziantep Merkez
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-[#B18A52]" />
                  <span>
                    <span className="font-semibold text-[#203B5C]">
                      Telefon:
                    </span>{" "}
                    +90 (342) 555 48 27
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-[#B18A52]" />
                  <span>
                    <span className="font-semibold text-[#203B5C]">
                      E-posta:
                    </span>{" "}
                    bilgi@dershane.edu.tr
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-[#B18A52]" />
                  <span>
                    <span className="font-semibold text-[#203B5C]">
                      Ziyaret Saatleri:
                    </span>{" "}
                    Pazartesi – Cumartesi, 09:00 – 18:30
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://instagram.com/dershane"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-[#E5DEC9] bg-[#F8F7F3] px-3 py-1.5 text-xs font-medium text-[#203B5C] transition-colors hover:border-[#B18A52] hover:bg-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 text-[#B18A52]"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>@dershane</span>
                  </a>
                  <a
                    href="https://facebook.com/dershane"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-[#E5DEC9] bg-[#F8F7F3] px-3 py-1.5 text-xs font-medium text-[#203B5C] transition-colors hover:border-[#B18A52] hover:bg-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 text-[#B18A52]"
                      aria-hidden="true"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span>@dershane</span>
                  </a>
                </div>
              </div>

              {/* Gaziantep Merkez Map */}
              <div className="rounded-md border border-[#E5DEC9] bg-[#F8F7F3] p-2.5">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-[#E9EBEE]">
                  <iframe
                    title="DERSHANE Gaziantep Merkez Konumu"
                    src="https://www.google.com/maps?q=Gaziantep+Merkez&output=embed"
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex items-center justify-between px-1.5 pt-2.5 pb-1 text-xs">
                  <span className="text-[#737B86]">Gaziantep Merkez</span>
                  <a
                    href="https://maps.google.com/?q=Gaziantep+Merkez"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#203B5C] hover:text-[#B18A52]"
                  >
                    Haritada Aç →
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Ön Görüşme Form */}
            <div className="lg:col-span-7">
              <div className="rounded-md border border-[#E5DEC9] bg-[#F8F7F3] p-7 sm:p-10">
                <div className="mb-6 border-b border-[#E5DEC9] pb-4">
                  <h2 className="font-editorial text-2xl font-medium text-[#203B5C]">
                    Ön Görüşme &amp; Seviye Analizi Formu
                  </h2>
                  <p className="mt-1 text-xs text-[#737B86]">
                    Bilgilerinizi bırakın, akademik danışmanlarımız aynı gün
                    içinde dönüş yapsın.
                  </p>
                </div>

                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#1E6B52]/30 bg-[#EBF5F0] text-[#1E6B52]">
                      <Check className="h-5 w-5" />
                    </div>
                    <h3 className="font-editorial mt-4 text-2xl font-medium text-[#203B5C]">
                      Randevu Talebiniz Kaydedildi
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[#737B86]">
                      Sayın {formName}, eğitim danışmanlarımız en kısa sürede{" "}
                      <span className="font-medium text-[#252A32]">
                        {formPhone}
                      </span>{" "}
                      numarası üzerinden sizinle iletişime geçecektir.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormName("");
                        setFormPhone("");
                        setFormNote("");
                      }}
                      className="mt-6 rounded-md border border-[#E9EBEE] bg-white px-4 py-2 text-xs font-medium text-[#203B5C] hover:border-[#203B5C]/40"
                    >
                      Yeni Talep Oluştur
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplicationSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="app-name"
                          className="block text-xs font-medium text-[#252A32]"
                        >
                          Öğrenci / Veli Adı Soyadı
                        </label>
                        <input
                          id="app-name"
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Örn. Kerem Yılmaz"
                          className="mt-1.5 w-full rounded-md border border-[#E9EBEE] bg-white px-3.5 py-2.5 text-sm text-[#252A32] placeholder-[#737B86]/60 outline-none transition-colors focus:border-[#203B5C]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="app-phone"
                          className="block text-xs font-medium text-[#252A32]"
                        >
                          Telefon Numarası
                        </label>
                        <input
                          id="app-phone"
                          type="tel"
                          required
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="05XX XXX XX XX"
                          className="mt-1.5 w-full rounded-md border border-[#E9EBEE] bg-white px-3.5 py-2.5 text-sm text-[#252A32] placeholder-[#737B86]/60 outline-none transition-colors focus:border-[#203B5C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="app-grade"
                        className="block text-xs font-medium text-[#252A32]"
                      >
                        İlgilenilen Program / Sınıf Düzeyi
                      </label>
                      <select
                        id="app-grade"
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className="mt-1.5 w-full rounded-md border border-[#E9EBEE] bg-white px-3.5 py-2.5 text-sm text-[#252A32] outline-none transition-colors focus:border-[#203B5C]"
                      >
                        <option value="12. Sınıf (YKS)">12. Sınıf YKS Yoğun</option>
                        <option value="Mezun (YKS)">Mezun Akademik Kamp</option>
                        <option value="11. Sınıf">11. Sınıf Erken Hazırlık</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="app-note"
                        className="block text-xs font-medium text-[#252A32]"
                      >
                        Kısa Not (İsteğe Bağlı)
                      </label>
                      <textarea
                        id="app-note"
                        rows={5}
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        placeholder="Hedef bölüm veya tercih ettiğiniz görüşme saati..."
                        className="mt-1.5 w-full rounded-md border border-[#E9EBEE] bg-white px-3.5 py-2.5 text-sm text-[#252A32] placeholder-[#737B86]/60 outline-none transition-colors focus:border-[#203B5C]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-md bg-[#203B5C] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#172B45]"
                    >
                      Ön Görüşme Talebi Gönder
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
