# 자기 전에 (sleeptonight)

자기 전에 틀어놓을 **긴 영상 하나**를 미리 정해두는 앱.
폰을 계속 만지다 잠을 놓치는 걸 막으려고, 유튜브·OTT의 긴 영상을
"오늘 밤 틀 것"으로 미리 골라두고 그냥 재생만 누르게 만드는 것이 목적이다.

"기능을 적게 넣는다"가 이 프로젝트의 핵심 원칙이다. 새 기능을 제안할 땐
이 원칙에 부합하는지 먼저 따져볼 것.

> 전신은 수면·몸무게 기록 앱 **'비실대지말자!'** (`v1.0.0` 태그).
> 그 시점 코드가 필요하면 `git checkout v1.0.0`.
>
> 레포·배포 이름은 `sleeptonight`, 화면에 보이는 한국어 이름은 **'자기 전에'**.
> 배포는 **Vercel 무료 서브도메인 `sleeptonight.vercel.app`**을 쓴다 —
> 유료 도메인을 살 계획은 없다. (`sleepnow`/`pleasesleep`은 `.vercel.app`이
> 이미 선점돼 있었다. 특히 `sleepnow.vercel.app`은 한국어 수면 관련 사이트가 쓴다.)

## 화면 구성

**4탭**. 하단 탭바로 이동한다.

| 탭 | 내용 |
| --- | --- |
| **홈** | 밤마다 무엇을 틀었는지 보여주는 **카드 피드**. 오늘 밤 고르기 진입점 |
| **메모** | 2열 **메모보드**(붙임쪽지) |
| **기록** | 수면 입력 + 기록 목록 + 그 아래 통계(캘린더·차트) |
| **설정** | 내보내기·가져오기, 기본 취침/기상 시각, 테마, 체중 기록 토글 |

## 무엇을 만드는가 (스코프)

### 1. 홈 — 플레이리스트 카드 피드

카드 하나 = **그 밤 하루**. 유튜브 썸네일 카드 같은 모양으로, 카드마다:

- **날짜 — 잠들기를 시도한 시각** (한 줄, 카드 상단)
- **썸네일** (유튜브 URL이면 이미지, 아니면 플레이스홀더)
- **제목**

이 카드들을 최신순 목록으로 쌓는다. 맨 위가 오늘 밤 카드.

- **대기 목록(큐)**은 홈 화면에 상시 노출하지 않는다. 오늘 밤 카드의
  "고르기"를 누르면 시트가 열리고 거기서 고르거나 새로 추가한다.
  (홈은 카드 피드만 보이게 유지 — 화면에 두 종류 목록이 겹치지 않도록.)
- 대기 목록 항목의 **입력은 한 줄 텍스트 하나**로, 사용자가 URL을 붙여넣든
  제목을 그냥 쓰든 같은 필드에 들어간다. (예: `https://youtu.be/xxxx` / `넷플릭스 다큐 3화`)
- **썸네일**: 유튜브 URL이면 영상 ID로 주소를 계산해 보여준다.
  `https://img.youtube.com/vi/<ID>/hqdefault.jpg` — `<img src>`에 꽂기만 하면 되므로
  **네트워크 요청(fetch)·API 키·로딩 상태가 전혀 필요 없다.**
- **제목**: 직접 쓴 것이 우선이고, 안 썼는데 유튜브 링크면 **영상 제목을 자동으로 가져온다**
  (`src/lib/youtubeTitle.ts`, oEmbed). 둘 다 없으면 카드에 "제목 없음".
  직접 쓴 `note`와 자동으로 받은 `fetchedTitle`은 분리해 저장한다 — 섞으면
  나중에 자동 값을 덮어써도 되는지 판단할 수 없다.
- 영상 길이는 **선택 입력**(수동). "긴 영상 고르기"에 도움이 되므로 입력하면 표시한다.

### 2. 메모 — 메모보드

- 네모난 카드들을 **2열 그리드**로 쌓는다. 최신순.
- 메모는 **날짜를 달 수도, 안 달 수도 있다.** 기본은 날짜 없는 자유 메모고,
  원하면 날짜를 지정해 그날 기록에 붙인다.

