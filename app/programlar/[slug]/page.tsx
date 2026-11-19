import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Users } from "lucide-react";
import { COURSE_PACKAGES } from "@/lib/packages-data";

export function generateStaticParams() {
  return COURSE_PACKAGES.map((pkg) => ({
    slug: pkg.slug,
  }));
}

export default function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#F8F7F3]" />}>
      <PackageDetailContent params={params} />
    </Suspense>
  );
}

async function PackageDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = COURSE_PACKAGES.find((item) => item.slug === slug);

  if (!pkg) {
    notFound();
  }

  const otherPackages = COURSE_PACKAGES.filter((item) => item.slug !== slug).slice(
    0,
    3
  );

  return (
    <div className="bg-[#F8F7F3] text-[#252A32]">
      {/* Breadcrumb & Header */}
      <section className="border-b border-[#E5DEC9] bg-[#FFFFFF] py-10 lg:py-14">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <Link
            href="/programlar"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#737B86] uppercase transition-colors hover:text-[#203B5C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Tüm Ders Paketleri</span>
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
              {pkg.code}
            </span>
            <span
              className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold ${pkg.accentStyle}`}
            >
              {pkg.accent}
            </span>
          </div>

          <h1 className="font-editorial mt-3 text-3xl font-medium tracking-tight text-[#203B5C] sm:text-4xl lg:text-5xl">
            {pkg.title}
          </h1>
        </div>
      </section>

      {/* Detail Split Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Square Image & Quick Facts */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-md border border-[#E5DEC9] bg-[#FFFFFF] p-2.5">
                <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-[#E9EBEE]">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#E9EBEE] rounded-md border border-[#E5DEC9] bg-[#FFFFFF] px-5">
                <div className="flex items-center justify-between py-4 text-sm">
                  <span className="inline-flex items-center gap-2 text-[#737B86]">
                    <Clock className="h-4 w-4 text-[#B18A52]" />
                    <span>Program Kapsamı</span>
                  </span>
                  <span className="font-semibold text-[#203B5C]">
                    {pkg.scope}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span className="inline-flex shrink-0 items-center gap-2 text-[#737B86]">
                    <Users className="h-4 w-4 text-[#B18A52]" />
                    <span>Hedef Kitle</span>
                  </span>
                  <span className="text-right font-medium text-[#252A32]">
                    {pkg.targetAudience}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Full Description, Highlights, Modules & CTA */}
            <div className="space-y-8 lg:col-span-7">
              <div className="rounded-md border border-[#E9EBEE] bg-[#FFFFFF] p-7 sm:p-9">
                <h2 className="font-editorial text-2xl font-medium text-[#203B5C]">
                  Paket Hakkında
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#737B86]">
                  {pkg.fullDescription}
                </p>

                <div className="mt-8 border-t border-[#E9EBEE] pt-7">
                  <h3 className="text-xs font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
                    Ders &amp; Saat Dağılımı ({pkg.scope})
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {pkg.courseHours.map((ch) => (
                      <div
                        key={ch.subject}
                        className="flex items-center justify-between rounded-md border border-[#E5DEC9] bg-[#F8F7F3] px-4 py-3 text-sm"
                      >
                        <span className="font-medium text-[#203B5C]">
                          {ch.subject}
                        </span>
                        <span className="font-semibold text-[#135D43]">
                          {ch.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 border-t border-[#E9EBEE] pt-7">
                  <h3 className="text-xs font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
                    Pakete Dahil Olanaklar
                  </h3>
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pkg.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-[#252A32]"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1E6B52]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-[#E9EBEE] pt-7">
                  <h3 className="text-xs font-semibold tracking-[0.14em] text-[#B18A52] uppercase">
                    Uygulama Modülleri
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {pkg.programModules.map((mod) => (
                      <div
                        key={mod.title}
                        className="rounded-md border border-[#E5DEC9] bg-[#F8F7F3] p-4"
                      >
                        <h4 className="text-sm font-semibold text-[#203B5C]">
                          {mod.title}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#737B86]">
                          {mod.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-[#E9EBEE] pt-7">
                  <Link
                    href="/iletisim"
                    className="inline-flex items-center gap-2.5 rounded-md bg-[#135D43] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E4A35]"
                  >
                    <span>Kayıt &amp; Ön Görüşme Talebi</span>
                    <ArrowRight className="h-4 w-4 text-[#E8C483]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Other Packages */}
          <div className="mt-16 border-t border-[#E5DEC9] pt-12">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl font-medium text-[#203B5C]">
                Diğer Ders Paketleri
              </h2>
              <Link
                href="/programlar"
                className="text-sm font-semibold text-[#203B5C] hover:text-[#B18A52]"
              >
                Tümünü Gör →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {otherPackages.map((other) => (
                <Link
                  key={other.slug}
                  href={`/programlar/${other.slug}`}
                  className="group flex items-center gap-4 rounded-md border border-[#E5DEC9] bg-[#FFFFFF] p-4 transition-colors hover:border-[#203B5C]/40"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-[#E9EBEE]">
                    <Image
                      src={other.image}
                      alt={other.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold tracking-wider text-[#B18A52] uppercase">
                      {other.code}
                    </span>
                    <h3 className="font-editorial truncate text-lg font-medium text-[#203B5C] group-hover:text-[#B18A52]">
                      {other.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#737B86]">
                      {other.scope}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
