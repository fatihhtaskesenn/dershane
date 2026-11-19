export interface ExamResult {
  id: string;
  title: string;
  type: "TYT" | "AYT";
  date: string;
  totalNet: number;
  maxNet: number;
  percentile: string;
  rank: number;
  totalParticipants: number;
  subjects: {
    name: string;
    correct: number;
    wrong: number;
    empty: number;
    net: number;
  }[];
}

export interface ScheduleItem {
  id: string;
  day: "Pazartesi" | "Salı" | "Çarşamba" | "Perşembe" | "Cuma" | "Cumartesi";
  time: string;
  subject: string;
  teacher: string;
  room: string;
  topic: string;
  type: "Konu Anlatımı" | "Soru Çözümü" | "Etüt" | "Deneme";
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: "Sınav" | "Duyuru" | "Etkinlik" | "Program";
  summary: string;
  important?: boolean;
}

export interface UpcomingExam {
  id: string;
  title: string;
  type: "TYT" | "AYT" | "Tarama";
  date: string;
  time: string;
  location: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  studentNo: string;
  email: string;
  grade: "12. Sınıf (YKS)" | "Mezun (YKS)" | "11. Sınıf";
  track: "Sayısal" | "Eşit Ağırlık" | "Sözel";
  averageNet: number;
  attendance: number;
  status: "Aktif" | "İzinli" | "Mezun";
  advisor: string;
  phone: string;
}

export const CURRENT_STUDENT = {
  id: "stu-01",
  name: "Kerem Yılmaz",
  studentNo: "2026-1042",
  grade: "12. Sınıf (YKS)",
  track: "Sayısal",
  target: "İTÜ Bilgisayar Mühendisliği",
  advisor: "Dr. Selin Kaya",
  averageTytNet: 94.5,
  lastAytNet: 64.25,
  attendanceRate: 97,
};

export const STUDENT_EXAMS: ExamResult[] = [
  {
    id: "ex-1",
    title: "Türkiye Geneli TYT Denemesi #1",
    type: "TYT",
    date: "14 Eyl 2026",
    totalNet: 81.25,
    maxNet: 120,
    percentile: "%4.8",
    rank: 612,
    totalParticipants: 12450,
    subjects: [
      { name: "Türkçe", correct: 31, wrong: 6, empty: 3, net: 29.5 },
      { name: "Sosyal Bilimler", correct: 15, wrong: 3, empty: 2, net: 14.25 },
      { name: "Matematik", correct: 25, wrong: 6, empty: 9, net: 23.5 },
      { name: "Fen Bilimleri", correct: 15, wrong: 4, empty: 1, net: 14.0 },
    ],
  },
  {
    id: "ex-2",
    title: "Kurum İçi TYT Tarama #2",
    type: "TYT",
    date: "28 Eyl 2026",
    totalNet: 86.5,
    maxNet: 120,
    percentile: "%3.2",
    rank: 48,
    totalParticipants: 1480,
    subjects: [
      { name: "Türkçe", correct: 33, wrong: 4, empty: 3, net: 32.0 },
      { name: "Sosyal Bilimler", correct: 16, wrong: 2, empty: 2, net: 15.5 },
      { name: "Matematik", correct: 27, wrong: 4, empty: 9, net: 26.0 },
      { name: "Fen Bilimleri", correct: 14, wrong: 4, empty: 2, net: 13.0 },
    ],
  },
  {
    id: "ex-3",
    title: "Türkiye Geneli TYT Denemesi #3",
    type: "TYT",
    date: "12 Eki 2026",
    totalNet: 91.75,
    maxNet: 120,
    percentile: "%2.1",
    rank: 285,
    totalParticipants: 13600,
    subjects: [
      { name: "Türkçe", correct: 34, wrong: 3, empty: 3, net: 33.25 },
      { name: "Sosyal Bilimler", correct: 17, wrong: 2, empty: 1, net: 16.5 },
      { name: "Matematik", correct: 29, wrong: 4, empty: 7, net: 28.0 },
      { name: "Fen Bilimleri", correct: 15, wrong: 4, empty: 1, net: 14.0 },
    ],
  },
  {
    id: "ex-4",
    title: "AYT Sayısal Kazanım Denemesi #1",
    type: "AYT",
    date: "24 Eki 2026",
    totalNet: 58.5,
    maxNet: 80,
    percentile: "%3.9",
    rank: 64,
    totalParticipants: 1640,
    subjects: [
      { name: "Matematik", correct: 29, wrong: 4, empty: 7, net: 28.0 },
      { name: "Fizik", correct: 11, wrong: 2, empty: 1, net: 10.5 },
      { name: "Kimya", correct: 11, wrong: 2, empty: 0, net: 10.5 },
      { name: "Biyoloji", correct: 10, wrong: 2, empty: 1, net: 9.5 },
    ],
  },
  {
    id: "ex-5",
    title: "Türkiye Geneli TYT Denemesi #4",
    type: "TYT",
    date: "02 Kas 2026",
    totalNet: 96.25,
    maxNet: 120,
    percentile: "%1.4",
    rank: 194,
    totalParticipants: 14200,
    subjects: [
      { name: "Türkçe", correct: 36, wrong: 3, empty: 1, net: 35.25 },
      { name: "Sosyal Bilimler", correct: 17, wrong: 2, empty: 1, net: 16.5 },
      { name: "Matematik", correct: 31, wrong: 4, empty: 5, net: 30.0 },
      { name: "Fen Bilimleri", correct: 15, wrong: 2, empty: 3, net: 14.5 },
    ],
  },
  {
    id: "ex-6",
    title: "AYT Sayısal Türkiye Geneli #2",
    type: "AYT",
    date: "11 Kas 2026",
    totalNet: 64.25,
    maxNet: 80,
    percentile: "%2.2",
    rank: 241,
    totalParticipants: 10850,
    subjects: [
      { name: "Matematik", correct: 32, wrong: 3, empty: 5, net: 31.25 },
      { name: "Fizik", correct: 12, wrong: 2, empty: 0, net: 11.5 },
      { name: "Kimya", correct: 11, wrong: 2, empty: 0, net: 10.5 },
      { name: "Biyoloji", correct: 11, wrong: 0, empty: 2, net: 11.0 },
    ],
  },
];

