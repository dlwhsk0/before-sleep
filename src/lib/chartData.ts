import type { RecordStats } from '../types'
import { addDaysToKey, enumerateDateKeys } from './date'

/** 차트 기본 표시 일수(최근 일주일). x축은 항상 최소 이만큼을 보여준다. */
export const WINDOW_DAYS = 7

/**
 * 차트에 넣을 한 줄(한 x축 지점 = 하루). Recharts는 배열 하나에서 각 시리즈가 키로 값을 읽는다.
 * 기록이 없는 날은 값이 null (점은 안 찍히고, 선은 connectNulls로 건너뛰어 이어진다).
 */
export type ChartRow = {
  date: string // "YYYY-MM-DD"
  label: string // "07/08"
  weightKg: number | null
  sleepHours: number | null // sleepMinutes를 소수 시간으로 (465 → 7.75)
  weightFromStart: number | null // 첫날 대비 몸무게 증감 (첫 기록/기록 없는 날은 null)
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
 *
 * x축이 항상 "달력 일" 기준이 되도록 마지막 기록일까지 매일을 채운다.
 * 축 범위는 최소 WINDOW_DAYS(7일)을 보장한다(기록이 적어도 일주일 폭 유지).
 * 기록이 없는 날은 값 null → 점은 없지만 선은 connectNulls로 이어진다(TrendChart).
 */
export function toChartRows(stats: RecordStats[]): ChartRow[] {
  if (stats.length === 0) return []

  const byDate = new Map(stats.map((s) => [s.date, s]))
  const end = stats[stats.length - 1].date
  const firstRecord = stats[0].date
  const weekStart = addDaysToKey(end, -(WINDOW_DAYS - 1))
  // 최소 일주일 폭 보장: 기록 시작이 더 과거면 그때부터, 아니면 일주일 전부터.
  const start = firstRecord < weekStart ? firstRecord : weekStart

  return enumerateDateKeys(start, end).map((date) => {
    const s = byDate.get(date)
    return {
      date,
      label: shortDateLabel(date),
      weightKg: s?.weightKg ?? null,
      sleepHours: s && s.sleepMinutes !== null ? minutesToHours(s.sleepMinutes) : null,
      weightFromStart: s?.weightDeltaFromStart ?? null,
    }
  })
}