### 3. 기록 — 수면 (+ 체중은 세부 기능)

- **수면**이 주 입력이다: 잠들기를 시도한 시각·기상 시각 → 소요 시간 파생.
- **체중은 중요도가 낮은 세부 기능이다.** 기록 탭에서 눈에 덜 띄는 보조 입력으로 두고,
  설정에서 아예 끌 수 있다. 화면 상단이나 홈 카드에 체중을 노출하지 않는다.
- 보여주는 것은 딱 이것만:
  - 데일리 기록값
  - 전일 대비 증감 (수면·체중 둘 다)
  - 첫날 대비 증감 (체중만)
- **통계는 별도 탭이 아니라 기록 탭 하단에 편입한다**: 월별 캘린더 + 추이 차트.

### 4. 설정

- 데이터 **내보내기·가져오기** (JSON). 로컬 저장이라 백업 수단이 사실상 필수고,
  기기를 옮길 때 수동으로 넘기는 통로도 된다.
- **기본 취침·기상 시각** — 매번 다이얼을 돌리지 않게 기본값 지정.
- **테마** — 시스템/라이트/다크 지정.
- **체중 기록 토글** — 끄면 기록 탭에서 체중 입력·표시가 사라진다.

### 스코프 밖

칼로리, 운동, 목표 설정, 알림, 영상 추천, 영상↔수면 상관관계 분석,
기기 간 자동 동기화 — 요청받기 전까지 만들지 않는다.

## 기술 스택

- **Vite + React 19 + TypeScript**
- **저장소: IndexedDB** (`idb` 래퍼) — 백엔드 없음, 데이터는 브라우저 로컬에만 저장
- **설정값만 `localStorage`** — 테마를 첫 페인트 전에 동기로 읽어야 플래시가 없어서
  IndexedDB(비동기)가 아니라 localStorage에 둔다.
- **차트: Recharts**
- **스타일: Tailwind CSS v4** (`@tailwindcss/vite` 플러그인, `@import 'tailwindcss'`)
- **PWA** (`vite-plugin-pwa`): 매니페스트 + 서비스워커(오프라인 프리캐시), "홈 화면에 추가" 지원.
  앱 아이콘 원본은 `public/icon.svg`, PNG(192/512/apple-touch)는 macOS `qlmanage`+`sips`로 생성.
- **네트워크는 유튜브 oEmbed 하나뿐.** 제목을 가져올 때만 부르고, API 키가 필요 없으며
  CORS가 열려 있어 브라우저에서 바로 호출한다. 실패(오프라인·비공개 영상)는 정상적인
  경우로 다뤄 제목 없이 저장한다.
  **썸네일은 네트워크 호출이 아니다** — URL에서 ID를 뽑아 `img.youtube.com` 주소를
  문자열로 조립할 뿐이다. **길이는 oEmbed가 주지 않아 수동 입력**이다.
  YouTube Data API(키 필요)는 쓰지 않는다.

여러 기기 동기화가 필요해지기 전까지 **백엔드는 도입하지 않는다.**
("서버에 저장"은 브라우저 IndexedDB를 뜻하는 것으로 정리됨.)

## 데이터 모델

