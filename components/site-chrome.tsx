"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CampusProvider } from "@/lib/campus-store";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanelRoute =
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin");

  if (isPanelRoute) {
    return <CampusProvider>{children}</CampusProvider>;
  }

  return (
    <CampusProvider>
      <SmoothScroll>
        <div className="flex min-h-screen flex-col bg-[#FCFBF8] text-[#17241F]">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </SmoothScroll>
    </CampusProvider>
  );
}
