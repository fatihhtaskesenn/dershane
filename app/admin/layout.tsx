"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  CalendarPlus,
  FileUp,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  UserPlus,
  Users,
} from "lucide-react";
import { PanelSidebar, type SidebarNavItem } from "@/components/panel-sidebar";

const ADMIN_NAV: SidebarNavItem[] = [
  {
    label: "Genel Bakış",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Ders Programı Oluştur",
    href: "/admin/schedule-builder",
    icon: CalendarDays,
    section: "Program & Sınıf",
  },
  {
    label: "Birebir Oluştur",
    href: "/admin/one-on-one",
    icon: CalendarPlus,
    section: "Program & Sınıf",
  },
  {
    label: "Sınıflar",
    href: "/admin/classes",
    icon: Layers,
    section: "Program & Sınıf",
  },
  {
    label: "Öğrenci Durumları",
    href: "/admin/students",
    icon: Users,
    section: "Öğrenci & Sınav",
  },
  {
    label: "Öğrenci Oluştur",
    href: "/admin/create-student",
    icon: UserPlus,
    section: "Öğrenci & Sınav",
  },
  {
    label: "Deneme PDF Yükle",
    href: "/admin/exams",
    icon: FileUp,
    section: "Öğrenci & Sınav",
  },
  {
    label: "Öğretmen Durumları",
    href: "/admin/teachers",
    icon: BookOpenCheck,
    section: "Öğretmen Kadrosu",
  },
  {
    label: "Öğretmen Oluştur",
    href: "/admin/create-teacher",
    icon: GraduationCap,
    section: "Öğretmen Kadrosu",
  },
  {
    label: "Siteyi Yönet",
    href: "/admin/content",
    icon: ImageIcon,
    section: "Kurum",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <PanelSidebar
      portalName="Yönetici Paneli"
      userName="Ahmet Hakan Demir"
      userMeta="Kurum Müdürü • Süper Yönetici"
      items={ADMIN_NAV}
      logoutHref="/admin"
    >
      {children}
    </PanelSidebar>
  );
}
