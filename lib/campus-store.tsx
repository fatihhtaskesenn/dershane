"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { COURSE_PACKAGES, type CoursePackage } from "@/lib/packages-data";

export type WeekDay =
  | "Pazartesi"
  | "Salı"
  | "Çarşamba"
  | "Perşembe"
  | "Cuma"
  | "Cumartesi"
  | "Pazar";

export interface SubjectNet {
  name: string;
  correct: number;
  wrong: number;
  empty: number;
  net: number;
}

export interface TopicPerformance {
  subject: string;
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  empty: number;
  percent: number;
}

export interface StudentExamRecord {
  id: string;
  title: string;
  type: "TYT" | "AYT";
  date: string;
  totalNet: number;
  maxNet: number;
  rank: number;
  subjects: SubjectNet[];
  topicBreakdown?: TopicPerformance[];
}

export interface StudentScheduleSlot {
  id: string;
  day: WeekDay;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: "Konu Anlatımı" | "Soru Çözümü" | "Etüt" | "Deneme";
  blockPeriod?: "morning" | "afternoon";
}

export interface StudyPlanItem {
  id: string;
  day: WeekDay;
  subject: string;
  topic: string;
  duration: string;
  completed: boolean;
}

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  teacherName: string;
  status: "Bekliyor" | "Tamamlandı";
}

export interface GuidanceSession {
  id: string;
  date: string;
  time: string;
  advisorName: string;
  topic: string;
  note: string;
  status: "Planlandı" | "Tamamlandı";
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface ClassroomRecord {
  id: string;
  name: string;
  track: "Sayısal" | "Eşit Ağırlık" | "Sözel";
  room: string;
  schedule: StudentScheduleSlot[];
}

export interface StudentAccount {
  id: string;
  name: string;
  studentNo: string;
  username: string;
  password: string;
  classId: string;
  className: string;
  grade: "12. Sınıf (YKS)" | "Mezun (YKS)" | "11. Sınıf";
  track: "Sayısal" | "Eşit Ağırlık" | "Sözel";
  parentName: string;
  target: string;
  advisorTeacherId: string;
  advisorName: string;
  branchTeacherId?: string;
  branchTeacherName?: string;
  phone: string;
  attendance: number;
  status: "Aktif" | "İzinli";
  exams: StudentExamRecord[];
  schedule: StudentScheduleSlot[];
  studyPlan: StudyPlanItem[];
  homework: HomeworkItem[];
  guidanceSessions: GuidanceSession[];
  personalNotes: PersonalNote[];
}

export interface TeacherScheduleSlot {
  id: string;
  day: WeekDay;
  time: string;
  classGroup: string;
  subject: string;
  room: string;
}

export interface OneOnOneSlot {
  id: string;
  studentId: string;
  studentName: string;
  day: WeekDay;
  time: string;
  subject: string;
  note: string;
}

export type TeacherRole =
  | "Branş Öğretmeni"
  | "Akademik Danışman"
  | "Rehberlik Uzmanı"
  | "Zümre Başkanı"
  | "Etüt Öğretmeni";

export interface TeacherAccount {
  id: string;
  name: string;
  role: TeacherRole;
  branch: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  schedule: TeacherScheduleSlot[];
  oneOnOneSlots: OneOnOneSlot[];
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  category: "Genel" | "Sınav" | "Program" | "Etkinlik";
  date: string;
  important?: boolean;
  attachmentName?: string;
  attachmentDataUrl?: string;
  attachmentSize?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  grade: string;
  note: string;
  createdAt: string;
  status: "Yeni" | "Görüşüldü";
}

export interface FeaturedHonorStudent {
  rank: string;
  name: string;
  department: string;
  track: "SAY" | "EA" | "SÖZ";
  image: string;
}

export interface InstagramReelItem {
  id: string;
  title: string;
  category: string;
  views: string;
  videoSrc: string;
  poster: string;
  instagramUrl: string;
}

export interface SiteContentConfig {
  heroTitlePrefix: string;
  heroTitleAccent: string;
  heroTitleSuffix: string;
  ecosystemBannerImage: string;
  honorStudents: FeaturedHonorStudent[];
  instagramReels?: InstagramReelItem[];
}

interface CampusState {
  students: StudentAccount[];
  teachers: TeacherAccount[];
  classes: ClassroomRecord[];
  announcements: CampusAnnouncement[];
  contactMessages: ContactMessage[];
  siteContent: SiteContentConfig;
  packages: CoursePackage[];
  activeStudentId: string;
  activeTeacherId: string;
  adminAuthenticated: boolean;
}

const STORAGE_KEY = "dershane_campus_store_v11";

const INITIAL_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: "ann-1",
    title: "Türkiye Geneli TYT Deneme Sınavı #7",
    content:
      "Bu Cumartesi saat 09:30'da tüm sınıflarımız için Türkiye Geneli TYT Denemesi yapılacaktır. Öğrencilerimizin 15 dakika önce salonda olmaları rica olunur.",
    category: "Sınav",
    date: "18 Kas 2026",
    important: true,
  },
  {
    id: "ann-2",
    title: "Kütüphane Akşam Etüt Saatleri Uzatıldı",
    content:
      "Gözetimli kütüphane çalışma salonlarımız hafta içi 21:00'e kadar tüm YKS öğrencilerimize açık olacaktır.",
    category: "Program",
    date: "16 Kas 2026",
  },
];

const INITIAL_CLASSES: ClassroomRecord[] = [
  {
    id: "cls-1",
    name: "12-A Sayısal",
    track: "Sayısal",
    room: "Derslik 204",
    schedule: [
      { id: "cs-1", day: "Pazartesi", time: "08:00 - 08:40", subject: "AYT Matematik", teacher: "Dr. Selin Kaya", room: "Derslik 204", type: "Konu Anlatımı" },
      { id: "cs-2", day: "Pazartesi", time: "08:50 - 09:30", subject: "AYT Matematik", teacher: "Dr. Selin Kaya", room: "Derslik 204", type: "Soru Çözümü" },
      { id: "cs-3", day: "Pazartesi", time: "09:40 - 10:20", subject: "AYT Fizik", teacher: "Murat Demir", room: "Lab 101", type: "Konu Anlatımı" },
      { id: "cs-4", day: "Salı", time: "10:30 - 11:10", subject: "AYT Kimya", teacher: "Prof. Dr. Ahmet Yılmaz", room: "Derslik 204", type: "Konu Anlatımı" },
      { id: "cs-5", day: "Çarşamba", time: "12:50 - 13:30", subject: "TYT Türkçe", teacher: "Zeynep Aksoy", room: "Derslik 204", type: "Soru Çözümü" },
      { id: "cs-6", day: "Perşembe", time: "08:50 - 09:30", subject: "AYT Biyoloji", teacher: "Elif Çelik", room: "Derslik 204", type: "Konu Anlatımı" },
      { id: "cs-7", day: "Cuma", time: "13:40 - 14:20", subject: "TYT Geometri", teacher: "Dr. Selin Kaya", room: "Etüt Salonu B", type: "Etüt" },
      { id: "cs-8", day: "Cumartesi", time: "08:00 - 12:00", subject: "TYT Genel Deneme", teacher: "Ölçme Birimi", room: "Salon A", type: "Deneme", blockPeriod: "morning" },
      { id: "cs-11", day: "Pazar", time: "10:30 - 11:10", subject: "AYT Matematik", teacher: "Dr. Selin Kaya", room: "Etüt Salonu A", type: "Etüt" },
    ],
  },
  {
    id: "cls-2",
    name: "Mezun-1 Sayısal",
    track: "Sayısal",
    room: "Derslik 102",
    schedule: [
      { id: "cs-12", day: "Pazartesi", time: "10:30 - 11:10", subject: "AYT Fizik", teacher: "Murat Demir", room: "Derslik 102", type: "Konu Anlatımı" },
      { id: "cs-13", day: "Salı", time: "08:50 - 09:30", subject: "TYT Matematik", teacher: "Dr. Selin Kaya", room: "Derslik 102", type: "Konu Anlatımı" },
      { id: "cs-14", day: "Çarşamba", time: "09:40 - 10:20", subject: "AYT Kimya", teacher: "Prof. Dr. Ahmet Yılmaz", room: "Derslik 102", type: "Soru Çözümü" },
      { id: "cs-15", day: "Perşembe", time: "11:20 - 12:00", subject: "AYT Biyoloji", teacher: "Elif Çelik", room: "Derslik 102", type: "Konu Anlatımı" },
      { id: "cs-16", day: "Cuma", time: "14:30 - 15:10", subject: "TYT Türkçe", teacher: "Zeynep Aksoy", room: "Derslik 102", type: "Soru Çözümü" },
      { id: "cs-17", day: "Pazar", time: "08:00 - 12:00", subject: "AYT Sayısal Deneme", teacher: "Ölçme Birimi", room: "Salon B", type: "Deneme", blockPeriod: "morning" },
    ],
  },
  {
    id: "cls-3",
    name: "12-B Eşit Ağırlık",
    track: "Eşit Ağırlık",
    room: "Derslik 301",
    schedule: [
      { id: "cs-19", day: "Pazartesi", time: "12:50 - 13:30", subject: "AYT Matematik", teacher: "Dr. Selin Kaya", room: "Derslik 301", type: "Konu Anlatımı" },
      { id: "cs-20", day: "Salı", time: "13:40 - 14:20", subject: "AYT Edebiyat", teacher: "Zeynep Aksoy", room: "Derslik 301", type: "Konu Anlatımı" },
      { id: "cs-21", day: "Çarşamba", time: "10:30 - 11:10", subject: "AYT Tarih", teacher: "Caner Aydın", room: "Derslik 301", type: "Konu Anlatımı" },
      { id: "cs-22", day: "Perşembe", time: "14:30 - 15:10", subject: "AYT Coğrafya", teacher: "Merve Koç", room: "Derslik 301", type: "Soru Çözümü" },
      { id: "cs-23", day: "Cumartesi", time: "12:50 - 21:00", subject: "TYT Genel Deneme", teacher: "Ölçme Birimi", room: "Salon A", type: "Deneme", blockPeriod: "afternoon" },
    ],
  },
  {
    id: "cls-4",
    name: "12-C Sözel",
    track: "Sözel",
    room: "Derslik 304",
    schedule: [
      { id: "cs-24", day: "Pazartesi", time: "14:30 - 15:10", subject: "AYT Edebiyat", teacher: "Zeynep Aksoy", room: "Derslik 304", type: "Konu Anlatımı" },
      { id: "cs-25", day: "Çarşamba", time: "08:50 - 09:30", subject: "AYT Tarih", teacher: "Caner Aydın", room: "Derslik 304", type: "Konu Anlatımı" },
      { id: "cs-26", day: "Cuma", time: "10:30 - 11:10", subject: "TYT Türkçe", teacher: "Zeynep Aksoy", room: "Derslik 304", type: "Soru Çözümü" },
    ],
  },
  {
    id: "cls-5",
    name: "11-A Erken Hazırlık",
    track: "Sayısal",
    room: "Derslik 108",
    schedule: [
      { id: "cs-27", day: "Salı", time: "16:10 - 16:50", subject: "TYT Matematik", teacher: "Dr. Selin Kaya", room: "Derslik 108", type: "Konu Anlatımı" },
      { id: "cs-28", day: "Perşembe", time: "16:10 - 16:50", subject: "TYT Fizik", teacher: "Murat Demir", room: "Derslik 108", type: "Konu Anlatımı" },
      { id: "cs-29", day: "Cumartesi", time: "11:20 - 12:00", subject: "TYT Biyoloji", teacher: "Elif Çelik", room: "Derslik 108", type: "Soru Çözümü" },
    ],
  },
];

