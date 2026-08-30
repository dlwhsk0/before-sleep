import { useState } from 'react'
import { todayKey } from '../lib/date'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** "YYYY-MM-DD" → { y, m } (m은 1–12) */
function parseYm(dateKey: string) {
  const [y, m] = dateKey.split('-').map(Number)
  return { y, m }
}

/**
 * 월 단위 기록 캘린더. 어떤 날에 기록했는지 달력 모양으로 표시하고,
 * 그 달에 며칠을 기록했는지 카운트해준다. ‹ › 로 달을 넘긴다.
 * 기본으로 가장 최근 기록이 있는 달을 보여준다.
 */
export function MonthCalendar({ recordedDates }: { recordedDates: string[] }) {
  const recorded = new Set(recordedDates)
  const today = todayKey()
  const todayYm = parseYm(today)

  // 오름차순 배열이므로 마지막이 가장 최근 기록. 없으면 이번 달.
  const latest = recordedDates.length
    ? recordedDates[recordedDates.length - 1]
    : today
  const [{ y, m }, setYm] = useState(() => parseYm(latest))

  const firstWeekday = new Date(y, m - 1, 1).getDay() // 0=일
  const daysInMonth = new Date(y, m, 0).getDate()
  const monthPrefix = `${y}-${String(m).padStart(2, '0')}-`
  const count = recordedDates.filter((d) => d.startsWith(monthPrefix)).length

  // 앞쪽 빈칸 + 날짜 셀
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prev = () =>
    setYm(({ y, m }) => (m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }))
  const next = () =>
    setYm(({ y, m }) => (m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }))

  // 미래 달은 볼 필요가 없으니 이번 달까지만.
  const atCurrentMonth = y > todayYm.y || (y === todayYm.y && m >= todayYm.m)

  const navClass =
    'flex h-7 w-7 items-center justify-center rounded-full text-faint hover:text-ink disabled:opacity-30'

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prev} aria-label="이전 달" className={navClass}>
          ‹
        </button>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">
            {y}년 {m}월
          </span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-dim">
            {count}일 기록
          </span>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={atCurrentMonth}
          aria-label="다음 달"
          className={navClass}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-xs text-faint">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />
          const key = `${monthPrefix}${String(d).padStart(2, '0')}`
          const isRecorded = recorded.has(key)
          const isToday = key === today
          return (
            <div key={key} className="flex aspect-square items-center justify-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isRecorded
                    ? 'bg-accent font-medium text-bg'
                    : isToday
                      ? 'text-dim ring-1 ring-line'
                      : 'text-faint'
                }`}
              >
                {d}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
