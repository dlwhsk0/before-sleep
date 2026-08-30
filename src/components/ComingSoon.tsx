/**
 * 아직 만들지 않은 탭의 자리표시자. 개편이 끝나면 전부 사라진다.
 * 무엇이 들어올 자리인지 한 줄로 말해 준다.
 */
export function ComingSoon({ step, children }: { step: string; children: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <span className="tnum text-[0.6875rem] tracking-widest text-faint uppercase">
        {step}
      </span>
      <p className="max-w-[20rem] text-[0.8125rem] leading-relaxed text-dim">{children}</p>
    </div>
  )
}
