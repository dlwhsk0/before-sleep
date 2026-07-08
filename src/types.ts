export type DailyRecord = {
  date: string // "YYYY-MM-DD" (기본 키)
  sleepStart: number // 취침 시각, 자정 기준 분 (0–1439). 예: 23:30 → 1410
  sleepEnd: number // 기상 시각, 자정 기준 분 (0–1439). 예: 07:15 → 435
  weightKg: number
}

export type RecordStats = DailyRecord & {
  sleepMinutes: number // 파생 소요 시간(분) = durationMinutes(start, end)
  sleepDeltaMinutes: number | null // 전일 대비 수면 소요 증감(분)
  weightDelta: number | null // 전일 대비 몸무게 증감
  weightDeltaFromStart: number | null // 첫날 대비 몸무게 증감
}
