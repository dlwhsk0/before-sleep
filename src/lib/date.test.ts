import { describe, expect, it } from 'vitest'
import { addDaysToKey, enumerateDateKeys } from './date'

describe('addDaysToKey', () => {
  it('며칠 더하기/빼기', () => {
    expect(addDaysToKey('2026-07-08', 1)).toBe('2026-07-09')
    expect(addDaysToKey('2026-07-08', -6)).toBe('2026-07-02')
  })
  it('월 넘김', () => {
    expect(addDaysToKey('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDaysToKey('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('연 넘김', () => {
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('enumerateDateKeys', () => {
  it('시작~끝(포함) 매일', () => {
    expect(enumerateDateKeys('2026-07-01', '2026-07-03')).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ])
  })
  it('시작==끝이면 하루', () => {
    expect(enumerateDateKeys('2026-07-01', '2026-07-01')).toEqual(['2026-07-01'])
  })
  it('시작 > 끝이면 빈 배열', () => {
    expect(enumerateDateKeys('2026-07-05', '2026-07-01')).toEqual([])
  })
  it('월 경계를 넘어도 이어진다', () => {
    expect(enumerateDateKeys('2026-07-30', '2026-08-01')).toEqual([
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
    ])
  })
})
