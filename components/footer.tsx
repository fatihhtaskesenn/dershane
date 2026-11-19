import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[#D2E2DA] bg-gradient-to-b from-[#EAF3EE] to-[#DFECE5] text-[#17241F]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/logo-dark.png"
                alt="DERSHANE Özel Öğretim Kursu"
                width={200}
                height={104}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#4A525D]">
              Ölçülebilir akademik disiplin, birebir danışmanlık ve veri odaklı
              sınav hazırlığı ile öğrencilerini Türkiye&apos;nin ve dünyanın
              seçkin üniversitelerine hazırlar.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#135D43] uppercase">
              Kurumsal &amp; Portal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#4A525D]">
              <li>
                <Link href="/yaklasim" className="transition-colors hover:text-[#1E242E]">
                  Akademik Yaklaşım
                </Link>
              </li>
              <li>
                <Link href="/basarilar" className="transition-colors hover:text-[#1E242E]">
                  Yerleştirme Sonuçları
                </Link>
              </li>
              <li>
                <Link href="/programlar" className="transition-colors hover:text-[#1E242E]">
                  Ders Paketleri
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="transition-colors hover:text-[#1E242E]">
                  Ön Görüşme &amp; İletişim
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-[#1E242E]">
                  Öğrenci &amp; Yönetici Girişi
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#135D43] uppercase">
              Kampüs &amp; İletişim
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#4A525D]">
              <li>Gaziantep Merkez</li>
              <li className="pt-1 font-semibold text-[#1E242E]">
                +90 (342) 555 48 27
              </li>
              <li>bilgi@dershane.edu.tr</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#D8CBB3] pt-6 text-xs text-[#5E6570] sm:mt-14 sm:flex-row sm:items-center sm:gap-4 sm:pt-8">
          <p>© 2026 DERSHANE Özel Öğretim Kursu. Tüm hakları saklıdır.</p>
          <p>Hafta içi &amp; Cumartesi: 08:30 – 19:30</p>
        </div>
      </div>
    </footer>
  );
}
