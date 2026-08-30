export type TabId = 'home' | 'memo' | 'record' | 'settings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'memo', label: '메모' },
  { id: 'record', label: '기록' },
  { id: 'settings', label: '설정' },
]

type Props = {
  value: TabId
  onChange: (tab: TabId) => void
}

/**
 * 하단 4탭바.
 *
 * 아이콘 없이 한글 라벨만 둔다. 네 단어가 모두 두 글자라 아이콘 없이도 한눈에
 * 읽히고, 화면에서 채도를 크게 가진 것이 썸네일이라는 원칙이 유지된다.
 * 활성 표시는 라벨 위의 작은 강조색 점 하나.
 */
export function TabBar({ value, onChange }: Props) {
  return (
    <nav
      aria-label="주요 화면"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active = tab.id === value
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1.5 py-3 text-[0.8125rem] transition-colors ${
                active ? 'text-ink' : 'text-dim hover:text-ink'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1 w-1 rounded-full transition-colors ${
                  active ? 'bg-accent' : 'bg-transparent'
                }`}
              />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
