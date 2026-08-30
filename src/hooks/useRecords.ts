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
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setRecords(await getAllRecords())
      setError(null)
    } catch (e) {
      // 사생활 보호 모드나 저장소 차단이면 여기로 온다. 조용히 멈추면
      // 화면이 '불러오는 중'에 영원히 갇히므로 상태로 올린다.
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
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

  return { records, loading, error, save, remove, refresh }
}
