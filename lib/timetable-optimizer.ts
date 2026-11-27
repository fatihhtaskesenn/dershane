import type {
  ClassroomRecord,
  StudentScheduleSlot,
  TeacherAccount,
  WeekDay,
} from "@/lib/campus-store";
import { buildDailySlots } from "@/components/WeeklyTimetable";

export type BlockMode = "auto" | "double" | "single";
export type OptimizationIntensity = "standard" | "high" | "max";

export interface OptimizerCurriculumRow {
  rowId: string;
  subject: string;
  examLevel: string;
  teacherName: string;
  weeklyHours: number;
  type: "Konu Anlatımı" | "Soru Çözümü";
  blockMode?: BlockMode;
}

export interface OptimizerOptions {
  daysScope: "weekdays" | "sixdays";
  timeWindow: "morning" | "afternoon" | "fullday";
  preserveExamBlocks: boolean;
  minimizeTeacherGaps: boolean;
  balanceDailySubjects: boolean;
  morningCorePriority: boolean;
  enableSwapChains: boolean;
  intensity: OptimizationIntensity;
}

export interface TeacherLoadReport {
  teacherName: string;
  branch: string;
  assignedHours: number;
  openSlotCount: number;
  closedSlotCount: number;
  idleGaps: number;
}

export interface OptimizationMetrics {
  requestedHours: number;
  placedHours: number;
  placementRate: number;
  optimizationScore: number;
  initialTeacherGaps: number;
  finalTeacherGaps: number;
  swapRescues: number;
  splitFallbacks: number;
  iterationsRun: number;
  durationMs: number;
  teacherReports: TeacherLoadReport[];
}

export interface OptimizerResult {
  entries: { classId: string; slots: Omit<StudentScheduleSlot, "id">[] }[];
  warnings: string[];
  metrics: OptimizationMetrics;
}

interface TeachingUnit {
  unitId: string;
  classId: string;
  className: string;
  room: string;
  subject: string;
  fullSubject: string;
  teacherName: string;
  type: "Konu Anlatımı" | "Soru Çözümü";
  duration: 1 | 2;
  weeklyHours: number;
  isCoreHeavy: boolean;
  dayIdx: number; // -1 if unplaced
  timeIdx: number; // -1 if unplaced
}

const CORE_HEAVY_SUBJECTS = new Set([
  "matematik",
  "geometri",
  "fizik",
  "kimya",
  "biyoloji",
  "türkçe",
  "edebiyat",
]);

function isCoreHeavySubject(subject: string): boolean {
  return CORE_HEAVY_SUBJECTS.has(subject.trim().toLowerCase());
}

function decomposeIntoUnits(
  cls: ClassroomRecord,
  rows: OptimizerCurriculumRow[]
): TeachingUnit[] {
  const units: TeachingUnit[] = [];
  let seq = 0;

  rows.forEach((row) => {
    const hours = Math.max(0, Math.floor(row.weeklyHours));
    if (hours === 0 || !row.teacherName) return;

    const fullSubject = `${row.examLevel} ${row.subject}`.trim();
    const core = isCoreHeavySubject(row.subject);
    const mode: BlockMode = row.blockMode ?? "auto";

    const durations: (1 | 2)[] = [];
    if (mode === "single") {
      for (let i = 0; i < hours; i++) durations.push(1);
    } else if (mode === "double") {
      const pairs = Math.floor(hours / 2);
      for (let i = 0; i < pairs; i++) durations.push(2);
      if (hours % 2 === 1) durations.push(1);
    } else {
      // "auto": 2-hour subjects spread as 1+1 across days; 3+ hours use 2-hr blocks + singles
      if (hours <= 2) {
        for (let i = 0; i < hours; i++) durations.push(1);
      } else {
        const pairs = Math.floor(hours / 2);
        for (let i = 0; i < pairs; i++) durations.push(2);
        if (hours % 2 === 1) durations.push(1);
      }
    }

    durations.forEach((dur) => {
      seq += 1;
      units.push({
        unitId: `${cls.id}-u-${seq}`,
        classId: cls.id,
        className: cls.name,
        room: cls.room,
        subject: row.subject,
        fullSubject,
        teacherName: row.teacherName,
        type: row.type,
        duration: dur,
        weeklyHours: hours,
        isCoreHeavy: core,
        dayIdx: -1,
        timeIdx: -1,
      });
    });
  });

  return units;
}

