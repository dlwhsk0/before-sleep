import { useCallback, useEffect, useState } from 'react'
import type { Memo } from '../types'
import { deleteMemo, getAllMemos, putMemo } from '../lib/db'

/** 메모를 React 상태로 노출한다. 최신 먼저 정렬된 상태로 온다. */
export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setMemos(await getAllMemos())
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
    async (text: string, date?: string) => {
      const memo: Memo = {
        id: crypto.randomUUID(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      }
      if (date) memo.date = date
      await putMemo(memo)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteMemo(id)
      await refresh()
    },
    [refresh],
  )

  return { memos, loading, error, add, remove, refresh }
}
