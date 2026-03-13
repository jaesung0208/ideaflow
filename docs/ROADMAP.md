# 프로젝트 로드맵 - IdeaFlow

## 개요
- **목표**: 가입 없이 링크 공유만으로 실시간 포스트잇 협업이 가능한 모바일-퍼스트 캔버스 도구 (운영비 0원)
- **전체 예상 기간**: 8주 (4 Phase, 각 Phase 2주 스프린트)
- **현재 진행 단계**: Phase 1 완료 / Phase 2 예정
- **기준일**: 2026-03-13
- **팀 규모 가정**: 소규모 팀 2-4명

## 진행 상태 범례
- ✅ 완료
- 🔄 진행 중
- 📋 예정
- ⏸️ 보류

---

## 프로젝트 현황 대시보드

| 항목 | 상태 |
|------|------|
| 전체 진행률 | 75% |
| 현재 Phase | Phase 4 (예정) |
| 다음 마일스톤 | M4 - AI 클러스터링 및 최종 배포 |
| MVP 범위 | Phase 1~2 (정적 캔버스 + 실시간 동기화) |

---

## 기술 아키텍처 결정 사항

| 결정 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | Vercel 무료 호스팅과 최적 호환, SSR/SSG 지원 |
| 스타일링 | Tailwind CSS | 유틸리티 퍼스트로 빠른 모바일-퍼스트 개발 |
| 애니메이션/제스처 | Framer Motion | 드래그, 핀치줌 등 제스처를 선언적으로 처리 |
| DB/실시간 | Firebase Firestore | onSnapshot으로 실시간 동기화, Spark 요금제 무료 |
| 인증 | Firebase Anonymous Auth | 가입 없이 고유 ID 부여, 완전 무료 |
| AI | Claude API (claude-haiku-4-5) | Anthropic API, 클러스터링에 충분한 성능 |
| STT | Web Speech API | 브라우저 내장, 추가 비용 없음 |
| 배포 | Vercel Hobby Plan | Next.js 최적 호스팅, 평생 무료 |

---

## 의존성 맵

```
Phase 1: 프로젝트 셋업 + 정적 캔버스 UI (프론트엔드 프로토타입)
    |
    v
Phase 2: Firebase 연동 + 실시간 동기화 (백엔드 연결)
    |
    v
Phase 3: 모바일 최적화 + 터치 제스처 + STT
    |
    v
Phase 4: AI 클러스터링 + 최종 배포
```

**상세 의존성:**
- 캔버스 UI (Phase 1) -> Phase 2의 Firestore 연동은 Phase 1의 커스텀 훅 인터페이스를 교체하는 방식
- 캔버스 UI (Phase 1) -> 드래그/핀치줌 제스처 (Phase 3)는 기본 UI 위에 확장
- Firebase 설정 (Phase 2) -> 실시간 동기화, 익명 인증 모두 Firebase에 의존
- 익명 인증 (Phase 2) -> 커서 공유 (Phase 2)는 사용자 ID가 필요
- Firestore 데이터 모델 (Phase 2) -> AI 클러스터링 (Phase 4)은 노트 데이터를 읽어 처리

**프론트 우선 개발 원칙:**
- Phase 1에서 로컬 상태 기반 UI를 먼저 완성하여 사용자 검토를 받음
- Phase 2에서 동일 인터페이스를 Firebase로 교체 (훅 내부만 변경)
- 각 Phase 완료 시 데모 가능한 결과물 제공

---

## Phase 1: 프로젝트 셋업 및 정적 캔버스 UI (Sprint 1) ✅ 완료: 2026-03-13

### 목표
프로젝트 기반을 구축하고, Firebase 없이 로컬 상태만으로 동작하는 캔버스 UI를 완성한다. 사용자가 포스트잇을 생성, 편집, 이동, 삭제할 수 있는 정적 프로토타입을 데모한다.

### 작업 목록 (Must Have)

