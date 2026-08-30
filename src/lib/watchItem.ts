/**
 * WatchItem.text 한 줄을 해석하는 순수 함수 모음.
 *
 * 사용자는 URL을 붙여넣거나 그냥 제목을 쓴다. 어느 쪽인지, 유튜브라면 영상 ID가
 * 무엇인지, 썸네일 주소는 무엇인지를 전부 여기서 파생한다. 파싱 결과는 저장하지
 * 않는다 — text가 단일 진실 원천이다.
 *
 * 네트워크 호출은 하지 않는다. 썸네일 주소는 ID로 문자열을 조립할 뿐이다.
 */

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
])

/** 유튜브 영상 ID는 11자리 [A-Za-z0-9_-] */
const ID_RE = /^[A-Za-z0-9_-]{11}$/

export type ParsedWatchItem = {
  /** text가 http(s) URL로 읽히는가 */
  isUrl: boolean
  /** 정규화된 URL. isUrl일 때만 */
  url?: string
  /** 링크의 호스트 (예: "youtube.com", "netflix.com") */
  host?: string
  /** 유튜브 영상 ID */
  youtubeId?: string
  /** 유튜브일 때 썸네일 이미지 주소 */
  thumbnailUrl?: string
  /** 화면에 보여줄 한 줄. note가 있으면 note, 없으면 text(URL이면 보기 좋게 줄임) */
  label: string
  /**
   * 카드에 쓸 제목. 직접 쓴 것(note/text)이 우선이고, 없으면 유튜브에서
   * 자동으로 가져온 제목. 둘 다 없으면 undefined.
   * 카드에는 링크 대신 이 값을 쓰므로 label(주소로 대체될 수 있음)과 구분해 둔다.
   */
  title?: string
}

/** URL 문자열에서 유튜브 영상 ID를 뽑는다. 유튜브가 아니거나 못 찾으면 undefined. */
export function youtubeIdFrom(url: URL): string | undefined {
  const host = url.hostname.toLowerCase()
  if (!YOUTUBE_HOSTS.has(host)) return undefined

  // youtu.be/ID
  if (host.endsWith('youtu.be')) {
    const id = url.pathname.slice(1).split('/')[0]
    return ID_RE.test(id) ? id : undefined
  }

  // youtube.com/watch?v=ID
  const v = url.searchParams.get('v')
  if (v && ID_RE.test(v)) return v

  // /shorts/ID, /live/ID, /embed/ID, /v/ID
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length >= 2 && ['shorts', 'live', 'embed', 'v'].includes(parts[0])) {
    return ID_RE.test(parts[1]) ? parts[1] : undefined
  }

  return undefined
}

/** 유튜브 영상 ID → 썸네일 주소. 네트워크 호출 없이 문자열 조립뿐. */
export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

/** URL을 화면용으로 줄인다. "https://youtu.be/abc?t=1" → "youtu.be/abc" */
function shortenUrl(url: URL): string {
  const host = url.hostname.replace(/^www\./, '')
  const path = url.pathname === '/' ? '' : url.pathname
  return (host + path).replace(/\/$/, '')
}

/** text(+note+자동 제목)를 화면에 필요한 값들로 해석한다. */
export function parseWatchItem(
  text: string,
  note?: string,
  fetchedTitle?: string,
): ParsedWatchItem {
  const trimmed = text.trim()

  let url: URL | undefined
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      url = new URL(trimmed)
    } catch {
      url = undefined
    }
  }

  if (!url) {
    return { isUrl: false, label: note?.trim() || trimmed, title: trimmed }
  }

  const youtubeId = youtubeIdFrom(url)
  return {
    isUrl: true,
    url: url.toString(),
    host: url.hostname.replace(/^www\./, ''),
    youtubeId,
    thumbnailUrl: youtubeId ? youtubeThumbnail(youtubeId) : undefined,
    label: note?.trim() || fetchedTitle?.trim() || shortenUrl(url),
    title: note?.trim() || fetchedTitle?.trim() || undefined,
  }
}