const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    id: "tch-1",
    name: "Dr. Selin Kaya",
    role: "Akademik Danışman",
    branch: "Matematik & Akademik Koçluk",
    username: "selin.kaya",
    password: "123456",
    email: "selin.kaya@dershane.edu.tr",
    phone: "+90 532 410 22 11",
    schedule: [
      { id: "ts-1", day: "Pazartesi", time: "08:00 - 08:40", classGroup: "12-A Sayısal", subject: "AYT Matematik", room: "Derslik 204" },
      { id: "ts-2", day: "Pazartesi", time: "08:50 - 09:30", classGroup: "12-A Sayısal", subject: "AYT Matematik", room: "Derslik 204" },
      { id: "ts-3", day: "Salı", time: "08:50 - 09:30", classGroup: "Mezun-1 Sayısal", subject: "TYT Matematik", room: "Derslik 102" },
      { id: "ts-4", day: "Cuma", time: "13:40 - 14:20", classGroup: "12-A Sayısal", subject: "TYT Geometri", room: "Etüt Salonu B" },
      { id: "ts-5", day: "Pazar", time: "10:30 - 11:10", classGroup: "12-A Sayısal", subject: "AYT Matematik", room: "Etüt Salonu A" },
    ],
    oneOnOneSlots: [
      { id: "oo-1", studentId: "stu-1", studentName: "Kerem Yılmaz", day: "Salı", time: "15:20 - 16:00", subject: "AYT Türev & Ekstremum", note: "Son denemedeki 3 hatalı soru üzerinden birebir tekrar." },
      { id: "oo-2", studentId: "stu-2", studentName: "Defne Arslan", day: "Perşembe", time: "16:10 - 16:50", subject: "TYT Hız Problemleri", note: "Süre yönetimi ve denklem kurma pratiği." },
      { id: "oo-3", studentId: "stu-3", studentName: "Emirhan Demir", day: "Cumartesi", time: "12:50 - 13:30", subject: "AYT Trigonometri", note: "Yarım açı formülleri soru çözümü." },
    ],
  },
  {
    id: "tch-2",
    name: "Murat Demir",
    role: "Branş Öğretmeni",
    branch: "Fizik",
    username: "murat.demir",
    password: "123456",
    email: "murat.demir@dershane.edu.tr",
    phone: "+90 533 618 44 09",
    schedule: [
      { id: "ts-6", day: "Pazartesi", time: "09:40 - 10:20", classGroup: "12-A Sayısal", subject: "AYT Fizik", room: "Lab 101" },
      { id: "ts-7", day: "Pazartesi", time: "10:30 - 11:10", classGroup: "Mezun-1 Sayısal", subject: "AYT Fizik", room: "Derslik 102" },
      { id: "ts-8", day: "Perşembe", time: "16:10 - 16:50", classGroup: "11-A Erken Hazırlık", subject: "TYT Fizik", room: "Derslik 108" },
    ],
    oneOnOneSlots: [
      { id: "oo-4", studentId: "stu-1", studentName: "Kerem Yılmaz", day: "Çarşamba", time: "16:10 - 16:50", subject: "AYT Manyetik İndüksiyon", note: "Sağ el kuralı ve akı değişimi soruları." },
      { id: "oo-5", studentId: "stu-7", studentName: "Berkay Öztürk", day: "Cuma", time: "15:20 - 16:00", subject: "AYT Çembersel Hareket", note: "Açısal momentum test analizi." },
    ],
  },
  {
    id: "tch-3",
    name: "Zeynep Aksoy",
    role: "Branş Öğretmeni",
    branch: "Türkçe & Edebiyat",
    username: "zeynep.aksoy",
    password: "123456",
    email: "zeynep.aksoy@dershane.edu.tr",
    phone: "+90 535 712 88 30",
    schedule: [
      { id: "ts-9", day: "Çarşamba", time: "12:50 - 13:30", classGroup: "12-A Sayısal", subject: "TYT Türkçe", room: "Derslik 204" },
      { id: "ts-10", day: "Salı", time: "13:40 - 14:20", classGroup: "12-B Eşit Ağırlık", subject: "AYT Edebiyat", room: "Derslik 301" },
      { id: "ts-11", day: "Pazartesi", time: "14:30 - 15:10", classGroup: "12-C Sözel", subject: "AYT Edebiyat", room: "Derslik 304" },
    ],
    oneOnOneSlots: [
      { id: "oo-6", studentId: "stu-4", studentName: "Zehra Karahan", day: "Perşembe", time: "15:20 - 16:00", subject: "AYT Divan Edebiyatı", note: "Nazım şekilleri ve beyit analizi." },
    ],
  },
  {
    id: "tch-4",
    name: "Prof. Dr. Ahmet Yılmaz",
    role: "Zümre Başkanı",
    branch: "Kimya",
    username: "ahmet.yilmaz",
    password: "123456",
    email: "ahmet.yilmaz@dershane.edu.tr",
    phone: "+90 532 840 15 62",
    schedule: [
      { id: "ts-12", day: "Salı", time: "10:30 - 11:10", classGroup: "12-A Sayısal", subject: "AYT Kimya", room: "Derslik 204" },
      { id: "ts-13", day: "Çarşamba", time: "09:40 - 10:20", classGroup: "Mezun-1 Sayısal", subject: "AYT Kimya", room: "Derslik 102" },
    ],
    oneOnOneSlots: [
      { id: "oo-7", studentId: "stu-2", studentName: "Defne Arslan", day: "Cuma", time: "16:10 - 16:50", subject: "AYT Organik Kimya", note: "Fonksiyonel gruplar ve adlandırma." },
    ],
  },
  {
    id: "tch-5",
    name: "Elif Çelik",
    role: "Branş Öğretmeni",
    branch: "Biyoloji",
    username: "elif.celik",
    password: "123456",
    email: "elif.celik@dershane.edu.tr",
    phone: "+90 536 309 77 14",
    schedule: [
      { id: "ts-14", day: "Perşembe", time: "08:50 - 09:30", classGroup: "12-A Sayısal", subject: "AYT Biyoloji", room: "Derslik 204" },
      { id: "ts-15", day: "Perşembe", time: "11:20 - 12:00", classGroup: "Mezun-1 Sayısal", subject: "AYT Biyoloji", room: "Derslik 102" },
      { id: "ts-16", day: "Cumartesi", time: "11:20 - 12:00", classGroup: "11-A Erken Hazırlık", subject: "TYT Biyoloji", room: "Derslik 108" },
    ],
    oneOnOneSlots: [],
  },
  {
    id: "tch-6",
    name: "Caner Aydın",
    role: "Rehberlik Uzmanı",
    branch: "Tarih & Coğrafya",
    username: "caner.aydin",
    password: "123456",
    email: "caner.aydin@dershane.edu.tr",
    phone: "+90 534 992 18 40",
    schedule: [
      { id: "ts-17", day: "Çarşamba", time: "10:30 - 11:10", classGroup: "12-B Eşit Ağırlık", subject: "AYT Tarih", room: "Derslik 301" },
      { id: "ts-18", day: "Perşembe", time: "14:30 - 15:10", classGroup: "12-B Eşit Ağırlık", subject: "AYT Coğrafya", room: "Derslik 301" },
      { id: "ts-19", day: "Çarşamba", time: "08:50 - 09:30", classGroup: "12-C Sözel", subject: "AYT Tarih", room: "Derslik 304" },
    ],
    oneOnOneSlots: [
      { id: "oo-8", studentId: "stu-6", studentName: "Ayşe Nur Şahin", day: "Cumartesi", time: "14:30 - 15:10", subject: "AYT Çağdaş Türk Tarihi", note: "Harita ve kronoloji pekiştirme." },
    ],
  },
  {
    id: "tch-7",
    name: "Burak Şen",
    role: "Branş Öğretmeni",
    branch: "Geometri",
    username: "burak.sen",
    password: "123456",
    email: "burak.sen@dershane.edu.tr",
    phone: "+90 532 511 40 22",
    schedule: [
      { id: "ts-20", day: "Salı", time: "09:40 - 10:20", classGroup: "12-A Sayısal", subject: "AYT Analitik Geometri", room: "Derslik 204" },
      { id: "ts-21", day: "Perşembe", time: "13:40 - 14:20", classGroup: "Mezun-1 Sayısal", subject: "TYT Üçgenler & Çokgenler", room: "Derslik 102" },
    ],
    oneOnOneSlots: [
      { id: "oo-9", studentId: "stu-3", studentName: "Emirhan Demir", day: "Cuma", time: "16:10 - 16:50", subject: "Çemberde Uzunluk", note: "Kiriş ve teğet özellikleri." },
    ],
  },
  {
    id: "tch-8",
    name: "Merve Koç",
    role: "Branş Öğretmeni",
    branch: "Coğrafya",
    username: "merve.koc",
    password: "123456",
    email: "merve.koc@dershane.edu.tr",
    phone: "+90 535 449 12 87",
    schedule: [
      { id: "ts-22", day: "Perşembe", time: "14:30 - 15:10", classGroup: "12-B Eşit Ağırlık", subject: "AYT Coğrafya", room: "Derslik 301" },
      { id: "ts-23", day: "Cuma", time: "11:20 - 12:00", classGroup: "12-C Sözel", subject: "TYT İklim & Harita Bilgisi", room: "Derslik 304" },
    ],
    oneOnOneSlots: [],
  },
  {
    id: "tch-9",
    name: "Oğuzhan Arslan",
    role: "Etüt Öğretmeni",
    branch: "Felsefe & Din Kültürü",
    username: "oguzhan.arslan",
    password: "123456",
    email: "oguzhan.arslan@dershane.edu.tr",
    phone: "+90 536 774 30 15",
    schedule: [
      { id: "ts-24", day: "Salı", time: "14:30 - 15:10", classGroup: "12-C Sözel", subject: "AYT Felsefe Grubu", room: "Derslik 304" },
      { id: "ts-25", day: "Cumartesi", time: "15:20 - 16:00", classGroup: "12-B Eşit Ağırlık", subject: "TYT Felsefe & Din", room: "Derslik 301" },
    ],
    oneOnOneSlots: [],
  },
  {
    id: "tch-10",
    name: "Seda Yavuz",
    role: "Akademik Danışman",
    branch: "Paragraf & Rehberlik",
    username: "seda.yavuz",
    password: "123456",
    email: "seda.yavuz@dershane.edu.tr",
    phone: "+90 533 905 64 21",
    schedule: [
      { id: "ts-26", day: "Pazartesi", time: "13:40 - 14:20", classGroup: "11-A Erken Hazırlık", subject: "TYT Paragraf Teknikleri", room: "Derslik 108" },
      { id: "ts-27", day: "Pazar", time: "13:40 - 14:20", classGroup: "12-B Eşit Ağırlık", subject: "Sınav Kaygısı & Zaman Yönetimi", room: "Seminer Salonu" },
    ],
    oneOnOneSlots: [
      { id: "oo-10", studentId: "stu-8", studentName: "Ece Yıldız", day: "Çarşamba", time: "17:00 - 17:40", subject: "Haftalık Çalışma Planı", note: "11. sınıf TYT erken başlangıç rutini." },
    ],
  },
];

