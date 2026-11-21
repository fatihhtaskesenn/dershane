"use client";

import React from "react";
import { CheckCircle2, Mail, Phone, Trash2 } from "lucide-react";
import { useCampus } from "@/lib/campus-store";

export default function AdminMessagesPage() {
  const {
    contactMessages,
    toggleContactMessageStatus,
    deleteContactMessage,
  } = useCampus();

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Veli &amp; Öğrenci Başvuruları
        </p>
        <h1 className="font-editorial mt-1 flex items-center gap-2 text-3xl font-medium text-[#203B5C]">
          <Mail className="h-6 w-6 text-[#135D43]" />
          <span>İletişim Mesajları ({contactMessages.length})</span>
        </h1>
      </div>

      {contactMessages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DCE4EE] bg-white p-10 text-center text-sm text-[#737B86]">
          Henüz gelen iletişim mesajı bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {contactMessages.map((m) => (
            <div
              key={m.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[#DCE4EE] bg-white p-5 shadow-2xs sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.status === "Yeni"
                        ? "bg-[#FEF7E6] text-[#8A6508]"
                        : "bg-[#EAF6F0] text-[#135D43]"
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="text-xs font-semibold text-[#203B5C]">
                    {m.name}
                  </span>
                  <span className="text-xs text-[#737B86]">• {m.createdAt}</span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-[#4E5E57]">
                  <Phone className="h-3.5 w-3.5 text-[#135D43]" />
                  <span>{m.phone}</span>
                  <span>·</span>
                  <span>{m.grade}</span>
                </p>
                <p className="text-xs text-[#203B5C]">{m.note}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleContactMessageStatus(m.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE4EE] bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#135D43] hover:bg-[#EAF6F0]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {m.status === "Yeni" ? "Arandı İşaretle" : "Yeni Yap"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteContactMessage(m.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Sil</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
