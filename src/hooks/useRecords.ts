import { useCallback, useEffect, useState } from 'react'
import type { DailyRecord } from '../types'
import {
  deleteRecord,
  getAllRecords,
  putRecord,
} from '../lib/db'

/**
 * IndexedDB의 기록을 React 상태로 노출하는 훅.
 * 저장/삭제 후에는 목록을 다시 읽어 항상 최신 상태를 유지한다.
 */
export function useRecords() {
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await getAllRecords()
    setRecords(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = useCallback(
    async (record: DailyRecord) => {
      await putRecord(record)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (date: string) => {
      await deleteRecord(date)
      await refresh()
    },
    [refresh],
  )

  return { records, loading, save, remove }
}
