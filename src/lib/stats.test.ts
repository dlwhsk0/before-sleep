import { describe, expect, it } from 'vitest'
import { computeStats, round1 } from './stats'
import type { DailyRecord } from '../types'

// 취침/기상을 "HH:MM" 대신 분으로 직접 지정하는 헬퍼
const rec = (
  date: string,
  sleepStart: number,
  sleepEnd: number,
  weightKg: number,
): DailyRecord => ({ date, sleepStart, sleepEnd, weightKg })

describe('round1', () => {
  it('부동소수 오차를 정리한다', () => {
    expect(round1(67.6 - 68.0)).toBe(-0.4)
    expect(round1(0.1 + 0.2)).toBe(0.3)
  })
})

describe('computeStats', () => {
  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(computeStats([])).toEqual([])
  })

  it('기록이 1개면 모든 증감이 null이다', () => {
    // 23:00(1380) → 07:00(420) = 8시간
    const [row] = computeStats([rec('2026-07-01', 1380, 420, 68)])
    expect(row.sleepMinutes).toBe(480)
    expect(row.sleepDeltaMinutes).toBeNull()
    expect(row.weightDelta).toBeNull()
    expect(row.weightDeltaFromStart).toBeNull()
  })

  it('기록이 2개면 전일 대비 증감을 계산한다 (수면은 분)', () => {
    const stats = computeStats([
      rec('2026-07-01', 1380, 420, 68.0), // 8시간
      rec('2026-07-02', 1410, 435, 67.6), // 23:30 → 07:15 = 7시간 45분 (465분)
    ])
    expect(stats[1].sleepMinutes).toBe(465)
    expect(stats[1].sleepDeltaMinutes).toBe(-15) // 465 - 480
    expect(stats[1].weightDelta).toBe(-0.4)
    expect(stats[1].weightDeltaFromStart).toBe(-0.4)
  })

  it('중간에 빠진 날이 있으면 직전 기록일 기준으로 비교한다', () => {
    // 1일, 3일, 4일 기록 (2일은 빠짐)
    const stats = computeStats([
      rec('2026-07-01', 1380, 420, 68.0), // 8시간
      rec('2026-07-03', 1380, 480, 67.0), // 23:00 → 08:00 = 9시간 (540분)
      rec('2026-07-04', 1440 - 60, 360, 67.5), // 23:00 → 06:00 = 7시간 (420분)
    ])
    // 3일은 직전 기록일(1일) 기준: 540 - 480 = +60분
    expect(stats[1].sleepDeltaMinutes).toBe(60)
    expect(stats[1].weightDelta).toBe(-1.0)
    // 4일은 직전 기록일(3일) 기준: 420 - 540 = -120분
    expect(stats[2].sleepDeltaMinutes).toBe(-120)
    expect(stats[2].weightDelta).toBe(0.5)
    // 첫날 대비는 항상 첫 기록(1일) 기준
    expect(stats[2].weightDeltaFromStart).toBe(-0.5)
  })

  it('입력이 정렬되지 않아도 내부에서 정렬해 올바르게 계산한다', () => {
    const stats = computeStats([
      rec('2026-07-03', 1380, 480, 67.0),
      rec('2026-07-01', 1380, 420, 68.0),
      rec('2026-07-02', 1410, 435, 67.6),
    ])
    expect(stats.map((s) => s.date)).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ])
    expect(stats[0].sleepDeltaMinutes).toBeNull()
    expect(stats[1].weightDelta).toBe(-0.4)
  })
})
