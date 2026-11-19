import type { StudentAccount } from "@/lib/campus-store";

function toPdfAscii(str: string): string {
  return str
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/[()\\]/g, "");
}

export function buildSampleExamPdfBlob(students: StudentAccount[]): Blob {
  const sampleStudents = students.slice(0, 12);
  const lines: string[] = [
    "DERSHANE OLCME VE DEGERLENDIRME BIRIMI - DENEME SONUC LISTESI",
    "Sinav: Turkiye Geneli TYT Denemesi #7",
    "----------------------------------------------------------------",
  ];

  sampleStudents.forEach((stu, idx) => {
    const trD = 31 + ((idx * 3) % 8);
    const trY = 3;
    const sosD = 15 + ((idx * 2) % 4);
    const sosY = 2;
    const matD = 26 + ((idx * 5) % 12);
    const matY = 3;
    const fenD = 14 + (idx % 6);
    const fenY = 2;
    lines.push(
      `${stu.studentNo} ${toPdfAscii(stu.name)} | Turkce: ${trD}D ${trY}Y | Sosyal: ${sosD}D ${sosY}Y | Matematik: ${matD}D ${matY}Y | Fen: ${fenD}D ${fenY}Y`
    );
  });

  // Build valid minimal PDF 1.4
  const contentOps = [
    "BT",
    "/F1 9 Tf",
    "36 770 Td",
    "14 TL",
    ...lines.map((line) => `(${line}) Tj T*`),
    "ET",
  ].join("\n");

  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${contentOps.length} >>\nstream\n${contentOps}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function buildSampleIndividualKarnePdfBlob(student: StudentAccount): Blob {
  const lines: string[] = [
    "DERSHANE BIREYSEL DENEME KARNESI VE KONU ANALIZI",
    `OGRENCI: ${student.studentNo} - ${toPdfAscii(student.name)} (${toPdfAscii(student.className)})`,
    "SINAV ADI: Turkiye Geneli TYT Denemesi #7 | TARIH: 19.11.2026",
    "Turkce: 32D 6Y 2B | Sosyal Bilimler: 15D 4Y 1B | Matematik: 27D 6Y 7B | Fen Bilimleri: 14D 4Y 2B",
    "----------------------------------------------------------------",
    "KONU ADI | SS | D | Y | %",
    "TURKCE",
    "Paragrafin Yapisi 8 5 3 62",
    "Paragrafta Konu ve Ana Dusunce 11 9 2 82",
    "Noktalama Isaretleri 2 1 1 50",
    "Ses Bilgisi ve Yazim Kurallari 3 3 0 100",
    "TAR-1",
    "Milli Mucadele Hazirlik Donemi 2 1 1 50",
    "Ataturk Ilkeleri ve Inkilap Tarihi 3 3 0 100",
    "COG-1",
    "Turkiye Iklimi ve Bitki Ortusu 2 1 1 50",
    "Nufus ve Yerlesme 2 2 0 100",
    "T. MAT",
    "Birinci Dereceden Denklemler 3 2 1 67",
    "Us ve Koklu Sayilar 4 2 1 50",
    "Mutlak Deger ve Esitsizlikler 3 1 1 33",
    "Sayi ve Kesir Problemleri 8 5 2 63",
    "GEO-1",
    "Ucgende Aci ve Kenar Bagintilari 4 2 1 50",
    "Cokgenler ve Dortgenler 3 2 0 67",
    "FIZ-1",
    "Kaldirma Kuvveti ve Basinc 2 1 1 50",
    "Optik ve Aynalar 2 1 1 50",
    "KIM-1",
    "Atomun Yapisi ve Periyodik Sistem 3 2 1 67",
    "Kimyasal Tepkimeler ve Mol 3 2 0 67",
    "BIY-1",
    "Hucre Bolunmeleri (Mitoz-Mayoz) 3 2 1 67",
    "Ekosistem Ekolojisi 3 3 0 100",
  ];

  const contentOps = [
    "BT",
    "/F1 9 Tf",
    "36 770 Td",
    "13 TL",
    ...lines.map((line) => `(${line}) Tj T*`),
    "ET",
  ].join("\n");

  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${contentOps.length} >>\nstream\n${contentOps}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
