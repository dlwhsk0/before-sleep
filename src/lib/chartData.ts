import type { RecordStats } from '../types'

/**
 * 차트에 넣을 한 줄(한 x축 지점). Recharts는 배열 하나에서 각 시리즈가 키로 값을 읽는다.
 * date는 식별/툴팁용, label은 축에 보이는 짧은 텍스트.
 */
export type ChartRow = {
  date: string // "YYYY-MM-DD"
  label: string // "07/08"
  weightKg: number
  sleepHours: number // sleepMinutes를 소수 시간으로 (465 → 7.75)
  weightFromStart: number | null // 첫날 대비 몸무게 증감 (첫 기록은 null)
}

/** 수면 분 → 소수 시간. 465 → 7.75 (기본 소수 2자리). */
export function minutesToHours(min: number, decimals = 2): number {
  const f = 10 ** decimals
  return Math.round((min / 60) * f) / f
}

/**
 * "2026-07-08" → "07/08". 타임존 변환 없이 문자열만 다룬다.
 * (new Date()/toISOString()은 UTC 변환으로 날짜가 밀릴 수 있어 쓰지 않는다.)
 */
export function shortDateLabel(dateKey: string): string {
  const [, month, day] = dateKey.split('-')
  return `${month}/${day}`
}

/**
 * computeStats 결과(오름차순)를 차트용 행 배열로 변환한다. 순수 함수.
 * 정렬을 바꾸지 않는다(왼→오 = 과거→최근).
 */
export function toChartRows(stats: RecordStats[]): ChartRow[] {
  return stats.map((s) => ({
    date: s.date,
    label: shortDateLabel(s.date),
    weightKg: s.weightKg,
    sleepHours: minutesToHours(s.sleepMinutes),
    weightFromStart: s.weightDeltaFromStart,
  }))
}
