import { useMemo, useState } from 'react'
import type { DailyRecord, WatchItem } from '../types'
import { todayKey } from '../lib/date'
import { NightCard } from './NightCard'
import { TonightPicker } from './TonightPicker'

type Props = {
  records: DailyRecord[]
  items: WatchItem[]
  onSaveRecord: (record: DailyRecord) => Promise<void>
  onAddItem: (text: string, note?: string) => Promise<WatchItem>
  onRemoveItem: (id: string) => void
}

/**
 * 홈 = 밤마다 무엇을 틀었는지 쌓이는 카드 피드.
 *
 * 맨 위가 오늘 밤 카드고, 그 아래로 지난 밤들이 최신순으로 이어진다.
 * 대기 목록은 여기 깔지 않고 "고르기" 시트에 둔다.
 */
export function HomeFeed({
  records,
  items,
  onSaveRecord,
  onAddItem,
  onRemoveItem,
}: Props) {
  const [picking, setPicking] = useState(false)
  const today = todayKey()

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const todayRecord = records.find((r) => r.date === today) ?? { date: today }

  // 지난 밤: 오늘 이전에서 "무엇을 틀었는지"가 있는 날만. 카드의 주인공이 영상이므로
  // 영상이 없는 날은 홈에 세우지 않는다(그 날들은 기록 탭에 있다).
  const past = useMemo(
    () =>
      records
        .filter((r) => r.date < today && r.watchItemId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [records, today],
  )

  const pick = async (id: string) => {
    await onSaveRecord({ ...todayRecord, watchItemId: id })
  }

  return (
    <div className="flex flex-col gap-6">
      <NightCard
        record={todayRecord}
        item={todayRecord.watchItemId ? byId.get(todayRecord.watchItemId) : undefined}
        today
        onPick={() => setPicking(true)}
      />

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm text-dim">지난 밤</h2>
          {past.map((record) => (
            <NightCard
              key={record.date}
              record={record}
              item={record.watchItemId ? byId.get(record.watchItemId) : undefined}
            />
          ))}
        </section>
      )}

      {picking && (
        <TonightPicker
          items={items}
          selectedId={todayRecord.watchItemId}
          onAdd={onAddItem}
          onSelect={pick}
          onRemove={onRemoveItem}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  )
}
