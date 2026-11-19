"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BookOpen, Compass, Eraser, GraduationCap, PenTool } from "lucide-react";

const FLOATING_FORMULAS = [
  { text: "∫ f(x) dx", x: "8%", y: "14%", depth: 28 },
  { text: "E = mc²", x: "84%", y: "18%", depth: -24 },
  { text: "lim x→∞", x: "14%", y: "48%", depth: 20 },
  { text: "Δx · Δp ≥ ħ/2", x: "80%", y: "52%", depth: -30 },
  { text: "∑ n²", x: "10%", y: "78%", depth: 24 },
  { text: "sin²θ + cos²θ = 1", x: "76%", y: "82%", depth: -20 },
  { text: "f'(x)", x: "48%", y: "10%", depth: 18 },
];

export function AcademicParallaxBg() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 70, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 70, damping: 20 });

  const layer1X = useTransform(smoothX, [-1, 1], [-22, 22]);
  const layer1Y = useTransform(smoothY, [-1, 1], [-18, 18]);

  const layer2X = useTransform(smoothX, [-1, 1], [26, -26]);
  const layer2Y = useTransform(smoothY, [-1, 1], [20, -20]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle Notebook Ruled Lines Pattern */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(220, 232, 226, 0.55) 39px, rgba(220, 232, 226, 0.55) 40px)",
        }}
      />
      {/* Vertical Margin Line like a Classic Notebook */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-rose-400/25 sm:left-20" />

      {/* Ambient Emerald & Gold Glows */}
      <div className="absolute -top-32 left-1/4 h-[460px] w-[460px] rounded-full bg-[#135D43]/[0.07] blur-[140px]" />
      <div className="absolute top-1/2 right-1/5 h-[420px] w-[420px] rounded-full bg-[#C58B3B]/[0.08] blur-[150px]" />

      {/* Parallax Layer 1: Mathematical & Physics Formulas */}
      <motion.div
        style={{ x: layer1X, y: layer1Y }}
        className="absolute inset-0"
      >
        {FLOATING_FORMULAS.map((item) => (
          <span
            key={item.text}
            style={{ left: item.x, top: item.y }}
            className="absolute font-mono text-xs tracking-wider text-[#135D43]/25 select-none sm:text-sm"
          >
            {item.text}
          </span>
        ))}
      </motion.div>

      {/* Parallax Layer 2: Educational Icons (Book, Pen, Eraser, Compass, Cap) */}
      <motion.div
        style={{ x: layer2X, y: layer2Y }}
        className="absolute inset-0"
      >
        <BookOpen className="absolute top-[22%] left-[22%] h-10 w-10 -rotate-12 text-[#C58B3B]/20" />
        <PenTool className="absolute top-[34%] right-[14%] h-9 w-9 rotate-12 text-[#135D43]/20" />
        <Eraser className="absolute bottom-[28%] left-[18%] h-8 w-8 -rotate-6 text-[#4E203D]/15" />
        <Compass className="absolute bottom-[20%] right-[22%] h-10 w-10 rotate-6 text-[#C58B3B]/20" />
        <GraduationCap className="absolute top-[60%] left-[48%] h-11 w-11 -rotate-6 text-[#135D43]/15" />
      </motion.div>
    </div>
  );
}