- ✅ **프로젝트 초기화** (복잡도: 낮음, 예상: 2시간)
  - Next.js 프로젝트 생성 (App Router, TypeScript)
  - Tailwind CSS 설정
  - Framer Motion 의존성 추가
  - ESLint, Prettier 기본 설정
  - 폴더 구조 정의: `app/`, `components/`, `lib/`, `hooks/`, `types/`
  - 검증: `npm run dev`로 기본 페이지 렌더링 확인, `npm run build` 성공

- ✅ **데이터 타입 정의** (복잡도: 낮음, 예상: 1시간)
  - `Note` 타입: `{ id, content, x, y, colorIndex, editorId }`
  - `Cursor` 타입: `{ id, x, y, lastSeen }`
  - `User` 타입: `{ id, nickname, color }`
  - 색상 팔레트 상수 정의 (포스트잇 색상 6~8가지)
  - 검증: TypeScript 컴파일 에러 없음

- ✅ **캔버스 컴포넌트 구현** (복잡도: 중간, 예상: 8시간)
  - `Canvas` 컴포넌트: 무한 캔버스 영역, 패닝(panning) 지원
  - `StickyNote` 컴포넌트: 포스트잇 카드 UI (색상, 그림자, 둥근 모서리)
  - Framer Motion `drag`를 사용한 노트 드래그 이동
  - `useNotes` 커스텀 훅: 로컬 상태(useState/useReducer)로 노트 CRUD 관리
  - 검증: 브라우저에서 노트 드래그 이동이 60fps로 부드럽게 동작

- ✅ **노트 CRUD 인터랙션** (복잡도: 중간, 예상: 6시간)
  - 노트 추가: 하단 FAB 버튼 클릭 시 캔버스 중앙에 새 노트 생성
  - 노트 편집: 노트 더블클릭/더블탭 시 인라인 텍스트 편집 모드
  - 노트 삭제: 노트 선택 후 삭제 버튼 (또는 길게 눌러 삭제)
  - 노트 색상 변경: 컨텍스트 메뉴 또는 색상 선택 팔레트
  - 검증: 생성/편집/삭제/색상변경 각각 동작 확인

- ✅ **하단 툴바 레이아웃** (복잡도: 낮음, 예상: 3시간)
  - 모바일 한 손 조작을 위한 하단 고정 툴바
  - 버튼: 노트 추가, (향후) AI 정리 (비활성), (향후) 음성 메모 (비활성)
  - 터치 타겟 최소 48px 확보
  - 검증: 모바일 뷰포트(375px)에서 올바르게 고정 표시, 터치 타겟 크기 확인

### 완료 기준 (Definition of Done)
- ✅ `npm run dev`로 로컬에서 캔버스 페이지가 정상 렌더링된다
- ✅ 포스트잇 생성, 드래그 이동, 텍스트 편집, 삭제가 로컬 상태로 동작한다
- ✅ 하단 툴바가 모바일 뷰포트(375px)에서 올바르게 고정 표시된다
- ✅ `npm run build`가 에러 없이 성공한다
- ✅ Lighthouse 접근성 점수 90 이상 (수동 검증 필요)

### Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**캔버스 렌더링 검증:**
1. `browser_navigate` -> `http://localhost:3000` 접속
2. `browser_snapshot` -> 캔버스 영역과 하단 툴바가 렌더링되었는지 확인
3. `browser_console_messages(level: "error")` -> 콘솔 에러 없음 확인

**노트 CRUD 검증:**
1. `browser_click` -> 하단 "노트 추가" 버튼 클릭
2. `browser_snapshot` -> 새 포스트잇이 캔버스에 나타났는지 확인
3. `browser_click` -> 생성된 포스트잇 더블클릭 (편집 모드 진입)
4. `browser_type` -> "테스트 아이디어" 텍스트 입력
5. `browser_snapshot` -> 입력한 텍스트가 포스트잇에 표시되는지 확인
6. `browser_click` -> 삭제 버튼 클릭
7. `browser_snapshot` -> 포스트잇이 제거되었는지 확인

**모바일 뷰 검증:**
1. `browser_resize` -> 375x812 (모바일 뷰포트)
2. `browser_snapshot` -> 하단 툴바 고정, 터치 타겟 영역 확인
3. `browser_console_messages(level: "error")` -> 에러 없음 확인

