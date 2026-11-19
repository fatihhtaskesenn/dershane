"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
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
    label: "Öğrenci Oluştur",
    href: "/admin/create-student",
    icon: UserPlus,
  },
  {
    label: "Öğrenci Durumları",
    href: "/admin/students",
    icon: Users,
  },
  {
    label: "Deneme PDF Yükle",
    href: "/admin/exams",
    icon: FileUp,
  },
  {
    label: "Öğretmen Oluştur",
    href: "/admin/create-teacher",
    icon: GraduationCap,
  },
  {
    label: "Öğretmen Durumları",
    href: "/admin/teachers",
    icon: BookOpenCheck,
  },
  {
    label: "Sınıflar",
    href: "/admin/classes",
    icon: Layers,
  },
  {
    label: "Birebir Oluştur",
    href: "/admin/one-on-one",
    icon: CalendarPlus,
  },
  {
    label: "Siteyi Yönet",
    href: "/admin/content",
    icon: ImageIcon,
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
