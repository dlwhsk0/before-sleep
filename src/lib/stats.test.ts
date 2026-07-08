import { describe, expect, it } from 'vitest'
import { computeStats, round1 } from './stats'
import type { DailyRecord } from '../types'

const rec = (date: string, sleepHours: number, weightKg: number): DailyRecord => ({
  date,
  sleepHours,
  weightKg,
})

describe('round1', () => {
  it('부동소수 오차를 정리한다', () => {
    expect(round1(7.5 - 7.2)).toBe(0.3)
    expect(round1(0.1 + 0.2)).toBe(0.3)
  })
})

describe('computeStats', () => {
  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(computeStats([])).toEqual([])
  })

  it('기록이 1개면 모든 증감이 null이다', () => {
    const [row] = computeStats([rec('2026-07-01', 7, 68)])
    expect(row.sleepDelta).toBeNull()
    expect(row.weightDelta).toBeNull()
    expect(row.weightDeltaFromStart).toBeNull()
  })

  it('기록이 2개면 전일 대비 증감을 계산한다', () => {
    const stats = computeStats([
      rec('2026-07-01', 7.0, 68.0),
      rec('2026-07-02', 7.5, 67.6),
    ])
    expect(stats[1].sleepDelta).toBe(0.5)
    expect(stats[1].weightDelta).toBe(-0.4)
    expect(stats[1].weightDeltaFromStart).toBe(-0.4)
  })

  it('중간에 빠진 날이 있으면 직전 기록일 기준으로 비교한다', () => {
    // 1일, 3일, 4일 기록 (2일은 빠짐)
    const stats = computeStats([
      rec('2026-07-01', 7.0, 68.0),
      rec('2026-07-03', 8.0, 67.0),
      rec('2026-07-04', 6.5, 67.5),
    ])
    // 3일은 달력상 전날(2일)이 아니라 직전 기록일(1일) 기준
    expect(stats[1].weightDelta).toBe(-1.0)
    expect(stats[1].sleepDelta).toBe(1.0)
    // 4일은 직전 기록일(3일) 기준
    expect(stats[2].weightDelta).toBe(0.5)
    // 첫날 대비는 항상 첫 기록(1일) 기준
    expect(stats[2].weightDeltaFromStart).toBe(-0.5)
  })

  it('반올림이 소수 1자리로 정리된다', () => {
    const stats = computeStats([
      rec('2026-07-01', 7.2, 68.0),
      rec('2026-07-02', 7.5, 68.0),
    ])
    expect(stats[1].sleepDelta).toBe(0.3)
  })

  it('입력이 정렬되지 않아도 내부에서 정렬해 올바르게 계산한다', () => {
    const stats = computeStats([
      rec('2026-07-03', 8.0, 67.0),
      rec('2026-07-01', 7.0, 68.0),
      rec('2026-07-02', 7.5, 67.6),
    ])
    expect(stats.map((s) => s.date)).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ])
    expect(stats[0].sleepDelta).toBeNull()
    expect(stats[1].weightDelta).toBe(-0.4)
  })
})
