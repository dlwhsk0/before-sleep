import { useState } from 'react'

type Props = {
  src?: string
  /** 썸네일이 없거나 못 불러왔을 때 대신 보여줄 글자 (보통 링크 호스트) */
  fallback?: string
  className: string
  fallbackClassName: string
}

/**
 * 썸네일 이미지. 주소가 없거나 불러오기에 실패하면 조용한 면으로 대체한다.
 *
 * 실패는 흔하다 — 오프라인이거나, 유튜브에서 내려간 영상이거나, 유튜브가 아닌
 * 링크라 애초에 주소가 없거나. 깨진 이미지 아이콘이 뜨는 것보다 낫다.
 */
export function Thumbnail({ src, fallback, className, fallbackClassName }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className={fallbackClassName}>
        <span className="px-2 text-center">{fallback ?? '링크 없음'}</span>
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