const BASE_INITIAL_STUDENTS: StudentAccount[] = [
  {
    id: "stu-1",
    name: "Kerem Yılmaz",
    studentNo: "2026-1042",
    username: "kerem.yilmaz",
    password: "123456",
    classId: "cls-1",
    className: "12-A Sayısal",
    grade: "12. Sınıf (YKS)",
    track: "Sayısal",
    parentName: "Hasan Yılmaz",
    target: "İTÜ Bilgisayar Mühendisliği",
    advisorTeacherId: "tch-1",
    advisorName: "Dr. Selin Kaya",
    phone: "+90 532 418 90 12",
    attendance: 97,
    status: "Aktif",
    exams: [
      {
        id: "ex-106",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "15 Şub 2027",
        totalNet: 105.25,
        maxNet: 120,
        rank: 112,
        subjects: [
          { name: "Türkçe", correct: 37, wrong: 2, empty: 1, net: 36.5 },
          { name: "Sosyal Bilimler", correct: 18, wrong: 1, empty: 1, net: 17.75 },
          { name: "Matematik", correct: 34, wrong: 2, empty: 4, net: 33.5 },
          { name: "Fen Bilimleri", correct: 18, wrong: 2, empty: 0, net: 17.5 },
        ],
        topicBreakdown: [
          { subject: "Türkçe", topic: "Paragrafın Yapısı", total: 8, correct: 6, wrong: 2, empty: 0, percent: 75 },
          { subject: "Türkçe", topic: "Noktalama İşaretleri", total: 2, correct: 1, wrong: 0, empty: 1, percent: 50 },
          { subject: "Matematik", topic: "Mutlak Değer ve Eşitsizlikler", total: 3, correct: 2, wrong: 1, empty: 0, percent: 67 },
          { subject: "Matematik", topic: "Problemler (Hız & İşçi)", total: 6, correct: 4, wrong: 1, empty: 1, percent: 67 },
          { subject: "Geometri", topic: "Üçgende Açı ve Kenar Bağıntıları", total: 3, correct: 1, wrong: 0, empty: 2, percent: 33 },
          { subject: "Fizik", topic: "Kaldırma Kuvveti & Basınç", total: 2, correct: 1, wrong: 1, empty: 0, percent: 50 },
          { subject: "Kimya", topic: "Kimyasal Tepkime Türleri", total: 2, correct: 1, wrong: 1, empty: 0, percent: 50 },
          { subject: "Tarih", topic: "Atatürk İlkeleri ve İnkılapları", total: 2, correct: 1, wrong: 1, empty: 0, percent: 50 },
        ],
      },
      {
        id: "ex-105",
        title: "Türkiye Geneli TYT Denemesi #5",
        type: "TYT",
        date: "18 Oca 2027",
        totalNet: 85.75,
        maxNet: 120,
        rank: 298,
        subjects: [
          { name: "Türkçe", correct: 33, wrong: 5, empty: 2, net: 31.75 },
          { name: "Sosyal Bilimler", correct: 15, wrong: 4, empty: 1, net: 14.0 },
          { name: "Matematik", correct: 28, wrong: 5, empty: 7, net: 26.75 },
          { name: "Fen Bilimleri", correct: 14, wrong: 3, empty: 3, net: 13.25 },
        ],
      },
      {
        id: "ex-104b",
        title: "Kurum İçi TYT Denemesi #4",
        type: "TYT",
        date: "14 Ara 2026",
        totalNet: 100.0,
        maxNet: 120,
        rank: 164,
        subjects: [
          { name: "Türkçe", correct: 36, wrong: 3, empty: 1, net: 35.25 },
          { name: "Sosyal Bilimler", correct: 17, wrong: 1, empty: 2, net: 16.75 },
          { name: "Matematik", correct: 32, wrong: 2, empty: 6, net: 31.5 },
          { name: "Fen Bilimleri", correct: 17, wrong: 2, empty: 1, net: 16.5 },
        ],
      },
      {
        id: "ex-101",
        title: "Türkiye Geneli TYT Denemesi #3",
        type: "TYT",
        date: "02 Kas 2026",
        totalNet: 74.0,
        maxNet: 120,
        rank: 418,
        subjects: [
          { name: "Türkçe", correct: 30, wrong: 6, empty: 4, net: 28.5 },
          { name: "Sosyal Bilimler", correct: 13, wrong: 3, empty: 4, net: 12.25 },
          { name: "Matematik", correct: 24, wrong: 7, empty: 9, net: 22.25 },
          { name: "Fen Bilimleri", correct: 12, wrong: 4, empty: 4, net: 11.0 },
        ],
      },
      {
        id: "ex-102",
        title: "AYT Sayısal Kazanım Denemesi #2",
        type: "AYT",
        date: "14 Kas 2026",
        totalNet: 64.25,
        maxNet: 80,
        rank: 31,
        subjects: [
          { name: "Matematik", correct: 32, wrong: 3, empty: 5, net: 31.25 },
          { name: "Fizik", correct: 12, wrong: 2, empty: 0, net: 11.5 },
          { name: "Kimya", correct: 12, wrong: 1, empty: 0, net: 11.75 },
          { name: "Biyoloji", correct: 10, wrong: 1, empty: 2, net: 9.75 },
        ],
      },
      {
        id: "ex-103",
        title: "Türkiye Geneli TYT Denemesi #2",
        type: "TYT",
        date: "12 Eki 2026",
        totalNet: 88.25,
        maxNet: 120,
        rank: 245,
        subjects: [
          { name: "Türkçe", correct: 33, wrong: 4, empty: 3, net: 32.0 },
          { name: "Sosyal Bilimler", correct: 16, wrong: 4, empty: 0, net: 15.0 },
          { name: "Matematik", correct: 28, wrong: 4, empty: 8, net: 27.0 },
          { name: "Fen Bilimleri", correct: 15, wrong: 3, empty: 2, net: 14.25 },
        ],
      },
      {
        id: "ex-104",
        title: "Türkiye Geneli TYT Denemesi #1",
        type: "TYT",
        date: "14 Eyl 2026",
        totalNet: 64.0,
        maxNet: 120,
        rank: 612,
        subjects: [
          { name: "Türkçe", correct: 27, wrong: 6, empty: 7, net: 25.5 },
          { name: "Sosyal Bilimler", correct: 12, wrong: 6, empty: 2, net: 10.5 },
          { name: "Matematik", correct: 20, wrong: 6, empty: 14, net: 18.5 },
          { name: "Fen Bilimleri", correct: 11, wrong: 6, empty: 3, net: 9.5 },
        ],
      },
    ],
    schedule: [
      {
        id: "ss-3",
        day: "Salı",
        time: "15:00 - 16:00",
        subject: "AYT Türev & Ekstremum (Birebir)",
        teacher: "Dr. Selin Kaya",
        room: "Danışmanlık 2",
        type: "Etüt",
      },
      {
        id: "ss-4",
        day: "Çarşamba",
        time: "16:00 - 17:00",
        subject: "AYT Manyetik İndüksiyon (Birebir)",
        teacher: "Murat Demir",
        room: "Etüt 4",
        type: "Etüt",
      },
    ],
    studyPlan: [
      {
        id: "sp-1",
        day: "Pazartesi",
        subject: "AYT Matematik",
        topic: "Türev Maksimum-Minimum Problemleri (60 Soru)",
        duration: "90 dk",
        completed: true,
      },
      {
        id: "sp-2",
        day: "Salı",
        subject: "TYT Türkçe",
        topic: "Paragraf Hız Seti + Dil Bilgisi Tekrarı",
        duration: "60 dk",
        completed: true,
      },
    ],
    homework: [
      {
        id: "hw-1",
        subject: "Matematik",
        title: "Türev Uygulamaları Fasikülü Test 4–7",
        dueDate: "21 Kas 2026",
        teacherName: "Dr. Selin Kaya",
        status: "Bekliyor",
      },
      {
        id: "hw-2",
        subject: "Fizik",
        title: "Elektromanyetik İndüksiyon 45 Yeni Nesil Soru",
        dueDate: "22 Kas 2026",
        teacherName: "Murat Demir",
        status: "Bekliyor",
      },
    ],
    guidanceSessions: [
      {
        id: "gs-1",
        date: "20 Kas 2026",
        time: "16:30",
        advisorName: "Dr. Selin Kaya",
        topic: "Kasım Ayı Net Hedef Revizyonu & Turlama Stratejisi",
        note: "TYT Matematikte süre yönetimi 5 dk kısaltılacak, AYT Fizik tekrarları artırılacak.",
        status: "Planlandı",
      },
    ],
    personalNotes: [
      {
        id: "pn-1",
        title: "Fizik Sağ El Kuralı Hatırlatma",
        content: "Başparmak akım yönü, dört parmak manyetik alan çizgileri.",
        date: "17 Kas 2026",
      },
    ],
  },
  {
    id: "stu-2",
    name: "Defne Arslan",
    studentNo: "2026-1018",
    username: "defne.arslan",
    password: "123456",
    classId: "cls-2",
    className: "Mezun-1 Sayısal",
    grade: "Mezun (YKS)",
    track: "Sayısal",
    parentName: "Mehmet Arslan",
    target: "Cerrahpaşa Tıp Fakültesi",
    advisorTeacherId: "tch-1",
    advisorName: "Dr. Selin Kaya",
    phone: "+90 535 712 44 09",
    attendance: 99,
    status: "Aktif",
    exams: [
      {
        id: "ex-201",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "15 Şub 2027",
        totalNet: 108.5,
        maxNet: 120,
        rank: 24,
        subjects: [
          { name: "Türkçe", correct: 38, wrong: 2, empty: 0, net: 37.5 },
          { name: "Sosyal Bilimler", correct: 18, wrong: 1, empty: 1, net: 17.75 },
          { name: "Matematik", correct: 36, wrong: 2, empty: 2, net: 35.5 },
          { name: "Fen Bilimleri", correct: 18, wrong: 1, empty: 1, net: 17.75 },
        ],
      },
    ],
    schedule: [
      {
        id: "ss-202",
        day: "Perşembe",
        time: "16:30 - 17:30",
        subject: "TYT Hız Problemleri (Birebir)",
        teacher: "Dr. Selin Kaya",
        room: "Danışmanlık 2",
        type: "Etüt",
      },
    ],
    studyPlan: [],
    homework: [
      {
        id: "hw-201",
        subject: "Matematik",
        title: "İleri Düzey Problem Denemeleri",
        dueDate: "23 Kas 2026",
        teacherName: "Dr. Selin Kaya",
        status: "Bekliyor",
      },
    ],
    guidanceSessions: [],
    personalNotes: [],
  },
  {
    id: "stu-3",
    name: "Emirhan Demir",
    studentNo: "2026-1071",
    username: "emirhan.demir",
    password: "123456",
    classId: "cls-1",
    className: "12-A Sayısal",
    grade: "12. Sınıf (YKS)",
    track: "Sayısal",
    parentName: "Ayşe Demir",
    target: "ODTÜ Elektrik-Elektronik Müh.",
    advisorTeacherId: "tch-2",
    advisorName: "Murat Demir",
    phone: "+90 541 209 87 33",
    attendance: 94,
    status: "Aktif",
    exams: [
      {
        id: "ex-301",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "15 Şub 2027",
        totalNet: 89.0,
        maxNet: 120,
        rank: 412,
        subjects: [
          { name: "Türkçe", correct: 33, wrong: 5, empty: 2, net: 31.75 },
          { name: "Sosyal Bilimler", correct: 15, wrong: 3, empty: 2, net: 14.25 },
          { name: "Matematik", correct: 29, wrong: 4, empty: 7, net: 28.0 },
          { name: "Fen Bilimleri", correct: 16, wrong: 4, empty: 0, net: 15.0 },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [],
    guidanceSessions: [],
    personalNotes: [],
  },
  {
    id: "stu-4",
    name: "Zehra Karahan",
    studentNo: "2026-1091",
    username: "zehra.karahan",
    password: "123456",
    classId: "cls-3",
    className: "12-B Eşit Ağırlık",
    grade: "12. Sınıf (YKS)",
    track: "Eşit Ağırlık",
    parentName: "Hasan Karahan",
    target: "Galatasaray Üniversitesi Hukuk",
    advisorTeacherId: "tch-3",
    advisorName: "Zeynep Aksoy",
    phone: "+90 537 210 44 19",
    attendance: 98,
    status: "Aktif",
    exams: [
      {
        id: "ex-z1",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "14 Kasım 2026",
        totalNet: 91.5,
        maxNet: 120,
        rank: 204,
        subjects: [
          { name: "Türkçe", correct: 37, wrong: 2, empty: 1, net: 36.5 },
          { name: "Sosyal Bilimler", correct: 18, wrong: 2, empty: 0, net: 17.5 },
          { name: "Matematik", correct: 28, wrong: 2, empty: 10, net: 27.5 },
          { name: "Fen Bilimleri", correct: 11, wrong: 4, empty: 5, net: 10.0 },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [
      { id: "hw-z1", subject: "AYT Edebiyat", title: "Divan Şiiri Mazmunları Tarama", dueDate: "22 Kasım", teacherName: "Zeynep Aksoy", status: "Bekliyor" },
    ],
    guidanceSessions: [
      { id: "gs-z1", date: "19 Kasım 2026", time: "14:00", advisorName: "Zeynep Aksoy", topic: "EA Matematik Net Artışı", note: "İlk 12 soru hızlandırma planlandı.", status: "Planlandı" },
    ],
    personalNotes: [],
  },
  {
    id: "stu-5",
    name: "Mert Kaya",
    studentNo: "2026-1104",
    username: "mert.kaya",
    password: "123456",
    classId: "cls-3",
    className: "12-B Eşit Ağırlık",
    grade: "12. Sınıf (YKS)",
    track: "Eşit Ağırlık",
    parentName: "Serkan Kaya",
    target: "Boğaziçi İşletme",
    advisorTeacherId: "tch-6",
    advisorName: "Caner Aydın",
    phone: "+90 538 411 62 05",
    attendance: 94,
    status: "Aktif",
    exams: [
      {
        id: "ex-m1",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "14 Kasım 2026",
        totalNet: 84.25,
        maxNet: 120,
        rank: 518,
        subjects: [
          { name: "Türkçe", correct: 33, wrong: 4, empty: 3, net: 32.0 },
          { name: "Sosyal Bilimler", correct: 17, wrong: 3, empty: 0, net: 16.25 },
          { name: "Matematik", correct: 27, wrong: 4, empty: 9, net: 26.0 },
          { name: "Fen Bilimleri", correct: 11, wrong: 4, empty: 5, net: 10.0 },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [],
    guidanceSessions: [],
    personalNotes: [],
  },
  {
    id: "stu-6",
    name: "Ayşe Nur Şahin",
    studentNo: "2026-1120",
    username: "ayse.sahin",
    password: "123456",
    classId: "cls-4",
    className: "12-C Sözel",
    grade: "12. Sınıf (YKS)",
    track: "Sözel",
    parentName: "Fatma Şahin",
    target: "Ankara Üniversitesi İletişim",
    advisorTeacherId: "tch-6",
    advisorName: "Caner Aydın",
    phone: "+90 539 601 29 77",
    attendance: 99,
    status: "Aktif",
    exams: [
      {
        id: "ex-a1",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "14 Kasım 2026",
        totalNet: 81.0,
        maxNet: 120,
        rank: 610,
        subjects: [
          { name: "Türkçe", correct: 38, wrong: 2, empty: 0, net: 37.5 },
          { name: "Sosyal Bilimler", correct: 19, wrong: 1, empty: 0, net: 18.75 },
          { name: "Matematik", correct: 17, wrong: 5, empty: 18, net: 15.75 },
          { name: "Fen Bilimleri", correct: 10, wrong: 4, empty: 6, net: 9.0 },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [],
    guidanceSessions: [],
    personalNotes: [],
  },
  {
    id: "stu-7",
    name: "Berkay Öztürk",
    studentNo: "2026-1135",
    username: "berkay.ozturk",
    password: "123456",
    classId: "cls-2",
    className: "Mezun-1 Sayısal",
    grade: "Mezun (YKS)",
    track: "Sayısal",
    parentName: "Kemal Öztürk",
    target: "Hacettepe Tıp",
    advisorTeacherId: "tch-2",
    advisorName: "Murat Demir",
    phone: "+90 531 820 33 90",
    attendance: 96,
    status: "Aktif",
    exams: [
      {
        id: "ex-b1",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "14 Kasım 2026",
        totalNet: 95.75,
        maxNet: 120,
        rank: 155,
        subjects: [
          { name: "Türkçe", correct: 34, wrong: 4, empty: 2, net: 33.0 },
          { name: "Sosyal Bilimler", correct: 16, wrong: 2, empty: 2, net: 15.5 },
          { name: "Matematik", correct: 33, wrong: 3, empty: 4, net: 32.25 },
          { name: "Fen Bilimleri", correct: 16, wrong: 4, empty: 0, net: 15.0 },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [],
    guidanceSessions: [],
    personalNotes: [],
  },
  {
    id: "stu-8",
    name: "Ece Yıldız",
    studentNo: "2026-1152",
    username: "ece.yildiz",
    password: "123456",
    classId: "cls-5",
    className: "11-A Erken Hazırlık",
    grade: "11. Sınıf",
    track: "Sayısal",
    parentName: "Dilek Yıldız",
    target: "İTÜ Mimarlık",
    advisorTeacherId: "tch-5",
    advisorName: "Elif Çelik",
    phone: "+90 542 190 85 11",
    attendance: 97,
    status: "Aktif",
    exams: [
      {
        id: "ex-e1",
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "14 Kasım 2026",
        totalNet: 74.5,
        maxNet: 120,
        rank: 820,
        subjects: [
          { name: "Türkçe", correct: 31, wrong: 5, empty: 4, net: 29.75 },
          { name: "Sosyal Bilimler", correct: 14, wrong: 4, empty: 2, net: 13.0 },
          { name: "Matematik", correct: 22, wrong: 4, empty: 14, net: 21.0 },
          { name: "Fen Bilimleri", correct: 12, wrong: 5, empty: 3, net: 10.75 },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [],
    guidanceSessions: [],
    personalNotes: [],
  },
];

const EXTRA_FIRST_NAMES = [
  "Arda", "Elif", "Yusuf", "Zeynep", "Ege", "Melis", "Kaan", "İrem", "Bora", "Nehir",
  "Emre", "Yağmur", "Tuna", "Selin", "Ozan", "Ceren", "Deniz", "Buse", "Alper", "Duru",
  "Doruk", "Aslı", "Can", "Sude", "Umut", "Gizem", "Eren", "İdil", "Bartu", "Naz",
  "Rüzgar", "Başak", "Poyraz", "Damla", "Yiğit", "Simge", "Kuzey", "Hazal", "Toprak", "Aylin",
  "Furkan", "Ela",
];

const EXTRA_LAST_NAMES = [
  "Yalçın", "Güneş", "Acar", "Korkmaz", "Tekin", "Şimşek", "Erdoğan", "Bulut", "Keskin", "Polat",
  "Sarı", "Aktaş", "Koçak", "Taş", "Turan", "Işık", "Avcı", "Soylu", "Uçar", "Bozkurt",
  "Çetin", "Bayram", "Aydın", "Karaca", "Doğan", "Duman", "Özkan", "Güler", "Şener", "Kaplan",
  "Kurt", "Yücel", "Oral", "Bilgin", "Ünal", "Özer", "Çakır", "Aslan", "Mutlu", "Ekinci",
  "Kılıç", "Sezer",
];

const EXTRA_TARGETS: Record<StudentAccount["track"], string[]> = {
  Sayısal: [
    "İTÜ Yapay Zeka Müh.",
    "ODTÜ Endüstri Müh.",
    "Cerrahpaşa Tıp",
    "Boğaziçi Bilgisayar Müh.",
    "Hacettepe Tıp",
  ],
  "Eşit Ağırlık": [
    "Galatasaray Hukuk",
    "Boğaziçi Ekonomi",
    "Ankara Üniversitesi Hukuk",
    "Koç İşletme",
    "Marmara Psikoloji",
  ],
  Sözel: [
    "Ankara İletişim",
    "İstanbul Türk Dili ve Edb.",
    "Hacettepe Tarih",
    "Marmara Gazetecilik",
    "Ege Radyo ve Sinema",
  ],
};

function toAsciiSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

const GENERATED_STUDENTS: StudentAccount[] = EXTRA_FIRST_NAMES.map((first, idx) => {
  const num = idx + 9; // stu-9 .. stu-50 (42 students + 8 base = 50)
  const last = EXTRA_LAST_NAMES[idx % EXTRA_LAST_NAMES.length];
  const fullName = `${first} ${last}`;
  const cls = INITIAL_CLASSES[idx % INITIAL_CLASSES.length];
  const advisor = INITIAL_TEACHERS[idx % INITIAL_TEACHERS.length];
  const grade: StudentAccount["grade"] =
    cls.id === "cls-2"
      ? "Mezun (YKS)"
      : cls.id === "cls-5"
      ? "11. Sınıf"
      : "12. Sınıf (YKS)";

  const turkceC = 28 + ((idx * 3) % 10);
  const sosC = 13 + ((idx * 2) % 6);
  const matC = cls.track === "Sözel" ? 14 + (idx % 10) : 24 + ((idx * 5) % 14);
  const fenC = cls.track === "Sayısal" ? 13 + (idx % 7) : 7 + (idx % 6);
  const calc = (c: number, w: number) => Number((c - w / 4).toFixed(2));
  const totalNet = Number(
    (
      calc(turkceC, 3) +
      calc(sosC, 2) +
      calc(matC, 3) +
      calc(fenC, 2)
    ).toFixed(2)
  );
  const prevNet = Number((totalNet - 4.5).toFixed(2));
  const targets = EXTRA_TARGETS[cls.track];

  return {
    id: `stu-${num}`,
    name: fullName,
    studentNo: `2026-${1200 + num}`,
    username: `${toAsciiSlug(first)}.${toAsciiSlug(last)}${num}`,
    password: "123456",
    classId: cls.id,
    className: cls.name,
    grade,
    track: cls.track,
    parentName: `${EXTRA_FIRST_NAMES[(idx + 7) % EXTRA_FIRST_NAMES.length]} ${last}`,
    target: targets[idx % targets.length],
    advisorTeacherId: advisor.id,
    advisorName: advisor.name,
    phone: `+90 53${idx % 9} ${310 + idx} ${(10 + idx) % 90} ${(20 + idx * 2) % 90}`,
    attendance: 90 + (idx % 10),
    status: "Aktif",
    exams: [
      {
        id: `ex-g1-${num}`,
        title: "Türkiye Geneli TYT Denemesi #5",
        type: "TYT",
        date: "24 Ekim 2026",
        totalNet: prevNet,
        maxNet: 120,
        rank: 150 + idx * 14,
        subjects: [
          { name: "Türkçe", correct: Math.max(20, turkceC - 2), wrong: 4, empty: 2, net: calc(Math.max(20, turkceC - 2), 4) },
          { name: "Sosyal Bilimler", correct: Math.max(10, sosC - 1), wrong: 2, empty: 1, net: calc(Math.max(10, sosC - 1), 2) },
          { name: "Matematik", correct: Math.max(12, matC - 2), wrong: 4, empty: 4, net: calc(Math.max(12, matC - 2), 4) },
          { name: "Fen Bilimleri", correct: Math.max(5, fenC - 1), wrong: 3, empty: 2, net: calc(Math.max(5, fenC - 1), 3) },
        ],
      },
      {
        id: `ex-g2-${num}`,
        title: "Türkiye Geneli TYT Denemesi #6",
        type: "TYT",
        date: "14 Kasım 2026",
        totalNet,
        maxNet: 120,
        rank: 110 + idx * 12,
        subjects: [
          { name: "Türkçe", correct: turkceC, wrong: 3, empty: 40 - turkceC - 3, net: calc(turkceC, 3) },
          { name: "Sosyal Bilimler", correct: sosC, wrong: 2, empty: 20 - sosC - 2, net: calc(sosC, 2) },
          { name: "Matematik", correct: matC, wrong: 3, empty: 40 - matC - 3, net: calc(matC, 3) },
          { name: "Fen Bilimleri", correct: fenC, wrong: 2, empty: 20 - fenC - 2, net: calc(fenC, 2) },
        ],
      },
    ],
    schedule: [],
    studyPlan: [],
    homework: [
      {
        id: `hw-g-${num}`,
        subject: advisor.branch.split("&")[0].trim(),
        title: "Haftalık Kazanım Tarama Testi",
        dueDate: "24 Kasım",
        teacherName: advisor.name,
        status: idx % 2 === 0 ? "Tamamlandı" : "Bekliyor",
      },
    ],
    guidanceSessions: [],
    personalNotes: [],
  };
});

const TOPIC_TEMPLATE_POOL: {
  subject: string;
  topic: string;
  total: number;
}[] = [
  { subject: "Türkçe", topic: "Paragrafın Yapısı ve Akış", total: 8 },
  { subject: "Türkçe", topic: "Noktalama İşaretleri & Yazım Kuralları", total: 4 },
  { subject: "Türkçe", topic: "Cümle Anlamı & Fiilimsiler", total: 5 },
  { subject: "Matematik", topic: "Sayı ve Kesir Problemleri", total: 6 },
  { subject: "Matematik", topic: "Mutlak Değer ve Eşitsizlikler", total: 3 },
  { subject: "Matematik", topic: "Üslü ve Köklü İfadeler", total: 4 },
  { subject: "Geometri", topic: "Üçgende Açı ve Benzerlik", total: 4 },
  { subject: "Fizik", topic: "Kaldırma Kuvveti & Basınç", total: 3 },
  { subject: "Kimya", topic: "Mol Kavramı ve Kimyasal Hesaplamalar", total: 3 },
  { subject: "Biyoloji", topic: "Hücre Bölünmeleri (Mitoz - Mayoz)", total: 3 },
  { subject: "Tarih", topic: "Milli Mücadele Hazırlık Dönemi", total: 3 },
  { subject: "Coğrafya", topic: "Türkiye İklimi ve Harita Bilgisi", total: 3 },
];

function buildTopicBreakdownForStudent(
  seed: number,
  track: StudentAccount["track"]
): TopicPerformance[] {
  return TOPIC_TEMPLATE_POOL.map((tpl, i) => {
    const isStrongArea =
      (track === "Sayısal" &&
        (tpl.subject === "Matematik" ||
          tpl.subject === "Fizik" ||
          tpl.subject === "Kimya")) ||
      (track === "Sözel" &&
        (tpl.subject === "Türkçe" ||
          tpl.subject === "Tarih" ||
          tpl.subject === "Coğrafya")) ||
      (track === "Eşit Ağırlık" &&
        (tpl.subject === "Türkçe" || tpl.subject === "Matematik"));

    const wrong = (seed + i * 3) % (isStrongArea ? 2 : 3);
    const empty = (seed + i) % 3 === 0 ? 1 : 0;
    const boundedWrong = Math.min(wrong, tpl.total);
    const boundedEmpty = Math.min(empty, tpl.total - boundedWrong);
    const correct = Math.max(0, tpl.total - boundedWrong - boundedEmpty);
    const percent = Math.round((correct / tpl.total) * 100);

    return {
      subject: tpl.subject,
      topic: tpl.topic,
      total: tpl.total,
      correct,
      wrong: boundedWrong,
      empty: boundedEmpty,
      percent,
    };
  });
}

function ensureMultiMonthTytHistory(
  exams: StudentExamRecord[],
  seed: number
): StudentExamRecord[] {
  const tytExams = exams.filter((e) => e.type === "TYT");
  if (tytExams.length >= 4) return exams;

  const baseExam = tytExams[0] ?? exams[0];
  if (!baseExam) return exams;

  const monthTemplates = [
    { label: "15 Eyl 2026", title: "Kurum İçi TYT Denemesi #1", offset: -3 },
    { label: "18 Eki 2026", title: "Türkiye Geneli TYT Denemesi #2", offset: -1 },
    { label: "14 Kas 2026", title: "Türkiye Geneli TYT Denemesi #3", offset: -2 },
    { label: "19 Ara 2026", title: "Türkiye Geneli TYT Denemesi #4", offset: 1 },
    { label: "23 Oca 2027", title: "Türkiye Geneli TYT Denemesi #5", offset: 0 },
  ];

  const syntheticTyt: StudentExamRecord[] = monthTemplates.map((m, i) => {
    const subjects = baseExam.subjects.map((sub, sIdx) => {
      const delta = m.offset + ((seed + i + sIdx) % 2 === 0 ? 1 : 0);
      const c = Math.max(4, Math.min(sub.name === "Türkçe" || sub.name === "Matematik" ? 39 : 19, sub.correct + delta));
      const w = Math.max(0, sub.wrong);
      const net = Number((c - w / 4).toFixed(2));
      return { ...sub, correct: c, net };
    });
    const totalNet = Number(
      subjects.reduce((acc, s) => acc + s.net, 0).toFixed(2)
    );
    return {
      id: `ex-hist-${seed}-${i}`,
      title: m.title,
      type: "TYT",
      date: m.label,
      totalNet,
      maxNet: 120,
      rank: Math.max(12, baseExam.rank + (4 - i) * 18),
      subjects,
      topicBreakdown: i === monthTemplates.length - 1 ? baseExam.topicBreakdown : undefined,
    };
  });

  const nonTyt = exams.filter((e) => e.type !== "TYT");
  return [...syntheticTyt, ...nonTyt];
}

const INITIAL_STUDENTS: StudentAccount[] = [
  ...BASE_INITIAL_STUDENTS,
  ...GENERATED_STUDENTS,
].map((stu, idx) => {
  const withTopics = stu.exams.map((ex, exIdx) =>
    exIdx === 0 && (!ex.topicBreakdown || ex.topicBreakdown.length === 0)
      ? {
          ...ex,
          topicBreakdown: buildTopicBreakdownForStudent(idx + 1, stu.track),
        }
      : ex
  );
  return {
    ...stu,
    exams: ensureMultiMonthTytHistory(withTopics, idx + 1),
  };
});

const INITIAL_SITE_CONTENT: SiteContentConfig = {
  heroTitlePrefix: "Disiplinli çalışma,",
  heroTitleAccent: "ölçülebilir",
  heroTitleSuffix: "akademik yükseliş.",
  ecosystemBannerImage: "/images/2dershane.jpeg",
  instagramReels: [
    {
      id: "reel-1",
      title: "Sabah Etüt & Soru Çözüm Maratonu",
      category: "Kampüs Yaşamı",
      views: "18.4B",
      videoSrc: "/videos/girisvideo.mp4",
      poster: "/images/1dershane.jpeg",
      instagramUrl: "https://www.instagram.com/reels/",
    },
    {
      id: "reel-2",
      title: "Türkiye Geneli TYT Deneme Günü",
      category: "Ölçme & Analiz",
      views: "24.1B",
      videoSrc: "/videos/dershanevideogiris.mp4",
      poster: "/images/2dershane.jpeg",
      instagramUrl: "https://www.instagram.com/reels/",
    },
    {
      id: "reel-3",
      title: "Birebir Akademik Koçluk & Konu Takibi",
      category: "Rehberlik",
      views: "15.9B",
      videoSrc: "/videos/girisvideo.mp4",
      poster: "/images/mentoring-session.jpg",
      instagramUrl: "https://www.instagram.com/reels/",
    },
    {
      id: "reel-4",
      title: "2026 YKS Derece Öğrencilerimizden Notlar",
      category: "Başarı Hikayesi",
      views: "32.7B",
      videoSrc: "/videos/dershanevideogiris.mp4",
      poster: "/images/hero-academy.jpg",
      instagramUrl: "https://www.instagram.com/reels/",
    },
  ],
  honorStudents: [
    {
      rank: "TR 84.",
      name: "Defne Arslan",
      department: "Cerrahpaşa Tıp",
      track: "SAY",
      image: "/images/ogrenciler/ogr6.png",
    },
    {
      rank: "TR 142.",
      name: "Kerem Yılmaz",
      department: "İTÜ Bilgisayar Müh.",
      track: "SAY",
      image: "/images/ogrenciler/ogr1.png",
    },
    {
      rank: "TR 198.",
      name: "Zeynep Naz Kaya",
      department: "Galatasaray Hukuk",
      track: "EA",
      image: "/images/ogrenciler/ogr2.png",
    },
    {
      rank: "TR 245.",
      name: "Emirhan Demir",
      department: "ODTÜ Elektrik-Elektronik",
      track: "SAY",
      image: "/images/ogrenciler/ogr3.png",
    },
    {
      rank: "TR 312.",
      name: "Elif Sude Çelik",
      department: "Hacettepe Tıp",
      track: "SAY",
      image: "/images/ogrenciler/ogr4.png",
    },
  ],
};

const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Ayşe Karahan",
    phone: "+90 532 814 22 09",
    grade: "12. Sınıf (YKS)",
    note: "Kızım için Sayısal Mezun/Örgün sınıfları ve seviye tespit sınavı hakkında görüşmek istiyoruz.",
    createdAt: "18 Kas 2026 • 14:20",
    status: "Yeni",
  },
];

interface CampusContextValue {
  students: StudentAccount[];
  teachers: TeacherAccount[];
  classes: ClassroomRecord[];
  announcements: CampusAnnouncement[];
  contactMessages: ContactMessage[];
  siteContent: SiteContentConfig;
  packages: CoursePackage[];
  activeStudent: StudentAccount;
  activeTeacher: TeacherAccount;
  adminAuthenticated: boolean;
  loginStudent: (identifier: string, password: string) => { ok: boolean; error?: string };
  loginTeacher: (identifier: string, password: string) => { ok: boolean; error?: string };
  loginAdmin: (email: string, password: string) => { ok: boolean; error?: string };
  logoutAdmin: () => void;
  addStudent: (
    payload: Omit<
      StudentAccount,
      | "id"
      | "exams"
      | "schedule"
      | "studyPlan"
      | "homework"
      | "guidanceSessions"
      | "personalNotes"
    >
  ) => string;
  addTeacher: (
    payload: Omit<TeacherAccount, "id" | "schedule" | "oneOnOneSlots">
  ) => string;
  updateStudent: (
    studentId: string,
    patch: Partial<
      Pick<
        StudentAccount,
        | "name"
        | "studentNo"
        | "classId"
        | "className"
        | "track"
        | "target"
        | "advisorName"
        | "parentName"
        | "username"
        | "password"
        | "attendance"
      >
    >
  ) => void;
  deleteStudent: (studentId: string) => void;
  updateTeacher: (
    teacherId: string,
    patch: Partial<
      Pick<
        TeacherAccount,
        "name" | "role" | "branch" | "username" | "password" | "email" | "phone"
      >
    >
  ) => void;
  deleteTeacher: (teacherId: string) => void;
  addExamToStudent: (studentId: string, exam: Omit<StudentExamRecord, "id">) => void;
  deleteStudentExam: (studentId: string, examId: string) => void;
  addBulkExamsToStudents: (
    entries: { studentId: string; exam: Omit<StudentExamRecord, "id"> }[]
  ) => void;
  addScheduleToStudent: (
    studentId: string,
    slot: Omit<StudentScheduleSlot, "id">
  ) => void;
  removeStudentScheduleSlot: (studentId: string, slotId: string) => void;
  addHomeworkToStudent: (
    studentId: string,
    hw: Omit<HomeworkItem, "id">
  ) => void;
  toggleHomeworkStatus: (studentId: string, hwId: string) => void;
  deleteHomeworkFromStudent: (studentId: string, hwId: string) => void;
  addStudyPlanToStudent: (
    studentId: string,
    plan: Omit<StudyPlanItem, "id">
  ) => void;
  toggleStudyPlanItem: (studentId: string, planId: string) => void;
  deleteStudyPlanItem: (studentId: string, planId: string) => void;
  addGuidanceToStudent: (
    studentId: string,
    session: Omit<GuidanceSession, "id">
  ) => void;
  deleteGuidanceSession: (studentId: string, sessionId: string) => void;
  addPersonalNote: (studentId: string, title: string, content: string) => void;
  deletePersonalNote: (studentId: string, noteId: string) => void;
  addScheduleToTeacher: (
    teacherId: string,
    slot: Omit<TeacherScheduleSlot, "id">
  ) => void;
  updateTeacherScheduleSlot: (
    teacherId: string,
    slotId: string,
    patch: Partial<Omit<TeacherScheduleSlot, "id">>
  ) => void;
  removeTeacherScheduleSlot: (teacherId: string, slotId: string) => void;
  createOneOnOneSession: (
    teacherId: string,
    studentId: string,
    day: WeekDay,
    time: string,
    subject: string,
    note: string
  ) => void;
  updateOneOnOneSlot: (
    teacherId: string,
    slotId: string,
    patch: Partial<Pick<OneOnOneSlot, "day" | "time" | "subject" | "note">>
  ) => void;
  removeOneOnOneSlot: (teacherId: string, slotId: string) => void;
  addClass: (
    payload: Omit<ClassroomRecord, "id" | "schedule">,
    initialStudentIds?: string[]
  ) => string;
  updateClass: (
    classId: string,
    patch: Partial<Pick<ClassroomRecord, "name" | "track" | "room">>
  ) => void;
  deleteClass: (classId: string) => void;
  assignStudentToClass: (studentId: string, classId: string) => void;
  addScheduleToClass: (
    classId: string,
    slot: Omit<StudentScheduleSlot, "id">
  ) => void;
  updateClassScheduleSlot: (
    classId: string,
    slotId: string,
    patch: Partial<Omit<StudentScheduleSlot, "id">>
  ) => void;
  addBulkScheduleToClass: (
    classId: string,
    slots: Omit<StudentScheduleSlot, "id">[]
  ) => void;
  clearClassSchedule: (classId: string) => void;
  removeClassScheduleSlot: (classId: string, slotId: string) => void;
  addAnnouncement: (
    ann: Omit<CampusAnnouncement, "id" | "date">
  ) => void;
  deleteAnnouncement: (id: string) => void;
  addContactMessage: (
    msg: Omit<ContactMessage, "id" | "createdAt" | "status">
  ) => void;
  toggleContactMessageStatus: (id: string) => void;
  deleteContactMessage: (id: string) => void;
  updateSiteContent: (patch: Partial<SiteContentConfig>) => void;
  updatePackage: (slug: string, patch: Partial<CoursePackage>) => void;
}

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CampusState>({
    students: INITIAL_STUDENTS,
    teachers: INITIAL_TEACHERS,
    classes: INITIAL_CLASSES,
    announcements: INITIAL_ANNOUNCEMENTS,
    contactMessages: INITIAL_CONTACT_MESSAGES,
    siteContent: INITIAL_SITE_CONTENT,
    packages: COURSE_PACKAGES,
    activeStudentId: INITIAL_STUDENTS[0].id,
    activeTeacherId: INITIAL_TEACHERS[0].id,
    adminAuthenticated: false,
  });

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CampusState>;
          if (
            Array.isArray(parsed.students) &&
            parsed.students.length > 0 &&
            Array.isArray(parsed.teachers) &&
            parsed.teachers.length > 0
          ) {
            setState((prev) => ({
              ...prev,
              students: parsed.students!,
              teachers: parsed.teachers!,
              classes:
                Array.isArray(parsed.classes) && parsed.classes.length > 0
                  ? parsed.classes
                  : INITIAL_CLASSES,
              announcements: Array.isArray(parsed.announcements)
                ? parsed.announcements
                : INITIAL_ANNOUNCEMENTS,
              contactMessages: Array.isArray(parsed.contactMessages)
                ? parsed.contactMessages
                : INITIAL_CONTACT_MESSAGES,
              siteContent: parsed.siteContent ?? INITIAL_SITE_CONTENT,
              packages:
                Array.isArray(parsed.packages) && parsed.packages.length > 0
                  ? parsed.packages
                  : COURSE_PACKAGES,
              activeStudentId: parsed.activeStudentId || parsed.students![0].id,
              activeTeacherId: parsed.activeTeacherId || parsed.teachers![0].id,
              adminAuthenticated: Boolean(parsed.adminAuthenticated),
            }));
          }
        }
      } catch {
        // Ignore storage errors
      }
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const persist = (updater: (prev: CampusState) => CampusState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  const loginStudent = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const found = state.students.find(
      (s) =>
        (s.username.toLowerCase() === cleanId ||
          s.studentNo.toLowerCase() === cleanId ||
          `${s.username.toLowerCase()}@dershane.edu.tr` === cleanId) &&
        s.password === password
    );
    if (!found) {
      return {
        ok: false,
        error: "Kullanıcı adı / öğrenci no veya şifre hatalı.",
      };
    }
    persist((prev) => ({ ...prev, activeStudentId: found.id }));
    return { ok: true };
  };

  const loginTeacher = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const found = state.teachers.find(
      (t) =>
        (t.username.toLowerCase() === cleanId ||
          t.email.toLowerCase() === cleanId) &&
        t.password === password
    );
    if (!found) {
      return { ok: false, error: "Öğretmen kullanıcı adı veya şifre hatalı." };
    }
    persist((prev) => ({ ...prev, activeTeacherId: found.id }));
    return { ok: true };
  };

  const loginAdmin = (email: string, password: string) => {
    const clean = email.trim().toLowerCase();
    if (
      (clean === "yonetici@dershane.edu.tr" || clean === "admin") &&
      (password === "123456" || password === "admin123")
    ) {
      persist((prev) => ({ ...prev, adminAuthenticated: true }));
      return { ok: true };
    }
    return { ok: false, error: "Yönetici e-postası veya şifre hatalı." };
  };

  const logoutAdmin = () => {
    persist((prev) => ({ ...prev, adminAuthenticated: false }));
  };

  const addStudent: CampusContextValue["addStudent"] = (payload) => {
    const id = `stu-${Date.now()}`;
    persist((prev) => ({
      ...prev,
      students: [
        {
          ...payload,
          id,
          exams: [],
          schedule: [],
          studyPlan: [],
          homework: [],
          guidanceSessions: [],
          personalNotes: [],
        },
        ...prev.students,
      ],
    }));
    return id;
  };

  const addTeacher: CampusContextValue["addTeacher"] = (payload) => {
    const id = `tch-${Date.now()}`;
    persist((prev) => ({
      ...prev,
      teachers: [
        {
          ...payload,
          id,
          schedule: [],
          oneOnOneSlots: [],
        },
        ...prev.teachers,
      ],
    }));
    return id;
  };

  const updateStudent: CampusContextValue["updateStudent"] = (
    studentId,
    patch
  ) => {
    persist((prev) => {
      const targetClass = patch.classId
        ? prev.classes.find((c) => c.id === patch.classId)
        : undefined;
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                ...patch,
                className: targetClass
                  ? targetClass.name
                  : patch.className ?? s.className,
              }
            : s
        ),
        teachers: prev.teachers.map((t) => ({
          ...t,
          oneOnOneSlots: t.oneOnOneSlots.map((oo) =>
            oo.studentId === studentId && patch.name
              ? { ...oo, studentName: patch.name }
              : oo
          ),
        })),
      };
    });
  };

  const deleteStudent: CampusContextValue["deleteStudent"] = (studentId) => {
    persist((prev) => {
      const remaining = prev.students.filter((s) => s.id !== studentId);
      return {
        ...prev,
        students: remaining,
        activeStudentId:
          prev.activeStudentId === studentId
            ? remaining[0]?.id ?? ""
            : prev.activeStudentId,
        teachers: prev.teachers.map((t) => ({
          ...t,
          oneOnOneSlots: t.oneOnOneSlots.filter(
            (oo) => oo.studentId !== studentId
          ),
        })),
      };
    });
  };

  const updateTeacher: CampusContextValue["updateTeacher"] = (
    teacherId,
    patch
  ) => {
    persist((prev) => {
      const oldTeacher = prev.teachers.find((t) => t.id === teacherId);
      const oldName = oldTeacher?.name;
      const newName = patch.name;
      return {
        ...prev,
        teachers: prev.teachers.map((t) =>
          t.id === teacherId ? { ...t, ...patch } : t
        ),
        classes:
          oldName && newName && oldName !== newName
            ? prev.classes.map((c) => ({
                ...c,
                schedule: c.schedule.map((slot) =>
                  slot.teacher === oldName ? { ...slot, teacher: newName } : slot
                ),
              }))
            : prev.classes,
      };
    });
  };

  const deleteTeacher: CampusContextValue["deleteTeacher"] = (teacherId) => {
    persist((prev) => {
      const remaining = prev.teachers.filter((t) => t.id !== teacherId);
      return {
        ...prev,
        teachers: remaining,
        activeTeacherId:
          prev.activeTeacherId === teacherId
            ? remaining[0]?.id ?? ""
            : prev.activeTeacherId,
      };
    });
  };

  const deleteStudentExam: CampusContextValue["deleteStudentExam"] = (
    studentId,
    examId
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, exams: s.exams.filter((e) => e.id !== examId) }
          : s
      ),
    }));
  };

  const removeStudentScheduleSlot: CampusContextValue["removeStudentScheduleSlot"] = (
    studentId,
    slotId
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, schedule: s.schedule.filter((slot) => slot.id !== slotId) }
          : s
      ),
    }));
  };

  const deleteHomeworkFromStudent: CampusContextValue["deleteHomeworkFromStudent"] = (
    studentId,
    hwId
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, homework: s.homework.filter((hw) => hw.id !== hwId) }
          : s
      ),
    }));
  };

  const deleteStudyPlanItem: CampusContextValue["deleteStudyPlanItem"] = (
    studentId,
    planId
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, studyPlan: s.studyPlan.filter((p) => p.id !== planId) }
          : s
      ),
    }));
  };

  const deleteGuidanceSession: CampusContextValue["deleteGuidanceSession"] = (
    studentId,
    sessionId
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              guidanceSessions: s.guidanceSessions.filter(
                (g) => g.id !== sessionId
              ),
            }
          : s
      ),
    }));
  };

  const updateTeacherScheduleSlot: CampusContextValue["updateTeacherScheduleSlot"] = (
    teacherId,
    slotId,
    patch
  ) => {
    persist((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              schedule: t.schedule.map((slot) =>
                slot.id === slotId ? { ...slot, ...patch } : slot
              ),
            }
          : t
      ),
    }));
  };

  const updateOneOnOneSlot: CampusContextValue["updateOneOnOneSlot"] = (
    teacherId,
    slotId,
    patch
  ) => {
    persist((prev) => {
      const teacher = prev.teachers.find((t) => t.id === teacherId);
      const oldSlot = teacher?.oneOnOneSlots.find((o) => o.id === slotId);
      if (!teacher || !oldSlot) return prev;
      const nextSubject = (patch.subject ?? oldSlot.subject)
        .replace(/\s*\(Birebir\)\s*$/i, "")
        .trim();
      const nextDay = patch.day ?? oldSlot.day;
      const nextTime = (patch.time ?? oldSlot.time).trim();
      const nextNote = patch.note ?? oldSlot.note;

      return {
        ...prev,
        teachers: prev.teachers.map((t) =>
          t.id === teacherId
            ? {
                ...t,
                oneOnOneSlots: t.oneOnOneSlots.map((o) =>
                  o.id === slotId
                    ? {
                        ...o,
                        day: nextDay,
                        time: nextTime,
                        subject: nextSubject,
                        note: nextNote,
                      }
                    : o
                ),
              }
            : t
        ),
        students: prev.students.map((s) =>
          s.id === oldSlot.studentId
            ? {
                ...s,
                schedule: s.schedule.map((ss) =>
                  ss.type === "Etüt" &&
                  ss.day === oldSlot.day &&
                  ss.time === oldSlot.time &&
                  ss.teacher === teacher.name
                    ? {
                        ...ss,
                        day: nextDay,
                        time: nextTime,
                        subject: nextSubject,
                      }
                    : ss
                ),
              }
            : s
        ),
      };
    });
  };

  const updateClass: CampusContextValue["updateClass"] = (classId, patch) => {
    persist((prev) => {
      const oldClass = prev.classes.find((c) => c.id === classId);
      const oldName = oldClass?.name;
      const newName = patch.name?.trim();
      return {
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === classId
            ? { ...c, ...patch, name: newName || c.name }
            : c
        ),
        students:
          oldName && newName && oldName !== newName
            ? prev.students.map((s) =>
                s.classId === classId ? { ...s, className: newName } : s
              )
            : prev.students,
        teachers:
          oldName && newName && oldName !== newName
            ? prev.teachers.map((t) => ({
                ...t,
                schedule: t.schedule.map((slot) =>
                  slot.classGroup === oldName
                    ? { ...slot, classGroup: newName }
                    : slot
                ),
              }))
            : prev.teachers,
      };
    });
  };

  const deleteClass: CampusContextValue["deleteClass"] = (classId) => {
    persist((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== classId),
    }));
  };

  const updateClassScheduleSlot: CampusContextValue["updateClassScheduleSlot"] = (
    classId,
    slotId,
    patch
  ) => {
    persist((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classId
          ? {
              ...c,
              schedule: c.schedule.map((slot) =>
                slot.id === slotId ? { ...slot, ...patch } : slot
              ),
            }
          : c
      ),
    }));
  };

  const deleteContactMessage: CampusContextValue["deleteContactMessage"] = (
    id
  ) => {
    persist((prev) => ({
      ...prev,
      contactMessages: prev.contactMessages.filter((m) => m.id !== id),
    }));
  };

  const addExamToStudent: CampusContextValue["addExamToStudent"] = (
    studentId,
    exam
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              exams: [...s.exams, { ...exam, id: `ex-${Date.now()}` }],
            }
          : s
      ),
    }));
  };

  const addBulkExamsToStudents: CampusContextValue["addBulkExamsToStudents"] = (
    entries
  ) => {
    const base = Date.now();
    const map = new Map<string, StudentExamRecord[]>();
    entries.forEach((entry, idx) => {
      const list = map.get(entry.studentId) || [];
      list.push({ ...entry.exam, id: `ex-${base}-${idx}` });
      map.set(entry.studentId, list);
    });
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        const added = map.get(s.id);
        return added ? { ...s, exams: [...s.exams, ...added] } : s;
      }),
    }));
  };

  const addScheduleToStudent: CampusContextValue["addScheduleToStudent"] = (
    studentId,
    slot
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              schedule: [...s.schedule, { ...slot, id: `ss-${Date.now()}` }],
            }
          : s
      ),
    }));
  };

  const addHomeworkToStudent: CampusContextValue["addHomeworkToStudent"] = (
    studentId,
    hw
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              homework: [{ ...hw, id: `hw-${Date.now()}` }, ...s.homework],
            }
          : s
      ),
    }));
  };

  const toggleHomeworkStatus = (studentId: string, hwId: string) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              homework: s.homework.map((h) =>
                h.id === hwId
                  ? {
                      ...h,
                      status:
                        h.status === "Bekliyor" ? "Tamamlandı" : "Bekliyor",
                    }
                  : h
              ),
            }
          : s
      ),
    }));
  };

  const addStudyPlanToStudent: CampusContextValue["addStudyPlanToStudent"] = (
    studentId,
    plan
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              studyPlan: [
                ...s.studyPlan,
                { ...plan, id: `sp-${Date.now()}` },
              ],
            }
          : s
      ),
    }));
  };

  const toggleStudyPlanItem = (studentId: string, planId: string) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              studyPlan: s.studyPlan.map((p) =>
                p.id === planId ? { ...p, completed: !p.completed } : p
              ),
            }
          : s
      ),
    }));
  };

  const addGuidanceToStudent: CampusContextValue["addGuidanceToStudent"] = (
    studentId,
    session
  ) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              guidanceSessions: [
                { ...session, id: `gs-${Date.now()}` },
                ...s.guidanceSessions,
              ],
            }
          : s
      ),
    }));
  };

  const addPersonalNote = (
    studentId: string,
    title: string,
    content: string
  ) => {
    const today = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              personalNotes: [
                { id: `pn-${Date.now()}`, title, content, date: today },
                ...(s.personalNotes ?? []),
              ],
            }
          : s
      ),
    }));
  };

  const deletePersonalNote = (studentId: string, noteId: string) => {
    persist((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              personalNotes: (s.personalNotes ?? []).filter(
                (n) => n.id !== noteId
              ),
            }
          : s
      ),
    }));
  };

  const addScheduleToTeacher: CampusContextValue["addScheduleToTeacher"] = (
    teacherId,
    slot
  ) => {
    persist((prev) => {
      const teacher = prev.teachers.find((t) => t.id === teacherId);
      if (!teacher) return prev;
      const base = Date.now();
      const trimmedTime = slot.time.trim();

      return {
        ...prev,
        teachers: prev.teachers.map((t) => {
          if (t.id !== teacherId) return t;
          const dup = t.schedule.some(
            (s) =>
              s.day === slot.day &&
              s.time.trim() === trimmedTime &&
              s.classGroup === slot.classGroup
          );
          if (dup) return t;
          return {
            ...t,
            schedule: [
              ...t.schedule,
              { ...slot, time: trimmedTime, id: `ts-${base}` },
            ],
          };
        }),
        classes: prev.classes.map((c) => {
          if (c.name !== slot.classGroup) return c;
          const dup = c.schedule.some(
            (s) =>
              s.day === slot.day &&
              s.time.trim() === trimmedTime &&
              s.subject === slot.subject &&
              s.teacher === teacher.name
          );
          if (dup) return c;
          return {
            ...c,
            schedule: [
              ...c.schedule,
              {
                id: `cs-${base + 1}`,
                day: slot.day,
                time: trimmedTime,
                subject: slot.subject,
                teacher: teacher.name,
                room: slot.room || c.room,
                type: "Konu Anlatımı",
              },
            ],
          };
        }),
      };
    });
  };

  const removeTeacherScheduleSlot = (teacherId: string, slotId: string) => {
    persist((prev) => {
      const teacher = prev.teachers.find((t) => t.id === teacherId);
      const targetSlot = teacher?.schedule.find((s) => s.id === slotId);

      return {
        ...prev,
        teachers: prev.teachers.map((t) =>
          t.id === teacherId
            ? { ...t, schedule: t.schedule.filter((s) => s.id !== slotId) }
            : t
        ),
        classes: targetSlot
          ? prev.classes.map((c) =>
              c.name === targetSlot.classGroup
                ? {
                    ...c,
                    schedule: c.schedule.filter(
                      (cs) =>
                        !(
                          cs.day === targetSlot.day &&
                          cs.time.trim() === targetSlot.time.trim() &&
                          cs.subject === targetSlot.subject &&
                          cs.teacher === teacher?.name
                        )
                    ),
                  }
                : c
            )
          : prev.classes,
      };
    });
  };

  const createOneOnOneSession: CampusContextValue["createOneOnOneSession"] = (
    teacherId,
    studentId,
    day,
    time,
    subject,
    note
  ) => {
    persist((prev) => {
      const teacher = prev.teachers.find((t) => t.id === teacherId);
      const student = prev.students.find((s) => s.id === studentId);
      if (!teacher || !student) return prev;

      const cleanSubject = subject.replace(/\s*\(Birebir\)\s*$/i, "").trim();
      const trimmedTime = time.trim();

      // Prevent duplicate 1-on-1 at the same teacher + student + day + time
      const alreadyOnTeacher = teacher.oneOnOneSlots.some(
        (o) =>
          o.studentId === studentId &&
          o.day === day &&
          o.time.trim() === trimmedTime
      );
      const alreadyOnStudent = student.schedule.some(
        (ss) =>
          ss.type === "Etüt" &&
          ss.day === day &&
          ss.time.trim() === trimmedTime &&
          ss.teacher === teacher.name
      );

      if (alreadyOnTeacher && alreadyOnStudent) {
        return prev;
      }

      const ooId = `oo-${Date.now()}`;
      const ssId = `ss-${Date.now() + 1}`;

      return {
        ...prev,
        teachers: prev.teachers.map((t) =>
          t.id === teacherId && !alreadyOnTeacher
            ? {
                ...t,
                oneOnOneSlots: [
                  ...t.oneOnOneSlots,
                  {
                    id: ooId,
                    studentId: student.id,
                    studentName: student.name,
                    day,
                    time: trimmedTime,
                    subject: cleanSubject,
                    note,
                  },
                ],
              }
            : t
        ),
        students: prev.students.map((s) =>
          s.id === studentId && !alreadyOnStudent
            ? {
                ...s,
                schedule: [
                  ...s.schedule,
                  {
                    id: ssId,
                    day,
                    time: trimmedTime,
                    subject: cleanSubject,
                    teacher: teacher.name,
                    room: "Birebir Etüt Odası",
                    type: "Etüt",
                  },
                ],
              }
            : s
        ),
      };
    });
  };

  const removeOneOnOneSlot = (teacherId: string, slotId: string) => {
    persist((prev) => {
      const teacher = prev.teachers.find((t) => t.id === teacherId);
      const targetSlot = teacher?.oneOnOneSlots.find((o) => o.id === slotId);

      return {
        ...prev,
        teachers: prev.teachers.map((t) =>
          t.id === teacherId
            ? {
                ...t,
                oneOnOneSlots: t.oneOnOneSlots.filter((o) => o.id !== slotId),
              }
            : t
        ),
        students: targetSlot
          ? prev.students.map((s) =>
              s.id === targetSlot.studentId
                ? {
                    ...s,
                    schedule: s.schedule.filter(
                      (ss) =>
                        !(
                          ss.type === "Etüt" &&
                          ss.day === targetSlot.day &&
                          ss.time === targetSlot.time &&
                          ss.teacher === teacher?.name
                        )
                    ),
                  }
                : s
            )
          : prev.students,
      };
    });
  };

  const addClass: CampusContextValue["addClass"] = (
    payload,
    initialStudentIds = []
  ) => {
    const id = `cls-${Date.now()}`;
    persist((prev) => ({
      ...prev,
      classes: [...prev.classes, { ...payload, id, schedule: [] }],
      students: prev.students.map((s) =>
        initialStudentIds.includes(s.id)
          ? { ...s, classId: id, className: payload.name }
          : s
      ),
    }));
    return id;
  };

  const assignStudentToClass: CampusContextValue["assignStudentToClass"] = (
    studentId,
    classId
  ) => {
    persist((prev) => {
      const targetClass = prev.classes.find((c) => c.id === classId);
      if (!targetClass) return prev;
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId
            ? { ...s, classId: targetClass.id, className: targetClass.name }
            : s
        ),
      };
    });
  };

  const addScheduleToClass: CampusContextValue["addScheduleToClass"] = (
    classId,
    slot
  ) => {
    persist((prev) => {
      const cls = prev.classes.find((c) => c.id === classId);
      if (!cls) return prev;
      const base = Date.now();
      const trimmedTime = slot.time.trim();

      return {
        ...prev,
        classes: prev.classes.map((c) => {
          if (c.id !== classId) return c;
          const dup = c.schedule.some(
            (s) =>
              s.day === slot.day &&
              s.time.trim() === trimmedTime &&
              s.subject === slot.subject &&
              s.teacher === slot.teacher
          );
          if (dup) return c;
          return {
            ...c,
            schedule: [
              ...c.schedule,
              { ...slot, time: trimmedTime, id: `cs-${base}` },
            ],
          };
        }),
        teachers: prev.teachers.map((t) => {
          if (t.name !== slot.teacher) return t;
          const dup = t.schedule.some(
            (ts) =>
              ts.day === slot.day &&
              ts.time.trim() === trimmedTime &&
              ts.classGroup === cls.name
          );
          if (dup) return t;
          return {
            ...t,
            schedule: [
              ...t.schedule,
              {
                id: `ts-${base + 1}`,
                day: slot.day,
                time: trimmedTime,
                classGroup: cls.name,
                subject: slot.subject,
                room: slot.room || cls.room,
              },
            ],
          };
        }),
      };
    });
  };

  const addBulkScheduleToClass: CampusContextValue["addBulkScheduleToClass"] = (
    classId,
    slots
  ) => {
    const base = Date.now();
    const mapped = slots.map((slot, index) => ({
      ...slot,
      time: slot.time.trim(),
      id: `cs-${base}-${index}`,
    }));
    persist((prev) => {
      const cls = prev.classes.find((c) => c.id === classId);
      if (!cls) return prev;
      return {
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === classId
            ? {
                ...c,
                schedule: [...c.schedule, ...mapped],
              }
            : c
        ),
        teachers: prev.teachers.map((t) => {
          const additions = mapped
            .filter(
              (m) =>
                m.teacher === t.name &&
                !m.blockPeriod &&
                !t.schedule.some(
                  (ts) =>
                    ts.day === m.day &&
                    ts.time.trim() === m.time.trim() &&
                    ts.classGroup === cls.name
                )
            )
            .map((m, idx) => ({
              id: `ts-${base}-${indexOffset(t.id, idx)}`,
              day: m.day,
              time: m.time,
              classGroup: cls.name,
              subject: m.subject,
              room: m.room || cls.room,
            }));
          if (additions.length === 0) return t;
          return {
            ...t,
            schedule: [...t.schedule, ...additions],
          };
        }),
      };
    });
  };

  function indexOffset(tid: string, idx: number) {
    return `${tid}-${idx}`;
  }

  const clearClassSchedule: CampusContextValue["clearClassSchedule"] = (
    classId
  ) => {
    persist((prev) => {
      const cls = prev.classes.find((c) => c.id === classId);
      if (!cls) return prev;
      return {
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === classId ? { ...c, schedule: [] } : c
        ),
        teachers: prev.teachers.map((t) => ({
          ...t,
          schedule: t.schedule.filter((ts) => ts.classGroup !== cls.name),
        })),
      };
    });
  };

  const removeClassScheduleSlot = (classId: string, slotId: string) => {
    persist((prev) => {
      const cls = prev.classes.find((c) => c.id === classId);
      const targetSlot = cls?.schedule.find((s) => s.id === slotId);

      return {
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === classId
            ? { ...c, schedule: c.schedule.filter((s) => s.id !== slotId) }
            : c
        ),
        teachers:
          cls && targetSlot
            ? prev.teachers.map((t) =>
                t.name === targetSlot.teacher
                  ? {
                      ...t,
                      schedule: t.schedule.filter(
                        (ts) =>
                          !(
                            ts.day === targetSlot.day &&
                            ts.time.trim() === targetSlot.time.trim() &&
                            ts.classGroup === cls.name &&
                            ts.subject === targetSlot.subject
                          )
                      ),
                    }
                  : t
              )
            : prev.teachers,
      };
    });
  };

  const addAnnouncement: CampusContextValue["addAnnouncement"] = (ann) => {
    const today = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    persist((prev) => ({
      ...prev,
      announcements: [
        { ...ann, id: `ann-${Date.now()}`, date: today },
        ...prev.announcements,
      ],
    }));
  };

  const deleteAnnouncement = (id: string) => {
    persist((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
  };

  const addContactMessage: CampusContextValue["addContactMessage"] = (msg) => {
    const now = new Date();
    const formatted = now.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    persist((prev) => ({
      ...prev,
      contactMessages: [
        {
          ...msg,
          id: `msg-${Date.now()}`,
          createdAt: `${formatted} • ${time}`,
          status: "Yeni",
        },
        ...prev.contactMessages,
      ],
    }));
  };

  const toggleContactMessageStatus = (id: string) => {
    persist((prev) => ({
      ...prev,
      contactMessages: prev.contactMessages.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "Yeni" ? "Görüşüldü" : "Yeni" }
          : m
      ),
    }));
  };

  const updateSiteContent: CampusContextValue["updateSiteContent"] = (
    patch
  ) => {
    persist((prev) => ({
      ...prev,
      siteContent: { ...prev.siteContent, ...patch },
    }));
  };

  const updatePackage: CampusContextValue["updatePackage"] = (slug, patch) => {
    persist((prev) => ({
      ...prev,
      packages: prev.packages.map((p) =>
        p.slug === slug ? { ...p, ...patch } : p
      ),
    }));
  };

  const activeStudent =
    state.students.find((s) => s.id === state.activeStudentId) ??
    state.students[0];
  const activeTeacher =
    state.teachers.find((t) => t.id === state.activeTeacherId) ??
    state.teachers[0];

  return (
    <CampusContext.Provider
      value={{
        students: state.students,
        teachers: state.teachers,
        classes: state.classes,
        announcements: state.announcements,
        contactMessages: state.contactMessages,
        siteContent: state.siteContent,
        packages: state.packages,
        activeStudent,
        activeTeacher,
        adminAuthenticated: state.adminAuthenticated,
        loginStudent,
        loginTeacher,
        loginAdmin,
        logoutAdmin,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addExamToStudent,
        deleteStudentExam,
        addBulkExamsToStudents,
        addScheduleToStudent,
        removeStudentScheduleSlot,
        addHomeworkToStudent,
        toggleHomeworkStatus,
        deleteHomeworkFromStudent,
        addStudyPlanToStudent,
        toggleStudyPlanItem,
        deleteStudyPlanItem,
        addGuidanceToStudent,
        deleteGuidanceSession,
        addPersonalNote,
        deletePersonalNote,
        addScheduleToTeacher,
        updateTeacherScheduleSlot,
        removeTeacherScheduleSlot,
        createOneOnOneSession,
        updateOneOnOneSlot,
        removeOneOnOneSlot,
        addClass,
        updateClass,
        deleteClass,
        assignStudentToClass,
        addScheduleToClass,
        updateClassScheduleSlot,
        addBulkScheduleToClass,
        clearClassSchedule,
        removeClassScheduleSlot,
        addAnnouncement,
        deleteAnnouncement,
        addContactMessage,
        toggleContactMessageStatus,
        deleteContactMessage,
        updateSiteContent,
        updatePackage,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error("useCampus must be used inside CampusProvider");
  }
  return ctx;
}
