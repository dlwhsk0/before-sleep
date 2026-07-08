import type { DailyRecord, RecordStats } from '../types'
import { durationMinutes } from './time'

/**
 * 소수 첫째 자리로 반올림한다.
 * 부동소수 오차(예: 67.6 - 68.0 = -0.3999999...)를 정리하는 용도.
 */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * 기록 목록으로부터 통계(전일 대비 / 첫날 대비 증감)를 계산한다.
 *
 * 순수 함수 — IndexedDB나 UI에 의존하지 않으므로 단독으로 테스트 가능하다.
 * 입력 순서와 무관하도록 내부에서 날짜 오름차순으로 정렬한다.
 *
 * 규칙:
 * - 수면 소요 = 취침~기상(자정 넘김 포함), 전일 대비는 "직전 기록일"의 소요와 비교(분)
 * - 몸무게 전일 대비 = 직전 기록일 기준
 * - 몸무게 첫날 대비 = 가장 오래된 기록 기준
 * - 비교 대상이 없는 첫 기록은 모든 증감이 null
 */
export function computeStats(records: DailyRecord[]): RecordStats[] {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]

  return sorted.map((record, i) => {
    const prev = i > 0 ? sorted[i - 1] : null
    const sleepMinutes = durationMinutes(record.sleepStart, record.sleepEnd)
    return {
      ...record,
      sleepMinutes,
      sleepDeltaMinutes: prev
        ? sleepMinutes - durationMinutes(prev.sleepStart, prev.sleepEnd)
        : null,
      weightDelta: prev ? round1(record.weightKg - prev.weightKg) : null,
      weightDeltaFromStart: prev ? round1(record.weightKg - first.weightKg) : null,
    }
  })
}
