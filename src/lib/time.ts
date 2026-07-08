/**
 * 시각을 "자정 기준 분(0–1439)"으로 다루는 순수 유틸.
 * 수면은 자정을 넘기는 경우가 많아(취침 23:30 → 기상 07:15) wrap-around 처리가 핵심.
 */

export const MINUTES_IN_DAY = 1440

/** 분 값에 delta를 더하고 하루(1440분) 안으로 감싼다. 음수 delta도 안전. */
export function addMinutes(min: number, delta: number): number {
  return (((min + delta) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
}

/**
 * 취침~기상 소요 시간(분). 자정을 넘기면 감싸서 계산한다.
 * 예: durationMinutes(1410, 435) === 465 (23:30 → 07:15 = 7시간 45분)
 */
export function durationMinutes(start: number, end: number): number {
  return (((end - start) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
}

/** 자정 기준 분 → "HH:MM". */
export function formatClock(min: number): string {
  const m = (((min % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY)
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** "HH:MM" → 자정 기준 분. */
export function parseClock(text: string): number {
  const [h, m] = text.split(':').map(Number)
  return h * 60 + m
}

/** 소요 분 → "7시간 30분" / "45분" / "8시간". */
export function formatHM(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}
