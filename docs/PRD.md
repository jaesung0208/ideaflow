# [PRD] 실시간 공유형 아이디어 캔버스 (Zero-Cost & Mobile-First)

## 1. 프로젝트 정의

- **제품명**: IdeaFlow (실시간 협업 아이디어 캔버스)
- **한 줄 정의**: 별도의 가입 없이 링크 공유만으로 웹과 모바일에서 실시간으로 포스트잇 아이디어를 배치하고 AI의 도움을 받아 정리하는 협업 도구.
- **핵심 가치**: 0원의 운영 비용, 설치 없는 즉각적 참여, 디바이스 간 완벽한 동기화.

## 2. 핵심 기능 요구사항

### 2.1 실시간 협업 엔진 (Core)

- **실시간 포스트잇(Sticky Notes)**: 모든 사용자가 노트를 생성, 수정, 이동, 삭제할 때 0.5초 이내에 모든 클라이언트에 반영.
- **실시간 커서 & 상태**: 현재 접속 중인 사용자의 마우스/터치 위치를 실시간으로 시각화하여 현장감 제공.
- **익명 세션**: 계정 생성 없이 즉시 고유 ID(사용자 아이콘/색상)를 부여받아 참여하되 고유ID를 바탕으로 별칭을 입력하게 해줘.

### 2.2 모바일 및 사용성 (Mobile-First)

- **터치 제스처**: 모바일 환경에서 부드러운 드래그 앤 드롭 및 핀치 투 줌(Pinch-to-zoom) 지원.
- **하단 엄지 영역 디자인**: 모든 조작 버튼(추가, AI 정리 등)을 화면 하단에 배치하여 모바일 한 손 조작 최적화.
- **음성 메모(STT)**: 자판 입력이 불편한 모바일 사용자를 위해 음성을 텍스트로 변환하여 즉시 노트 생성.

### 2.3 지능형 어시스턴트 (AI)

- **스마트 클러스터링**: 흩어진 아이디어들을 Gemini AI가 분석하여 유사한 주제끼리 자동 그룹화 및 재배치.

## 3. 기술 스택 (Zero-Cost Stack)

본 프로젝트는 모든 인프라를 **무료 티어(Free Tier)** 범위 내에서 해결합니다.


|               |                               |                                      |
| ------------- | ----------------------------- | ------------------------------------ |
| **구분**        | **선택 기술**                     | **비용 전략**                            |
| **Frontend**  | React (Next.js), Tailwind CSS | 오픈 소스 (무료)                           |
| **Animation** | Framer Motion                 | 제스처 및 애니메이션 (무료)                     |
| **Database**  | Firebase Firestore            | Spark 요금제 (일일 읽기 5만/쓰기 2만 무료)        |
| **Auth**      | Firebase Anonymous Auth       | 완전 무료                                |
| **AI (LLM)**  | Gemini 2.5 Flash              | Google AI Studio 무료 티어 (RPM 제한 내 사용) |
| **STT**       | Web Speech API                | 브라우저 내장 기능 (완전 무료)                   |
| **Hosting**   | Vercel                        | Hobby Plan (평생 무료)                   |


## 4. 실시간 동기화 및 모바일 전략

### 4.1 실시간 동기화 구현 (Firestore)

- `onSnapshot` 리스너를 사용하여 서버 상태를 클라이언트 상태와 1:1 매핑.
- **Optimistic UI**: 로컬 변경 사항을 서버 응답 대기 없이 즉시 반영하여 체감 속도 극대화.
- **Throttling**: 커서 위치 데이터는 100ms 단위로 전송을 제한하여 Firebase 무료 쓰기 할당량 보존.

### 4.2 모바일 최적화 구현

- **Viewport**: `user-scalable=no` 설정을 통해 브라우저 확대 간섭을 제거하고 커서 터치 확대 방지.
- **Layout**: 데스크탑은 넓은 캔버스, 모바일은 하단 시트(Bottom Sheet) 형태의 UI 적용.

## 5. 데이터 모델 (Schema)

### `notes` (Collection)

- `id`: string (UID)
- `content`: string
- `x`, `y`: number (좌표)
- `colorIndex`: number (색상 코드)
- `editorId`: string (현재 편집 중인 사용자 ID)

### `cursors` (Collection)

- `id`: string (사용자 UID)
- `x`, `y`: number
- `lastSeen`: timestamp (자동 삭제 로직용)

## 6. 개발 원칙

1. **No Backend**: 모든 로직은 서버리스(Firebase & Edge Function)로 처리하여 서버 유지비 0원 유지.
2. **Minimalism**: 필수 기능 외의 화려한 장식보다는 성능과 실시간성 우선.
3. **Accessibility**: 모바일 사용자의 터치 타겟 크기를 최소 48px 이상으로 확보.

