/**
 * 앱 설정. IndexedDB가 아니라 localStorage에 둔다.
 *
 * 테마는 첫 페인트 전에 읽혀야 화면이 번쩍이지 않는데, IndexedDB는 비동기라
 * 그 타이밍을 맞출 수 없다. index.html의 인라인 스크립트가 같은 키를 동기로
 * 읽어 <html data-theme>을 미리 붙인다. (키를 바꾸면 그쪽도 같이 고칠 것.)
 */

export type ThemePref = 'system' | 'light' | 'dark'

export type Settings = {
  theme: ThemePref
  /** false면 기록 탭에서 체중 입력·표시를 숨긴다. */
  trackWeight: boolean
  /** 밤이 깊을수록 화면을 어둡게 (nightDim). */
  dimAtNight: boolean
  /** 기록할 때 다이얼의 기본 위치. 자정 기준 분. */
  defaultSleepStart?: number
  defaultSleepEnd?: number
}

export const STORAGE_KEY = 'before-sleep:settings'

export const DEFAULT_SETTINGS: Settings = {
  // 시스템 설정을 따르지 않고 다크로 시작한다. 불 끈 방에서 쓰는 앱이라
  // 라이트가 기본이면 첫인상이 설계 의도와 어긋난다. 설정에서 바꿀 수 있다.
  theme: 'dark',
  trackWeight: true,
  dimAtNight: true,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    // 저장된 값이 낡았거나 일부만 있어도 기본값으로 메운다.
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    // 사생활 보호 모드 등으로 localStorage를 못 읽어도 앱은 떠야 한다.
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // 저장 실패는 무시한다. 이번 세션 동안은 메모리 상태로 동작한다.
  }
}

/** 설정의 테마 선택을 <html data-theme>에 반영한다. 'system'이면 속성을 지운다. */
export function applyTheme(theme: ThemePref): void {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

/** 첫 페인트 전 인라인 스크립트와 같은 규칙. 저장값이 없으면 기본값(다크). */
export function initialTheme(): ThemePref {
  return loadSettings().theme
}
