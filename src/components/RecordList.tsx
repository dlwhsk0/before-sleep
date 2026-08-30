import { useState } from 'react'
import type { RecordStats } from '../types'
import { todayKey } from '../lib/date'
import { formatClock, formatHM } from '../lib/time'
import { DeltaBadge } from './DeltaBadge'

const kg = (n: number) => `${n.toFixed(1)}kg`

/**
 * 삭제 버튼. 한 번에 지우지 않고 "삭제 · 취소" 인라인 확인을 한 번 거친다.
 * 실수로 기록이 날아가지 않도록.
 */
function DeleteButton({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-faint hover:text-danger"
      >
        삭제
      </button>
    )
  }

  return (
    <span className="flex items-center gap-2 text-xs">
      <span className="text-dim">삭제할까요?</span>
      <button
        type="button"
        onClick={() => onConfirm()}
        className="font-medium text-rise hover:text-danger"
      >
        삭제
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-faint hover:text-dim"
      >
        취소
      </button>
    </span>
  )
}

/**
 * 몸무게 행. 절대값은 숨기고 증감값(전일·첫날 대비)만 보여준다.
 * 실제 몸무게는 버튼을 **누르고 있는 동안에만** 잠깐 드러난다. 손을 떼면 다시 가려진다.
 * (숫자를 매일 마주하고 싶지 않은 사용자 배려)
 */
function WeightRow({ row }: { row: RecordStats }) {
  const [peek, setPeek] = useState(false)
  const hide = () => setPeek(false)
  return (
    <>
      <button
        type="button"
        onPointerDown={() => setPeek(true)}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setPeek(true)
        }}
        onKeyUp={hide}
        onBlur={hide}
        className="flex w-full touch-none items-baseline justify-between text-left"
      >
        <span className="text-dim">몸무게</span>
        <span className="flex items-baseline gap-2">
          {peek ? (
            <span className="text-base font-medium text-ink">
              {row.weightKg === undefined ? '—' : kg(row.weightKg)}
            </span>
          ) : (
            <span className="text-xs text-faint">눌러서 보기</span>
          )}
          <DeltaBadge value={row.weightDelta} format={kg} />
          {/* 괄호 안 값 = 첫날 대비 (라벨은 리스트 헤더에 표기) */}
          {row.weightDeltaFromStart !== null && (
            <span className="flex items-baseline text-faint">
              (<DeltaBadge value={row.weightDeltaFromStart} format={kg} />)
            </span>
          )}
        </span>
      </button>
    </>
  )
}

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
      <p className="py-8 text-center text-sm text-faint">
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
          className="rounded-xl border border-line p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">
              {row.date}
              {row.date === today && (
                <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-xs text-bg">
                  오늘
                </span>
              )}
            </span>
            <DeleteButton onConfirm={() => onDelete(row.date)} />
          </div>

          <div className="flex flex-col gap-1 text-sm">
            {/* 수면·체중은 각각 없을 수 있다. 없는 값은 줄째로 건너뛴다. */}
            {row.sleepStart !== undefined &&
              row.sleepEnd !== undefined &&
              row.sleepMinutes !== null && (
                <div className="flex items-baseline justify-between">
                  <span className="text-dim">수면</span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-base font-medium text-ink">
                      {formatClock(row.sleepStart)} → {formatClock(row.sleepEnd)}
                    </span>
                    <span className="text-dim">· {formatHM(row.sleepMinutes)}</span>
                    <DeltaBadge value={row.sleepDeltaMinutes} format={formatHM} />
                  </span>
                </div>
              )}

            {row.weightKg !== undefined && <WeightRow row={row} />}
          </div>
        </li>
      ))}
    </ul>
  )
}