export function runOptimizedTimetableSolver(
  targetClasses: ClassroomRecord[],
  curriculumsByClass: Record<string, OptimizerCurriculumRow[]>,
  teachers: TeacherAccount[],
  options: OptimizerOptions
): OptimizerResult {
  const startTime = performance.now();

  const candidateDays: WeekDay[] =
    options.daysScope === "weekdays"
      ? ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"]
      : ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  const allSlots = buildDailySlots(50).slots;
  const candidateTimes = allSlots.filter((t) => {
    if (options.timeWindow === "morning") return t < "12:00";
    if (options.timeWindow === "afternoon") return t >= "12:00" && t <= "17:10";
    return t <= "17:10";
  });

  const D = candidateDays.length;
  const T = candidateTimes.length;
  const targetClassNames = new Set(targetClasses.map((c) => c.name));

  // Map day/time to indices for O(1) lookups
  const dayToIdx = new Map<WeekDay, number>();
  candidateDays.forEach((d, idx) => dayToIdx.set(d, idx));
  const timeToIdx = new Map<string, number>();
  candidateTimes.forEach((t, idx) => timeToIdx.set(t, idx));

  // Teacher fixed busy + unavailable matrices: boolean[D][T]
  const teacherBlocked = new Map<string, boolean[][]>();
  const teacherOpenCount = new Map<string, number>();
  const teacherClosedCount = new Map<string, number>();

  teachers.forEach((t) => {
    const grid = Array.from({ length: D }, () => Array<boolean>(T).fill(false));
    let closed = 0;

    // 1. Explicitly marked unavailable slots
    (t.unavailableSlots ?? []).forEach((key) => {
      const [dStr, tStr] = key.split("|");
      const di = dayToIdx.get(dStr as WeekDay);
      const ti = timeToIdx.get((tStr ?? "").trim());
      if (di !== undefined && ti !== undefined && !grid[di][ti]) {
        grid[di][ti] = true;
        closed += 1;
      }
    });

    // 2. Lessons in classes NOT being regenerated
    t.schedule.forEach((ts) => {
      if (targetClassNames.has(ts.classGroup)) return;
      const di = dayToIdx.get(ts.day);
      const ti = timeToIdx.get(ts.time.trim());
      if (di !== undefined && ti !== undefined) {
        grid[di][ti] = true;
      }
    });

    // 3. 1-on-1 slots
    t.oneOnOneSlots.forEach((oo) => {
      const di = dayToIdx.get(oo.day);
      const ti = timeToIdx.get(oo.time.trim());
      if (di !== undefined && ti !== undefined) {
        grid[di][ti] = true;
      }
    });

    let open = 0;
    for (let d = 0; d < D; d++) {
      for (let s = 0; s < T; s++) {
        if (!grid[d][s]) open += 1;
      }
    }

    teacherBlocked.set(t.name, grid);
    teacherOpenCount.set(t.name, open);
    teacherClosedCount.set(t.name, closed);
  });

  // Class exam block matrices
  const classExamBlocked = new Map<string, boolean[][]>();
  targetClasses.forEach((cls) => {
    const grid = Array.from({ length: D }, () => Array<boolean>(T).fill(false));
    if (options.preserveExamBlocks) {
      cls.schedule
        .filter((s) => Boolean(s.blockPeriod))
        .forEach((b) => {
          const di = dayToIdx.get(b.day);
          if (di === undefined) return;
          for (let ti = 0; ti < T; ti++) {
            const tm = candidateTimes[ti];
            if (b.blockPeriod === "morning" && tm < "12:00") grid[di][ti] = true;
            if (b.blockPeriod === "afternoon" && tm >= "12:00") grid[di][ti] = true;
          }
        });
    }
    classExamBlocked.set(cls.id, grid);
  });

  // Build all teaching units
  const allUnits: TeachingUnit[] = [];
  targetClasses.forEach((cls) => {
    const rows = curriculumsByClass[cls.id] ?? [];
    allUnits.push(...decomposeIntoUnits(cls, rows));
  });

  // Compute teacher demand for MRV difficulty ordering
  const teacherDemand = new Map<string, number>();
  allUnits.forEach((u) => {
    teacherDemand.set(u.teacherName, (teacherDemand.get(u.teacherName) ?? 0) + u.duration);
  });

  // Sort units: Most Constrained First (MRV)
  allUnits.sort((a, b) => {
    if (b.duration !== a.duration) return b.duration - a.duration;
    const tightA =
      (teacherDemand.get(a.teacherName) ?? 1) /
      Math.max(1, teacherOpenCount.get(a.teacherName) ?? D * T);
    const tightB =
      (teacherDemand.get(b.teacherName) ?? 1) /
      Math.max(1, teacherOpenCount.get(b.teacherName) ?? D * T);
    if (Math.abs(tightB - tightA) > 0.01) return tightB - tightA;
    return b.weeklyHours - a.weeklyHours;
  });

  // Live occupancy grids: null or TeachingUnit
  const classGrid = new Map<string, (TeachingUnit | null)[][]>();
  targetClasses.forEach((cls) => {
    classGrid.set(
      cls.id,
      Array.from({ length: D }, () => Array<TeachingUnit | null>(T).fill(null))
    );
  });

  const teacherGrid = new Map<string, (TeachingUnit | null)[][]>();
  const ensureTeacherGrid = (name: string) => {
    let g = teacherGrid.get(name);
    if (!g) {
      g = Array.from({ length: D }, () => Array<TeachingUnit | null>(T).fill(null));
      teacherGrid.set(name, g);
    }
    return g;
  };
  teachers.forEach((t) => ensureTeacherGrid(t.name));

  // Helper: check if 2-hour block crosses lunch break
  const isSameHalfDay = (tIdx: number, dur: 1 | 2): boolean => {
    if (dur === 1) return tIdx >= 0 && tIdx < T;
    if (tIdx < 0 || tIdx + 1 >= T) return false;
    const t1 = candidateTimes[tIdx];
    const t2 = candidateTimes[tIdx + 1];
    return (t1 < "12:00" && t2 < "12:00") || (t1 >= "12:00" && t2 >= "12:00");
  };

  const canPlaceAt = (
    u: TeachingUnit,
    d: number,
    t: number,
    ignoreUnit?: TeachingUnit
  ): boolean => {
    if (!isSameHalfDay(t, u.duration)) return false;
    const cGrid = classGrid.get(u.classId)!;
    const exGrid = classExamBlocked.get(u.classId)!;
    const tGrid = ensureTeacherGrid(u.teacherName);
    const tBlk = teacherBlocked.get(u.teacherName);

    for (let k = 0; k < u.duration; k++) {
      const ti = t + k;
      if (exGrid[d][ti]) return false;
      if (tBlk && tBlk[d][ti]) return false;
      const cOcc = cGrid[d][ti];
      if (cOcc && cOcc !== ignoreUnit) return false;
      const tOcc = tGrid[d][ti];
      if (tOcc && tOcc !== ignoreUnit) return false;
    }
    return true;
  };

  const placeUnit = (u: TeachingUnit, d: number, t: number) => {
    const cGrid = classGrid.get(u.classId)!;
    const tGrid = ensureTeacherGrid(u.teacherName);
    for (let k = 0; k < u.duration; k++) {
      cGrid[d][t + k] = u;
      tGrid[d][t + k] = u;
    }
    u.dayIdx = d;
    u.timeIdx = t;
  };

  const removeUnit = (u: TeachingUnit) => {
    if (u.dayIdx < 0 || u.timeIdx < 0) return;
    const cGrid = classGrid.get(u.classId)!;
    const tGrid = ensureTeacherGrid(u.teacherName);
    for (let k = 0; k < u.duration; k++) {
      if (cGrid[u.dayIdx][u.timeIdx + k] === u) {
        cGrid[u.dayIdx][u.timeIdx + k] = null;
      }
      if (tGrid[u.dayIdx][u.timeIdx + k] === u) {
        tGrid[u.dayIdx][u.timeIdx + k] = null;
      }
    }
    u.dayIdx = -1;
    u.timeIdx = -1;
  };

  // Soft placement cost for constructive phase
  const placementCost = (u: TeachingUnit, d: number, t: number): number => {
    let cost = 0;
    const cGrid = classGrid.get(u.classId)!;
    const tGrid = ensureTeacherGrid(u.teacherName);

    let sameSubjectOnDay = 0;
    let classHoursOnDay = 0;
    for (let s = 0; s < T; s++) {
      const occ = cGrid[d][s];
      if (occ) {
        classHoursOnDay += 1;
        if (occ.fullSubject === u.fullSubject) sameSubjectOnDay += 1;
      }
    }

    if (options.balanceDailySubjects) {
      cost += sameSubjectOnDay * 35;
      if (sameSubjectOnDay >= 2) cost += 60;
      cost += classHoursOnDay * 4;
    }

    if (options.morningCorePriority && u.isCoreHeavy) {
      if (candidateTimes[t] >= "12:00") cost += 18;
      else cost -= t === 0 ? 4 : 6;
    }

    if (options.minimizeTeacherGaps) {
      // Reward adjacency to teacher's existing lessons on day d
      let hasAdjacent = false;
      let hasLessonOnDay = false;
      for (let s = 0; s < T; s++) {
        if (tGrid[d][s]) {
          hasLessonOnDay = true;
          if (Math.abs(s - t) === 1 || Math.abs(s - (t + u.duration - 1)) === 1) {
            hasAdjacent = true;
          }
        }
      }
      if (hasLessonOnDay) {
        cost += hasAdjacent ? -16 : 22;
      }
    }

    // Slight preference for compact class schedule (avoid late isolated slots)
    cost += t * 0.5;
    return cost;
  };

  const findBestDirectSlot = (
    u: TeachingUnit
  ): { d: number; t: number; cost: number } | null => {
    let best: { d: number; t: number; cost: number } | null = null;
    for (let d = 0; d < D; d++) {
      for (let t = 0; t < T; t++) {
        if (!canPlaceAt(u, d, t)) continue;
        const c = placementCost(u, d, t);
        if (!best || c < best.cost) {
          best = { d, t, cost: c };
        }
      }
    }
    return best;
  };

  // Phase 2: Constructive Placement + 1-Hop Swap-Chain Rescue
  let swapRescues = 0;
  let splitFallbacks = 0;
  const unplacedUnits: TeachingUnit[] = [];

  const trySwapRescue = (u: TeachingUnit): boolean => {
    if (!options.enableSwapChains) return false;
    const cGrid = classGrid.get(u.classId)!;
    const exGrid = classExamBlocked.get(u.classId)!;
    const tGrid = ensureTeacherGrid(u.teacherName);
    const tBlk = teacherBlocked.get(u.teacherName);

    for (let d = 0; d < D; d++) {
      for (let t = 0; t < T; t++) {
        if (!isSameHalfDay(t, u.duration)) continue;

        // Check hard fixed blocks (exam / teacher unavailable)
        let fixedBlocked = false;
        const blockers = new Set<TeachingUnit>();
        for (let k = 0; k < u.duration; k++) {
          const ti = t + k;
          if (exGrid[d][ti] || (tBlk && tBlk[d][ti])) {
            fixedBlocked = true;
            break;
          }
          if (cGrid[d][ti]) blockers.add(cGrid[d][ti]!);
          if (tGrid[d][ti]) blockers.add(tGrid[d][ti]!);
        }
        if (fixedBlocked || blockers.size !== 1) continue;

        const blocker = Array.from(blockers)[0];
        const origD = blocker.dayIdx;
        const origT = blocker.timeIdx;
        removeUnit(blocker);

        if (canPlaceAt(u, d, t)) {
          const altForBlocker = findBestDirectSlot(blocker);
          if (altForBlocker) {
            placeUnit(blocker, altForBlocker.d, altForBlocker.t);
            placeUnit(u, d, t);
            swapRescues += 1;
            return true;
          }
        }

        // Restore blocker if rescue failed
        placeUnit(blocker, origD, origT);
      }
    }
    return false;
  };

  const extraSplitUnits: TeachingUnit[] = [];

  allUnits.forEach((u) => {
    const direct = findBestDirectSlot(u);
    if (direct) {
      placeUnit(u, direct.d, direct.t);
      return;
    }

    if (trySwapRescue(u)) {
      return;
    }

    // If a 2-hour block couldn't fit, split into two 1-hour units
    if (u.duration === 2) {
      const s1: TeachingUnit = { ...u, unitId: `${u.unitId}-a`, duration: 1 };
      const s2: TeachingUnit = { ...u, unitId: `${u.unitId}-b`, duration: 1 };
      let anyPlaced = false;

      for (const su of [s1, s2]) {
        const dSlot = findBestDirectSlot(su);
        if (dSlot) {
          placeUnit(su, dSlot.d, dSlot.t);
          extraSplitUnits.push(su);
          anyPlaced = true;
        } else if (trySwapRescue(su)) {
          extraSplitUnits.push(su);
          anyPlaced = true;
        } else {
          unplacedUnits.push(su);
        }
      }
      if (anyPlaced) splitFallbacks += 1;
    } else {
      unplacedUnits.push(u);
    }
  });

  const activeUnits = [
    ...allUnits.filter((u) => u.dayIdx >= 0),
    ...extraSplitUnits.filter((u) => u.dayIdx >= 0),
  ];

  // Helper to compute total teacher idle gaps across all teachers
  const countTotalTeacherGaps = (): {
    totalGaps: number;
    perTeacher: Map<string, number>;
  } => {
    let totalGaps = 0;
    const perTeacher = new Map<string, number>();
    teacherGrid.forEach((grid, tName) => {
      let tGaps = 0;
      for (let d = 0; d < D; d++) {
        let first = -1;
        let last = -1;
        let count = 0;
        for (let s = 0; s < T; s++) {
          if (grid[d][s]) {
            if (first === -1) first = s;
            last = s;
            count += 1;
          }
        }
        if (count > 1 && last > first) {
          // Count empty slots between first and last (excluding lunch break transition if any)
          for (let s = first + 1; s < last; s++) {
            if (!grid[d][s]) tGaps += 1;
          }
        }
      }
      perTeacher.set(tName, tGaps);
      totalGaps += tGaps;
    });
    return { totalGaps, perTeacher };
  };

  // Global soft-penalty function for Simulated Annealing
  const computeGlobalPenalty = (): number => {
    let penalty = 0;

    if (options.minimizeTeacherGaps) {
      const { totalGaps } = countTotalTeacherGaps();
      penalty += totalGaps * 25;
    }

    targetClasses.forEach((cls) => {
      const cGrid = classGrid.get(cls.id)!;
      const dailyCounts: number[] = [];

      for (let d = 0; d < D; d++) {
        let dayCount = 0;
        let first = -1;
        let last = -1;
        const subjectCounts = new Map<string, number>();

        for (let s = 0; s < T; s++) {
          const occ = cGrid[d][s];
          if (!occ) continue;
          dayCount += 1;
          if (first === -1) first = s;
          last = s;

          const prev = subjectCounts.get(occ.fullSubject) ?? 0;
          subjectCounts.set(occ.fullSubject, prev + 1);

          if (options.morningCorePriority && occ.isCoreHeavy && candidateTimes[s] >= "12:00") {
            penalty += 6;
          }
        }

        dailyCounts.push(dayCount);

        // Penalize internal gaps in class schedule
        if (dayCount > 1 && last > first) {
          for (let s = first + 1; s < last; s++) {
            if (!cGrid[d][s]) penalty += 14;
          }
        }

        // Penalize >2 hours of same subject in a single day
        if (options.balanceDailySubjects) {
          subjectCounts.forEach((cnt) => {
            if (cnt === 2) penalty += 2;
            if (cnt >= 3) penalty += (cnt - 2) * 30;
          });
        }
      }

      if (options.balanceDailySubjects && dailyCounts.length > 1) {
        const maxD = Math.max(...dailyCounts);
        const minD = Math.min(...dailyCounts);
        if (maxD - minD > 1) penalty += (maxD - minD - 1) * 10;
      }
    });

    return penalty;
  };

  const initialTeacherGaps = countTotalTeacherGaps().totalGaps;
  let currentPenalty = computeGlobalPenalty();
  let bestPenalty = currentPenalty;
  let bestSnapshot = activeUnits.map((u) => ({
    unit: u,
    d: u.dayIdx,
    t: u.timeIdx,
  }));

  // Phase 3: Simulated Annealing / Local Search Optimization
  const iterations =
    options.intensity === "max"
      ? 3500
      : options.intensity === "high"
      ? 1800
      : 700;

  if (activeUnits.length > 1 && (options.minimizeTeacherGaps || options.balanceDailySubjects || options.morningCorePriority)) {
    for (let iter = 0; iter < iterations; iter++) {
      const temp = Math.max(0.5, 25 * (1 - iter / iterations));
      const u = activeUnits[Math.floor(Math.random() * activeUnits.length)];
      const oldD = u.dayIdx;
      const oldT = u.timeIdx;

      const trySwap = Math.random() < 0.45;
      if (trySwap) {
        // Pick another unit in the same class with same duration
        const peers = activeUnits.filter(
          (p) => p !== u && p.classId === u.classId && p.duration === u.duration
        );
        if (peers.length === 0) continue;
        const v = peers[Math.floor(Math.random() * peers.length)];
        const vD = v.dayIdx;
        const vT = v.timeIdx;

        removeUnit(u);
        removeUnit(v);

        if (canPlaceAt(u, vD, vT) && canPlaceAt(v, oldD, oldT)) {
          placeUnit(u, vD, vT);
          placeUnit(v, oldD, oldT);
          const nextPenalty = computeGlobalPenalty();
          const delta = nextPenalty - currentPenalty;
          if (delta <= 0 || Math.random() < Math.exp(-delta / temp)) {
            currentPenalty = nextPenalty;
            if (nextPenalty < bestPenalty) {
              bestPenalty = nextPenalty;
              bestSnapshot = activeUnits.map((x) => ({
                unit: x,
                d: x.dayIdx,
                t: x.timeIdx,
              }));
            }
          } else {
            removeUnit(u);
            removeUnit(v);
            placeUnit(u, oldD, oldT);
            placeUnit(v, vD, vT);
          }
        } else {
          placeUnit(u, oldD, oldT);
          placeUnit(v, vD, vT);
        }
      } else {
        // Move u to a random valid empty slot in its class
        const newD = Math.floor(Math.random() * D);
        const newT = Math.floor(Math.random() * T);
        if (newD === oldD && newT === oldT) continue;

        removeUnit(u);
        if (canPlaceAt(u, newD, newT)) {
          placeUnit(u, newD, newT);
          const nextPenalty = computeGlobalPenalty();
          const delta = nextPenalty - currentPenalty;
          if (delta <= 0 || Math.random() < Math.exp(-delta / temp)) {
            currentPenalty = nextPenalty;
            if (nextPenalty < bestPenalty) {
              bestPenalty = nextPenalty;
              bestSnapshot = activeUnits.map((x) => ({
                unit: x,
                d: x.dayIdx,
                t: x.timeIdx,
              }));
            }
          } else {
            removeUnit(u);
            placeUnit(u, oldD, oldT);
          }
        } else {
          placeUnit(u, oldD, oldT);
        }
      }
    }

    // Restore best snapshot found during annealing
    activeUnits.forEach((u) => removeUnit(u));
    bestSnapshot.forEach(({ unit, d, t }) => {
      if (d >= 0 && t >= 0) placeUnit(unit, d, t);
    });
  }

  // Build output entries
  const entries = targetClasses.map((cls) => {
    const cGrid = classGrid.get(cls.id)!;
    const slots: Omit<StudentScheduleSlot, "id">[] = [];
    for (let d = 0; d < D; d++) {
      for (let t = 0; t < T; t++) {
        const occ = cGrid[d][t];
        if (!occ) continue;
        slots.push({
          day: candidateDays[d],
          time: candidateTimes[t],
          subject: occ.fullSubject,
          teacher: occ.teacherName,
          room: occ.room,
          type: occ.type,
        });
      }
    }
    return { classId: cls.id, slots };
  });

  // Build warnings for any unplaced hours
  const warningGroups = new Map<string, number>();
  unplacedUnits.forEach((u) => {
    const key = `${u.className} · ${u.fullSubject} (${u.teacherName})`;
    warningGroups.set(key, (warningGroups.get(key) ?? 0) + u.duration);
  });

  const warnings = Array.from(warningGroups.entries()).map(([label, hrs]) => {
    const open = teacherOpenCount.get(
      label.slice(label.lastIndexOf("(") + 1, label.lastIndexOf(")"))
    );
    return `${label}: ${hrs} saat yerleştirilemedi${
      open !== undefined ? ` (Öğretmenin açık saati: ${open})` : ""
    }.`;
  });

  const requestedHours = allUnits.reduce((sum, u) => sum + u.duration, 0);
  const placedHours = entries.reduce((sum, e) => sum + e.slots.length, 0);
  const placementRate =
    requestedHours > 0 ? Math.round((placedHours / requestedHours) * 100) : 100;

  const { totalGaps: finalTeacherGaps, perTeacher } = countTotalTeacherGaps();
  const gapPenaltyNorm = Math.min(25, finalTeacherGaps * 1.5);
  const optimizationScore = Math.max(
    0,
    Math.min(100, Math.round(placementRate * 0.75 + (25 - gapPenaltyNorm)))
  );

  const teacherReports: TeacherLoadReport[] = teachers
    .map((t) => {
      const grid = teacherGrid.get(t.name);
      let assigned = 0;
      if (grid) {
        for (let d = 0; d < D; d++) {
          for (let s = 0; s < T; s++) {
            if (grid[d][s]) assigned += 1;
          }
        }
      }
      return {
        teacherName: t.name,
        branch: t.branch,
        assignedHours: assigned,
        openSlotCount: teacherOpenCount.get(t.name) ?? D * T,
        closedSlotCount: teacherClosedCount.get(t.name) ?? 0,
        idleGaps: perTeacher.get(t.name) ?? 0,
      };
    })
    .filter((r) => r.assignedHours > 0 || r.closedSlotCount > 0)
    .sort((a, b) => b.assignedHours - a.assignedHours);

  const durationMs = Math.max(1, Math.round(performance.now() - startTime));

  return {
    entries,
    warnings,
    metrics: {
      requestedHours,
      placedHours,
      placementRate,
      optimizationScore,
      initialTeacherGaps,
      finalTeacherGaps,
      swapRescues,
      splitFallbacks,
      iterationsRun: iterations,
      durationMs,
      teacherReports,
    },
  };
}