```ts
// 영상 파일이 아니라 "볼 것 한 줄"을 담는다. 저장되는 건 전부 텍스트.
type WatchItem = {
  id: string               // crypto.randomUUID()
  text: string             // 사용자가 직접 쓴 한 줄. URL이거나 그냥 제목
  note?: string            // 선택. text에 URL을 넣었을 때 붙이는 제목·메모
  durationMinutes?: number // 선택 입력
  addedAt: string          // ISO 8601
  archived?: boolean       // true면 대기 목록에서 숨김 (다 봤음)
}

type Memo = {
  id: string               // crypto.randomUUID()
  text: string             // 메모 본문
  date?: string            // 선택. "YYYY-MM-DD" — 없으면 날짜 무관 자유 메모
  createdAt: string        // ISO 8601. 보드 정렬 기준
}

type DailyRecord = {
  date: string             // "YYYY-MM-DD", 하루 한 개 (기본 키)
  sleepStart?: number      // 잠들기를 시도한 시각, 자정 기준 분 (0–1439). 예: 23:30 → 1410
  sleepEnd?: number        // 기상 시각, 자정 기준 분 (0–1439). 예: 07:15 → 435
  weightKg?: number        // 예: 68.2 (세부 기능)
  watchItemId?: string     // 그날 밤 틀은 것 (WatchItem.id 참조)
}

// localStorage에 저장 (IndexedDB 아님)
type Settings = {
  theme: 'system' | 'light' | 'dark'
  trackWeight: boolean     // false면 체중 입력·표시를 숨긴다
  dimAtNight: boolean      // 밤이 깊을수록 화면을 어둡게 (아래 '디자인' 참고)
  defaultSleepStart?: number
  defaultSleepEnd?: number
}
```

- **`DailyRecord`의 필드는 모두 optional이다.** 영상은 자기 전에 정하고 수면·체중은
  아침에 기록하므로, 한 레코드가 부분적으로만 채워진 중간 상태가 정상이다.
  통계·목록은 값이 없는 날을 건너뛰어야 한다.
- **홈 카드는 `DailyRecord` + 참조된 `WatchItem`의 조합**이다. 카드에 표시할 값을
  따로 저장하지 않고 조인해서 만든다.
- 수면은 **시작/종료 시각**으로 기록하고 소요 시간은 파생한다(단일 진실 원천).
  자정을 넘기는 수면은 `(end - start + 1440) % 1440`으로 계산 (`src/lib/time.ts`).
- **`WatchItem`은 `text` 한 줄이 단일 진실 원천이다.** URL 여부·유튜브 ID·썸네일 주소·표시용
  라벨은 전부 `text`에서 파생한다(`src/lib/watchItem.ts`). 파싱 결과를 따로 저장하지 않는다.
- **재생 여부도 파생값이다.** `WatchItem`에 저장하지 않고, `DailyRecord.watchItemId`를
  훑어서 "마지막으로 틀은 날"을 구한다. 같은 것을 여러 날 틀 수 있다.
- **저장소 키 이름은 앱 이름을 따라 바꾸지 않는다.** IndexedDB는 `'health-tracker'`,
  설정 localStorage 키는 `'before-sleep:settings'` 그대로다. 바꾸면 기존 데이터가
  새 키로 갈려서 사라진다. (설정 키는 `index.html`의 인라인 스크립트에도 박혀 있어
  한쪽만 고치면 테마가 첫 페인트에서 어긋난다.)
  스키마 버전은 **3**. 마이그레이션은 `src/lib/db.ts`의 `upgrade`에 있다.
  - v1 → v2: `sleepHours` → `sleepStart`/`sleepEnd`
  - v2 → v3: `watchlist`·`memos` 스토어 추가 (둘 다 `keyPath: 'id'`).
    기존 `records`는 손대지 않는다 (필드가 optional로 넓어진 것뿐이라 데이터 변환이 필요 없다).

### 통계 계산 규칙

- **전일 대비**: 달력상 전날이 아니라 **직전에 그 값이 기록된 날** 기준으로 계산한다.
  (중간에 기록을 빼먹어도 자연스럽게 이어지도록.) 수면은 **분 단위**(`sleepDeltaMinutes`).
- **첫날 대비**: 체중만, `오늘 − 체중이 기록된 가장 오래된 날`.
- 비교 대상이 없으면(첫 기록) 증감은 표시하지 않는다(null).

## 디자인

이 앱은 **불 끈 방에서, 자려고 누운 상태로** 쓴다. 그래서 **다크가 기본이고 라이트가 예외다.**
토큰도 그 순서로 짠다.

- **팔레트는 깊은 남색 밤하늘 계열.** 배경 `#0d1117`, 카드 `#161b24`, 강조 `#6ea8ff`.
- **강조색은 `--c-accent` 하나뿐**이고 "오늘 밤"과 활성 상태에만 쓴다.
  화면에서 채도를 크게 가진 것은 **영상 썸네일**이어야 눈이 곧장 "오늘 뭘 볼지"로 간다.
  새 색을 추가하고 싶으면 이 원칙을 먼저 다시 볼 것.
