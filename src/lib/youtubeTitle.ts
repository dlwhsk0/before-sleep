/**
 * 유튜브 영상 제목 가져오기.
 *
 * oEmbed는 API 키 없이 CORS를 허용해서 브라우저에서 바로 부를 수 있다.
 * 제목·채널명·썸네일을 주지만 **길이는 주지 않는다** — 러닝 타임이 여전히
 * 수동 입력인 이유다.
 *
 * 실패(오프라인, 비공개·삭제된 영상, 차단)는 정상적인 경우로 다룬다.
 * 제목을 못 가져와도 저장은 되어야 하므로 예외를 던지지 않고 undefined를 준다.
 */

const TIMEOUT_MS = 5000

export async function fetchYoutubeTitle(url: string): Promise<string | undefined> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) return undefined
    const data: unknown = await res.json()
    if (data && typeof data === 'object' && 'title' in data) {
      const title = (data as { title?: unknown }).title
      if (typeof title === 'string' && title.trim()) return title.trim()
    }
    return undefined
  } catch {
    return undefined
  }
}
