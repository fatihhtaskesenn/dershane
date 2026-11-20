"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StudentExamRecord } from "@/lib/campus-store";

const MONTH_ORDER: Record<string, number> = {
  Eyl: 1,
  Eylül: 1,
  Eki: 2,
  Ekim: 2,
  Kas: 3,
  Kasım: 3,
  Ara: 4,
  Aralık: 4,
  Oca: 5,
  Ocak: 5,
  Şub: 6,
  Şubat: 6,
  Mar: 7,
  Mart: 7,
  Nis: 8,
  Nisan: 8,
  May: 9,
  Mayıs: 9,
  Haz: 10,
  Haziran: 10,
};

const SUBJECT_CARDS = [
  { key: "Matematik", maxQuestions: 40 },
  { key: "Türkçe", maxQuestions: 40 },
  { key: "Fen Bilimleri", maxQuestions: 20 },
  { key: "Sosyal Bilimler", maxQuestions: 20 },
] as const;

type MetricFilter = "Toplam" | (typeof SUBJECT_CARDS)[number]["key"];

function extractMonthShort(dateStr: string): { label: string; order: number } {
  const parts = dateStr.trim().split(/\s+/);
  for (const part of parts) {
    if (MONTH_ORDER[part]) {
      return {
        label: part.slice(0, 3),
        order: MONTH_ORDER[part],
      };
    }
  }
  return { label: dateStr, order: 99 };
}