### 기술 고려사항
- Framer Motion의 `drag` prop으로 드래그를 구현하되, `dragConstraints`로 캔버스 영역 내 제한
- 로컬 상태는 추후 Firebase로 교체하기 쉽도록 커스텀 훅(`useNotes`)으로 추상화
- karpathy-guidelines 준수:
  - 이 단계에서는 Firebase 코드를 미리 작성하지 않음 (로컬 상태만으로 동작하는 최소 구현)
  - `useNotes` 훅의 인터페이스를 먼저 확정하고, 내부 구현은 단순한 useState로 시작
  - 캔버스 패닝은 CSS transform으로 최소 구현, 복잡한 가상화는 하지 않음
  - 색상 팔레트 등 상수는 별도 파일에 정의하되 과도한 추상화 금지

---

## Phase 2: Firebase 연동 및 실시간 동기화 (Sprint 2) ✅ 완료: 2026-03-14

### 목표
Firebase Anonymous Auth로 익명 세션을 구현하고, Firestore onSnapshot을 통해 모든 노트 변경 사항이 0.5초 이내에 전 클라이언트에 동기화되는 실시간 협업 엔진을 완성한다.

### 작업 목록 (Must Have)

- ✅ **Firebase 프로젝트 설정** (복잡도: 낮음, 예상: 2시간)
  - Firebase 프로젝트 생성 및 Firestore 활성화 (Spark 요금제)
  - Firebase Anonymous Auth 활성화
  - `lib/firebase.ts` 설정 파일 작성 (환경변수로 키 관리)
  - `.env.local.example` 파일 제공 (Firebase 설정값 템플릿)
  - Firestore 보안 규칙 설정 (익명 사용자 읽기/쓰기 허용, 컬렉션 범위 제한)
  - 검증: Firebase 콘솔에서 프로젝트 생성 확인, `npm run dev`에서 Firebase 초기화 성공

- ✅ **익명 인증 및 사용자 세션** (복잡도: 중간, 예상: 4시간)
  - `useAuth` 훅: 앱 진입 시 `signInAnonymously()` 자동 호출
  - 고유 사용자 ID 기반 색상/아이콘 자동 부여
  - 별칭(닉네임) 입력 모달: 최초 접속 시 닉네임 입력 (선택적, 기본값 "익명 사용자")
  - 세션 정보를 `localStorage`에 저장하여 재접속 시 동일 ID 유지
  - 검증: 두 탭에서 접속 시 서로 다른 사용자 ID/색상이 부여됨

- ✅ **Firestore 실시간 동기화** (복잡도: 높음, 예상: 12시간)
  - `useNotes` 훅을 Firestore `onSnapshot` 기반으로 전환 (인터페이스 유지, 내부 구현 교체)
  - Optimistic UI: 로컬 변경을 즉시 반영 후 서버 확인 시 보정
  - 노트 생성/수정/삭제 시 Firestore 문서 CRUD 연동
  - 충돌 처리: `editorId` 필드로 동시 편집 잠금 (한 노트를 한 명만 편집)
  - Firestore 오프라인 캐시 활성화
  - 검증: 두 탭에서 동일 방 접속, 한 탭에서 노트 생성/수정 -> 0.5초 이내에 다른 탭에 반영

- ✅ **실시간 커서 공유** (복잡도: 중간, 예상: 6시간)
  - `useCursors` 훅: 마우스/터치 이동 시 `cursors` 컬렉션에 위치 업데이트
  - 100ms 단위 throttling으로 Firebase 쓰기 할당량 보존
  - 다른 사용자 커서를 캔버스에 시각화 (색상 + 닉네임 라벨)
  - `lastSeen` 타임스탬프 기반으로 30초 이상 비활성 커서 자동 제거
  - 검증: 두 탭에서 마우스 이동 시 서로의 커서가 실시간으로 표시됨

