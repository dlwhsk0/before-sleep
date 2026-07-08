<div align="center">

<img src="public/pwa-192x192.png" width="96" alt="건강 기록 아이콘" />

# 건강 기록

**수면과 몸무게, 딱 두 가지만 매일 기록하는 미니멀 건강 관리 앱**

[▶ 라이브 데모](https://health-tracker-tau-coral.vercel.app)

</div>

## 소개

시중의 건강 앱은 기능이 너무 많습니다. 이 앱은 반대로 갑니다 —
**수면 시간**과 **몸무게** 두 가지만 기록하고, 꼭 필요한 통계만 보여줍니다.

- 데일리 기록
- **전일 대비** 증감 (수면·몸무게)
- **첫날 대비** 증감 (몸무게)

> "기능을 적게 넣는다"가 이 프로젝트의 핵심 원칙입니다.

## 주요 기능

- 🌙 **수면 시각 원형 다이얼** — 24시간 원에서 취침/기상 핸들을 드래그, 사이 구간이 수면(자정 넘김 처리)
- ⚖️ **몸무게 스테퍼** — 0.1kg 단위 −/+ 버튼, 항상 소수점 첫째자리
- 📅 **날짜 선택** — 과거 날짜도 기록/수정
- 📊 **추이 차트** — 몸무게 / 수면 시간 / 첫날 대비 몸무게, 기본 최근 7일 + 드래그로 이전 탐색
- 📱 **PWA** — "홈 화면에 추가"로 앱처럼, 오프라인 동작
- 🔒 **로컬 우선** — 데이터는 브라우저(IndexedDB)에만 저장, 서버 없음

## 기술 스택

- **React 19 + TypeScript + Vite**
- **IndexedDB** (`idb`) — 로컬 저장, 백엔드 없음
- **Recharts** — 추이 차트
- **Tailwind CSS v4**
- **vite-plugin-pwa** — 매니페스트 + 서비스워커(오프라인)
- **Vitest** — 순수 로직 단위 테스트

## 로컬 실행

```bash
git clone https://github.com/dlwhsk0/health-tracker.git
cd health-tracker
npm install
npm run dev
```

### 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run test` | 단위 테스트 (Vitest) |
| `npm run lint` | 린트 (oxlint) |

## 프라이버시

입력한 수면·몸무게 데이터는 **브라우저 로컬(IndexedDB)에만** 저장됩니다.
어떤 서버로도 전송되지 않으며, 이 저장소에는 **코드만** 포함됩니다.

## 배포

정적 빌드(`dist`)이므로 Vercel · Netlify · Cloudflare Pages 등에 그대로 올릴 수 있습니다.
빌드 명령 `npm run build`, 출력 디렉터리 `dist`.

---

<div align="center">

[@dlwhsk0](https://github.com/dlwhsk0)

</div>
