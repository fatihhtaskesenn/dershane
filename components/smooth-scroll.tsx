"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let progressTween: gsap.core.Tween | null = null;
    if (progressRef.current) {
      progressTween = gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }

    return () => {
      progressTween?.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={progressRef}
        className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[2.5px] origin-left scale-x-0 bg-gradient-to-r from-[#4E203D] via-[#C58B3B] to-[#135D43]"
        aria-hidden="true"
      />
      {children}
    </>
  );
}