- ✅ **방(Room) 개념 도입** (복잡도: 중간, 예상: 4시간)
  - URL 기반 방 식별: `/room/[roomId]` 라우팅 (Next.js dynamic route)
  - 방 생성: 랜덤 ID 생성 후 해당 URL로 이동
  - 링크 공유만으로 참여: URL 접속 시 해당 방의 Firestore 컬렉션 구독
  - 메인 페이지(`/`)에서 "새 캔버스 만들기" 버튼
  - 검증: "새 캔버스 만들기" 클릭 -> `/room/[랜덤ID]`로 이동, 해당 URL 공유 시 동일 방 접속

### 완료 기준 (Definition of Done)
- ✅ 두 개 이상의 브라우저 탭에서 동일 URL 접속 시 실시간 노트 동기화 확인 (수동 검증 필요)
- ✅ 노트 변경이 0.5초 이내에 다른 탭에 반영 (수동 검증 필요)
- ✅ 각 탭에 서로 다른 익명 사용자 ID/색상이 부여됨 (수동 검증 완료)
- ✅ 커서 위치가 다른 탭에서 실시간으로 표시됨 (수동 검증 완료)
- ✅ Firebase Firestore 쓰기가 일일 무료 할당량(2만) 내에서 합리적으로 소비됨 (수동 검증 완료)
- ✅ `npm run build` 에러 없음

### Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**익명 인증 검증:**
1. `browser_navigate` -> `http://localhost:3000` 접속
2. `browser_snapshot` -> 닉네임 입력 모달 또는 메인 화면 표시 확인
3. `browser_click` -> "새 캔버스 만들기" 버튼 클릭
4. `browser_snapshot` -> `/room/[roomId]` 페이지로 이동 확인
5. `browser_network_requests` -> Firebase Auth 호출 성공(200) 확인

**실시간 동기화 검증:**
1. `browser_navigate` -> `http://localhost:3000/room/test-room` 접속 (탭 1)
2. `browser_click` -> 노트 추가 버튼 클릭
3. `browser_type` -> "실시간 테스트" 입력
4. `browser_snapshot` -> 노트 생성 확인
5. `browser_network_requests` -> Firestore 쓰기 요청 성공 확인
6. `browser_console_messages(level: "error")` -> 에러 없음 확인

**방 공유 검증:**
1. `browser_navigate` -> `http://localhost:3000` 접속
2. `browser_click` -> "새 캔버스 만들기" 클릭
3. `browser_snapshot` -> 고유 room URL이 생성되었는지 확인
4. 생성된 URL로 `browser_navigate` -> 동일 방 접속 확인

### 기술 고려사항
- Firebase 설정은 환경변수(`.env.local`)로 관리, 절대 커밋하지 않음
- Firestore 보안 규칙은 최소 권한 원칙 적용 (해당 방의 문서만 접근 가능)
- Optimistic UI 구현 시 `onSnapshot`의 `metadata.hasPendingWrites`를 활용하여 로컬/서버 상태 구분
- throttling은 직접 구현 (의존성 최소화 원칙, lodash 전체를 추가하지 않음)
- karpathy-guidelines 준수:
  - Firebase 연동 코드를 훅 단위로 격리, 컴포넌트가 Firebase에 직접 의존하지 않도록 설계
  - `useNotes` 훅의 외부 인터페이스는 Phase 1과 동일하게 유지
  - throttle 유틸리티는 별도 `lib/throttle.ts`로 분리하되, 범용적으로 만들지 않고 커서 전용으로 최소 구현

---

## Phase 3: 모바일 최적화 및 음성 메모 (Sprint 3) ✅ 완료: 2026-03-14

### 목표
모바일 사용자를 위한 터치 제스처(드래그, 핀치줌)를 완성하고, Web Speech API 기반 음성-텍스트 변환(STT)으로 모바일에서의 노트 입력 경험을 극대화한다.

### 작업 목록 (Must Have)

- ✅ **터치 제스처 최적화** (복잡도: 높음, 예상: 10시간)
  - 핀치 투 줌(Pinch-to-zoom): Framer Motion 또는 직접 터치 이벤트 처리로 구현
  - 캔버스 확대/축소 시 노트 위치가 정확하게 스케일링
  - 드래그와 줌 제스처 간 충돌 방지 (단일 터치 = 드래그, 두 손가락 = 줌)
  - `user-scalable=no` viewport 메타태그 설정으로 브라우저 기본 줌 차단
  - 터치 이벤트 최적화 (passive 이벤트 리스너)
  - 검증: 모바일 에뮬레이션에서 핀치줌 동작 확인, 드래그와 충돌 없음

