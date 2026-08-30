import { useRef } from 'react'
import type { DailyRecord, WatchItem } from '../types'
import { parseWatchItem } from '../lib/watchItem'
import { formatClock, formatHM } from '../lib/time'
import { Thumbnail } from './Thumbnail'

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

const LONG_PRESS_MS = 500

type Props = {
  record: DailyRecord
  item?: WatchItem
  /** 오늘 밤 카드는 조금 더 도드라지게 */
  today?: boolean
  /** 아직 아무것도 안 정했을 때 고르러 가기 */
  onPick?: () => void
  /** 길게 누르기·우클릭으로 여는 수정/삭제 메뉴 */
  onActions?: () => void
}

/**
 * 하룻밤 = 카드 한 장.
 *
 * 날짜와 영상을 틀은 시각이 위, 썸네일이 가운데, 제목이 아래.
 * 화면에서 채도를 크게 가진 것은 이 썸네일이어야 하므로 주변은 조용하게 둔다.
 *
 * 링크는 카드에 쓰지 않는다 — 썸네일을 누르면 열리므로 주소를 글로 또 보여줄
 * 이유가 없고, 그 자리는 제목이 쓴다. 수정·삭제 버튼도 두지 않고 길게 누르기
 * (데스크톱에서는 우클릭, 키보드에서는 포커스 후 Enter)로 메뉴를 연다.
 */
export function NightCard({ record, item, today, onPick, onActions }: Props) {
  const parsed = item ? parseWatchItem(item.text, item.note, item.fetchedTitle) : null
  const timer = useRef<number | null>(null)

  const clear = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const startPress = () => {
    if (!onActions) return
    clear()
    timer.current = window.setTimeout(() => {
      timer.current = null
      onActions()
    }, LONG_PRESS_MS)
  }

  const media = (
    <Thumbnail
      src={parsed?.thumbnailUrl}
      fallback={parsed?.host}
      className="aspect-video w-full rounded-lg bg-surface-2 object-cover"
      fallbackClassName="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-2 text-[0.6875rem] text-faint"
    />
  )

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border bg-surface p-3 ${
        today ? 'border-accent-soft' : 'border-line'
      }`}
      // 길게 누르기 = 수정/삭제. 항목이 있을 때만 onActions가 넘어온다.
      onPointerDown={startPress}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={
        onActions
          ? (e) => {
              e.preventDefault()
              onActions()
            }
          : undefined
      }
      // 길게 누르기만 두면 키보드로 닿을 수 없으므로 포커스 + Enter도 받는다.
      tabIndex={onActions ? 0 : undefined}
      onKeyDown={
        onActions
          ? (e) => {
              if (e.target !== e.currentTarget) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onActions()
              }
            }
          : undefined
      }
      aria-label={onActions ? `${parsed?.title ?? '제목 없음'} — 수정` : undefined}
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <span className={`text-[0.8125rem] ${today ? 'text-ink' : 'text-dim'}`}>
          {today ? '오늘 밤' : formatDateKey(record.date)}
        </span>
        {record.sleepStart !== undefined ? (
          <span className="tnum text-[0.8125rem] text-dim">
            {formatClock(record.sleepStart)}
            <span className="ml-1 font-[family-name:var(--font-sans)] text-[0.6875rem] text-faint">
              틀었음
            </span>
          </span>
        ) : (
          <span className="text-[0.6875rem] text-faint">틀은 시각 미기록</span>
        )}
      </div>

      {parsed?.url ? (
        <a
          href={parsed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg"
          // 길게 누르는 동안 링크가 열리지 않게 한다.
          onClick={(e) => {
            if (timer.current === null && onActions) return
            if (timer.current !== null) e.preventDefault()
          }}
        >
          {media}
        </a>
      ) : (
        media
      )}

      <div className="flex items-start justify-between gap-3 px-1 pb-1">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={`text-[0.8125rem] leading-snug ${parsed?.title ? 'text-ink' : 'text-faint'}`}>
            {parsed ? (parsed.title ?? '제목 없음') : '아직 안 정했어요'}
          </span>
          {item?.durationMinutes && (
            <span className="tnum text-[0.6875rem] text-faint">
              {formatHM(item.durationMinutes)}
            </span>
          )}
        </span>
        {onPick && (
          <button
            type="button"
            onClick={onPick}
            className="shrink-0 text-[0.6875rem] text-accent transition-opacity hover:opacity-70"
          >
            고르기
          </button>
        )}
      </div>
    </article>
  )
}
