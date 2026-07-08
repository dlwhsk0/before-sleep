function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          건강 기록
        </h1>
        <p className="text-sm text-neutral-500">수면과 몸무게를 매일 기록해요</p>
      </header>

      <section className="rounded-xl border border-neutral-200 p-6 text-center text-neutral-400 dark:border-neutral-800">
        여기에 곧 입력 폼과 통계가 들어갑니다.
      </section>
    </main>
  )
}

export default App