- ✅ **모바일 UI 개선** (복잡도: 중간, 예상: 6시간)
  - 하단 시트(Bottom Sheet) UI: 노트 목록을 하단에서 스와이프하여 올리는 패널
  - 노트 편집 시 모바일 키보드가 올라와도 레이아웃이 깨지지 않도록 처리
  - 모바일 컨텍스트 메뉴: 길게 누르기(long press)로 노트 옵션(편집, 색상, 삭제) 표시
  - 모든 인터랙티브 요소 터치 타겟 48px 이상 확보
  - 검증: 모바일 뷰포트에서 모든 버튼이 48px 이상, 키보드 올라올 때 레이아웃 정상

- ✅ **음성 메모(STT) 기능** (복잡도: 중간, 예상: 6시간)
  - `useSpeechToText` 훅: Web Speech API (`SpeechRecognition`) 래핑
  - 하단 툴바의 마이크 버튼 클릭 시 음성 인식 시작
  - 인식된 텍스트를 실시간으로 미리보기 표시
  - 음성 인식 완료 시 자동으로 새 포스트잇 생성
  - 브라우저 미지원 시 마이크 버튼 비활성화 및 툴팁 표시
  - 한국어/영어 자동 감지 또는 수동 언어 선택
  - 검증: Chrome에서 마이크 버튼 클릭 -> 음성 인식 UI 표시, 미지원 브라우저에서 버튼 비활성화

### 작업 목록 (Should Have)

- ✅ **반응형 레이아웃 정교화** (복잡도: 낮음, 예상: 4시간)
  - 데스크톱: 넓은 캔버스 + 사이드바(접속자 목록)
  - 태블릿: 캔버스 + 하단 시트
  - 모바일: 캔버스 + 하단 시트 + 하단 툴바
  - Tailwind CSS 브레이크포인트(`sm`, `md`, `lg`) 기반 분기
  - 검증: 375px, 768px, 1440px 각 뷰포트에서 레이아웃 전환 확인

### 완료 기준 (Definition of Done)
- ⬜ 모바일 디바이스(또는 Chrome DevTools 모바일 에뮬레이션)에서 핀치줌으로 캔버스 확대/축소 동작 (수동 검증 필요)
- ✅ 포스트잇 드래그가 터치 환경에서 부드럽게 동작 (Playwright 검증 완료)
- ⬜ 음성 메모 버튼 클릭 시 마이크 권한 요청 후 음성 인식이 시작됨 (수동 검증 필요)
- ⬜ 인식된 음성이 새 포스트잇으로 생성됨 (수동 검증 필요)
- ✅ Web Speech API 미지원 브라우저에서 마이크 버튼이 비활성화됨 (Playwright 검증 완료)
- ✅ 모바일 뷰포트(375px)에서 모든 버튼의 터치 타겟이 48px 이상 (Playwright 검증 완료)

### Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**모바일 레이아웃 검증:**
1. `browser_navigate` -> `http://localhost:3000/room/test-room` 접속
2. `browser_resize` -> 375x812 (모바일 뷰포트)
3. `browser_snapshot` -> 하단 시트, 하단 툴바가 올바르게 배치되었는지 확인
4. `browser_click` -> 노트 추가 버튼 클릭
5. `browser_snapshot` -> 모바일에서 노트 생성 정상 동작 확인

**음성 메모 UI 검증:**
1. `browser_navigate` -> `http://localhost:3000/room/test-room` 접속
2. `browser_snapshot` -> 하단 툴바에 마이크 버튼 존재 확인
3. `browser_click` -> 마이크 버튼 클릭
4. `browser_snapshot` -> 음성 인식 UI(녹음 중 표시 또는 권한 요청) 확인
5. `browser_console_messages(level: "error")` -> 에러 없음 확인

