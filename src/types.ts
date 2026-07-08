export type DailyRecord = {
  date: string // "YYYY-MM-DD" (기본 키)
  sleepHours: number
  weightKg: number
}

export type RecordStats = DailyRecord & {
  sleepDelta: number | null // 전일 대비 (직전 기록일)
  weightDelta: number | null // 전일 대비 (직전 기록일)
  weightDeltaFromStart: number | null // 첫날 대비 (몸무게만)
}
