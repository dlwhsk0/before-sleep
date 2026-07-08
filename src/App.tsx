import { lazy, Suspense, useState } from 'react'
import { useRecords } from './hooks/useRecords'
import { computeStats } from './lib/stats'
import { RecordForm } from './components/RecordForm'
import { RecordList } from './components/RecordList'

// 통계 화면은 Recharts를 포함해 무거우므로, 통계 탭을 열 때만 지연 로딩한다.
const StatsSection = lazy(() =>
  import('./components/StatsSection').then((m) => ({ default: m.StatsSection })),
)

type Tab = 'record' | 'stats'

function App() {
  const { records, loading, save, remove } = useRecords()
  const [tab, setTab] = useState<Tab>('record')

  const stats = computeStats(records)

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-50'
        : 'text-neutral-500'
    }`

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          건강 기록
        </h1>
        <p className="text-sm text-neutral-500">수면과 몸무게를 매일 기록해요</p>
      </header>

      {/* 탭 바 */}
      <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setTab('record')}
          className={tabClass(tab === 'record')}
        >
          기록
        </button>
        <button
          type="button"
          onClick={() => setTab('stats')}
          className={tabClass(tab === 'stats')}
        >
          통계
        </button>
      </div>

      {tab === 'record' ? (
        <>
          <RecordForm records={records} onSave={save} />
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              기록
            </h2>
            {loading ? (
              <p className="py-8 text-center text-sm text-neutral-400">
                불러오는 중…
              </p>
            ) : (
              <RecordList stats={stats} onDelete={remove} />
            )}
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            통계
          </h2>
          {loading ? (
            <p className="py-8 text-center text-sm text-neutral-400">불러오는 중…</p>
          ) : (
            <Suspense
              fallback={
                <p className="py-8 text-center text-sm text-neutral-400">
                  차트 불러오는 중…
                </p>
              }
            >
              <StatsSection stats={stats} />
            </Suspense>
          )}
        </section>
      )}

      <footer className="mt-auto pt-8 text-center text-xs text-neutral-400">
        <a
          href="https://github.com/dlwhsk0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          @dlwhsk0
        </a>
      </footer>
    </main>
  )
}

export default App