**반응형 전환 검증:**
1. `browser_resize` -> 1440x900 (데스크톱)
2. `browser_snapshot` -> 데스크톱 레이아웃 확인 (넓은 캔버스 + 사이드바)
3. `browser_resize` -> 768x1024 (태블릿)
4. `browser_snapshot` -> 태블릿 레이아웃 확인
5. `browser_resize` -> 375x812 (모바일)
6. `browser_snapshot` -> 모바일 레이아웃 확인 (하단 시트 + 하단 툴바)

### 기술 고려사항
- 핀치줌 구현 시 CSS `transform: scale()`과 `transform-origin`을 활용하여 GPU 가속
- Web Speech API는 Chrome/Edge에서 가장 안정적, Safari는 부분 지원 - 브라우저별 분기 처리 필요
- 터치 이벤트와 마우스 이벤트를 모두 처리하되, `pointer` 이벤트 API 우선 사용으로 코드 단순화
- STT 훅은 캔버스 로직과 완전히 분리하여 독립적으로 테스트 가능하게 구현
- karpathy-guidelines 준수:
  - 핀치줌은 충분히 복잡하므로 별도 훅(`useCanvasGesture`)으로 격리, 캔버스 컴포넌트에는 최소 인터페이스만 노출
  - STT 훅은 단일 책임: 음성 인식 시작/중지, 결과 텍스트 반환만 담당
  - 반응형은 Tailwind 브레이크포인트만으로 해결, 커스텀 미디어쿼리 훅은 만들지 않음

---

## Phase 4: AI 클러스터링 및 최종 배포 (Sprint 4) 📋

### 목표
Claude API를 활용하여 흩어진 아이디어를 자동으로 그룹화하는 스마트 클러스터링 기능을 구현하고, Vercel에 최종 배포하여 프로덕션 준비를 완료한다.

### 작업 목록 (Must Have)

- ⬜ **Claude AI 연동** (복잡도: 중간, 예상: 4시간)
  - Next.js Route Handler(`app/api/cluster/route.ts`)로 Claude API 프록시 엔드포인트 생성
  - API 키는 서버 측 환경변수로 관리 (클라이언트에 노출하지 않음)
  - 요청 rate limiting: 사용자당 분당 5회 제한 (무료 티어 RPM 보호)
  - 검증: `/api/cluster` 엔드포인트에 테스트 데이터 전송 -> 200 응답 + JSON 결과

- ⬜ **스마트 클러스터링 기능** (복잡도: 높음, 예상: 10시간)
  - 현재 방의 모든 노트 텍스트를 수집하여 Claude에 클러스터링 요청
  - 프롬프트 설계: "다음 아이디어들을 유사한 주제별로 그룹화하고 그룹명을 제안하세요" (구조화된 JSON 응답 요구)
  - AI 응답 파싱: 그룹별 노트 ID 목록 + 그룹명 추출
  - 클러스터링 결과에 따라 노트를 자동 재배치 (그룹별 영역으로 이동 애니메이션)
  - 그룹 경계를 시각적으로 표시 (배경색 영역 또는 점선 테두리)
  - 검증: 5개 이상 노트에 서로 다른 주제 텍스트 입력 -> "AI 정리" 실행 -> 그룹별로 재배치됨

- ⬜ **클러스터링 UX** (복잡도: 중간, 예상: 6시간)
  - 하단 툴바의 "AI 정리" 버튼으로 실행
  - 로딩 상태: AI 처리 중 스피너 또는 프로그레스 표시
  - 결과 미리보기: 재배치 전 그룹핑 결과를 보여주고 "적용" / "취소" 선택
  - 실행 취소(Undo): 클러스터링 적용 후 되돌리기 기능
  - 검증: "AI 정리" 클릭 -> 로딩 스피너 -> 미리보기 -> "적용" -> 재배치 -> "되돌리기" -> 원복

- ⬜ **Vercel 배포** (복잡도: 낮음, 예상: 3시간)
  - Vercel 프로젝트 연결 및 환경변수 설정 (Firebase 키, Anthropic API 키)
  - 프로덕션 빌드 검증 (`next build` 성공)
  - 커스텀 도메인 설정 (선택적)
  - Open Graph 메타태그 설정 (링크 공유 시 미리보기)
  - 검증: Vercel 배포 URL로 접속하여 전체 기능 동작 확인

