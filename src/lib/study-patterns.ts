/**
 * Milo Study Pattern Engine
 * Reads real study session telemetry from localStorage and computes:
 * - Subject weakness scores (based on mastery ratings)
 * - Neglected subjects (not studied in 3+ days)
 * - Spaced repetition intervals (SM-2 algorithm)
 * - Focus quality scores (time vs. interruptions)
 * - Personalized coaching recommendations
 */

export interface StudySession {
  subject: string;
  duration: number;
  actualMinutes: number;
  interruptions: number;
  mastery: number; // 1–5
  timestamp: string;
}

export interface SubjectStat {
  name: string;
  avgMastery: number;
  totalMinutes: number;
  sessionsCount: number;
  avgInterruptions: number;
  lastStudied: Date | null;
  daysSinceLastStudy: number | null;
  nextReviewDue: Date | null; // SM-2 spaced repetition
  focusQuality: number; // 0–100
  trend: "improving" | "declining" | "stable" | "no-data";
}

export interface StudyPattern {
  subjectStats: SubjectStat[];
  weakestSubjects: SubjectStat[]; // mastery < 3.5
  neglectedSubjects: SubjectStat[]; // not studied in 3+ days
  strongestSubject: SubjectStat | null;
  totalStudyMinutes: number;
  totalSessions: number;
  overallMastery: number;
  overallFocusQuality: number;
  coachingInsights: string[]; // 3 personalized tips
  studyStyleRecommendation: string; // recommended approach
  streakDays: number;
}

// SM-2 Algorithm: calculate next review interval based on mastery (ease factor)
function sm2NextInterval(mastery: number, prevIntervalDays: number): number {
  // mastery 1-5 maps to ease factor 1.3 - 2.5
  const easeFactor = Math.max(1.3, 0.1 + mastery * 0.48);
  if (mastery < 3) {
    return 1; // review again tomorrow if struggling
  }
  if (prevIntervalDays <= 1) {
    return 3; // first successful recall: 3 days
  }
  if (prevIntervalDays <= 3) {
    return 7;
  }
  return Math.round(prevIntervalDays * easeFactor);
}

function computeFocusQuality(minutes: number, interruptions: number): number {
  if (minutes === 0) return 0;
  const interruptionPenalty = interruptions * 10;
  const raw = Math.max(0, 100 - interruptionPenalty + Math.min(30, minutes));
  return Math.min(100, Math.round(raw));
}

