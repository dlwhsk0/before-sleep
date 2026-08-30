import { describe, expect, it } from 'vitest'
import { DIM_END, DIM_PEAK, DIM_START, MAX_DIM, minutesOfDay, nightDimOpacity } from './nightDim'

describe('nightDimOpacity', () => {
  it('낮에는 어둡게 하지 않는다', () => {
    expect(nightDimOpacity(DIM_END)).toBe(0) // 06:00
    expect(nightDimOpacity(12 * 60)).toBe(0) // 정오
    expect(nightDimOpacity(20 * 60 + 59)).toBe(0) // 20:59
  })

  it('21시에 0에서 시작한다', () => {
    expect(nightDimOpacity(DIM_START)).toBe(0)
  })

  it('자정을 넘겨 03시에 최대치에 닿는다', () => {
    expect(nightDimOpacity(DIM_PEAK)).toBe(MAX_DIM)
  })

  it('21시와 03시 사이에서 단조 증가한다', () => {
    const samples = [21 * 60, 22 * 60, 23 * 60, 0, 60, 120, 180]
    const values = samples.map(nightDimOpacity)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('자정은 중간쯤이다 (21시부터 3시간 / 6시간)', () => {
    expect(nightDimOpacity(0)).toBeCloseTo(MAX_DIM / 2, 4)
  })

  it('03시와 06시 사이에는 최대치를 유지한다', () => {
    expect(nightDimOpacity(4 * 60)).toBe(MAX_DIM)
    expect(nightDimOpacity(5 * 60 + 59)).toBe(MAX_DIM)
  })

  it('가독성 상한을 넘지 않는다', () => {
    for (let m = 0; m < 1440; m++) {
      expect(nightDimOpacity(m)).toBeLessThanOrEqual(MAX_DIM)
      expect(nightDimOpacity(m)).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('minutesOfDay', () => {
  it('Date를 자정 기준 분으로 바꾼다', () => {
    expect(minutesOfDay(new Date(2026, 7, 31, 23, 30))).toBe(23 * 60 + 30)
    expect(minutesOfDay(new Date(2026, 7, 31, 0, 0))).toBe(0)
  })
})