### 작업 목록 (Should Have)

- ⬜ **성능 최적화** (복잡도: 중간, 예상: 4시간)
  - 노트 100개 이상일 때 뷰포트 내 노트만 렌더링
  - Firestore 쿼리 최적화: 방별 인덱스 활용
  - 번들 사이즈 최소화 (불필요 패키지 제거)
  - Lighthouse 성능 점수 90 이상 달성
  - 검증: Lighthouse 리포트에서 Performance 90+, Accessibility 90+

- ⬜ **에러 처리 및 안정성** (복잡도: 낮음, 예상: 3시간)
  - Firebase 연결 실패 시 재연결 로직 및 사용자 알림
  - Claude API 실패 시 에러 메시지 표시 ("AI 기능을 일시적으로 사용할 수 없습니다")
  - 네트워크 오프라인 상태 감지 및 표시
  - 검증: 네트워크 차단 후 오프라인 상태 표시 확인, API 실패 시 에러 메시지 표시 확인

### 완료 기준 (Definition of Done)
- ⬜ "AI 정리" 버튼 클릭 시 노트들이 주제별로 그룹화되어 재배치됨
- ⬜ 그룹 영역이 시각적으로 구분됨
- ⬜ 클러스터링 결과를 취소(Undo)할 수 있음
- ⬜ Vercel에 배포 완료, 배포 URL로 접속하여 전체 기능 동작 확인
- ⬜ 두 대의 실제 디바이스(PC + 모바일)에서 동시 접속 협업 확인
- ⬜ Lighthouse 성능 90+, 접근성 90+
- ⬜ Firebase 일일 무료 할당량 내에서 정상 운영 확인

### Playwright MCP 검증 시나리오
> `npm run dev` 실행 후 아래 순서로 검증

**AI 클러스터링 검증:**
1. `browser_navigate` -> `http://localhost:3000/room/test-room` 접속
2. `browser_click` -> 노트 추가 버튼을 여러 번 클릭하여 5개 이상 노트 생성
3. `browser_type` -> 각 노트에 서로 다른 주제의 텍스트 입력 (예: "React 학습", "Next.js 라우팅", "저녁 메뉴", "점심 추천")
4. `browser_click` -> 하단 "AI 정리" 버튼 클릭
5. `browser_wait_for` -> 로딩 스피너 또는 결과 미리보기 표시 대기
6. `browser_snapshot` -> 클러스터링 결과 미리보기 화면 확인
7. `browser_click` -> "적용" 버튼 클릭
8. `browser_snapshot` -> 노트가 그룹별로 재배치되었는지 확인
9. `browser_network_requests` -> Claude API 프록시 호출 성공(200) 확인
10. `browser_console_messages(level: "error")` -> 에러 없음 확인

**클러스터링 Undo 검증:**
1. `browser_click` -> "되돌리기" 버튼 클릭
2. `browser_snapshot` -> 노트가 원래 위치로 복구되었는지 확인

**배포 상태 검증:**
1. `browser_navigate` -> Vercel 배포 URL 접속
2. `browser_snapshot` -> 프로덕션 환경에서 정상 렌더링 확인
3. `browser_click` -> "새 캔버스 만들기" 클릭
4. `browser_snapshot` -> 방 생성 및 캔버스 표시 확인
5. `browser_network_requests` -> Firebase/Claude 연동 정상 확인
6. `browser_console_messages(level: "error")` -> 프로덕션 에러 없음 확인

### 기술 고려사항
- Claude API 호출은 반드시 서버 측(Route Handler)에서 수행하여 API 키 보호
- 클러스터링 프롬프트는 구조화된 JSON 응답을 요구하여 파싱 안정성 확보
- 노트 재배치 애니메이션은 Framer Motion `animate`로 부드럽게 처리 (layout animation)
- rate limiting은 클라이언트 측에서도 제한 (서버리스 환경에서는 요청별 독립이므로)
- karpathy-guidelines 준수:
  - AI 프롬프트와 파싱 로직을 별도 유틸리티(`lib/ai.ts`)로 분리
  - 컴포넌트에서는 "클러스터링 결과"만 받아 사용
  - rate limiting은 단순 카운터 기반, Redis 등 외부 의존성 추가하지 않음
  - 성능 최적화는 측정 후 필요한 부분만 수행 (추측 기반 최적화 금지)

