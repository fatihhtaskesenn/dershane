"use client";

import React from "react";
import { Megaphone, MessageSquareHeart } from "lucide-react";
import { useCampus } from "@/lib/campus-store";

export default function StudentAnnouncementsAndGuidancePage() {
  const { activeStudent, announcements } = useCampus();

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Kurum Bilgilendirme
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
          Duyurular &amp; Rehberlik Görüşmelerim
        </h1>
      </div>

      {/* Announcements */}
      <section className="space-y-3">
        <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
          <Megaphone className="h-5 w-5 text-[#135D43]" />
          <span>Genel Kampüs Duyuruları</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-[#DCE4EE] bg-white p-5"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="rounded bg-[#E7F3EE] px-2 py-0.5 text-[#135D43]">
                  {a.category}
                </span>
                <span className="text-[#737B86]">{a.date}</span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-[#203B5C]">
                {a.title}
              </h3>
              <p className="mt-1 text-sm text-[#4E5E57]">{a.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guidance */}
      <section className="space-y-3">
        <h2 className="font-editorial flex items-center gap-2 text-2xl font-medium text-[#203B5C]">
          <MessageSquareHeart className="h-5 w-5 text-[#C58B3B]" />
          <span>Rehberlik Görüşmelerim ({activeStudent.advisorName})</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeStudent.guidanceSessions.map((gs) => (
            <div
              key={gs.id}
              className="rounded-xl border border-[#E5DEC9] bg-white p-5"
            >
              <p className="text-xs font-semibold text-[#135D43]">
                {gs.date} • {gs.time}
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#203B5C]">
                {gs.topic}
              </h3>
              <p className="mt-1 text-sm text-[#4E5E57]">{gs.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
