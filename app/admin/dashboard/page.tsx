"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  GraduationCap,
  Layers,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  Plus,
  Trash2,
  Star,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  Paperclip,
  X,
} from "lucide-react";
import { useCampus, type CampusAnnouncement } from "@/lib/campus-store";

const PIE_COLORS = ["#11284B", "#0E4D3A", "#B8860B", "#1E6B52", "#475569", "#94A3B8"];

export default function AdminDashboardPage() {
  const {
    students,
    teachers,
    classes,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    contactMessages,
  } = useCampus();

  // Announcement form state
  const [annTitle, setAnnTitle] = useState("");
  const [annCategory, setAnnCategory] = useState<CampusAnnouncement["category"]>("Genel");
  const [annContent, setAnnContent] = useState("");
  const [annImportant, setAnnImportant] = useState(false);
  const [annFileName, setAnnFileName] = useState("");
  const [annFileDataUrl, setAnnFileDataUrl] = useState("");
  const [annFileSize, setAnnFileSize] = useState("");

  // Mobile marquee: animate each chart once when it first enters the viewport
  const [mobileChartSeen, setMobileChartSeen] = useState({
    bar: true,
    row: false,
    pie: false,
  });
  const mobileRowRef = useRef<HTMLDivElement | null>(null);
  const mobilePieRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rowEl = mobileRowRef.current;
    const pieEl = mobilePieRef.current;
    if (!rowEl && !pieEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === rowEl) {
            setMobileChartSeen((prev) => (prev.row ? prev : { ...prev, row: true }));
            observer.unobserve(rowEl);
          } else if (entry.target === pieEl) {
            setMobileChartSeen((prev) => (prev.pie ? prev : { ...prev, pie: true }));
            observer.unobserve(pieEl);
          }
        });
      },
      { threshold: 0.45 }
    );

    if (rowEl) observer.observe(rowEl);
    if (pieEl) observer.observe(pieEl);

    return () => observer.disconnect();
  }, []);

  // Student latest TYT net bar chart data (sorted descending)
  const studentBarData = useMemo(() => {
    const mapped = students.map((stu) => {
      const tytExams = stu.exams.filter((e) => e.type === "TYT");
      const latestTyt = tytExams[tytExams.length - 1];
      return {
        name: stu.name.split(" ")[0],
        fullName: stu.name,
        className: stu.className,
        net: latestTyt ? Number(latestTyt.totalNet.toFixed(2)) : 0,
        track: stu.track,
      };
    });
    return mapped
      .sort((a, b) => b.net - a.net)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [students]);

  const averageTytNet = useMemo(() => {
    const valid = studentBarData.filter((d) => d.net > 0);
    if (valid.length === 0) return 0;
    return Number((valid.reduce((acc, d) => acc + d.net, 0) / valid.length).toFixed(2));
  }, [studentBarData]);

  // Subject average row chart data (to spot lowest net subject)
  const subjectRowData = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    students.forEach((stu) => {
      const tytExams = stu.exams.filter((e) => e.type === "TYT");
      const latest = tytExams[tytExams.length - 1];
      if (!latest) return;
      latest.subjects.forEach((sub) => {
        const current = map.get(sub.name) || { sum: 0, count: 0 };
        map.set(sub.name, { sum: current.sum + sub.net, count: current.count + 1 });
      });
    });

    const rows = Array.from(map.entries()).map(([subject, { sum, count }]) => ({
      subject,
      ortalamaNet: Number((sum / count).toFixed(2)),
    }));

    return rows.sort((a, b) => a.ortalamaNet - b.ortalamaNet);
  }, [students]);

  const lowestSubject = subjectRowData[0] ?? null;

  // Student TYT performance band distribution pie chart
  const successBandPie = useMemo(() => {
    const bands = [
      { name: "95+ Net (Zirve)", min: 95, max: 121, color: "#0E4D3A", count: 0 },
      { name: "85 – 94.9 Net (İleri)", min: 85, max: 95, color: "#11284B", count: 0 },
      { name: "75 – 84.9 Net (Gelişim)", min: 75, max: 85, color: "#B8860B", count: 0 },
      { name: "75 Altı (Etüt Öncelikli)", min: 0, max: 75, color: "#C2410C", count: 0 },
    ];
    studentBarData.forEach((d) => {
      const band = bands.find((b) => d.net >= b.min && d.net < b.max);
      if (band) band.count += 1;
    });
    const total = studentBarData.length || 1;
    return bands
      .filter((b) => b.count > 0)
      .map((b) => ({
        name: b.name,
        value: b.count,
        color: b.color,
        percent: Math.round((b.count / total) * 100),
      }));
  }, [studentBarData]);

  const unreadMessagesCount = useMemo(
    () => contactMessages.filter((m) => m.status === "Yeni").length,
    [contactMessages]
  );

  const handleAnnouncementFile = (file: File | undefined) => {
    if (!file) return;
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const sizeLabel =
      sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    const reader = new FileReader();
    reader.onload = () => {
      setAnnFileName(file.name);
      setAnnFileDataUrl(String(reader.result ?? ""));
      setAnnFileSize(sizeLabel);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement({
      title: annTitle.trim(),
      category: annCategory,
      content: annContent.trim(),
      important: annImportant,
      ...(annFileName && annFileDataUrl
        ? {
            attachmentName: annFileName,
            attachmentDataUrl: annFileDataUrl,
            attachmentSize: annFileSize,
          }
        : {}),
    });
    setAnnTitle("");
    setAnnContent("");
    setAnnImportant(false);
    setAnnFileName("");
    setAnnFileDataUrl("");
    setAnnFileSize("");
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8860B]">
            Yönetici Kontrol Merkezi
          </p>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-[#11284B] mt-0.5 sm:mt-1">
            Dershane Durumu &amp; Genel Duyurular
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 sm:mt-1">
            Kurum genelindeki öğrenci net analizlerini, öğretmen yoğunluğunu inceleyin ve tüm kampüse duyuru yayınlayın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/create-student"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#11284B]/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#11284B] hover:bg-[#11284B] hover:text-white transition"
          >
            <Plus className="w-3.5 h-3.5" /> Öğrenci Ekle
          </Link>
          <Link
            href="/admin/create-teacher"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#11284B]/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#11284B] hover:bg-[#11284B] hover:text-white transition"
          >
            <Plus className="w-3.5 h-3.5" /> Öğretmen Ekle
          </Link>
          <Link
            href="/admin/classes"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#11284B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1a3a6b] transition"
          >
            <Layers className="w-3.5 h-3.5" /> Sınıfları Yönet
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="rounded-xl border border-[#11284B]/10 bg-white p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Kayıtlı Öğrenci
            </span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#11284B]" />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-[#11284B] mt-1 sm:mt-2">{students.length}</p>
          <Link
            href="/admin/students"
            className="mt-1 sm:mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-[#0E4D3A] hover:underline"
          >
            Öğrenci durumları <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#11284B]/10 bg-white p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Aktif Öğretmen
            </span>
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0E4D3A]" />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-[#11284B] mt-1 sm:mt-2">{teachers.length}</p>
          <Link
            href="/admin/teachers"
            className="mt-1 sm:mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-[#0E4D3A] hover:underline"
          >
            Öğretmen yoğunlukları <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#11284B]/10 bg-white p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Aktif Sınıf / Grup
            </span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8860B]" />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-[#11284B] mt-1 sm:mt-2">{classes.length}</p>
          <Link
            href="/admin/classes"
            className="mt-1 sm:mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-[#0E4D3A] hover:underline"
          >
            Sınıf programları <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#11284B]/10 bg-white p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Kurum TYT Ort.
            </span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0E4D3A]" />
          </div>
          <p className="text-xl sm:text-3xl font-bold text-[#0E4D3A] mt-1 sm:mt-2">{averageTytNet} Net</p>
          <Link
            href="/admin/content"
            className="mt-1 sm:mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-[#4B5563] hover:underline"
          >
            {unreadMessagesCount} yeni mesaj <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>
      </div>

      {/* Lowest Subject Alert */}
      {lowestSubject && (
        <div className="rounded-xl border border-[#B8860B]/30 bg-[#FFFDF7] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#B8860B]/15 text-[#8A6508] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8A6508]">
                En Çok Net Düşüklüğü Görülen Ders
              </p>
              <p className="text-sm text-[#11284B] mt-0.5">
                Kurum genelinde son TYT denemelerinde en düşük ortalama{" "}
                <strong className="font-bold text-[#11284B]">{lowestSubject.subject}</strong>{" "}
                dersinde (<strong className="text-[#B8860B]">{lowestSubject.ortalamaNet} net</strong>) ölçüldü.
                Zümre etüt planlaması önerilir.
              </p>
            </div>
          </div>
          <Link
            href="/admin/classes"
            className="shrink-0 rounded-lg bg-[#11284B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1a3a6b] transition"
          >
            Programı Güncelle
          </Link>
        </div>
      )}

      {/* 3 Animated Charts: Infinite Marquee on Mobile (< lg), 3-col Grid on Desktop */}
      {(() => {
        const renderChartCards = (
          prefix: string,
          cardClass: string,
          options?: { isMobilePrimary?: boolean; isMobileDuplicate?: boolean }
        ) => {
          const isPrimary = options?.isMobilePrimary ?? false;
          const isDuplicate = options?.isMobileDuplicate ?? false;
          const showRowData = !isPrimary || mobileChartSeen.row;
          const showPieData = !isPrimary || mobileChartSeen.pie;

          return (
            <>
              {/* Column Chart */}
              <div key={`${prefix}-bar`} className={cardClass}>
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#11284B] sm:text-base">
                      Öğrenci Son TYT Netleri
                    </h2>
                    <p className="text-[11px] text-[#64748B] sm:text-xs">
                      Büyükten küçüğe başarı sıralaması
                    </p>
                  </div>
                  <BarChart3 className="h-4 w-4 text-[#11284B]/60 sm:h-5 sm:w-5" />
                </div>
                <div className="h-48 w-full sm:h-64 [&_.recharts-wrapper]:outline-none [&_svg]:outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#475569" }} domain={[0, 120]} />
                      <Tooltip
                        cursor={false}
                        formatter={(value) => [`${value} Net`, "TYT Toplam"]}
                        labelFormatter={(label, payload) => {
                          const p = payload?.[0]?.payload;
                          return p ? `${p.rank}. ${p.fullName} (${p.className})` : String(label);
                        }}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 8px 20px rgba(17,40,75,0.08)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="net"
                        fill="#11284B"
                        activeBar={{ fill: "#1E4075" }}
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={!isDuplicate}
                        animationDuration={900}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Horizontal Row Chart */}
              <div
                key={`${prefix}-row`}
                ref={isPrimary ? mobileRowRef : undefined}
                className={cardClass}
              >
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#11284B] sm:text-base">
                      Ders Bazlı Net Ortalaması
                    </h2>
                    <p className="text-[11px] text-[#64748B] sm:text-xs">
                      En düşükten yükseğe satır grafiği
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-[#0E4D3A]/70 sm:h-5 sm:w-5" />
                </div>
                <div className="h-48 w-full sm:h-64 [&_.recharts-wrapper]:outline-none [&_svg]:outline-none">
                  {showRowData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectRowData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} domain={[0, 40]} />
                        <YAxis
                          dataKey="subject"
                          type="category"
                          tick={{ fontSize: 11, fill: "#11284B", fontWeight: 600 }}
                          width={90}
                        />
                        <Tooltip
                          cursor={false}
                          formatter={(value) => [`${value} Net`, "Kurum Ortalaması"]}
                          contentStyle={{
                            borderRadius: "10px",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 8px 20px rgba(17,40,75,0.08)",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="ortalamaNet"
                          fill="#0E4D3A"
                          activeBar={{ fill: "#146B50" }}
                          radius={[0, 6, 6, 0]}
                          isAnimationActive={!isDuplicate}
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full" aria-hidden="true" />
                  )}
                </div>
              </div>

              {/* Pie Chart: Student Performance Bands */}
              <div
                key={`${prefix}-pie`}
                ref={isPrimary ? mobilePieRef : undefined}
                className={cardClass}
              >
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#11284B] sm:text-base">
                      Kurum Başarı Bandı Dağılımı
                    </h2>
                    <p className="text-[11px] text-[#64748B] sm:text-xs">
                      Son TYT netlerine göre öğrenci seviye grupları
                    </p>
                  </div>
                  <PieChartIcon className="h-4 w-4 text-[#B8860B] sm:h-5 sm:w-5" />
                </div>
                <div className="h-44 w-full sm:h-52 [&_.recharts-wrapper]:outline-none [&_svg]:outline-none">
                  {showPieData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={successBandPie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={80}
                          paddingAngle={3}
                          isAnimationActive={!isDuplicate}
                          animationDuration={900}
                        >
                          {successBandPie.map((band) => (
                            <Cell key={band.name} fill={band.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, _, item) => [
                            `${value} Öğrenci (%${item?.payload?.percent ?? 0})`,
                            item?.payload?.name || "Seviye",
                          ]}
                          contentStyle={{
                            borderRadius: "10px",
                            border: "1px solid #E2E8F0",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full" aria-hidden="true" />
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {successBandPie.map((band) => (
                    <div key={band.name} className="flex items-center justify-between text-[11px] text-[#475569]">
                      <span className="flex items-center gap-1.5 truncate">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: band.color }}
                        />
                        <span className="truncate">{band.name}</span>
                      </span>
                      <span className="ml-1 font-bold text-[#11284B]">{band.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        };

        return (
          <>
            {/* Mobile Infinite Marquee (< lg) */}
            <div className="overflow-hidden py-1 lg:hidden">
              <div className="animate-marquee items-stretch">
                {renderChartCards(
                  "m1",
                  "mr-3.5 w-[84vw] shrink-0 rounded-2xl border border-[#11284B]/10 bg-white p-4 shadow-sm sm:w-[48vw]",
                  { isMobilePrimary: true }
                )}
                {renderChartCards(
                  "m2",
                  "mr-3.5 w-[84vw] shrink-0 rounded-2xl border border-[#11284B]/10 bg-white p-4 shadow-sm sm:w-[48vw]",
                  { isMobileDuplicate: true }
                )}
              </div>
            </div>

            {/* Desktop 3-Column Grid (lg+) */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
              {renderChartCards(
                "desktop",
                "rounded-2xl border border-[#11284B]/10 bg-white p-6 shadow-sm"
              )}
            </div>
          </>
        );
      })()}

      {/* Announcements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Announcement */}
        <form
          onSubmit={handleCreateAnnouncement}
          className="lg:col-span-5 rounded-2xl border border-[#11284B]/10 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#11284B]/10 text-[#11284B] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#11284B]">Genel Kampüs Duyurusu Yayınla</h2>
              <p className="text-xs text-[#64748B]">
                Yayınlanan duyurular tüm öğrenci ve öğretmen panellerinde görünür.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#11284B] mb-1">Duyuru Başlığı</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="Örn: Cumartesi Türkiye Geneli TYT Denemesi"
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] focus:outline-none focus:border-[#11284B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#11284B] mb-1">Kategori</label>
            <select
              value={annCategory}
              onChange={(e) => setAnnCategory(e.target.value as CampusAnnouncement["category"])}
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] focus:outline-none focus:border-[#11284B]"
            >
              <option value="Genel">Genel</option>
              <option value="Sınav">Sınav</option>
              <option value="Program">Program</option>
              <option value="Etkinlik">Etkinlik</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#11284B] mb-1">Duyuru İçeriği</label>
            <textarea
              required
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Öğrencilere ve öğretmenlere iletmek istediğiniz detayları yazın..."
              className="w-full rounded-lg border border-[#11284B]/15 bg-[#FAF8F5] px-3 py-2 text-sm text-[#11284B] focus:outline-none focus:border-[#11284B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#11284B] mb-1">
              Dosya / Ek Ekle (İsteğe Bağlı)
            </label>
            {annFileName ? (
              <div className="flex items-center justify-between rounded-lg border border-[#0E4D3A]/30 bg-[#EAF6F0] px-3 py-2 text-xs text-[#0E4D3A]">
                <span className="flex items-center gap-1.5 truncate font-semibold">
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{annFileName}</span>
                  <span className="text-[10px] opacity-75">({annFileSize})</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAnnFileName("");
                    setAnnFileDataUrl("");
                    setAnnFileSize("");
                  }}
                  className="ml-2 rounded p-0.5 hover:bg-white/70"
                  title="Dosyayı Kaldır"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#11284B]/25 bg-[#FAF8F5] px-3 py-2.5 text-xs font-medium text-[#475569] transition hover:border-[#11284B] hover:text-[#11284B]">
                <Paperclip className="h-3.5 w-3.5" />
                <span>PDF, Görsel veya Belge Seç</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleAnnouncementFile(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-[#11284B] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={annImportant}
              onChange={(e) => setAnnImportant(e.target.checked)}
              className="rounded border-[#11284B]/30 text-[#11284B]"
            />
            Önemli duyuru olarak vurgula
          </label>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#11284B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3a6b] transition"
          >
            <Plus className="w-4 h-4" />
            Duyuruyu Yayınla
          </button>
        </form>

        {/* Active Announcements List */}
        <div className="lg:col-span-7 rounded-2xl border border-[#11284B]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#11284B]">
                Yayındaki Duyurular ({announcements.length})
              </h2>
              <p className="text-xs text-[#64748B]">Öğrenci ve öğretmenlerin gördüğü aktif duyuru akışı</p>
            </div>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#11284B]/15 p-8 text-center text-sm text-[#64748B]">
              Henüz yayınlanmış bir duyuru bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`rounded-xl border p-4 transition ${
                    ann.important
                      ? "border-[#B8860B]/40 bg-[#FFFDF7]"
                      : "border-[#11284B]/10 bg-[#FAF8F5]/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-[#11284B]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#11284B]">
                          {ann.category}
                        </span>
                        {ann.important && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#B8860B]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8A6508]">
                            <Star className="w-3 h-3" /> Önemli
                          </span>
                        )}
                        <span className="text-[11px] text-[#64748B]">{ann.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#11284B]">{ann.title}</h3>
                      <p className="text-xs text-[#4B5563] leading-relaxed">{ann.content}</p>
                      {ann.attachmentName && ann.attachmentDataUrl && (
                        <a
                          href={ann.attachmentDataUrl}
                          download={ann.attachmentName}
                          className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-[#11284B]/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#11284B] hover:bg-[#FAF8F5]"
                        >
                          <Paperclip className="h-3 w-3 text-[#0E4D3A]" />
                          <span>{ann.attachmentName}</span>
                          {ann.attachmentSize && (
                            <span className="text-[10px] text-[#64748B]">({ann.attachmentSize})</span>
                          )}
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(ann.id)}
                      title="Duyuruyu Sil"
                      className="shrink-0 rounded-lg p-1.5 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
