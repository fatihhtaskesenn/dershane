import type {
  StudentAccount,
  SubjectNet,
  TopicPerformance,
} from "@/lib/campus-store";

export interface ParsedStudentExam {
  studentId: string;
  studentNo: string;
  studentName: string;
  className: string;
  subjects: SubjectNet[];
  totalNet: number;
  rank: number;
}

export interface ExamPdfParseResult {
  matched: ParsedStudentExam[];
  unmatchedLines: string[];
}

function normalizeTr(value: string): string {
  return value
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SUBJECT_PATTERNS: { name: string; regex: RegExp }[] = [
  {
    name: "Türkçe",
    regex:
      /(?:turkce|türkçe|tr)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Sosyal Bilimler",
    regex:
      /(?:sosyal(?:\s*bilimler)?|sos)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Matematik",
    regex:
      /(?:matematik|mat)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Fen Bilimleri",
    regex:
      /(?:fen(?:\s*bilimleri)?|fen)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Fizik",
    regex:
      /(?:fizik|fiz)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Kimya",
    regex:
      /(?:kimya|kim)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Biyoloji",
    regex:
      /(?:biyoloji|biyo)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Edebiyat",
    regex:
      /(?:edebiyat|edb)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Tarih",
    regex:
      /(?:tarih|tar)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
  {
    name: "Coğrafya",
    regex:
      /(?:cografya|coğrafya|cog)\s*[:\-]?\s*(\d+)\s*(?:d|dogru)?[\s,/]+(\d+)\s*(?:y|yanlis)?(?:[\s,/]+(\d+)\s*(?:b|bos)?)?(?:[\s,/\(\)]+([\d.,]+)\s*(?:net)?)?/i,
  },
];

function extractSubjectsFromText(chunk: string): SubjectNet[] {
  const normalized = normalizeTr(chunk);
  const subjects: SubjectNet[] = [];

  for (const sp of SUBJECT_PATTERNS) {
    const match = normalized.match(sp.regex);
    if (match) {
      const correct = Number(match[1]) || 0;
      const wrong = Number(match[2]) || 0;
      const empty = match[3] !== undefined ? Number(match[3]) || 0 : 0;
      const parsedNet =
        match[4] !== undefined
          ? Number(match[4].replace(",", "."))
          : NaN;
      const net = Number.isFinite(parsedNet)
        ? Number(parsedNet.toFixed(2))
        : Number((correct - wrong / 4).toFixed(2));

      subjects.push({
        name: sp.name,
        correct,
        wrong,
        empty,
        net,
      });
    }
  }

  return subjects;
}

export function parseExamPdfText(
  rawText: string,
  students: StudentAccount[]
): ExamPdfParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Build blocks: whenever a line contains a studentNo or a known student name, start a new block
  const blocks: { student: StudentAccount; text: string }[] = [];
  const unmatchedLines: string[] = [];

  const studentIndex = students.map((s) => ({
    student: s,
    no: s.studentNo.toLowerCase(),
    normName: normalizeTr(s.name),
  }));

  let currentBlock: { student: StudentAccount; text: string } | null = null;

  for (const line of lines) {
    const normLine = normalizeTr(line);
    const found = studentIndex.find(
      (item) =>
        normLine.includes(item.no) ||
        (item.normName.length >= 5 && normLine.includes(item.normName))
    );

    if (found) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { student: found.student, text: line };
    } else if (currentBlock) {
      currentBlock.text += " " + line;
    } else if (/\d+\s*(d|dogru)/i.test(normLine)) {
      unmatchedLines.push(line);
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  const matchedMap = new Map<string, ParsedStudentExam>();

  blocks.forEach((b) => {
    const subjects = extractSubjectsFromText(b.text);
    if (subjects.length === 0) return;

    const totalNet = Number(
      subjects.reduce((acc, s) => acc + s.net, 0).toFixed(2)
    );

    matchedMap.set(b.student.id, {
      studentId: b.student.id,
      studentNo: b.student.studentNo,
      studentName: b.student.name,
      className: b.student.className,
      subjects,
      totalNet,
      rank: 1,
    });
  });

  const sorted = Array.from(matchedMap.values())
    .sort((a, b) => b.totalNet - a.totalNet)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return {
    matched: sorted,
    unmatchedLines,
  };
}

const KARNE_SECTION_MAP: { pattern: RegExp; subject: string }[] = [
  { pattern: /^(?:turkce|türkçe)$/i, subject: "Türkçe" },
  { pattern: /^(?:tar-?1|tarih)$/i, subject: "Tarih" },
  { pattern: /^(?:cog-?1|coğrafya|cografya)$/i, subject: "Coğrafya" },
  { pattern: /^(?:fel-?1|felsefe)$/i, subject: "Felsefe" },
  { pattern: /^(?:din-?1|din(?:\s*kulturu)?)$/i, subject: "Din Kültürü" },
  { pattern: /^(?:t\.?\s*mat|tyt\s*mat|matematik)$/i, subject: "Matematik" },
  { pattern: /^(?:geo-?1|geometri)$/i, subject: "Geometri" },
  { pattern: /^(?:fiz-?1|fizik)$/i, subject: "Fizik" },
  { pattern: /^(?:kim-?1|kimya)$/i, subject: "Kimya" },
  { pattern: /^(?:biy-?1|biyoloji)$/i, subject: "Biyoloji" },
  { pattern: /^(?:edebiyat|t\.?\s*edebiyat)$/i, subject: "Edebiyat" },
];

export interface SingleKarneParseResult {
  detectedTitle?: string;
  detectedDate?: string;
  detectedType?: "TYT" | "AYT";
  subjects: SubjectNet[];
  topicBreakdown: TopicPerformance[];
  totalNet: number;
}

export function parseSingleStudentKarnePdf(
  rawText: string
): SingleKarneParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Parse topic breakdown rows using BOTH line-by-line AND multi-column inline scanning
  // Using mathematical checksum: correct + wrong <= total AND Math.round((correct/total)*100) is within +-2 of percent!
  let currentSubject = "Genel";
  const topicBreakdown: TopicPerformance[] = [];
  const seenTopics = new Set<string>();

  const sectionTokens = [
    { regex: /\b(?:TURKCE|TÜRKÇE)\b/i, subject: "Türkçe" },
    { regex: /\bTAR-?1\b/i, subject: "Tarih" },
    { regex: /\bCO[GĞ]-?1\b/i, subject: "Coğrafya" },
    { regex: /\bFEL-?1\b/i, subject: "Felsefe" },
    { regex: /\bD[Iİ]N-?1\b/i, subject: "Din Kültürü" },
    { regex: /\bT\.?\s*MAT\b/i, subject: "Matematik" },
    { regex: /\bGEO-?1\b/i, subject: "Geometri" },
    { regex: /\bF[Iİ]Z-?1\b/i, subject: "Fizik" },
    { regex: /\bK[Iİ]M-?1\b/i, subject: "Kimya" },
    { regex: /\bB[Iİ]Y-?1\b/i, subject: "Biyoloji" },
  ];

  // Global topic matcher: captures topic text (letters or year-prefixed like 1453-1683) + 4 integers (SS, D, Y, %)
  const globalTopicRegex =
    /([A-Za-zÇĞİÖŞÜçğıöşü0-9][A-Za-zÇĞİÖŞÜçğıöşü0-9\s,./\-()'&?]{2,70}?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})%?(?=\s|$)/g;

  for (const line of lines) {
    const norm = normalizeTr(line);

    const exactSection = KARNE_SECTION_MAP.find((m) => m.pattern.test(norm));
    if (exactSection) {
      currentSubject = exactSection.subject;
      continue;
    }

    // Update currentSubject if a known section header appears at the start of a line
    for (const st of sectionTokens) {
      if (new RegExp(`^\\s*${st.regex.source}`, "i").test(line)) {
        currentSubject = st.subject;
        break;
      }
    }

    // Check inline bracket prefix like "[Matematik] ..."
    let workingLine = line;
    const bracketMatch = line.match(/^\[([^\]]+)\]\s*(.+)$/);
    if (bracketMatch) {
      currentSubject = bracketMatch[1].trim();
      workingLine = bracketMatch[2].trim();
    }

    globalTopicRegex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = globalTopicRegex.exec(workingLine)) !== null) {
      let topicName = m[1].trim();
      const total = Number(m[2]);
      const correct = Number(m[3]);
      const wrong = Number(m[4]);
      const percent = Number(m[5]);

      // Strip leading section token if glued onto topicName
      for (const st of sectionTokens) {
        if (st.regex.test(topicName)) {
          // If it's e.g. "TURKCE Hareket Ve Hareket...", only switch subject if it wasn't just the left column header
          const stripped = topicName.replace(st.regex, "").trim();
          if (stripped.length > 2) {
            topicName = stripped;
          }
        }
      }

      if (
        !topicName ||
        /^\d+$/.test(topicName) ||
        total <= 0 ||
        total > 40 ||
        correct + wrong > total ||
        percent > 100
      ) {
        continue;
      }

      // Verify percentage checksum: (D / SS) * 100 ≈ % (within 2.5 points for rounding)
      const expectedPct = (correct / total) * 100;
      if (Math.abs(expectedPct - percent) > 2.5) {
        continue;
      }

      if (
        /^(soru|dogru|yanlis|bos|net|konu|toplam|ss|puan|derece|cevap|sinav)$/i.test(
          normalizeTr(topicName)
        )
      ) {
        continue;
      }

      const key = `${currentSubject}::${topicName}`;
      if (seenTopics.has(key)) continue;
      seenTopics.add(key);

      topicBreakdown.push({
        subject: currentSubject,
        topic: topicName,
        total,
        correct,
        wrong,
        empty: Math.max(0, total - correct - wrong),
        percent,
      });
    }
  }

  // 2. Check Turkish Karne tabular rows FIRST: SORU SAYISI / DOĞRU CEVAP / YANLIŞ CEVAP / BOŞ CEVAP
  let subjects: SubjectNet[] = [];
  let detectedType: "TYT" | "AYT" | undefined;

  const extractRowNumbers = (labelRegex: RegExp): number[] => {
    const line = lines.find((l) => labelRegex.test(normalizeTr(l)));
    if (!line) return [];
    return (line.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) =>
      Number(n.replace(",", "."))
    );
  };

  const soruNums = extractRowNumbers(/^soru\s*sayisi/);
  const dogruNums = extractRowNumbers(/^dogru\s*cevap/);
  const yanlisNums = extractRowNumbers(/^yanlis\s*cevap/);
  const bosNums = extractRowNumbers(/^bos\s*cevap/);

  if (dogruNums.length >= 4 && yanlisNums.length >= 4) {
    const tytSum = (soruNums.length >= 4 ? soruNums : dogruNums)
      .slice(0, 4)
      .reduce((a, b) => a + b, 0);
    const aytSum = (soruNums.length > 4 ? soruNums : dogruNums)
      .slice(4)
      .reduce((a, b) => a + b, 0);

    if (tytSum > 0 && aytSum === 0) {
      detectedType = "TYT";
      const names = ["Türkçe", "Sosyal Bilimler", "Matematik", "Fen Bilimleri"];
      subjects = names.map((name, i) => {
        const c = dogruNums[i] ?? 0;
        const w = yanlisNums[i] ?? 0;
        const e = bosNums[i] ?? 0;
        return {
          name,
          correct: c,
          wrong: w,
          empty: e,
          net: Number((c - w / 4).toFixed(2)),
        };
      });
    } else if (aytSum > 0 && tytSum === 0) {
      detectedType = "AYT";
      const aytDefs = [
        { name: "Matematik", indices: [4, 5] }, // MAT-2 + GEO-2
        { name: "Fizik", indices: [6] },
        { name: "Kimya", indices: [7] },
        { name: "Biyoloji", indices: [8] },
        { name: "Edebiyat", indices: [9] },
        { name: "Tarih", indices: [10, 12] },
        { name: "Coğrafya", indices: [11, 13] },
      ];
      subjects = aytDefs
        .map((def) => {
          const sCount = def.indices.reduce(
            (acc, idx) => acc + (soruNums[idx] ?? 0),
            0
          );
          const c = def.indices.reduce(
            (acc, idx) => acc + (dogruNums[idx] ?? 0),
            0
          );
          const w = def.indices.reduce(
            (acc, idx) => acc + (yanlisNums[idx] ?? 0),
            0
          );
          const e = def.indices.reduce(
            (acc, idx) => acc + (bosNums[idx] ?? 0),
            0
          );
          if (sCount === 0 && c === 0 && w === 0) return null;
          return {
            name: def.name,
            correct: c,
            wrong: w,
            empty: e,
            net: Number((c - w / 4).toFixed(2)),
          };
        })
        .filter((x): x is SubjectNet => x !== null);
    }
  }

  // 2b. Standard text fallback if not a tabular karne
  if (subjects.length === 0) {
    subjects = extractSubjectsFromText(rawText);
  }

  // 3. Fallback: aggregate TYT subjects from topicBreakdown if top summary wasn't matched
  if (subjects.length === 0 && topicBreakdown.length > 0) {
    const bucket = new Map<string, { c: number; w: number; e: number }>();
    const mapToMain = (sub: string) => {
      if (
        sub === "Tarih" ||
        sub === "Coğrafya" ||
        sub === "Felsefe" ||
        sub === "Din Kültürü"
      ) {
        return "Sosyal Bilimler";
      }
      if (sub === "Geometri" || sub === "Matematik") return "Matematik";
      if (sub === "Fizik" || sub === "Kimya" || sub === "Biyoloji") {
        return "Fen Bilimleri";
      }
      return sub;
    };

    for (const t of topicBreakdown) {
      const main = mapToMain(t.subject);
      const cur = bucket.get(main) || { c: 0, w: 0, e: 0 };
      bucket.set(main, {
        c: cur.c + t.correct,
        w: cur.w + t.wrong,
        e: cur.e + t.empty,
      });
    }

    subjects = Array.from(bucket.entries()).map(([name, val]) => ({
      name,
      correct: val.c,
      wrong: val.w,
      empty: val.e,
      net: Number((val.c - val.w / 4).toFixed(2)),
    }));
  }

  const totalNet = Number(
    subjects.reduce((acc, s) => acc + s.net, 0).toFixed(2)
  );

  // Try to detect title, date & exam type
  const dateMatch = rawText.match(/\b(\d{2}[./-]\d{2}[./-]\d{4})\b/);
  const titleLine = lines.find((l) =>
    /deneme|sinav|izleme|tyt|ayt/i.test(normalizeTr(l))
  );
  if (!detectedType && titleLine) {
    if (/\bayt\b/i.test(titleLine) && !/\btyt\b/i.test(titleLine)) {
      detectedType = "AYT";
    } else if (/\btyt\b/i.test(titleLine)) {
      detectedType = "TYT";
    }
  }

  return {
    detectedTitle: titleLine,
    detectedDate: dateMatch?.[1],
    detectedType,
    subjects,
    topicBreakdown,
    totalNet,
  };
}
