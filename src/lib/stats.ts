import type { DailyRecord, RecordStats } from '../types'
import { durationMinutes } from './time'

/**
 * 소수 첫째 자리로 반올림한다.
 * 부동소수 오차(예: 67.6 - 68.0 = -0.3999999...)를 정리하는 용도.
 */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** 수면이 온전히 기록된 레코드인지. */
function hasSleep(r: DailyRecord): r is DailyRecord & { sleepStart: number; sleepEnd: number } {
  return r.sleepStart !== undefined && r.sleepEnd !== undefined
}

/**
 * 기록 목록으로부터 통계(전일 대비 / 첫날 대비 증감)를 계산한다.
 *
 * 순수 함수 — IndexedDB나 UI에 의존하지 않으므로 단독으로 테스트 가능하다.
 * 입력 순서와 무관하도록 내부에서 날짜 오름차순으로 정렬한다.
 *
 * 규칙:
 * - 전일 대비는 달력상 전날이 아니라 **직전에 그 값이 기록된 날**과 비교한다.
 *   수면과 체중은 서로 다른 날 비어 있을 수 있으므로 각각 따로 추적한다.
 * - 체중 첫날 대비 = 체중이 기록된 가장 오래된 날 기준
 * - 비교 대상이 없으면(첫 기록) 증감은 null
 */
export function computeStats(records: DailyRecord[]): RecordStats[] {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))

  const firstWeight = sorted.find((r) => r.weightKg !== undefined)?.weightKg

  let prevSleepMinutes: number | null = null
  let prevWeight: number | null = null

  return sorted.map((record) => {
    const sleepMinutes = hasSleep(record)
      ? durationMinutes(record.sleepStart, record.sleepEnd)
      : null
    const weight = record.weightKg

    const sleepDeltaMinutes =
      sleepMinutes !== null && prevSleepMinutes !== null
        ? sleepMinutes - prevSleepMinutes
        : null
    const weightDelta =
      weight !== undefined && prevWeight !== null ? round1(weight - prevWeight) : null
    const weightDeltaFromStart =
      weight !== undefined && firstWeight !== undefined && weight !== firstWeight
        ? round1(weight - firstWeight)
        : null

    if (sleepMinutes !== null) prevSleepMinutes = sleepMinutes
    if (weight !== undefined) prevWeight = weight

    return {
      ...record,
      sleepMinutes,
      sleepDeltaMinutes,
      weightDelta,
      weightDeltaFromStart,
    }
  })
}
