"use client";

import React from "react";
import { CalendarDays, LayoutDashboard, Users } from "lucide-react";
import { PanelSidebar, type SidebarNavItem } from "@/components/panel-sidebar";
import { useCampus } from "@/lib/campus-store";

const TEACHER_NAV: SidebarNavItem[] = [
  {
    label: "Ders Programı & Birebirler",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Öğrenciler & Netler",
    href: "/teacher/students",
    icon: Users,
  },
  {
    label: "Haftalık Takvim",
    href: "/teacher/schedule",
    icon: CalendarDays,
  },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeTeacher } = useCampus();

  return (
    <PanelSidebar
      portalName="Öğretmen Paneli"
      userName={activeTeacher.name}
      userMeta={`${activeTeacher.role} • ${activeTeacher.branch}`}
      items={TEACHER_NAV}
      logoutHref="/login"
    >
      {children}
    </PanelSidebar>
  );
}
