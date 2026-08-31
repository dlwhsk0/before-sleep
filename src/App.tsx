import { lazy, Suspense, useCallback, useState } from 'react'
import { useMemos } from './hooks/useMemos'
import { useRecords } from './hooks/useRecords'
import { useSettings } from './hooks/useSettings'
import { useWatchlist } from './hooks/useWatchlist'
import { computeStats } from './lib/stats'
import { AppHeader } from './components/AppHeader'
import { HomeFeed } from './components/HomeFeed'
import { MemoBoard } from './components/MemoBoard'
import { NightDim } from './components/NightDim'
import { RecordForm } from './components/RecordForm'
import { RecordList } from './components/RecordList'
import { SettingsPanel } from './components/SettingsPanel'
import { TabBar, type TabId } from './components/TabBar'

// 통계는 Recharts를 포함해 무거우므로 기록 탭을 열 때만 지연 로딩한다.
const StatsSection = lazy(() =>
  import('./components/StatsSection').then((m) => ({ default: m.StatsSection })),
)

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm text-ink">{children}</h2>
}

function Loading({ label }: { label: string }) {
  return <p className="py-10 text-center text-[0.8125rem] text-faint">{label}</p>
}

/**
 * 저장소를 못 읽었을 때. 사생활 보호 모드나 저장소 차단이면 IndexedDB가 열리지
 * 않는데, 그때 '불러오는 중'만 계속 띄우면 고장 난 앱과 구분이 안 된다.
 */
function LoadError({ detail }: { detail: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <p className="text-[0.8125rem] text-ink">기록을 불러오지 못했어요</p>
      <p className="max-w-[20rem] text-[0.6875rem] leading-relaxed text-faint">
        브라우저 저장소를 열 수 없습니다. 사생활 보호 모드이거나 사이트 데이터가
        차단돼 있으면 이럴 수 있어요.
      </p>
      <p className="max-w-[20rem] text-[0.6875rem] break-all text-faint">{detail}</p>
    </div>
  )
}

function App() {
  const {
    records,
    loading,
    error,
    save,
    remove,
    refresh: refreshRecords,
  } = useRecords()
  const {
    items,
    add: addItem,
    update: updateItem,
    remove: removeItem,
    refresh: refreshItems,
  } = useWatchlist()
  const {
    memos,
    add: addMemo,
    update: updateMemo,
    remove: removeMemo,
    refresh: refreshMemos,
  } = useMemos()
  const { settings, update } = useSettings()
  const [tab, setTab] = useState<TabId>('home')

  const stats = computeStats(records)

  // 예시 데이터를 넣거나 지운 뒤 세 스토어를 한꺼번에 다시 읽는다.
  const refreshAll = useCallback(() => {
    void refreshRecords()
    void refreshItems()
    void refreshMemos()
  }, [refreshRecords, refreshItems, refreshMemos])

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto max-w-md">
        <AppHeader />

        {/* 하단 탭바에 가리지 않도록 넉넉히 비운다 */}
        <main className="px-5 pb-28">
          {tab === 'home' &&
            (error ? (
              <LoadError detail={error} />
            ) : loading ? (
              <Loading label="불러오는 중" />
            ) : (
              <HomeFeed
                records={records}
                items={items}
                onSaveRecord={save}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
              />
            ))}

          {tab === 'memo' && (
            <MemoBoard
              memos={memos}
              onAdd={addMemo}
              onUpdate={updateMemo}
              onRemove={removeMemo}
            />
          )}

          {tab === 'record' && (
            <div className="flex flex-col gap-8">
              <RecordForm records={records} onSave={save} />

              <section className="flex flex-col gap-3">
                <SectionTitle>지난 기록</SectionTitle>
                {error ? (
                  <LoadError detail={error} />
                ) : loading ? (
                  <Loading label="불러오는 중" />
                ) : (
                  <RecordList stats={stats} onDelete={remove} />
                )}
              </section>

              <section className="flex flex-col gap-3">
                <SectionTitle>통계</SectionTitle>
                {error ? null : loading ? (
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
            <SettingsPanel
              settings={settings}
              onChange={update}
              onDataChanged={refreshAll}
            />
          )}
        </main>
      </div>

      <TabBar value={tab} onChange={setTab} />
      <NightDim enabled={settings.dimAtNight} />
    </div>
  )
}

export default App