- **밤이 깊을수록 화면이 스스로 어두워진다** (`src/lib/nightDim.ts`). 21시에 0에서 시작해
  새벽 3시에 상한(0.12)에 닿고 6시에 0으로 돌아온다. 색 토큰을 다시 계산하는 대신
  `--c-dim-veil` 오버레이 한 장을 덮어 썸네일까지 고르게 가라앉힌다.
  상한은 본문 대비가 WCAG AA를 한참 넘는 선에서 멈춘다. 설정에서 끌 수 있다.
- **대비 하한**: 본문·라벨·조작 대상은 전부 배경 대비 **4.5:1 이상**. `--c-text-faint`가
  그 경계선(다크 4.98:1 / 라이트 4.81:1)이므로 이보다 어두운 텍스트 색을 새로 만들지 말 것.

### 토큰

색은 `src/index.css`의 `--c-*`에 정의하고 `@theme`에서 Tailwind 유틸리티로 노출한다
(`bg-bg`, `text-ink`, `text-dim`, `text-faint`, `border-line`, `text-accent` …).
**컴포넌트에 `neutral-*` 같은 Tailwind 기본 색이나 `dark:` 변형을 쓰지 않는다** —
토큰이 두 테마를 모두 처리한다.

### 글꼴

전부 **굴림**이다. 자체 호스팅하며 구글 폰트 등 외부 요청은 없다.

- 본문·표제(`--font-sans`, `--font-display`): `Gulim` → `public/fonts/gulim-korean.woff2` (118KB)
- 수치·시각(`--font-mono`): `GulimChe`(굴림체, 고정폭) → `public/fonts/gulimche-latin.woff2` (13KB).
  `.tnum` 클래스로 쓴다.

출처는 **HanYang I&C**가 SIL Open Font License 1.1로 공개한 <https://github.com/googlefonts/gulim>.
원본 TTF는 한자까지 포함해 3.8MB라 그대로 쓸 수 없어 서브셋했다. 다시 만들려면:

```sh
pip install fonttools brotli
# 굴림: 한글 11,172자 전체 + 라틴/기호. 한자를 덜어내 3.8MB → 118KB
pyftsubset gulim-Regular.ttf --output-file=public/fonts/gulim-korean.woff2 --flavor=woff2 \
  --unicodes="U+0000-00FF,U+2000-206F,U+20A0-20BF,U+2100-214F,U+2190-21FF,U+25A0-25FF,U+3000-303F,U+3130-318F,U+AC00-D7A3,U+FF00-FFEF" \
  --layout-features='*' --no-hinting
# 굴림체: 수치 표기 전용이라 라틴만
pyftsubset gulimche-Regular.ttf --output-file=public/fonts/gulimche-latin.woff2 --flavor=woff2 \
  --unicodes="U+0000-00FF,U+2000-206F,U+2212" --layout-features='*' --no-hinting
```

굴림은 굵기가 Regular 하나뿐이라 굵은 글씨는 브라우저가 합성한다. 위계는 크기와 여백으로 잡는다.
`vite.config.ts`의 `globPatterns`에 `woff2`가 들어 있어야 서비스워커가 폰트를 프리캐시한다
(빠지면 오프라인에서 글꼴만 시스템 폰트로 바뀐다).

### SVG

SVG에서 색을 쓸 때는 `fill="var(--c-x)"` 같은 **표현 속성이 아니라 `style={{ fill: ... }}`**로
넘긴다. 속성 값에서는 `var()`가 해석되지 않는다. 단, 인라인 `style`은 클래스를 이기므로
`focus:stroke-*` 같은 상태 스타일이 있는 속성은 클래스로 남길 것.

## 컨벤션

