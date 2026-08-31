import { useCallback, useRef } from 'react'

export const LONG_PRESS_MS = 500

/**
 * 길게 누르기로 동작을 여는 핸들러 묶음.
 *
 * 화면 곳곳에서 "수정·삭제 버튼을 눌러 두지 않고 길게 눌러 연다"를 쓰므로
 * 한 곳에 모은다. 길게 누르기만 두면 키보드·데스크톱에서 닿을 수 없어
 * 우클릭과 포커스 후 Enter도 같은 동작으로 이어 준다.
 *
 * `pressed()`로 지금 길게 누르는 중인지 물을 수 있다 — 안에 링크가 있을 때
 * 누르는 동안 링크가 열리지 않게 막는 데 쓴다.
 */
export function useLongPress(onTrigger?: () => void) {
  const timer = useRef<number | null>(null)
  const fired = useRef(false)

  const clear = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  if (!onTrigger) {
    return { handlers: {}, pressed: () => false, fired: () => false }
  }

  const handlers = {
    onPointerDown: () => {
      clear()
      fired.current = false
      timer.current = window.setTimeout(() => {
        timer.current = null
        fired.current = true
        onTrigger()
      }, LONG_PRESS_MS)
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      onTrigger()
    },
    // 카드 자체가 포커스를 받고, 안쪽 요소의 키 입력은 그쪽에 맡긴다.
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onTrigger()
      }
    },
  }

  return {
    handlers,
    pressed: () => timer.current !== null,
    fired: () => fired.current,
  }
}
