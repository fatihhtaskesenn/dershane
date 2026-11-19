"use client";

import React from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  Megaphone,
  StickyNote,
} from "lucide-react";
import { PanelSidebar, type SidebarNavItem } from "@/components/panel-sidebar";
import { useCampus } from "@/lib/campus-store";

const STUDENT_NAV: SidebarNavItem[] = [
  {
    label: "Genel Bakış",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Ders Programı & Birebir",
    href: "/student/schedule",
    icon: CalendarDays,
  },
  {
    label: "Deneme Sonuçlarım",
    href: "/student/exams",
    icon: FileBarChart2,
  },
  {
    label: "Konu Eksiklerim",
    href: "/student/weak-topics",
    icon: AlertTriangle,
  },
  {
    label: "Ödevlendirmeler",
    href: "/student/homework",
    icon: ClipboardList,
  },
  {
    label: "Kendi Notlarım",
    href: "/student/study-plan",
    icon: StickyNote,
  },
  {
    label: "Duyurular",
    href: "/student/guidance",
    icon: Megaphone,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeStudent } = useCampus();

  return (
    <PanelSidebar
      portalName="Öğrenci Paneli"
      userName={activeStudent.name}
      userMeta={`${activeStudent.className} • ${activeStudent.track}`}
      items={STUDENT_NAV}
      logoutHref="/login"
    >
      {children}
    </PanelSidebar>
  );
}
