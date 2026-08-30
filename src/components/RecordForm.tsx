import { useEffect, useState } from 'react'
import type { DailyRecord } from '../types'
import { todayKey } from '../lib/date'
import { addMinutes, durationMinutes, formatClock, formatHM } from '../lib/time'
import { END_COLOR, SleepClock, START_COLOR } from './SleepClock'

const DEFAULT_START = 23 * 60 // 23:00
const DEFAULT_END = 7 * 60 // 07:00

/**
 * 기록 입력 폼. 날짜를 골라 해당 날짜를 기록/수정한다.
 * 선택한 날짜에 기존 기록이 있으면 그 값을 채워 수정 모드로 동작한다.
 */
export function RecordForm({
  records,
  onSave,
}: {
  records: DailyRecord[]
  onSave: (record: DailyRecord) => Promise<void>
}) {
  const [date, setDate] = useState(todayKey())
  const [sleepStart, setSleepStart] = useState(DEFAULT_START)
  const [sleepEnd, setSleepEnd] = useState(DEFAULT_END)
  const [weight, setWeight] = useState('0.0')
  const [saving, setSaving] = useState(false)

  const existing = records.find((r) => r.date === date)

  // 날짜가 바뀌거나 기록이 갱신되면 해당 날짜의 값을 폼에 채운다.
  useEffect(() => {
    if (existing) {
      setSleepStart(existing.sleepStart)
      setSleepEnd(existing.sleepEnd)
      setWeight(existing.weightKg.toFixed(1))
    } else {
      setSleepStart(DEFAULT_START)
      setSleepEnd(DEFAULT_END)
      // 몸무게는 초기화하지 않고 현재 입력값 유지 (날짜 이동 시 재입력 방지).
      // 매일 몸무게는 크게 안 바뀌므로 직전 값을 시작점으로 두는 게 편하다.
    }
    // existing은 date/records에서 파생되므로 그 둘만 의존성으로 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, records])

  const dur = durationMinutes(sleepStart, sleepEnd)
  const durH = Math.floor(dur / 60)
  const durM = dur % 60

  // 소요 시간 직접 수정: 취침 고정, 기상 시각이 이동.
  const setDuration = (hours: number, minutes: number) => {
    const total = hours * 60 + minutes
    setSleepEnd(addMinutes(sleepStart, total))
  }

  // 몸무게를 0.1kg 단위로 증감 (빈 값은 0으로 간주, 음수 방지). 항상 소수점 첫째자리.
  const stepWeight = (delta: number) => {
    const base = weight === '' || Number.isNaN(Number(weight)) ? 0 : Number(weight)
    const next = Math.max(0, base + delta)
    setWeight(next.toFixed(1))
  }

  // 입력 칸을 벗어날 때 소수점 첫째자리로 정규화 (타이핑 중에는 건드리지 않음)
  const normalizeWeight = () => {
    if (weight === '') return
    const n = Number(weight)
    if (Number.isNaN(n)) return
    setWeight(Math.max(0, n).toFixed(1))
  }

  const weightNum = Number(weight)
  const valid = weight !== '' && !Number.isNaN(weightNum) && weightNum > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    try {
      await onSave({ date, sleepStart, sleepEnd, weightKg: weightNum })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-line p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">
          기록
        </h2>
        <input
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-line px-2 py-1 text-sm outline-none focus:border-ink"
        />
      </div>

      {/* 수면: 왼쪽 원형 다이얼 + 오른쪽 세부/소요 */}
      <div className="flex flex-col gap-3">
        <span className="text-sm text-dim">수면</span>
        <div className="flex items-center gap-4">
          <SleepClock
            start={sleepStart}
            end={sleepEnd}
            onChange={(s, en) => {
              setSleepStart(s)
              setSleepEnd(en)
            }}
          />

          {/* 오른쪽: 취침/기상 세부 + 총 수면시간 + 소요 편집 */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-dim">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: START_COLOR }}
                />
                취침
                <span className="font-medium text-ink">
                  {formatClock(sleepStart)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-dim">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: END_COLOR }}
                />
                기상
                <span className="font-medium text-ink">
                  {formatClock(sleepEnd)}
                </span>
              </span>
            </div>

            {/* 소요 총 수면시간 + 직접 편집 (취침 고정, 기상 이동) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-dim">소요</span>
                <span className="text-lg font-semibold text-ink">
                  {formatHM(dur)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={durH}
                  onChange={(e) => setDuration(Number(e.target.value), durM)}
                  className="w-12 rounded-lg border border-line px-2 py-1 text-right outline-none focus:border-ink"
                />
                <span className="text-dim">시간</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={durM}
                  onChange={(e) => setDuration(durH, Number(e.target.value))}
                  className="w-12 rounded-lg border border-line px-2 py-1 text-right outline-none focus:border-ink"
                />
                <span className="text-dim">분</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 몸무게 (중앙 정렬 + 양옆 −/+ 스테퍼) */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-dim">몸무게 (kg)</span>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="0.1kg 감소"
            onClick={() => stepWeight(-0.1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-2xl leading-none text-ink active:bg-surface-2"
          >
            −
          </button>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={normalizeWeight}
            className="w-28 rounded-lg border border-line px-3 py-2 text-center text-lg outline-none focus:border-ink [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="0.1kg 증가"
            onClick={() => stepWeight(0.1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-2xl leading-none text-ink active:bg-surface-2"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid || saving}
        className="rounded-lg bg-accent px-4 py-2.5 font-medium text-bg transition-opacity disabled:opacity-40"
      >
        {saving ? '저장 중…' : existing ? '기록 수정' : '기록 저장'}
      </button>
    </form>
  )
}