export const STUDENT_SCHEDULE: ScheduleItem[] = [
  {
    id: "sch-1",
    day: "Pazartesi",
    time: "09:00 - 10:30",
    subject: "AYT Matematik",
    teacher: "Prof. Dr. Emre Aydın",
    room: "A-204",
    topic: "Türev Uygulamaları ve Ekstremum",
    type: "Konu Anlatımı",
  },
  {
    id: "sch-2",
    day: "Pazartesi",
    time: "10:45 - 12:15",
    subject: "AYT Fizik",
    teacher: "Zeynep Demir",
    room: "A-204",
    topic: "Elektrik Alan ve Potansiyel",
    type: "Konu Anlatımı",
  },
  {
    id: "sch-3",
    day: "Pazartesi",
    time: "13:30 - 15:00",
    subject: "TYT Türkçe",
    teacher: "Murat Çelik",
    room: "B-102",
    topic: "Paragrafta Yapı ve Anlam Bütünlüğü",
    type: "Soru Çözümü",
  },
  {
    id: "sch-4",
    day: "Salı",
    time: "09:00 - 10:30",
    subject: "AYT Kimya",
    teacher: "Dr. Selin Kaya",
    room: "Lab-1",
    topic: "Kimyasal Denge ve Kp-Kc İlişkisi",
    type: "Konu Anlatımı",
  },
  {
    id: "sch-5",
    day: "Salı",
    time: "10:45 - 12:15",
    subject: "Geometri",
    teacher: "Burak Şahin",
    room: "A-204",
    topic: "Çemberde Uzunluk ve Alan",
    type: "Soru Çözümü",
  },
  {
    id: "sch-6",
    day: "Salı",
    time: "14:00 - 15:30",
    subject: "Birebir Etüt",
    teacher: "Dr. Selin Kaya",
    room: "Etüt-3",
    topic: "Haftalık Hata Analizi & Koçluk",
    type: "Etüt",
  },
  {
    id: "sch-7",
    day: "Çarşamba",
    time: "09:00 - 10:30",
    subject: "AYT Biyoloji",
    teacher: "Aslıhan Koç",
    room: "A-204",
    topic: "Sinir Sistemi ve Duyu Organları",
    type: "Konu Anlatımı",
  },
  {
    id: "sch-8",
    day: "Çarşamba",
    time: "10:45 - 12:15",
    subject: "AYT Matematik",
    teacher: "Prof. Dr. Emre Aydın",
    room: "A-204",
    topic: "İntegral Giriş ve Belirsiz İntegral",
    type: "Konu Anlatımı",
  },
  {
    id: "sch-9",
    day: "Perşembe",
    time: "09:00 - 10:30",
    subject: "TYT Matematik",
    teacher: "Burak Şahin",
    room: "B-105",
    topic: "Yeni Nesil Problem Kampı",
    type: "Soru Çözümü",
  },
  {
    id: "sch-10",
    day: "Perşembe",
    time: "10:45 - 12:15",
    subject: "AYT Fizik",
    teacher: "Zeynep Demir",
    room: "A-204",
    topic: "Manyetizma ve İndüksiyon Akımı",
    type: "Soru Çözümü",
  },
  {
    id: "sch-11",
    day: "Cuma",
    time: "09:00 - 10:30",
    subject: "AYT Kimya",
    teacher: "Dr. Selin Kaya",
    room: "A-204",
    topic: "Asit-Baz Dengesi ve Titrasyon",
    type: "Konu Anlatımı",
  },
  {
    id: "sch-12",
    day: "Cuma",
    time: "13:30 - 15:00",
    subject: "AYT Biyoloji",
    teacher: "Aslıhan Koç",
    room: "A-204",
    topic: "Endokrin Sistem Tekrarı",
    type: "Soru Çözümü",
  },
  {
    id: "sch-13",
    day: "Cumartesi",
    time: "09:30 - 12:15",
    subject: "Türkiye Geneli TYT #5",
    teacher: "Sınav Merkezi",
    room: "Ana Salon",
    topic: "Genel Değerlendirme Denemesi",
    type: "Deneme",
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Kasım Ayı Türkiye Geneli TYT-AYT Maratonu",
    date: "17 Kas 2026",
    category: "Sınav",
    summary: "Cumartesi saat 09:30'da Ana Salon'da yapılacaktır. Optik formlar için kurşun kalem ve kimlik belgesi zorunludur.",
    important: true,
  },
  {
    id: "ann-2",
    title: "Türev & İntegral Yoğunlaştırılmış Kamp Programı",
    date: "15 Kas 2026",
    category: "Program",
    summary: "12. sınıf Sayısal grupları için hafta sonu ek soru çözüm saatleri sisteme işlenmiştir.",
  },
  {
    id: "ann-3",
    title: "Veli Bilgilendirme ve Bireysel Gelişim Görüşmeleri",
    date: "12 Kas 2026",
    category: "Duyuru",
    summary: "Danışman öğretmenlerinizle randevu saatlerinizi öğrenci portalı üzerinden teyit edebilirsiniz.",
  },
];

