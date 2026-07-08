import { useEffect, useState } from 'react'
import type { DailyRecord } from '../types'
import { todayKey } from '../lib/date'
import { addMinutes, durationMinutes } from '../lib/time'
import { SleepClock } from './SleepClock'

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
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  const existing = records.find((r) => r.date === date)

  // 날짜가 바뀌거나 기록이 갱신되면 해당 날짜의 값을 폼에 채운다.
  useEffect(() => {
    if (existing) {
      setSleepStart(existing.sleepStart)
      setSleepEnd(existing.sleepEnd)
      setWeight(String(existing.weightKg))
    } else {
      setSleepStart(DEFAULT_START)
      setSleepEnd(DEFAULT_END)
      setWeight('')
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
      className="flex flex-col gap-5 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          기록
        </h2>
        <input
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
        />
      </div>

      {/* 수면: 드래그 슬라이더 */}
      <div className="flex flex-col gap-3">
        <span className="text-sm text-neutral-500">수면</span>
        <SleepClock
          start={sleepStart}
          end={sleepEnd}
          onChange={(s, en) => {
            setSleepStart(s)
            setSleepEnd(en)
          }}
        />

        {/* 소요 시간 직접 수정 (취침 고정, 기상 이동) */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">소요</span>
          <input
            type="number"
            min="0"
            max="23"
            value={durH}
            onChange={(e) => setDuration(Number(e.target.value), durM)}
            className="w-14 rounded-lg border border-neutral-300 px-2 py-1 text-right outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
          />
          <span className="text-neutral-500">시간</span>
          <input
            type="number"
            min="0"
            max="59"
            step="5"
            value={durM}
            onChange={(e) => setDuration(durH, Number(e.target.value))}
            className="w-14 rounded-lg border border-neutral-300 px-2 py-1 text-right outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
          />
          <span className="text-neutral-500">분</span>
        </div>
      </div>

      {/* 몸무게 */}
      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">몸무게 (kg)</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="예: 68.2"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-lg outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
        />
      </label>

      <button
        type="submit"
        disabled={!valid || saving}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 font-medium text-white transition-opacity disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {saving ? '저장 중…' : existing ? '기록 수정' : '기록 저장'}
      </button>
    </form>
  )
}
