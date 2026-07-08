import { useRef } from 'react'
import { durationMinutes, formatClock, formatHM } from '../lib/time'

/**
 * 단일 24시간 원형 다이얼로 수면 시각을 정한다.
 * - 원 한 바퀴 = 24시간 (12시 방향=0시, 시계방향) → 24시간 전부 선택 가능.
 * - 취침(indigo)/기상(amber) 두 핸들을 드래그/방향키로 조정. 5분 단위 스냅.
 * - 두 핸들 사이를 호로 이어 수면 구간을 표시.
 *
 * 값은 상위(폼)가 소유하는 controlled 컴포넌트. start/end는 자정 기준 분(0–1439).
 */

const SIZE = 260
const C = SIZE / 2
const R = 100
const HANDLE = 15
const SNAP = 5 // 분

const START_COLOR = '#6366f1' // indigo (취침)
const END_COLOR = '#f59e0b' // amber (기상)

/** 값 비율(0~1)을 원 위 좌표로. 12시 방향(위)이 0, 시계방향. */
function polar(r: number, frac: number) {
  const rad = (frac * 360 - 90) * (Math.PI / 180)
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) }
}

type Handle = {
  key: string
  value: number // 자정 기준 분
  color: string
  label: string
  apply: (value: number) => void
}

export function SleepClock({
  start,
  end,
  onChange,
}: {
  start: number
  end: number
  onChange: (start: number, end: number) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)

  // 포인터 위치 → 자정 기준 분 (5분 스냅)
  const timeFromPointer = (clientX: number, clientY: number): number => {
    const el = svgRef.current
    if (!el) return start
    const rect = el.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    deg = ((deg % 360) + 360) % 360
    return (Math.round((deg / 360) * (1440 / SNAP)) * SNAP) % 1440
  }

  const handles: Handle[] = [
    {
      key: 'start',
      value: start,
      color: START_COLOR,
      label: '취침 시각',
      apply: (v) => onChange(v, end),
    },
    {
      key: 'end',
      value: end,
      color: END_COLOR,
      label: '기상 시각',
      apply: (v) => onChange(start, v),
    },
  ]

  const onHandleMove = (h: Handle) => (e: React.PointerEvent) => {
    if (e.buttons === 0) return // 드래그 중이 아니면 무시
    h.apply(timeFromPointer(e.clientX, e.clientY))
  }

  const onHandleKey = (h: Handle) => (e: React.KeyboardEvent) => {
    let d = 0
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') d = -SNAP
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') d = SNAP
    if (d === 0) return
    e.preventDefault()
    h.apply((h.value + d + 1440) % 1440)
  }

  const dur = durationMinutes(start, end)
  const hourTicks = [0, 3, 6, 9, 12, 15, 18, 21]

  // 취침 → 기상 수면 구간 호 (실제 시각 기준, 시계방향)
  const arcStart = polar(R, start / 1440)
  const arcEnd = polar(R, end / 1440)
  const largeArc = dur / 1440 > 0.5 ? 1 : 0
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[260px] touch-none select-none"
      >
        {/* 링 가이드 */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          strokeWidth={2}
          className="stroke-neutral-200 dark:stroke-neutral-700"
        />

        {/* 취침 → 기상 수면 구간 호 (취침색 → 기상색 그라데이션) */}
        {dur > 0 && (
          <>
            <defs>
              <linearGradient
                id="sleepArc"
                gradientUnits="userSpaceOnUse"
                x1={arcStart.x}
                y1={arcStart.y}
                x2={arcEnd.x}
                y2={arcEnd.y}
              >
                <stop offset="0%" stopColor={START_COLOR} />
                <stop offset="100%" stopColor={END_COLOR} />
              </linearGradient>
            </defs>
            <path
              d={arcPath}
              fill="none"
              stroke="url(#sleepArc)"
              strokeWidth={8}
              strokeLinecap="round"
            />
          </>
        )}

        {/* 시 눈금 */}
        {hourTicks.map((h) => {
          const p = polar(R - 20, h / 24)
          return (
            <text
              key={h}
              x={p.x}
              y={p.y}
              dy="0.32em"
              textAnchor="middle"
              className="fill-neutral-400 text-[10px]"
            >
              {h}
            </text>
          )
        })}

        {/* 중앙 요약 */}
        <text
          x={C}
          y={C - 4}
          textAnchor="middle"
          className="fill-neutral-900 text-[16px] font-semibold dark:fill-neutral-100"
        >
          {formatHM(dur)}
        </text>
        <text
          x={C}
          y={C + 15}
          textAnchor="middle"
          className="fill-neutral-400 text-[11px]"
        >
          {formatClock(start)} → {formatClock(end)}
        </text>

        {/* 핸들 (취침 / 기상) */}
        {handles.map((h) => {
          const p = polar(R, h.value / 1440)
          return (
            <circle
              key={h.key}
              cx={p.x}
              cy={p.y}
              r={HANDLE}
              fill={h.color}
              stroke="white"
              strokeWidth={2}
              role="slider"
              tabIndex={0}
              aria-label={h.label}
              aria-valuetext={formatClock(h.value)}
              className="cursor-grab touch-none outline-none focus:stroke-neutral-900 active:cursor-grabbing dark:focus:stroke-neutral-100"
              onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
              onPointerMove={onHandleMove(h)}
              onKeyDown={onHandleKey(h)}
            />
          )
        })}
      </svg>

      {/* 범례 */}
      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-neutral-500">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: START_COLOR }}
          />
          취침{' '}
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            {formatClock(start)}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-neutral-500">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: END_COLOR }}
          />
          기상{' '}
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            {formatClock(end)}
          </span>
        </span>
      </div>
    </div>
  )
}
