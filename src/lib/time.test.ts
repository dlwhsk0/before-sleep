import { describe, expect, it } from 'vitest'
import {
  addMinutes,
  durationMinutes,
  formatClock,
  formatHM,
  parseClock,
} from './time'

describe('durationMinutes', () => {
  it('같은 날 안의 소요 시간', () => {
    expect(durationMinutes(60, 120)).toBe(60) // 01:00 → 02:00
  })

  it('자정을 넘기는 수면을 감싸서 계산한다', () => {
    // 23:30(1410) → 07:15(435) = 7시간 45분
    expect(durationMinutes(1410, 435)).toBe(465)
  })

  it('취침과 기상이 같으면 0', () => {
    expect(durationMinutes(1380, 1380)).toBe(0)
  })
})

describe('addMinutes', () => {
  it('하루 안으로 감싼다 (양수)', () => {
    expect(addMinutes(1380, 120)).toBe(60) // 23:00 + 2h → 01:00
  })
  it('음수도 안전하게 감싼다', () => {
    expect(addMinutes(30, -60)).toBe(1410) // 00:30 - 1h → 23:30
  })
})

describe('formatClock / parseClock', () => {
  it('분 → HH:MM', () => {
    expect(formatClock(1410)).toBe('23:30')
    expect(formatClock(435)).toBe('07:15')
    expect(formatClock(0)).toBe('00:00')
  })
  it('HH:MM → 분', () => {
    expect(parseClock('23:30')).toBe(1410)
    expect(parseClock('07:15')).toBe(435)
  })
})

describe('formatHM', () => {
  it('시간과 분을 사람이 읽는 형식으로', () => {
    expect(formatHM(465)).toBe('7시간 45분')
    expect(formatHM(480)).toBe('8시간')
    expect(formatHM(45)).toBe('45분')
  })
})
