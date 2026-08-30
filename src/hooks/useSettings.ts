import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  loadSettings,
  saveSettings,
  type Settings,
} from '../lib/settings'

/**
 * 설정을 React 상태로 노출하는 훅.
 * 값이 바뀔 때마다 localStorage에 쓰고 테마를 문서에 반영한다.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    saveSettings(settings)
    applyTheme(settings.theme)
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return { settings, update }
}