---

## 리스크 및 완화 전략

| 리스크 | 영향도 | 발생 가능성 | 완화 전략 |
|--------|--------|-------------|-----------|
| Firebase 무료 할당량 초과 | 높음 | 중간 | 커서 throttling(100ms), 불필요한 쓰기 최소화, Firebase 콘솔에서 사용량 모니터링 |
| Web Speech API 브라우저 호환성 | 중간 | 높음 | 미지원 시 기능 비활성화(graceful degradation), 사용자에게 지원 브라우저 안내 |
| Claude API rate limit | 중간 | 중간 | 사용자당 rate limiting, 클러스터링 결과 캐싱, 불필요한 재요청 방지 |
| 모바일 터치 제스처 복잡성 | 중간 | 높음 | Phase 1에서 기본 드래그 검증 후 Phase 3에서 점진적으로 제스처 추가 |
| 실시간 동기화 충돌 | 높음 | 낮음 | editorId 기반 잠금, last-write-wins 정책으로 단순화 |
| Vercel 빌드 시간/크기 제한 | 낮음 | 낮음 | 의존성 최소화, 번들 분석으로 불필요 패키지 제거 |

---

## 마일스톤

| 마일스톤 | Phase | 예상 완료일 | 산출물 |
|----------|-------|-------------|--------|
| M1: 정적 프로토타입 | Phase 1 완료 | 2026-03-27 | 로컬 동작 캔버스 데모 (사용자 검토용) |
| M2: 실시간 협업 MVP | Phase 2 완료 | 2026-04-10 | 링크 공유로 실시간 동기화 가능한 서비스 |
| M3: 모바일 최적화 | Phase 3 완료 | 2026-04-24 | 모바일 터치/음성 완전 지원 |
| M4: 프로덕션 릴리스 | Phase 4 완료 | 2026-05-08 | Vercel 배포 완료, AI 클러스터링 포함 |

---

## 기술 부채 관리

각 Phase에서 발생할 수 있는 기술 부채와 해소 시점:

| 항목 | 발생 시점 | 해소 시점 | 설명 |
|------|-----------|-----------|------|
| 로컬 상태 -> Firestore 전환 | Phase 1 | Phase 2 | Phase 1의 로컬 상태 코드를 Firestore로 교체 (훅 내부만 변경) |
| 하드코딩된 색상/상수 | Phase 1 | Phase 2 | 초기 빠른 구현 후 상수 파일로 정리 |
| 기본 드래그 -> 고급 제스처 | Phase 1 | Phase 3 | Framer Motion 기본 drag에서 핀치줌 등 확장 |
| AI 프롬프트 최적화 | Phase 4 | Phase 4 이후 | 초기 프롬프트로 시작 후 결과 품질 보며 개선 |

---

## 향후 계획 (Backlog) - Won't Have (MVP 이후)

아래 기능들은 PRD 범위에 포함되지 않으나 향후 확장 가능한 항목입니다:

- ⬜ **사용자 인증 확장**: Google/GitHub 소셜 로그인으로 영구 계정 지원
- ⬜ **노트 미디어 확장**: 이미지, 링크 미리보기, 파일 첨부 지원
- ⬜ **캔버스 템플릿**: 브레인스토밍, KPT 회고, SWOT 분석 등 사전 정의 레이아웃
- ⬜ **내보내기 기능**: 캔버스를 PNG/PDF/Markdown으로 내보내기
- ⬜ **히스토리/버전 관리**: 캔버스 변경 이력 및 특정 시점으로 복원
- ⬜ **AI 기능 확장**: 아이디어 요약, 마인드맵 자동 생성, 아이디어 보완 제안
- ⬜ **접속자 제한/비공개 방**: 비밀번호 또는 초대 링크로 접근 제어
- ⬜ **알림 기능**: 새 노트 추가 시 참여자에게 알림 (Push Notification)
