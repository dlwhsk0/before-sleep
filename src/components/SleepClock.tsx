import { useRef } from 'react'
import { durationMinutes, formatClock, formatHM } from '../lib/time'

/**
 * 동심 이중 링 원형 다이얼로 수면 시각을 정한다.
 * - 바깥 링 = 시(0~23, 원 한 바퀴 = 24시간 → 24시간 전부 선택 가능)
 * - 안쪽 링 = 분(5분 단위)
 * - 취침(indigo)/기상(amber) 각각의 시·분 핸들 = 총 4개를 드래그/방향키로 조정.
 *
 * 값은 상위(폼)가 소유하는 controlled 컴포넌트. start/end는 자정 기준 분(0–1439).
 */

const SIZE = 260
const C = SIZE / 2
const R_HOUR = 108
const R_MIN = 66
const HOUR_HANDLE = 15
const MIN_HANDLE = 12

const START_COLOR = '#6366f1' // indigo (취침)
const END_COLOR = '#f59e0b' // amber (기상)

/** 값 비율(0~1)을 원 위 좌표로. 12시 방향(위)이 0, 시계방향. */
function polar(r: number, frac: number) {
  const rad = (frac * 360 - 90) * (Math.PI / 180)
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) }
}

type Handle = {
  key: string
  ring: 'hour' | 'min'
  value: number
  frac: number // 원 위 렌더 위치(0~1). 시 핸들은 분까지 반영해 호 끝과 정확히 맞물림.
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

  const startHour = Math.floor(start / 60)
  const startMin = start % 60
  const endHour = Math.floor(end / 60)
  const endMin = end % 60

  // 포인터 위치 → 원 중심 기준 각도 비율(0~1)
  const fracFromPointer = (clientX: number, clientY: number): number => {
    const el = svgRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    deg = ((deg % 360) + 360) % 360
    return deg / 360
  }

  const hourFromFrac = (f: number) => Math.round(f * 24) % 24
  const minFromFrac = (f: number) => (Math.round(f * 12) * 5) % 60

  const handles: Handle[] = [
    {
      key: 'startHour',
      ring: 'hour',
      value: startHour,
      frac: start / 1440, // 분까지 반영한 실제 취침 시각 위치
      color: START_COLOR,
      label: '취침 시',
      apply: (v) => onChange(v * 60 + startMin, end),
    },
    {
      key: 'endHour',
      ring: 'hour',
      value: endHour,
      frac: end / 1440, // 분까지 반영한 실제 기상 시각 위치
      color: END_COLOR,
      label: '기상 시',
      apply: (v) => onChange(start, v * 60 + endMin),
    },
    {
      key: 'startMin',
      ring: 'min',
      value: startMin,
      frac: startMin / 60,
      color: START_COLOR,
      label: '취침 분',
      apply: (v) => onChange(startHour * 60 + v, end),
    },
    {
      key: 'endMin',
      ring: 'min',
      value: endMin,
      frac: endMin / 60,
      color: END_COLOR,
      label: '기상 분',
      apply: (v) => onChange(start, endHour * 60 + v),
    },
  ]

  const onHandleMove = (h: Handle) => (e: React.PointerEvent) => {
    if (e.buttons === 0) return // 드래그 중이 아니면 무시
    const f = fracFromPointer(e.clientX, e.clientY)
    h.apply(h.ring === 'hour' ? hourFromFrac(f) : minFromFrac(f))
  }

  const onHandleKey = (h: Handle) => (e: React.KeyboardEvent) => {
    let d = 0
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') d = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') d = 1
    if (d === 0) return
    e.preventDefault()
    if (h.ring === 'hour') h.apply((h.value + d + 24) % 24)
    else h.apply((h.value + d * 5 + 60) % 60)
  }

  const dur = durationMinutes(start, end)
  const hourTicks = [0, 3, 6, 9, 12, 15, 18, 21]
  const minTicks = [0, 15, 30, 45]

  // 취침 → 기상 수면 구간 호 (바깥 시 링, 실제 시각 기준, 시계방향)
  const arcStart = polar(R_HOUR, start / 1440)
  const arcEnd = polar(R_HOUR, end / 1440)
  const largeArc = dur / 1440 > 0.5 ? 1 : 0
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${R_HOUR} ${R_HOUR} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`

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
          r={R_HOUR}
          fill="none"
          strokeWidth={2}
          className="stroke-neutral-200 dark:stroke-neutral-700"
        />
        <circle
          cx={C}
          cy={C}
          r={R_MIN}
          fill="none"
          strokeWidth={2}
          className="stroke-neutral-100 dark:stroke-neutral-800"
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
              strokeWidth={7}
              strokeLinecap="round"
            />
          </>
        )}

        {/* 시 눈금 (바깥) */}
        {hourTicks.map((h) => {
          const p = polar(R_HOUR, h / 24)
          return (
            <text
              key={`h${h}`}
              x={p.x}
              y={p.y}
              dy="0.32em"
              textAnchor="middle"
              className="fill-neutral-400 text-[9px]"
            >
              {h}
            </text>
          )
        })}

        {/* 분 눈금 (안쪽) */}
        {minTicks.map((m) => {
          const p = polar(R_MIN, m / 60)
          return (
            <text
              key={`m${m}`}
              x={p.x}
              y={p.y}
              dy="0.32em"
              textAnchor="middle"
              className="fill-neutral-300 text-[8px] dark:fill-neutral-600"
            >
              {m}
            </text>
          )
        })}

        {/* 중앙 요약 */}
        <text
          x={C}
          y={C - 4}
          textAnchor="middle"
          className="fill-neutral-900 text-[15px] font-semibold dark:fill-neutral-100"
        >
          {formatHM(dur)}
        </text>
        <text
          x={C}
          y={C + 14}
          textAnchor="middle"
          className="fill-neutral-400 text-[10px]"
        >
          {formatClock(start)} → {formatClock(end)}
        </text>

        {/* 핸들 (시 2 + 분 2) */}
        {handles.map((h) => {
          const r = h.ring === 'hour' ? R_HOUR : R_MIN
          const p = polar(r, h.frac)
          const radius = h.ring === 'hour' ? HOUR_HANDLE : MIN_HANDLE
          return (
            <circle
              key={h.key}
              cx={p.x}
              cy={p.y}
              r={radius}
              fill={h.color}
              stroke="white"
              strokeWidth={2}
              role="slider"
              tabIndex={0}
              aria-label={h.label}
              aria-valuenow={h.value}
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
