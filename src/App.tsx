import { useState } from 'react'
import { useRecords } from './hooks/useRecords'
import { computeStats } from './lib/stats'
import { RecordForm } from './components/RecordForm'
import { RecordList } from './components/RecordList'
import { StatsSection } from './components/StatsSection'

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
            <StatsSection stats={stats} />
          )}
        </section>
      )}
    </main>
  )
}

export default App
