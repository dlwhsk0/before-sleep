import { describe, expect, it } from 'vitest'
import { minutesToHours, shortDateLabel, toChartRows } from './chartData'
import type { RecordStats } from '../types'

// RecordStats를 간단히 만드는 헬퍼 (차트 변환에 필요한 필드 위주)
const stat = (
  date: string,
  sleepMinutes: number,
  weightKg: number,
  weightDeltaFromStart: number | null,
): RecordStats => ({
  date,
  sleepStart: 0,
  sleepEnd: sleepMinutes,
  weightKg,
  sleepMinutes,
  sleepDeltaMinutes: null,
  weightDelta: null,
  weightDeltaFromStart,
})

describe('minutesToHours', () => {
  it('분을 소수 시간으로 변환한다', () => {
    expect(minutesToHours(465)).toBe(7.75)
    expect(minutesToHours(480)).toBe(8)
    expect(minutesToHours(450)).toBe(7.5)
    expect(minutesToHours(0)).toBe(0)
  })
  it('소수 자리수 옵션을 따른다', () => {
    expect(minutesToHours(465, 1)).toBe(7.8)
  })
})

describe('shortDateLabel', () => {
  it('MM/DD로 자른다 (0 패딩 유지)', () => {
    expect(shortDateLabel('2026-07-08')).toBe('07/08')
    expect(shortDateLabel('2026-01-05')).toBe('01/05')
    expect(shortDateLabel('2026-12-31')).toBe('12/31')
  })
})

describe('toChartRows', () => {
  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(toChartRows([])).toEqual([])
  })

  it('기록 1개여도 x축은 7일(일주일)로 채운다', () => {
    const rows = toChartRows([stat('2026-07-08', 480, 68, null)])
    expect(rows).toHaveLength(7)
    expect(rows[0].date).toBe('2026-07-02') // 07-08 기준 6일 전부터
    const last = rows[rows.length - 1]
    expect(last.date).toBe('2026-07-08')
    expect(last.weightKg).toBe(68)
    expect(last.sleepHours).toBe(8)
    expect(last.weightFromStart).toBeNull()
    // 기록 없는 날은 null
    expect(rows[0].weightKg).toBeNull()
    expect(rows[0].sleepHours).toBeNull()
  })

  it('기록이 적어도 최소 7일 폭을 보장한다', () => {
    const rows = toChartRows([
      stat('2026-07-08', 480, 68, null),
      stat('2026-07-09', 470, 67.8, -0.2),
      stat('2026-07-10', 465, 67.6, -0.4),
    ])
    expect(rows).toHaveLength(7)
    expect(rows[0].date).toBe('2026-07-04')
    expect(rows[rows.length - 1].date).toBe('2026-07-10')
  })

  it('빠진 날은 null로 채운다', () => {
    const rows = toChartRows([
      stat('2026-07-01', 480, 68.0, null),
      stat('2026-07-03', 465, 67.6, -0.4), // 07-02 빠짐
    ])
    const gap = rows.find((r) => r.date === '2026-07-02')
    expect(gap?.weightKg).toBeNull()
    const has = rows.find((r) => r.date === '2026-07-03')
    expect(has?.weightKg).toBe(67.6)
    expect(has?.sleepHours).toBe(7.75)
    expect(has?.weightFromStart).toBe(-0.4)
  })

  it('7일 넘게 연속이면 전체 일수만큼(오름차순)', () => {
    const stats = Array.from({ length: 9 }, (_, i) =>
      stat(`2026-07-0${i + 1}`, 480, 68, i === 0 ? null : 0),
    ) // 2026-07-01 .. 2026-07-09
    const rows = toChartRows(stats)
    expect(rows).toHaveLength(9)
    expect(rows.every((r) => r.weightKg !== null)).toBe(true)
    expect(rows.map((r) => r.date)).toEqual(stats.map((s) => s.date))
  })
})
