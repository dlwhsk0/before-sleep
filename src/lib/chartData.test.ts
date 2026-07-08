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

  it('기록 1개 → 첫날 대비는 null', () => {
    const [row] = toChartRows([stat('2026-07-01', 480, 68, null)])
    expect(row.sleepHours).toBe(8)
    expect(row.weightFromStart).toBeNull()
    expect(row.label).toBe('07/01')
  })

  it('여러 기록 → 입력 순서(오름차순) 유지, 값 통과', () => {
    const rows = toChartRows([
      stat('2026-07-01', 480, 68.0, null),
      stat('2026-07-02', 465, 67.6, -0.4),
    ])
    expect(rows.map((r) => r.date)).toEqual(['2026-07-01', '2026-07-02'])
    expect(rows[1].sleepHours).toBe(7.75)
    expect(rows[1].weightFromStart).toBe(-0.4)
  })
})
