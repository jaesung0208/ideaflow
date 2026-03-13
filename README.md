# IdeaFlow

**가입 없이 링크 공유만으로 실시간 포스트잇 협업이 가능한 모바일-퍼스트 캔버스 도구**

🔗 **라이브 데모**: https://ideaflow-sooty.vercel.app

---

## 주요 기능

### 실시간 협업
- 링크 공유만으로 즉시 참여 — 가입 불필요
- 포스트잇 생성·편집·이동·삭제가 모든 참여자에게 실시간 동기화
- 다른 사용자의 커서 위치 실시간 표시 (닉네임 + 기기 이모지 💻📱)
- 접속자 목록 사이드바 (데스크톱)

### 캔버스
- 무한 캔버스 패닝
- 핀치줌 (모바일 두 손가락 확대/축소)
- 포스트잇 드래그 이동
- 6가지 색상 변경
- 미니맵으로 전체 캔버스 조망

### 템플릿
- **빈 캔버스**: 자유롭게 시작
- **브레인스토밍**: 중심 주제 + 방향별 아이디어 노트 배치
- **KPT 회고**: Keep / Problem / Try 3개 영역 + 가이드 노트
  - 각 영역 독립 드래그 이동 및 리사이즈
  - 영역 위치·크기 Firestore 실시간 동기화

### AI 클러스터링
- "AI 정리" 버튼 클릭 → Claude AI가 노트를 주제별로 자동 그룹화
- 재배치 미리보기 후 적용 또는 취소
- 적용 후 되돌리기(Undo) 지원

### 음성 메모 (STT)
- 마이크 버튼 클릭 → 음성 인식 → 자동으로 새 포스트잇 생성
- Web Speech API (Chrome/Edge 기본 지원, 추가 비용 없음)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS |
| 애니메이션/드래그 | Framer Motion |
| 실시간 DB | Firebase Firestore (onSnapshot) |
| 인증 | Firebase Anonymous Auth |
| AI | Claude API (claude-haiku-4-5) |
| STT | Web Speech API |
| 배포 | Vercel Hobby Plan |

> 운영비 0원 — Firebase Spark 요금제 + Vercel Hobby 플랜 기준

---

## 로컬 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 아래 값을 채웁니다:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
ANTHROPIC_API_KEY=
```

### 3. 개발 서버 시작
```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## 데이터 모델 (Firestore)

```
rooms/{roomId}
  ├── templateId: string | null
  └── zones: { [zoneId]: { x, y, w, h } }   ← KPT 영역 위치

rooms/{roomId}/notes/{noteId}
  ├── content, x, y, colorIndex
  ├── editorId (편집 잠금)
  └── createdAt, createdBy

rooms/{roomId}/cursors/{userId}
  ├── x, y, nickname, color
  ├── device: 'mobile' | 'desktop'
  └── lastSeen
```

---

## 프로젝트 구조

```
src/
  app/
    page.tsx               # 메인 (새 캔버스 만들기)
    room/[roomId]/page.tsx # 캔버스 룸
    api/cluster/route.ts   # Claude AI 프록시 엔드포인트
  components/
    Canvas.tsx             # 무한 캔버스 + 패닝
    StickyNote.tsx         # 포스트잇 카드
    BottomToolbar.tsx      # 하단 툴바
    CursorLayer.tsx        # 다른 사용자 커서 렌더링
    MiniMap.tsx            # 전체 조망 미니맵
    TemplatePickerModal.tsx
    TemplateZoneOverlay.tsx  # KPT 드래그·리사이즈 존
    ClusterGroupOverlay.tsx  # AI 클러스터 그룹 표시
    ClusterPreviewModal.tsx
  hooks/
    useAuth.ts             # 익명 인증 + 닉네임 세션
    useNotes.ts            # 노트 Firestore CRUD
    useCursors.ts          # 커서 실시간 동기화
    useCluster.ts          # AI 클러스터링 상태
    useSpeechToText.ts     # Web Speech API 래핑
    useCanvasGesture.ts    # 핀치줌 제스처
  lib/
    firebase.ts
    templates.ts           # 템플릿 데이터 정의
    applyTemplate.ts       # 템플릿 Firestore 적용
```

---

## 스프린트 기록

| 스프린트 | 내용 | 상태 |
|----------|------|------|
| Sprint 1 | 정적 캔버스 UI (포스트잇 CRUD, 하단 툴바) | ✅ 완료 |
| Sprint 2 | Firebase 연동, 실시간 동기화, 익명 인증, 커서 공유 | ✅ 완료 |
| Sprint 3 | 모바일 최적화, 핀치줌, STT, 반응형 레이아웃 | ✅ 완료 |
| Sprint 4 | AI 클러스터링, 성능 개선, Vercel 배포 | ✅ 완료 |
| Sprint 5 | 캔버스 템플릿 (브레인스토밍, KPT 드래그·리사이즈) | ✅ 완료 |
