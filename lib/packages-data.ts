export interface CourseHourItem {
  subject: string;
  hours: string;
}

export interface CoursePackage {
  slug: string;
  code: string;
  category: "Sınıf Paketleri" | "Destek & Sınav";
  accent: string;
  accentStyle: string;
  title: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  scope: string;
  targetAudience: string;
  courseHours: CourseHourItem[];
  highlights: string[];
  programModules: {
    title: string;
    detail: string;
  }[];
}

export const COURSE_PACKAGES: CoursePackage[] = [
  {
    slug: "mezun-sinif-paketi",
    code: "PKT — 01",
    category: "Sınıf Paketleri",
    accent: "Tam Zamanlı Kamp",
    accentStyle: "bg-[#F2EDE3] text-[#9A743E]",
    title: "Mezun Sınıf Paketi",
    image: "/images/paketler/mezunsinifpaket.jpeg",
    shortDescription:
      "Yalnızca sınava odaklanan mezun öğrenciler için tam gün kamp ve kütüphane disiplini.",
    fullDescription:
      "Üniversite hazırlık sürecini yalnızca sınav odaklı sürdüren mezun öğrenciler için tasarlanan bu kapsamlı program; sıfırdan ileri seviyeye konu anlatımı, yoğun soru çözüm kampları ve gözetimli kütüphane çalışma saatlerini tek çatı altında sunar.",
    scope: "Haftada 26 Saat",
    targetAudience: "Mezun (YKS) • Sayısal, Eşit Ağırlık, Sözel",
    courseHours: [
      { subject: "Matematik & Geometri", hours: "8 Saat / Hafta" },
      { subject: "Türkçe & Edebiyat", hours: "4 Saat / Hafta" },
      { subject: "Fizik, Kimya, Biyoloji", hours: "9 Saat / Hafta" },
      { subject: "Tarih, Coğrafya, Felsefe", hours: "3 Saat / Hafta" },
      { subject: "Soru Çözüm & Etüt", hours: "2 Saat / Hafta" },
    ],
    highlights: [
      "TYT & AYT tüm konuların sıfırdan ileri seviyeye işlenmesi",
      "Tam gün gözetimli çalışma ve soru çözüm alanları",
      "Haftalık Türkiye geneli ve kurum içi deneme değerlendirmesi",
      "Birebir akademik danışmanlık ve haftalık hedef takibi",
    ],
    programModules: [
      {
        title: "Sabah Yoğun Konu Anlatımı",
        detail: "12–16 kişilik seviye sınıflarında etkileşimli müfredat işleyişi.",
      },
      {
        title: "Öğleden Sonra Soru Kampı",
        detail: "Branş öğretmenleri eşliğinde yeni nesil soru çözüm saatleri.",
      },
      {
        title: "Akıllı Takip & Net Analizi",
        detail: "Her deneme sonrası DERSHANE LMS panelinde kazanım raporu.",
      },
    ],
  },
  {
    slug: "orgun-sinif-paketi",
    code: "PKT — 02",
    category: "Sınıf Paketleri",
    accent: "Okul + Sınav Dengesi",
    accentStyle: "bg-[#EEF2F6] text-[#203B5C]",
    title: "Örgün Sınıf Paketi",
    image: "/images/paketler/orgunsinifpaket.jpeg",
    shortDescription:
      "11 ve 12. sınıf öğrencileri için okul dersleriyle uyumlu dengeli YKS hazırlık programı.",
    fullDescription:
      "Lise eğitimine devam eden 11 ve 12. sınıf öğrencilerinin okul yazılılarını ve OBP puanını korurken YKS müfredatına tam hakimiyet kazanmalarını sağlayan, yorucu olmayan ama yüksek verimli sınıf programıdır.",
    scope: "Haftada 18 Saat",
    targetAudience: "11. ve 12. Sınıf Öğrencileri",
    courseHours: [
      { subject: "Matematik & Geometri", hours: "6 Saat / Hafta" },
      { subject: "Türkçe & Edebiyat", hours: "3 Saat / Hafta" },
      { subject: "Fen Bilimleri (FKB)", hours: "6 Saat / Hafta" },
      { subject: "Sosyal Bilimler", hours: "2 Saat / Hafta" },
      { subject: "Deneme Analiz & Etüt", hours: "1 Saat / Hafta" },
    ],
    highlights: [
      "Okul saatleriyle uyumlu hafta içi akşam ve hafta sonu grupları",
      "12–16 kişilik seviye bazlı homojen sınıf yapısı",
      "Düzenli konu tarama testleri ve eksik kapatma etütleri",
      "Okul yazılı dönemlerine özel destek tekrar oturumları",
    ],
    programModules: [
      {
        title: "Eş Zamanlı TYT & AYT Akışı",
        detail: "12. sınıf konularıyla paralel ilerleyen planlı TYT tekrarları.",
      },
      {
        title: "Hafta Sonu Deneme & Analiz",
        detail: "Düzenli ölçme sınavları ve anlık net gelişim grafikleri.",
      },
      {
        title: "Veli Bilgilendirme Sistemi",
        detail: "Devamsızlık ve sınav gelişiminin şeffaf biçimde paylaşımı.",
      },
    ],
  },
  {
    slug: "hizlandirilmis-sinif-paketi",
    code: "PKT — 03",
    category: "Sınıf Paketleri",
    accent: "Yoğun Tempo",
    accentStyle: "bg-[#EBF5F0] text-[#1E6B52]",
    title: "Hızlandırılmış Sınıf Paketi",
    image: "/images/paketler/hizlandirilmispaket.jpeg",
    shortDescription:
      "Kısa sürede temel eksiklerini kapatıp hızlı net artışı hedefleyen yoğun tekrar kampı.",
    fullDescription:
      "Sınav öncesi kritik aylarda veya dönem aralarında temel eksiklerini hızlıca kapatmak isteyen öğrenciler için sıkıştırılmış, yüksek tempolu ve doğrudan net artışına odaklanan özel kamp programıdır.",
    scope: "Haftada 22 Saat",
    targetAudience: "Hızlı Net Artışı Hedefleyen YKS Adayları",
    courseHours: [
      { subject: "TYT–AYT Matematik", hours: "8 Saat / Hafta" },
      { subject: "Türkçe & Paragraf Kampı", hours: "4 Saat / Hafta" },
      { subject: "Fen Bilimleri Tekrar", hours: "6 Saat / Hafta" },
      { subject: "Sosyal & Soru Çözümü", hours: "4 Saat / Hafta" },
    ],
    highlights: [
      "Sınavda en çok çıkan konu başlıklarına odaklanan akış",
      "Günlük yeni nesil soru çözüm ve hız kazanma pratikleri",
      "Kısa periyotlarla anlık seviye ve net gelişim ölçümü",
      "Birebir soru çözüm etütleriyle anında telafi desteği",
    ],
    programModules: [
      {
        title: "Kritik Konu Taraması",
        detail: "ÖSYM ağırlığı yüksek ünitelerin yoğunlaştırılmış anlatımı.",
      },
      {
        title: "Zaman Yönetimi Pratikleri",
        detail: "Süre baskısı altında doğru soru seçme ve çözme teknikleri.",
      },
      {
        title: "Haftalık Net Kontrolü",
        detail: "Her hafta yapılan taramalarla net artışının ölçülmesi.",
      },
    ],
  },
  {
    slug: "ozel-matematik-paketi",
    code: "PKT — 04",
    category: "Destek & Sınav",
    accent: "Branş Odaklı",
    accentStyle: "bg-[#EEF2F6] text-[#203B5C]",
    title: "Özel Matematik Paketi",
    image: "/images/paketler/ozelmatematikpaket.jpeg",
    shortDescription:
      "TYT-AYT Matematik ve Geometri netlerini belirleyici seviyeye taşıyan özel branş programı.",
    fullDescription:
      "Sıralamada en büyük farkı yaratan TYT-AYT Matematik ve Geometri derslerinde temeli güçlendirmek veya derece düzeyine çıkmak isteyen öğrenciler için küçük gruplarda ya da birebir yürütülen branş paketidir.",
    scope: "Haftada 8 Saat",
    targetAudience: "Matematik & Geometri Netini Yükseltmek İsteyenler",
    courseHours: [
      { subject: "TYT Matematik & Problem", hours: "3 Saat / Hafta" },
      { subject: "AYT İleri Matematik", hours: "3 Saat / Hafta" },
      { subject: "Geometri Atölyesi", hours: "2 Saat / Hafta" },
    ],
    highlights: [
      "Problem çözme hızı ve analitik düşünme becerisi geliştirme",
      "AYT ileri düzey matematik konularında derinlemesine pratik",
      "Kişiye özel zorluk dereceli soru fasikülleri",
      "Geometri bakış açısı kazandıran görsel çözüm atölyeleri",
    ],
    programModules: [
      {
        title: "TYT Problem & Hız Atölyesi",
        detail: "Yeni nesil sözel-sayısal problemleri hızlı kavrama teknikleri.",
      },
      {
        title: "AYT İleri Analiz",
        detail: "Fonksiyon, Türev, İntegral ve Trigonometri uzmanlık oturumları.",
      },
      {
        title: "Birebir Hata Analizi",
        detail: "Yanlış yapılan soruların kök nedenlerinin öğretmenle çözümü.",
      },
    ],
  },
  {
    slug: "deneme-paketi",
    code: "PKT — 05",
    category: "Destek & Sınav",
    accent: "Ölçme & Analiz",
    accentStyle: "bg-[#F2EDE3] text-[#9A743E]",
    title: "Deneme Paketi",
    image: "/images/paketler/denemepaketi.jpeg",
    shortDescription:
      "Türkiye geneli yayınlarla gerçek sınav provası ve detaylı dijital net analizi.",
    fullDescription:
      "Sınav stresini yönetmek, gerçek sınav atmosferini düzenli deneyimlemek ve net gelişimini bilimsel verilerle izlemek isteyen tüm öğrenciler için hazırlanan kapsamlı kurumsal sınav kulübü paketidir.",
    scope: "Yıllık 40+ Deneme",
    targetAudience: "Tüm YKS Adayları (Kurum Dışı Katılıma Açık)",
    courseHours: [
      { subject: "TYT Genel Deneme", hours: "20 Oturum • 3 Saat" },
      { subject: "AYT Genel Deneme", hours: "20 Oturum • 3 Saat" },
      { subject: "Soru Çözüm & Analiz", hours: "2 Saat / Hafta" },
    ],
    highlights: [
      "Türkiye geneli yayınevleriyle eş zamanlı TYT & AYT uygulamaları",
      "Sınav sonrası konu bazlı detaylı net ve hata raporu",
      "Dijital öğrenci paneli üzerinden grafiksel performans takibi",
      "Kurum içi ve Türkiye geneli yüzdelik dilim sıralaması",
    ],
    programModules: [
      {
        title: "Gerçek Sınav Provası",
        detail: "Sessiz salonlarda ÖSYM saat ve kurallarına birebir uygun oturumlar.",
      },
      {
        title: "Anında Optik & Karne",
        detail: "Sınav günü akşamında DERSHANE portalında net ve konu analizi.",
      },
      {
        title: "Trend Grafikleri",
        detail: "Dönem boyu net artış eğrisinin Recharts grafikleriyle izlenmesi.",
      },
    ],
  },
  {
    slug: "etut-ve-destek-paketi",
    code: "PKT — 06",
    category: "Destek & Sınav",
    accent: "Akademik Destek",
    accentStyle: "bg-[#EBF5F0] text-[#1E6B52]",
    title: "Etüt ve Destek Paketi",
    image: "/images/paketler/etutdestekpaketi.jpeg",
    shortDescription:
      "Eksik konuları telafi eden ve çözemediği soruları öğretmenlerle çözdüren birebir etüt paketi.",
    fullDescription:
      "Derslerde anlaşılmayan noktaları anında telafi etmek, deneme sınavlarında boş bırakılan veya yanlış yapılan soruları branş öğretmenleriyle birebir çözmek isteyen öğrenciler için oluşturulan akademik destek modülüdür.",
    scope: "Haftada 10 Saat",
    targetAudience: "Birebir Soru Çözümü & Telafi Desteği Arayanlar",
    courseHours: [
      { subject: "Matematik & Geometri Etüdü", hours: "4 Saat / Hafta" },
      { subject: "Fen Bilimleri Soru Çözümü", hours: "3 Saat / Hafta" },
      { subject: "Türkçe & Sosyal Telafi", hours: "2 Saat / Hafta" },
      { subject: "Gözetimli Etüt Salonu", hours: "1 Saat+ / Gün" },
    ],
    highlights: [
      "Branş öğretmenleriyle birebir veya mini grup soru çözümü",
      "Deneme sınavı yanlışlarına göre otomatik etüt planlaması",
      "Sessiz çalışma ve kütüphane alanlarından tam yararlanma",
      "Öğrenci portalından kolay etüt takibi",
    ],
    programModules: [
      {
        title: "Birebir Soru Çözüm Masaları",
        detail: "Matematik, Fen ve Türkçe branşlarında anlık soru çözüm desteği.",
      },
      {
        title: "Kazanım Telafi Oturumları",
        detail: "Eksik kaldığı tespit edilen üniteler için hedefli tekrarlar.",
      },
      {
        title: "Sessiz Etüt Salonu",
        detail: "Verimli bireysel çalışma için ergonomik ve sessiz ortam.",
      },
    ],
  },
  {
    slug: "rehberlik-ve-kocluk-paketi",
    code: "PKT — 07",
    category: "Destek & Sınav",
    accent: "Birebir Mentorluk",
    accentStyle: "bg-[#EEF2F6] text-[#203B5C]",
    title: "Rehberlik ve Koçluk Paketi",
    image: "/images/paketler/rehberlikpaket.jpeg",
    shortDescription:
      "Kişiye özel çalışma programı, motivasyon yönetimi ve stratejik tercih danışmanlığı.",
    fullDescription:
      "Sadece ders çalışmak değil, doğru stratejiyle verimli çalışmak isteyen öğrenciler için sınav kaygısı yönetimi, haftalık kişiselleştirilmiş çalışma planı ve dönem sonu tercih danışmanlığı sunan birebir koçluk paketidir.",
    scope: "Haftada 4 Saat",
    targetAudience: "Planlı Çalışma & Hedef Odaklı Rehberlik İsteyenler",
    courseHours: [
      { subject: "Birebir Akademik Koçluk", hours: "1 Saat / Hafta" },
      { subject: "Deneme & Hata Analizi", hours: "1 Saat / Hafta" },
      { subject: "Haftalık Program & Takip", hours: "1 Saat / Hafta" },
      { subject: "Sınav Stratejisi Görüşmesi", hours: "1 Saat / Hafta" },
    ],
    highlights: [
      "Kişiye özel haftalık çalışma takvimi ve kaynak planlaması",
      "Veli bilgilendirme görüşmeleri ve motivasyon takibi",
      "Dönem sonu gerçekçi puan ve tercih simülasyonu",
      "Sınav kaygısı ve dikkat yönetimi üzerine bireysel çalışmalar",
    ],
    programModules: [
      {
        title: "Haftalık Program Revizyonu",
        detail: "Öğrencinin güncel netlerine göre her hafta yenilenen çalışma planı.",
      },
      {
        title: "Sınav Stratejisi Koçluğu",
        detail: "Turlama tekniği, ders sırası ve süre optimizasyonu danışmanlığı.",
      },
      {
        title: "Üniversite & Tercih Danışmanlığı",
        detail: "YKS sonuçlarına göre en doğru bölüm ve üniversite yerleşimi.",
      },
    ],
  },
  {
    slug: "yaz-kurs-paketi",
    code: "PKT — 08",
    category: "Sınıf Paketleri",
    accent: "Yaz Başlangıç Kampı",
    accentStyle: "bg-[#F2EDE3] text-[#9A743E]",
    title: "Yaz Kurs Paketi",
    image: "/images/1dershane.jpeg",
    shortDescription:
      "Yeni döneme önden başlamak isteyen öğrenciler için TYT temel atma ve yaz soru kampı.",
    fullDescription:
      "Yaz tatilini verimli değerlendirerek yeni eğitim yılına güçlü bir TYT temeliyle başlamak isteyen öğrenciler için hazırlanan yoğun yaz programı; temel konu anlatımları, günlük soru çözüm saatleri ve haftalık seviye taramalarını bir araya getirir.",
    scope: "Haftada 20 Saat",
    targetAudience: "11. & 12. Sınıfa Geçenler • Mezun Adaylar",
    courseHours: [
      { subject: "TYT Matematik & Geometri", hours: "7 Saat / Hafta" },
      { subject: "Türkçe & Paragraf", hours: "4 Saat / Hafta" },
      { subject: "Fen Bilimleri (TYT Temel)", hours: "5 Saat / Hafta" },
      { subject: "Sosyal Bilimler", hours: "2 Saat / Hafta" },
      { subject: "Haftalık Deneme & Etüt", hours: "2 Saat / Hafta" },
    ],
    highlights: [
      "Okul dönemi başlamadan TYT temel konularının tamamlanması",
      "12–16 kişilik seviye gruplarında etkileşimli yaz dersleri",
      "Her hafta düzenli TYT tarama sınavı ve net takibi",
      "Branş öğretmenleriyle yaz boyunca birebir soru çözüm desteği",
    ],
    programModules: [
      {
        title: "TYT Temel Güçlendirme",
        detail: "Matematik, Türkçe ve Fen derslerinde eksiksiz temel oluşturma.",
      },
      {
        title: "Yaz Soru Kampı",
        detail: "Konuların pekiştirilmesi için rehberli yeni nesil soru çözümleri.",
      },
      {
        title: "Dönem Başı Hazır Başlangıç",
        detail: "Eylül ayına rakiplerden önde ve yüksek net ortalamasıyla giriş.",
      },
    ],
  },
];
