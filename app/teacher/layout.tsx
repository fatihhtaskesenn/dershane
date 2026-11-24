"use client";

import React from "react";
import { CalendarDays, ClipboardList, LayoutDashboard, Users } from "lucide-react";
import { PanelSidebar, type SidebarNavItem } from "@/components/panel-sidebar";
import { isGuidanceRole, useCampus } from "@/lib/campus-store";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeTeacher } = useCampus();
  const showHomeworkTab = isGuidanceRole(activeTeacher);

  const navItems: SidebarNavItem[] = [
    {
      label: "Genel Bakış",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Öğrenciler & Netler",
      href: "/teacher/students",
      icon: Users,
    },
    ...(showHomeworkTab
      ? [
          {
            label: "Ödev Ver",
            href: "/teacher/homework",
            icon: ClipboardList,
          },
        ]
      : []),
    {
      label: "Haftalık Takvim",
      href: "/teacher/schedule",
      icon: CalendarDays,
    },
  ];

  return (
    <PanelSidebar
      portalName="Öğretmen Paneli"
      userName={activeTeacher.name}
      userMeta={`${activeTeacher.role} • ${activeTeacher.branch}`}
      items={navItems}
      logoutHref="/login"
    >
      {children}
    </PanelSidebar>
  );
}
