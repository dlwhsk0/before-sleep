import { useCallback, useEffect, useState } from 'react'
import type { WatchItem } from '../types'
import { deleteWatchItem, getAllWatchItems, putWatchItem } from '../lib/db'

/** 대기 목록을 React 상태로 노출한다. 쓰기 후에는 다시 읽어 최신을 유지한다. */
export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await getAllWatchItems())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (text: string, note?: string) => {
      const item: WatchItem = {
        id: crypto.randomUUID(),
        text: text.trim(),
        addedAt: new Date().toISOString(),
      }
      if (note?.trim()) item.note = note.trim()
      await putWatchItem(item)
      await refresh()
      return item
    },
    [refresh],
  )

  const update = useCallback(
    async (item: WatchItem) => {
      await putWatchItem(item)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteWatchItem(id)
      await refresh()
    },
    [refresh],
  )

  return { items, loading, error, add, update, remove, refresh }
}
