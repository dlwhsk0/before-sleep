/**
 * 밤이 깊을수록 화면을 스스로 어둡게 만드는 값.
 *
 * 이 앱의 목적은 화면을 오래 보게 하는 게 아니라 폰을 내려놓게 하는 것이다.
 * 그래서 늦은 시각일수록 인터페이스가 물러난다: 전체를 덮는 검은 오버레이의
 * 불투명도를 시각에 따라 올린다.
 *
 * 21시에 0에서 시작해 새벽 3시에 최대치에 닿고, 아침 6시에 다시 0으로 돌아온다.
 * 최대치는 본문 대비가 WCAG AA를 한참 웃도는 선(0.12)에서 멈춘다 —
 * 어둡게 하려다 못 읽게 만들면 안 되므로.
 */

import { MINUTES_IN_DAY, durationMinutes } from './time'

export { minutesOfDay } from './time'

/** 어두워지기 시작하는 시각 (21:00). */
export const DIM_START = 21 * 60
/** 최대치에 닿는 시각 (03:00). */
export const DIM_PEAK = 3 * 60
/** 다시 밝아지는 시각 (06:00). */
export const DIM_END = 6 * 60
/** 오버레이 불투명도 상한. 이 이상은 가독성을 해친다. */
export const MAX_DIM = 0.12

const RAMP = durationMinutes(DIM_START, DIM_PEAK) // 360분

/**
 * 자정 기준 분(0–1439) → 오버레이 불투명도(0 ~ MAX_DIM).
 * 06:00–21:00은 0, 21:00→03:00은 선형 증가, 03:00–06:00은 최대 유지.
 */
export function nightDimOpacity(minutesOfDay: number): number {
  const m = ((minutesOfDay % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY

  // 낮: 어둡게 하지 않는다
  if (m >= DIM_END && m < DIM_START) return 0

  const elapsed = durationMinutes(DIM_START, m)
  if (elapsed >= RAMP) return MAX_DIM
  return Number(((elapsed / RAMP) * MAX_DIM).toFixed(4))
}

