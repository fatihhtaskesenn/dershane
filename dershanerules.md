# Antigravity Complete Master Rules & Architecture: Dershane Yönetim ve Kurumsal Web Sistemi

## 1. Proje Vizyonu ve Mimari Konsept
Bu proje; dershaneler ve eğitim kurumları için hem kurumsal tanıtım web sitesi (ön yüz) hem de öğrenci ve yöneticiler için gelişmiş bir LMS (Öğrenci/Yönetim Paneli) sunan hibrit bir Next.js platformudur.

- **Ön Yüz (Public Website):** Kurumun dijital yüzü. Klasik, sıradan ve yapay zeka ürünü şablonlardan tamamen arındırılmış; Apple, Vercel ve Stripe tarzı minimalist, derinlikli (subtle gradients, glassmorphism), yüksek kontrastlı tipografiye sahip, son teknoloji hissi veren kurumsal bir landing page.
- **Navigasyon Bar (Navbar):** En solda "Sisteme Giriş" (Login) butonu, hemen yanında kurumsal logo/isim ve orta alanda menü linkleri yer alır. Böylece hem kurumsal web sitesi hem de yönetim sistemi tek bir ekrandan yönetilir.
- **Öğrenci Paneli:** Giriş yapan öğrencilerin deneme sınavı sonuçları, net takibi, grafiksel analizleri ve haftalık ders programlarını gördüğü özel alan.
- **Yönetici Paneli:** Kurum yöneticilerinin öğrenci ekleyebildiği, içerik yönetimi yapabildiği ve genel kurum istatistiklerini takip ettiği kontrol merkezi.

---

## 2. Teknoloji Stack (Yığın) ve Kurulum Komutları

Proje aşağıdaki modern web teknolojileriyle sıfırdan inşa edilecektir. Veritabanı aşamasına geçilene kadar tüm bileşenlerde kapsamlı Mock (Fake) Data kullanılacaktır.

### 2.1. Kullanılacak Teknolojiler
- Framework: Next.js (App Router, React Server Components)
- Stil & Tasarım: Tailwind CSS
- İkon Seti: Lucide React
- Animasyon & Geçişler: Framer Motion (Akıcı sayfa geçişleri ve micro-interaction'lar için)
- Grafik / Veri Görselleştirme: Recharts (Öğrenci net analizi için)

### 2.2. Proje Kurulum ve Paket Komutları
Antigravity, projeyi başlatmak için sırasıyla şu terminal komutlarını çalıştıracaktır:
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
npm install lucide-react framer-motion clsx tailwind-merge recharts
npm run dev

---

## 3. UI / UX Tasarım Felsefesi (Anti-AI Template Standardı)
Görsel kimlik standart "mavi butonlu AI şablonu" görünümünden kesinlikle uzak duracaktır:
1. Renk Paleti: Derin uzay grileri/siyahları (zinc-950 / slate-900), saf beyaz metinler, hafif cam efektleri ve kurumsal prestij yansıtan tek bir accent renk (Derin İndigo veya Premium Teal).
2. Tipografi: Keskin, okunabilir ve hiyerarşik (Inter veya Geist font ailesi referans alınarak). Büyük ve cesur başlıklar, hafif gri alt açıklamalar.
3. Mikro Etkileşimler (Micro-interactions): Butonlara, kartlara ve tablo satırlarına gelindiğinde (hover) hafif derinlik kazanma, yumuşak scale ve border parlamaları.
4. Layout Mimarisi: Geniş boşluklar (whitespace), kart tabanlı grid sistemleri ve keskin olmayan yumuşak köşe yarıçapları (rounded-2xl).

---

## 4. Sayfa ve Rota Mimarisi (Route Map)
app/
├── layout.tsx (Global fontlar, root provider'lar ve Navbar/Footer sarmalayıcısı)
├── page.tsx (Kurumsal Ana Sayfa - Hero, Özellikler, Başarılar, CTA)
├── login/ (Giriş Ekranı - Öğrenci / Yönetici Ortak Giriş Noktası)
├── student/ (Öğrenci Paneli Kökü)
│   ├── layout.tsx (Öğrenci paneli özel sol menüsü)
│   ├── dashboard/ (Özet duyurular, yaklaşan sınavlar)
│   ├── exams/ (Deneme sınavları listesi ve net analizi)
│   └── schedule/ (Haftalık ders programı gridi)
└── admin/ (Yönetici Paneli Kökü)
    ├── layout.tsx (Yönetici paneli özel sol menüsü)
    ├── dashboard/ (Kurum geneli istatistikler ve özetler)
    └── students/ (Öğrenci listesi, ekleme ve düzenleme paneli)

---

## 5. Geliştirme Aşamaları ve Milestones
- Adım 1: Proje iskeletinin kurulması, paketlerin yüklenmesi ve Tailwind yapılandırması.
- Adım 2: Global Navbar (En solunda giriş butonu ile) ve Kurumsal Ana Sayfa tasarımı (Yeni nesil UI/UX ile).
- Adım 3: /login ekranı ve rol tabanlı yönlendirme mekanizması (Öğrenci / Yönetici simülasyonu).
- Adım 4: Öğrenci Paneli ekranlarının mock verilerle (net grafikleri, ders programı) kodlanması.
- Adım 5: Yönetici Paneli ekranlarının mock verilerle (öğrenci yönetimi, veri ekleme) kodlanması.
- Adım 6: Kullanıcının talebi doğrultusunda veritabanı (Supabase/PostgreSQL) entegrasyonu aşamasına geçilmesi.