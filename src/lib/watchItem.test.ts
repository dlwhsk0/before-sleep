import { describe, expect, it } from 'vitest'
import { parseWatchItem, youtubeIdFrom, youtubeThumbnail } from './watchItem'

const id = (u: string) => youtubeIdFrom(new URL(u))

describe('youtubeIdFrom', () => {
  it('여러 형태의 유튜브 주소에서 ID를 뽑는다', () => {
    expect(id('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(id('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(id('https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=90s')).toBe('dQw4w9WgXcQ')
    expect(id('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(id('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(id('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(id('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('youtu.be의 뒤따르는 경로·쿼리를 무시한다', () => {
    expect(id('https://youtu.be/dQw4w9WgXcQ?t=42')).toBe('dQw4w9WgXcQ')
  })

  it('유튜브가 아니면 undefined', () => {
    expect(id('https://www.netflix.com/watch/80100172')).toBeUndefined()
    expect(id('https://vimeo.com/123456789')).toBeUndefined()
  })

  it('ID 형식이 아니면 undefined', () => {
    expect(id('https://www.youtube.com/watch?v=short')).toBeUndefined()
    expect(id('https://www.youtube.com/@somechannel')).toBeUndefined()
  })
})

describe('youtubeThumbnail', () => {
  it('ID로 썸네일 주소를 조립한다', () => {
    expect(youtubeThumbnail('dQw4w9WgXcQ')).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    )
  })
})

describe('parseWatchItem', () => {
  it('유튜브 링크는 썸네일까지 만든다', () => {
    const p = parseWatchItem('https://youtu.be/dQw4w9WgXcQ')
    expect(p.isUrl).toBe(true)
    expect(p.youtubeId).toBe('dQw4w9WgXcQ')
    expect(p.thumbnailUrl).toContain('dQw4w9WgXcQ')
    expect(p.label).toBe('youtu.be/dQw4w9WgXcQ')
  })

  it('유튜브가 아닌 링크는 썸네일 없이 호스트만', () => {
    const p = parseWatchItem('https://www.netflix.com/watch/80100172')
    expect(p.isUrl).toBe(true)
    expect(p.host).toBe('netflix.com')
    expect(p.thumbnailUrl).toBeUndefined()
    expect(p.label).toBe('netflix.com/watch/80100172')
  })

  it('URL이 아니면 그냥 제목으로 다룬다', () => {
    const p = parseWatchItem('넷플릭스 다큐 3화')
    expect(p.isUrl).toBe(false)
    expect(p.url).toBeUndefined()
    expect(p.label).toBe('넷플릭스 다큐 3화')
  })

  it('note가 있으면 라벨로 note를 쓴다', () => {
    const p = parseWatchItem('https://youtu.be/dQw4w9WgXcQ', '잔잔한 피아노 3시간')
    expect(p.label).toBe('잔잔한 피아노 3시간')
    expect(p.youtubeId).toBe('dQw4w9WgXcQ')
  })

  it('앞뒤 공백을 정리한다', () => {
    expect(parseWatchItem('  자기 전 라디오  ').label).toBe('자기 전 라디오')
  })

  it('title은 카드에 쓸 제목이다 (링크는 쓰지 않는다)', () => {
    expect(parseWatchItem('https://youtu.be/dQw4w9WgXcQ', '빗소리 10시간').title).toBe(
      '빗소리 10시간',
    )
    // URL이 아니면 쓴 것 자체가 제목
    expect(parseWatchItem('넷플릭스 다큐 3화').title).toBe('넷플릭스 다큐 3화')
  })

  it('직접 쓴 제목이 없으면 유튜브에서 받아온 제목을 쓴다', () => {
    const p = parseWatchItem(
      'https://youtu.be/dQw4w9WgXcQ',
      undefined,
      'lofi hip hop radio',
    )
    expect(p.title).toBe('lofi hip hop radio')
    expect(p.label).toBe('lofi hip hop radio')
  })

  it('직접 쓴 제목이 자동으로 받은 것보다 우선한다', () => {
    const p = parseWatchItem('https://youtu.be/dQw4w9WgXcQ', '내가 쓴 제목', '받아온 제목')
    expect(p.title).toBe('내가 쓴 제목')
  })

  it('둘 다 없으면 title은 undefined (카드는 "제목 없음")', () => {
    expect(parseWatchItem('https://youtu.be/dQw4w9WgXcQ').title).toBeUndefined()
  })

  it('label은 여전히 링크로 대체될 수 있다 (대기 목록에서는 주소가 단서가 된다)', () => {
    expect(parseWatchItem('https://youtu.be/dQw4w9WgXcQ').label).toBe(
      'youtu.be/dQw4w9WgXcQ',
    )
  })

  it('깨진 URL은 제목으로 떨어진다', () => {
    const p = parseWatchItem('https://')
    expect(p.isUrl).toBe(false)
  })
})