export const UPCOMING_EXAMS: UpcomingExam[] = [
  {
    id: "up-1",
    title: "Türkiye Geneli TYT Denemesi #5",
    type: "TYT",
    date: "21 Kas 2026",
    time: "09:30",
    location: "Ana Salon - Kat 2",
  },
  {
    id: "up-2",
    title: "AYT Sayısal Bölüm Tarama #3",
    type: "AYT",
    date: "25 Kas 2026",
    time: "14:00",
    location: "A-204 Dersliği",
  },
  {
    id: "up-3",
    title: "Matematik Problemler Hız Testi",
    type: "Tarama",
    date: "28 Kas 2026",
    time: "10:00",
    location: "B-105 Dersliği",
  },
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "stu-01",
    name: "Kerem Yılmaz",
    studentNo: "2026-1042",
    email: "kerem.yilmaz@dershane.edu.tr",
    grade: "12. Sınıf (YKS)",
    track: "Sayısal",
    averageNet: 94.5,
    attendance: 97,
    status: "Aktif",
    advisor: "Dr. Selin Kaya",
    phone: "0532 410 22 18",
  },
  {
    id: "stu-02",
    name: "Defne Arslan",
    studentNo: "2026-1018",
    email: "defne.arslan@dershane.edu.tr",
    grade: "Mezun (YKS)",
    track: "Sayısal",
    averageNet: 102.25,
    attendance: 99,
    status: "Aktif",
    advisor: "Prof. Dr. Emre Aydın",
    phone: "0533 891 44 09",
  },
  {
    id: "stu-03",
    name: "Mertcan Özkan",
    studentNo: "2026-1089",
    email: "mertcan.ozkan@dershane.edu.tr",
    grade: "12. Sınıf (YKS)",
    track: "Eşit Ağırlık",
    averageNet: 82.75,
    attendance: 91,
    status: "Aktif",
    advisor: "Murat Çelik",
    phone: "0542 315 67 80",
  },
  {
    id: "stu-04",
    name: "Elif Naz Korkmaz",
    studentNo: "2026-1104",
    email: "elif.korkmaz@dershane.edu.tr",
    grade: "11. Sınıf",
    track: "Sayısal",
    averageNet: 74.5,
    attendance: 95,
    status: "Aktif",
    advisor: "Zeynep Demir",
    phone: "0505 772 19 34",
  },
  {
    id: "stu-05",
    name: "Caner Aksoy",
    studentNo: "2026-1055",
    email: "caner.aksoy@dershane.edu.tr",
    grade: "Mezun (YKS)",
    track: "Eşit Ağırlık",
    averageNet: 88.0,
    attendance: 86,
    status: "İzinli",
    advisor: "Murat Çelik",
    phone: "0535 604 91 12",
  },
  {
    id: "stu-06",
    name: "Zehra Nur Çetin",
    studentNo: "2026-1120",
    email: "zehra.cetin@dershane.edu.tr",
    grade: "12. Sınıf (YKS)",
    track: "Sözel",
    averageNet: 79.25,
    attendance: 94,
    status: "Aktif",
    advisor: "Aslıhan Koç",
    phone: "0544 218 53 77",
  },
];

export const ADMIN_INSTITUTION_TREND = [
  { month: "Eylül", tytAvg: 74.2, aytAvg: 44.8 },
  { month: "Ekim", tytAvg: 81.5, aytAvg: 51.3 },
  { month: "Kasım", tytAvg: 88.4, aytAvg: 58.9 },
];