export function StudentNetCharts({ exams }: { exams: StudentExamRecord[] }) {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<MetricFilter>("Toplam");

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthlyData = useMemo(() => {
    const tytExams = exams.filter((e) => e.type === "TYT");
    const source = tytExams.length > 0 ? tytExams : exams;

    const rows = source.map((ex) => {
      const { label, order } = extractMonthShort(ex.date);
      const getNet = (name: string) =>
        ex.subjects.find((s) =>
          s.name.toLowerCase().includes(name.toLowerCase().split(" ")[0])
        )?.net ?? 0;

      return {
        month: label,
        order,
        Toplam: ex.totalNet,
        Matematik: getNet("Matematik"),
        Türkçe: getNet("Türkçe"),
        "Fen Bilimleri": getNet("Fen"),
        "Sosyal Bilimler": getNet("Sosyal"),
      };
    });

    const sorted = rows.sort((a, b) => a.order - b.order);
    if (sorted.length === 1) {
      return [{ ...sorted[0], month: "Başlangıç", order: 0 }, sorted[0]];
    }
    return sorted;
  }, [exams]);

  const subjectCards = useMemo(() => {
    if (monthlyData.length === 0) return [];
    const first = monthlyData[0];
    const last = monthlyData[monthlyData.length - 1];

    return SUBJECT_CARDS.map((meta) => {
      const current = Number(last[meta.key]);
      const start = Number(first[meta.key]);
      const diff = Number((current - start).toFixed(2));
      const pct = Math.min(100, Math.round((current / meta.maxQuestions) * 100));
      return {
        ...meta,
        current,
        diff,
        pct,
      };
    });
  }, [monthlyData]);

  const { yDomain, yTicks } = useMemo(() => {
    const maxCapMap: Record<MetricFilter, number> = {
      Toplam: 120,
      Matematik: 40,
      Türkçe: 40,
      "Fen Bilimleri": 20,
      "Sosyal Bilimler": 20,
    };
    const maxCap = maxCapMap[metric] ?? 120;

    if (monthlyData.length === 0) {
      return {
        yDomain: [0, maxCap] as [number, number],
        yTicks:
          maxCap === 120
            ? [0, 30, 60, 90, 120]
            : maxCap === 40
            ? [0, 10, 20, 30, 40]
            : [0, 5, 10, 15, 20],
      };
    }

    const vals = monthlyData.map((d) => Number(d[metric]));
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const pad = metric === "Toplam" ? 10 : 5;
    const rawMin = Math.max(0, minVal - pad);
    const rawMax = Math.min(maxCap, maxVal + pad);
    const span = Math.max(10, rawMax - rawMin);
    const tickStep =
      maxCap === 20
        ? 5
        : maxCap === 40
        ? span > 20
          ? 10
          : 5
        : span > 50
        ? 20
        : 10;

    const end = Math.min(maxCap, Math.ceil(rawMax / tickStep) * tickStep);
    let start = Math.max(0, Math.floor(rawMin / tickStep) * tickStep);
    if (start >= end) {
      start = Math.max(0, end - tickStep * 2);
    }

    const ticks: number[] = [];
    for (let t = start; t <= end; t += tickStep) {
      ticks.push(t);
    }
    return { yDomain: [start, end] as [number, number], yTicks: ticks };
  }, [monthlyData, metric]);

  if (monthlyData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main Wavy Area Chart Card — Sweeps Left-to-Right on Entry */}
      <div className="rounded-xl border border-[#DCE8E2] bg-white p-5 shadow-[0_12px_32px_rgba(19,93,67,0.06)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-editorial text-xl font-semibold text-[#17241F] sm:text-2xl">
              Deneme Net Gelişimi
            </h2>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-lg border border-[#DCE8E2] bg-[#FCFBF8] p-1">
            {(
              [
                "Toplam",
                "Matematik",
                "Türkçe",
                "Fen Bilimleri",
                "Sosyal Bilimler",
              ] as MetricFilter[]
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMetric(tab)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all sm:px-3 sm:text-xs ${
                  metric === tab
                    ? "bg-[#135D43] text-white shadow-xs"
                    : "text-[#4E5E57] hover:text-[#135D43]"
                }`}
              >
                {tab === "Toplam" ? "Genel Toplam" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Left-to-Right Animated Reveal Container */}
        <motion.div
          key={metric}
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="h-[185px] w-full sm:h-[260px]"
        >
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 12, right: 14, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="emeraldWaveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#135D43" stopOpacity={0.34} />
                    <stop offset="65%" stopColor="#135D43" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#135D43" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#E4ECE7"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#4E5E57", fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={54}
                  domain={yDomain}
                  ticks={yTicks}
                  tickFormatter={(v) => `${v} Net`}
                  tick={{ fill: "#4E5E57", fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0E3B2B",
                    border: "none",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#E8C483", fontWeight: 600 }}
                  labelStyle={{ color: "#FFFFFF", fontWeight: 600 }}
                  formatter={(value) => [`${value} Net`, metric]}
                />
                <Area
                  type="natural"
                  dataKey={metric}
                  stroke="#135D43"
                  strokeWidth={2.8}
                  fill="url(#emeraldWaveFill)"
                  fillOpacity={1}
                  dot={{ r: 3.5, fill: "#135D43", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#C58B3B", stroke: "#FFFFFF", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* 4 Clean Subject Cards with Emerald + Gold Animated Bars */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {subjectCards.map((sub, idx) => (
          <button
            key={sub.key}
            type="button"
            onClick={() =>
              setMetric((prev) => (prev === sub.key ? "Toplam" : sub.key))
            }
            className={`group rounded-xl border bg-white p-3 text-left transition-all sm:p-5 ${
              metric === sub.key
                ? "border-[#135D43] shadow-[0_10px_24px_rgba(19,93,67,0.12)]"
                : "border-[#DCE8E2] hover:border-[#C58B3B]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#4E5E57] sm:text-sm">
                {sub.key}
              </span>
              {sub.diff > 0 && (
                <span className="rounded-sm bg-[#E7F3EE] px-1.5 py-0.5 text-[10px] font-bold text-[#135D43]">
                  +{sub.diff}
                </span>
              )}
            </div>

            <p className="font-editorial mt-2 text-2xl font-semibold text-[#17241F] sm:text-3xl">
              {sub.current.toFixed(2)} Net
            </p>
            <p className="mt-0.5 text-[11px] text-[#737B86]">
              {sub.maxQuestions} Soru
            </p>

            {/* Emerald + Gold Two-Tone Animated Bar */}
            <div className="mt-3.5 flex h-2 w-full overflow-hidden rounded-full bg-[#EFECE3]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sub.pct}%` }}
                transition={{
                  duration: 0.9,
                  delay: idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full bg-[#135D43]"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(6, 100 - sub.pct)}%` }}
                transition={{
                  duration: 0.9,
                  delay: idx * 0.08 + 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full bg-[#C58B3B]"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
