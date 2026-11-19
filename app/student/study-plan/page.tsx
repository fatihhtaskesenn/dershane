"use client";

import React, { useState } from "react";
import { Plus, StickyNote, Trash2 } from "lucide-react";
import { useCampus } from "@/lib/campus-store";

export default function StudentNotesPage() {
  const { activeStudent, addPersonalNote, deletePersonalNote } = useCampus();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addPersonalNote(activeStudent.id, title.trim(), content.trim());
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-7">
      <div className="border-b border-[#E9EBEE] pb-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
          Kişisel Çalışma Defterim
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-medium text-[#203B5C]">
          Kendi Notlarım
        </h1>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-3 rounded-xl border border-[#DCE4EE] bg-white p-6"
      >
        <input
          type="text"
          required
          placeholder="Not Başlığı..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3.5 py-2.5 text-sm"
        />
        <textarea
          rows={3}
          required
          placeholder="Önemli formüller, yanlış yaptığın soru notları..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border border-[#DCE4EE] bg-[#F8FAFC] px-3.5 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#0D2558] px-5 py-2.5 text-xs font-semibold text-white"
        >
          <Plus className="h-4 w-4 text-[#E8C483]" />
          <span>Notu Kaydet</span>
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(activeStudent.personalNotes ?? []).map((n) => (
          <div
            key={n.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#E5DEC9] bg-white p-5"
          >
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#135D43]">
                <StickyNote className="h-3.5 w-3.5" />
                <span>{n.date}</span>
              </p>
              <h2 className="font-editorial mt-1.5 text-xl font-medium text-[#203B5C]">
                {n.title}
              </h2>
              <p className="mt-1.5 text-sm text-[#4E5E57]">{n.content}</p>
            </div>
            <button
              type="button"
              onClick={() => deletePersonalNote(activeStudent.id, n.id)}
              className="text-rose-600 hover:text-rose-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
