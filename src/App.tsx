import { useRecords } from './hooks/useRecords'
import { computeStats } from './lib/stats'
import { todayKey } from './lib/date'
import { TodayForm } from './components/TodayForm'
import { RecordList } from './components/RecordList'

function App() {
  const { records, loading, save, remove } = useRecords()

  const stats = computeStats(records)
  const today = records.find((r) => r.date === todayKey())

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          건강 기록
        </h1>
        <p className="text-sm text-neutral-500">수면과 몸무게를 매일 기록해요</p>
      </header>

      <TodayForm existing={today} onSave={save} />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          기록
        </h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400">불러오는 중…</p>
        ) : (
          <RecordList stats={stats} onDelete={remove} />
        )}
      </section>
    </main>
  )
}

export default App
