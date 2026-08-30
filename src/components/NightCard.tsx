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

type Props = {
  record: DailyRecord
  item?: WatchItem
  /** 오늘 밤 카드는 조금 더 도드라지게 */
  today?: boolean
  onPick?: () => void
}

/**
 * 하룻밤 = 카드 한 장.
 *
 * 날짜와 잠들기를 시도한 시각이 위, 썸네일이 가운데, 제목이 아래.
 * 화면에서 채도를 크게 가진 것은 이 썸네일이어야 하므로 주변은 조용하게 둔다.
 */
export function NightCard({ record, item, today, onPick }: Props) {
  const parsed = item ? parseWatchItem(item.text, item.note) : null

  const media = (
    <Thumbnail
      src={parsed?.thumbnailUrl}
      fallback={parsed?.host}
      className="aspect-video w-full rounded-lg bg-surface-2 object-cover"
      fallbackClassName="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-2 text-xs text-faint"
    />
  )

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border p-3 ${
        today ? 'border-accent-soft bg-surface' : 'border-line bg-surface'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <span className={`text-sm ${today ? 'text-ink' : 'text-dim'}`}>
          {today ? '오늘 밤' : formatDateKey(record.date)}
        </span>
        {record.sleepStart !== undefined ? (
          <span className="tnum text-sm text-dim">
            {formatClock(record.sleepStart)}
            <span className="ml-1 font-[family-name:var(--font-sans)] text-xs text-faint">
              누움
            </span>
          </span>
        ) : (
          <span className="text-xs text-faint">잠든 시각 미기록</span>
        )}
      </div>

      {parsed?.url ? (
        <a
          href={parsed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg"
        >
          {media}
        </a>
      ) : (
        media
      )}

      <div className="flex items-start justify-between gap-3 px-1 pb-1">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm leading-snug text-ink">
            {parsed ? parsed.label : '아직 안 정했어요'}
          </span>
          {item?.durationMinutes && (
            <span className="tnum text-xs text-faint">
              {formatHM(item.durationMinutes)}
            </span>
          )}
        </span>
        {onPick && (
          <button
            type="button"
            onClick={onPick}
            className="shrink-0 text-xs text-accent transition-opacity hover:opacity-70"
          >
            {item ? '바꾸기' : '고르기'}
          </button>
        )}
      </div>
    </article>
  )
}
