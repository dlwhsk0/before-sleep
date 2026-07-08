import type { RecordStats } from '../types'
import { todayKey } from '../lib/date'
import { formatClock, formatHM } from '../lib/time'
import { DeltaBadge } from './DeltaBadge'

const kg = (n: number) => `${n.toFixed(1)}kg`

/**
 * 기록 카드 리스트. 최신 날짜가 위로 오도록 역순 정렬해 보여준다.
 * 수면은 "취침 → 기상 · 소요시간", 몸무게는 값 + 전일 대비, 그리고 첫날 대비를 표시한다.
 */
export function RecordList({
  stats,
  onDelete,
}: {
  stats: RecordStats[]
  onDelete: (date: string) => Promise<void>
}) {
  if (stats.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        아직 기록이 없어요. 위에서 오늘 기록을 저장해보세요.
      </p>
    )
  }

  const today = todayKey()
  // 최신순으로 보여준다 (stats는 오름차순).
  const rows = [...stats].reverse()

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={row.date}
          className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {row.date}
              {row.date === today && (
                <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">
                  오늘
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onDelete(row.date)}
              className="text-xs text-neutral-400 hover:text-red-500"
            >
              삭제
            </button>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-neutral-500">수면</span>
              <span className="flex items-baseline gap-2">
                <span className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                  {formatClock(row.sleepStart)} → {formatClock(row.sleepEnd)}
                </span>
                <span className="text-neutral-500">
                  · {formatHM(row.sleepMinutes)}
                </span>
                <DeltaBadge value={row.sleepDeltaMinutes} format={formatHM} />
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-neutral-500">몸무게</span>
              <span className="flex items-baseline gap-2">
                <span className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                  {row.weightKg.toFixed(1)}kg
                </span>
                <DeltaBadge value={row.weightDelta} format={kg} />
              </span>
            </div>

            {row.weightDeltaFromStart !== null && (
              <div className="mt-0.5 text-right text-xs">
                <DeltaBadge
                  value={row.weightDeltaFromStart}
                  format={kg}
                  label="첫날 대비"
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
