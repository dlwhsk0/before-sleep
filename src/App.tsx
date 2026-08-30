import { lazy, Suspense, useState } from 'react'
import { useRecords } from './hooks/useRecords'
import { useSettings } from './hooks/useSettings'
import { computeStats } from './lib/stats'
import { AppHeader } from './components/AppHeader'
import { ComingSoon } from './components/ComingSoon'
import { NightDim } from './components/NightDim'
import { RecordForm } from './components/RecordForm'
import { RecordList } from './components/RecordList'
import { TabBar, type TabId } from './components/TabBar'

// 통계는 Recharts를 포함해 무거우므로 기록 탭을 열 때만 지연 로딩한다.
const StatsSection = lazy(() =>
  import('./components/StatsSection').then((m) => ({ default: m.StatsSection })),
)

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-display)] text-base text-ink">
      {children}
    </h2>
  )
}

function Loading({ label }: { label: string }) {
  return <p className="py-10 text-center text-sm text-faint">{label}</p>
}

function App() {
  const { records, loading, save, remove } = useRecords()
  const { settings } = useSettings()
  const [tab, setTab] = useState<TabId>('home')

  const stats = computeStats(records)

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto max-w-md">
        <AppHeader />

        {/* 하단 탭바에 가리지 않도록 넉넉히 비운다 */}
        <main className="px-5 pb-28">
          {tab === 'home' && (
            <ComingSoon step="R3">
              밤마다 무엇을 틀었는지 카드로 쌓입니다. 날짜와 잠들기를 시도한 시각,
              썸네일, 제목이 한 장에 담깁니다.
            </ComingSoon>
          )}

          {tab === 'memo' && (
            <ComingSoon step="R4">
              떠오른 것을 붙여 두는 메모보드입니다. 두 줄로 쌓이고, 원하면 날짜를
              달 수 있습니다.
            </ComingSoon>
          )}

          {tab === 'record' && (
            <div className="flex flex-col gap-8">
              <RecordForm records={records} onSave={save} />

              <section className="flex flex-col gap-3">
                <SectionTitle>지난 기록</SectionTitle>
                {loading ? (
                  <Loading label="불러오는 중" />
                ) : (
                  <RecordList stats={stats} onDelete={remove} />
                )}
              </section>

              <section className="flex flex-col gap-3">
                <SectionTitle>통계</SectionTitle>
                {loading ? (
                  <Loading label="불러오는 중" />
                ) : (
                  <Suspense fallback={<Loading label="차트 불러오는 중" />}>
                    <StatsSection stats={stats} />
                  </Suspense>
                )}
              </section>
            </div>
          )}

          {tab === 'settings' && (
            <div className="flex flex-col gap-8">
              <ComingSoon step="R6">
                내보내기·가져오기, 기본 취침·기상 시각, 테마, 체중 기록 켜고 끄기가
                들어옵니다.
              </ComingSoon>

              <div className="flex items-center justify-center gap-4 text-xs text-faint">
                <a
                  href="https://github.com/dlwhsk0/before-sleep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-dim"
                >
                  소스 코드
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://github.com/dlwhsk0/before-sleep/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-dim"
                >
                  의견 보내기
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      <TabBar value={tab} onChange={setTab} />
      <NightDim enabled={settings.dimAtNight} />
    </div>
  )
}

export default App
