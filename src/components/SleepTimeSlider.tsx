import { useRef } from 'react'
import {
  addMinutes,
  durationMinutes,
  formatClock,
  formatHM,
} from '../lib/time'

/**
 * 야간 중심 24시간 타임라인 위에서 취침/기상 두 핸들을 드래그해 수면 시각을 정한다.
 * 축은 18:00 → 익일 12:00 (18시간 창). 값은 상위(폼)가 소유하는 controlled 컴포넌트.
 *
 * - 드래그 / 방향키로 조정, 5분 단위 스냅.
 * - 소요 시간은 durationMinutes(start, end)로 실시간 표시.
 */

const WINDOW_START = 18 * 60 // 18:00 (분)
const WINDOW_LEN = 18 * 60 // 18시간
const SNAP = 5 // 분

/** 자정 기준 분 → 축 위치(0~1). 창을 벗어나면 양 끝으로 클램프. */
function toAxis(min: number): number {
  const offset = (((min - WINDOW_START) % 1440) + 1440) % 1440
  return Math.min(Math.max(offset / WINDOW_LEN, 0), 1)
}

/** 축 위치(0~1) → 자정 기준 분 (5분 스냅). */
function fromAxis(frac: number): number {
  const clamped = Math.min(Math.max(frac, 0), 1)
  const offset = Math.round((clamped * WINDOW_LEN) / SNAP) * SNAP
  return addMinutes(WINDOW_START, offset)
}

// 눈금: 18:00부터 3시간 간격 (18,21,00,03,06,09,12시)
const TICK_HOURS = [0, 3, 6, 9, 12, 15, 18]

export function SleepTimeSlider({
  start,
  end,
  onChange,
}: {
  start: number
  end: number
  onChange: (start: number, end: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const minFromClientX = (clientX: number): number => {
    const el = trackRef.current
    if (!el) return start
    const rect = el.getBoundingClientRect()
    return fromAxis((clientX - rect.left) / rect.width)
  }

  const handleProps = (which: 'start' | 'end') => ({
    role: 'slider' as const,
    tabIndex: 0,
    'aria-label': which === 'start' ? '취침 시각' : '기상 시각',
    'aria-valuetext': formatClock(which === 'start' ? start : end),
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (e.buttons === 0) return // 드래그 중이 아니면 무시
      const t = minFromClientX(e.clientX)
      if (which === 'start') onChange(t, end)
      else onChange(start, t)
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      let delta = 0
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -SNAP
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = SNAP
      if (delta === 0) return
      e.preventDefault()
      if (which === 'start') onChange(addMinutes(start, delta), end)
      else onChange(start, addMinutes(end, delta))
    },
  })

  const startFrac = toAxis(start)
  const endFrac = toAxis(end)
  const fillLeft = Math.min(startFrac, endFrac)
  const fillWidth = Math.abs(endFrac - startFrac)
  const dur = durationMinutes(start, end)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-neutral-500">
          취침{' '}
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            {formatClock(start)}
          </span>
        </span>
        <span className="font-medium text-neutral-900 dark:text-neutral-50">
          {formatHM(dur)}
        </span>
        <span className="text-neutral-500">
          기상{' '}
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            {formatClock(end)}
          </span>
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-10 touch-none rounded-full bg-neutral-100 dark:bg-neutral-800"
      >
        {/* 수면 구간 채우기 */}
        <div
          className="absolute top-0 h-full rounded-full bg-indigo-200 dark:bg-indigo-900/60"
          style={{ left: `${fillLeft * 100}%`, width: `${fillWidth * 100}%` }}
        />
        {/* 취침 핸들 */}
        <div
          {...handleProps('start')}
          className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-indigo-500 shadow active:cursor-grabbing dark:border-neutral-900"
          style={{ left: `${startFrac * 100}%` }}
        />
        {/* 기상 핸들 */}
        <div
          {...handleProps('end')}
          className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-amber-500 shadow active:cursor-grabbing dark:border-neutral-900"
          style={{ left: `${endFrac * 100}%` }}
        />
      </div>

      {/* 눈금 라벨 */}
      <div className="relative h-4 text-xs text-neutral-400">
        {TICK_HOURS.map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2"
            style={{ left: `${(h / 18) * 100}%` }}
          >
            {(18 + h) % 24}
          </span>
        ))}
      </div>
    </div>
  )
}
