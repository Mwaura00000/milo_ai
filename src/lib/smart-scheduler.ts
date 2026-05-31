export interface StudySession {
  id: string;
  unitName: string;
  dayOfWeek: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: "reading" | "practice";
}

export function generateSmartSchedule(
  units: string[],
  energyPeak: "Morning" | "Afternoon" | "Night",
  focusStyle: "Sprint" | "Marathon",
  startDate: Date = new Date()
): StudySession[] {
  const schedule: StudySession[] = [];
  
  if (!units || units.length === 0) {
    return schedule;
  }

  // ── 1. Configure constraints based on inputs ──
  let startHour = 8;
  switch (energyPeak) {
    case "Morning": startHour = 6; break;
    case "Afternoon": startHour = 14; break;
    case "Night": startHour = 19; break;
  }

  const windowMinutes = 240; // 4 hour window
  const blockDuration = focusStyle === "Sprint" ? 45 : 90;
  const breakDuration = focusStyle === "Sprint" ? 5 : 15;
  const cycleDuration = blockDuration + breakDuration;

  let unitIndex = 0;

  // ── 2. Loop through 7 days ──
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    // Calculate the current day's date
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    // Handle timezone cleanly for YYYY-MM-DD format
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Days 0, 1, 2 are "reading" (early week), Days 3, 4, 5, 6 are "practice" (late week)
    const sessionType = dayOffset < 3 ? "reading" : "practice";

    let currentMinutes = startHour * 60; // Convert to minutes since midnight
    let remainingWindow = windowMinutes;

    // ── 3. Fill the daily time window ──
    while (remainingWindow >= blockDuration) {
      // Calculate start time string
      const sHour = Math.floor(currentMinutes / 60);
      const sMin = currentMinutes % 60;
      const startTimeStr = `${sHour.toString().padStart(2, '0')}:${sMin.toString().padStart(2, '0')}`;

      // Calculate end time string
      const endMinutes = currentMinutes + blockDuration;
      const eHour = Math.floor(endMinutes / 60);
      const eMin = endMinutes % 60;
      const endTimeStr = `${eHour.toString().padStart(2, '0')}:${eMin.toString().padStart(2, '0')}`;

      // Pick next unit round-robin
      const currentUnit = units[unitIndex % units.length];
      unitIndex++;

      schedule.push({
        id: crypto.randomUUID(),
        unitName: currentUnit,
        dayOfWeek,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        type: sessionType
      });

      // Advance clock by block + break
      currentMinutes += cycleDuration;
      remainingWindow -= cycleDuration;
    }
  }

  return schedule;
}