export function analyzeStudyPatterns(
  sessions: StudySession[],
  enrolledSubjects: string[]
): StudyPattern {
  const now = new Date();

  // Build per-subject maps
  const subjectMap = new Map<
    string,
    {
      masteries: number[];
      minutes: number[];
      interruptions: number[];
      timestamps: Date[];
    }
  >();

  // Initialize with enrolled subjects so even unstudied ones appear
  for (const subject of enrolledSubjects) {
    subjectMap.set(subject, {
      masteries: [],
      minutes: [],
      interruptions: [],
      timestamps: [],
    });
  }

  // Populate from logged sessions (match by fuzzy subject name)
  for (const session of sessions) {
    const matchedKey =
      enrolledSubjects.find(
        (s) =>
          s.toLowerCase() === session.subject.toLowerCase() ||
          session.subject.toLowerCase().includes(s.toLowerCase().split(" ")[0])
      ) || session.subject;

    if (!subjectMap.has(matchedKey)) {
      subjectMap.set(matchedKey, {
        masteries: [],
        minutes: [],
        interruptions: [],
        timestamps: [],
      });
    }
    const entry = subjectMap.get(matchedKey)!;
    entry.masteries.push(session.mastery);
    entry.minutes.push(session.actualMinutes);
    entry.interruptions.push(session.interruptions);
    entry.timestamps.push(new Date(session.timestamp));
  }

  // Build SubjectStat for each subject
  const subjectStats: SubjectStat[] = [];

  for (const [name, data] of subjectMap.entries()) {
    const count = data.masteries.length;
    const avgMastery =
      count > 0
        ? Math.round((data.masteries.reduce((a, b) => a + b, 0) / count) * 10) /
          10
        : 0;
    const totalMinutes = data.minutes.reduce((a, b) => a + b, 0);
    const avgInterruptions =
      count > 0
        ? Math.round(
            (data.interruptions.reduce((a, b) => a + b, 0) / count) * 10
          ) / 10
        : 0;
    const avgMinutesPerSession = count > 0 ? totalMinutes / count : 0;
    const focusQuality = computeFocusQuality(
      avgMinutesPerSession,
      avgInterruptions
    );

    // Sort timestamps desc
    const sortedTimestamps = [...data.timestamps].sort(
      (a, b) => b.getTime() - a.getTime()
    );
    const lastStudied = sortedTimestamps[0] || null;
    const daysSinceLastStudy = lastStudied
      ? Math.floor((now.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // SM-2 next review
    let nextReviewDue: Date | null = null;
    if (lastStudied && avgMastery > 0) {
      const lastInterval = daysSinceLastStudy ?? 1;
      const intervalDays = sm2NextInterval(avgMastery, lastInterval);
      nextReviewDue = new Date(lastStudied.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    }

    // Trend: compare last 2 sessions vs previous 2
    let trend: SubjectStat["trend"] = "no-data";
    if (data.masteries.length >= 3) {
      const recent = data.masteries.slice(-2);
      const older = data.masteries.slice(-4, -2);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      if (recentAvg > olderAvg + 0.3) trend = "improving";
      else if (recentAvg < olderAvg - 0.3) trend = "declining";
      else trend = "stable";
    } else if (data.masteries.length > 0) {
      trend = "stable";
    }

    subjectStats.push({
      name,
      avgMastery,
      totalMinutes,
      sessionsCount: count,
      avgInterruptions,
      lastStudied,
      daysSinceLastStudy,
      nextReviewDue,
      focusQuality,
      trend,
    });
  }

  // Sort by weakest first
  const weakestSubjects = subjectStats
    .filter((s) => s.avgMastery > 0 && s.avgMastery < 3.5)
    .sort((a, b) => a.avgMastery - b.avgMastery);

  const neglectedSubjects = subjectStats.filter(
    (s) => s.daysSinceLastStudy !== null && s.daysSinceLastStudy >= 3
  );

  const studiedSubjects = subjectStats.filter((s) => s.sessionsCount > 0);
  const strongestSubject =
    studiedSubjects.length > 0
      ? studiedSubjects.reduce((a, b) =>
          a.avgMastery > b.avgMastery ? a : b
        )
      : null;

  const totalStudyMinutes = subjectStats.reduce(
    (a, b) => a + b.totalMinutes,
    0
  );
  const totalSessions = sessions.length;
  const overallMastery =
    studiedSubjects.length > 0
      ? Math.round(
          (studiedSubjects.reduce((a, b) => a + b.avgMastery, 0) /
            studiedSubjects.length) *
            10
        ) / 10
      : 0;
  const overallFocusQuality =
    studiedSubjects.length > 0
      ? Math.round(
          studiedSubjects.reduce((a, b) => a + b.focusQuality, 0) /
            studiedSubjects.length
        )
      : 0;

  // Streak calculation
  const allDates = sessions.map((s) =>
    new Date(s.timestamp).toDateString()
  );
  const uniqueDates = [...new Set(allDates)].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  let streakDays = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(now);
    expected.setDate(expected.getDate() - i);
    if (uniqueDates[i] === expected.toDateString()) {
      streakDays++;
    } else {
      break;
    }
  }

  // Generate personalized insights
  const coachingInsights: string[] = [];

  if (weakestSubjects.length > 0) {
    const w = weakestSubjects[0];
    coachingInsights.push(
      `Your ${w.name} mastery is ${w.avgMastery}/5 — below target. Try active recall drills instead of re-reading notes.`
    );
  }
  if (neglectedSubjects.length > 0) {
    const n = neglectedSubjects[0];
    coachingInsights.push(
      `You haven't studied ${n.name} in ${n.daysSinceLastStudy} days. Memory decay has likely started — schedule a 20-min review today.`
    );
  }
  if (overallFocusQuality < 60) {
    coachingInsights.push(
      `Your focus quality score is ${overallFocusQuality}/100. High interruptions are reducing retention. Try studying in 25-min distraction-free blocks (Pomodoro).`
    );
  } else if (strongestSubject) {
    coachingInsights.push(
      `${strongestSubject.name} is your strongest subject at ${strongestSubject.avgMastery}/5. Excellent work — keep the spaced review schedule to maintain it.`
    );
  }
  if (streakDays >= 3) {
    coachingInsights.push(
      `🔥 You're on a ${streakDays}-day study streak! Consistency like this boosts long-term retention by up to 40%.`
    );
  }

  // Study style recommendation
  let studyStyleRecommendation =
    "Start with active recall sessions: close your notes and write down everything you remember, then check gaps.";
  if (overallMastery >= 4) {
    studyStyleRecommendation =
      "Your mastery is strong. Focus on interleaving — mix subjects in a single session to strengthen cross-concept connections.";
  } else if (overallFocusQuality < 50) {
    studyStyleRecommendation =
      "Your interruption rate is high. Use the Pomodoro method: 25 min focused study, 5 min break, no phone during the block.";
  } else if (weakestSubjects.length > 1) {
    studyStyleRecommendation =
      "Multiple subjects need attention. Use spaced repetition — review weak subjects daily using the flashcard system for 15 min before starting your main session.";
  }

  return {
    subjectStats,
    weakestSubjects,
    neglectedSubjects,
    strongestSubject,
    totalStudyMinutes,
    totalSessions,
    overallMastery,
    overallFocusQuality,
    coachingInsights,
    studyStyleRecommendation,
    streakDays,
  };
}

// Helper: get sessions from localStorage (client-side only)
export function getSessionsFromStorage(): StudySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("study_sessions");
    return raw ? (JSON.parse(raw) as StudySession[]) : [];
  } catch {
    return [];
  }
}

// Helper: get enrolled subjects from localStorage
export function getSubjectsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("milo_active_subjects");
    return raw ? (JSON.parse(raw) as string[]) : ["Mathematics", "Geography", "Physics"];
  } catch {
    return [];
  }
}