- 날짜 키 포맷은 항상 `YYYY-MM-DD` 로컬 날짜. UTC 변환으로 날짜가 밀리지 않게 주의.
- 시각은 "자정 기준 분(0–1439)"으로 다룬다. 표시/파싱은 `src/lib/time.ts` 유틸 사용.
- `WatchItem.text` 해석(URL인지 판정, 유튜브 ID 추출, 썸네일 주소 조립, 표시용 라벨)은
  `src/lib/watchItem.ts`에 모은다. 순수 함수만 두고 네트워크 호출은 넣지 않는다.
  `youtu.be/ID`, `youtube.com/watch?v=ID`, `/shorts/ID`, `/live/ID`, `m.youtube.com` 모두 인식.
- **"영상"이라는 말이 실제 영상 파일 저장으로 오해되지 않게** 타입·스토어 이름은
  `WatchItem`/`watchlist`를 쓴다. 저장하는 것은 텍스트뿐이다.
- 수면 입력은 **단일 24시간 원형 다이얼**(`src/components/SleepClock.tsx`): 취침/기상 두 핸들을
  드래그/방향키로 조정(5분 스냅), 사이를 호로 이어 수면 구간 표시. 소요 시간 미세조정은 폼의 숫자 입력.
- 체중은 소수점 한 자리까지.
- 외부 링크는 항상 `target="_blank" rel="noopener noreferrer"`.
- UI 텍스트는 한국어. 취침 시각은 UI에서 "잠들기를 시도한 시각" 쪽 표현을 쓴다.
- 커밋은 각 단계(아래) 단위로, 의미 있는 메시지로 남긴다. (검증 통과 후 커밋)

## 개발 명령어

- `npm run dev` — 개발 서버
- `npm run build` — 타입체크(`tsc -b`) + 프로덕션 빌드
- `npm run test` — vitest 단위 테스트 (순수 로직 검증)
- `npm run lint` — oxlint

## 개편 단계 (진행 상황)

- [x] 단계 R0 — 리네이밍(앱 이름·매니페스트·레포 링크) + 이 CLAUDE.md
- [x] 단계 R1 — 데이터 계층: `DailyRecord` optional화, `watchlist`·`memos` 스토어(v3),
      `watchItem.ts` 텍스트 파싱 + 테스트, `settings`(localStorage)
- [x] 단계 R2 — UI 셸 전면 개편: 하단 4탭바(홈/메모/기록/설정), 디자인 토큰·다크 테마
- [x] 단계 R3 — 홈: 플레이리스트 카드 피드 + "오늘 밤 고르기" 시트(대기 목록)
- [x] 단계 R4 — 메모: 2열 메모보드
- [ ] 단계 R5 — 기록: 수면 중심으로 폼 재편(체중 격하) + 통계 편입.
      체중이 비어도 저장되게 할 것(지금은 제출 버튼이 잠긴다).
      `settings.trackWeight`가 false면 체중 입력을 숨기는 배선도 아직 안 됨
- [~] 단계 R6 — 설정: 테마·야간 디밍·체중 토글은 완료.
      **남음: 내보내기·가져오기(JSON), 기본 취침·기상 시각**
- [ ] 단계 R7 — 아이콘·매니페스트 마무리, 마이그레이션 실기기 확인

### 이전 버전 (v1.0.0에서 완료)

- [x] 스캐폴딩 / 데이터 계층 / 기록 입력 UI / 통계·차트 / PWA

### 예시 데이터

`src/lib/sampleData.ts`는 **개발 빌드에서만** 쓰는 화면 채우기용이다
(설정 탭 하단, `import.meta.env.DEV` 가드). 넣은 항목의 id에 `sample-` 접두어가
붙어 있어 "예시 데이터 지우기"가 그것만 지운다. 이미 기록이 있는 날짜는 덮어쓰지 않는다.

## 스킬

- `/ship` (`.claude/skills/ship/`) — 변경을 검증(test+build)하고 관례대로 커밋·푸시하는 반복 절차.

---

_이 파일은 Claude Code가 매 세션 자동으로 읽는 "프로젝트 메모리"다.
결정사항·컨벤션·스코프가 바뀌면 여기부터 업데이트할 것._
