---
name: IdeaFlow 프로젝트 현황
description: IdeaFlow 프로젝트의 스프린트 진행 현황 및 주요 기술 결정사항
type: project
---

IdeaFlow - 실시간 아이디어 캔버스 프로젝트. 가입 없이 링크 공유만으로 실시간 포스트잇 협업이 가능한 모바일-퍼스트 캔버스 도구 (운영비 0원 목표).

**현재 상태 (2026-03-14):**
- Sprint 1 (Phase 1: 정적 캔버스 UI): ✅ 완료 (2026-03-13)
- Sprint 2 (Phase 2: Firebase 연동 및 실시간 동기화): ✅ 완료 (2026-03-14)
- Sprint 3 (Phase 3: 모바일 최적화): ✅ 완료 (2026-03-14)
- Sprint 4 (Phase 4: AI 클러스터링 + Vercel 배포): ✅ 완료 (2026-03-14)
- Sprint 5 (Phase 2.5: 캔버스 템플릿 — 브레인스토밍/KPT): ✅ 완료 (2026-03-14)

**MVP 릴리스 완료:**
- 프로덕션 URL: https://ideaflow-sooty.vercel.app
- Sprint 5 PR: https://github.com/jaesung0208/ideaflow/pull/4 (sprint5 → main, OPEN)
- 원격 저장소: https://github.com/jaesung0208/ideaflow.git
- 브랜치 구조: main(기본), master, sprint1, sprint2, sprint3, sprint4, sprint5

**기술 스택:** Next.js 15 (App Router), TypeScript, Firebase (Firestore + Anonymous Auth), Framer Motion, Tailwind CSS, Claude API (claude-haiku-4-5-20251001), Vercel

**중요 결정사항:**
- Firebase uid 대신 sessionStorage 기반 tabId를 커서 식별자로 사용 (탭마다 다른 색상/커서 부여)
- useAuth: NICKNAME_KEY(localStorage), TAB_ID_KEY(sessionStorage), TAB_GREETED_KEY(sessionStorage) 세 가지 키 분리
- 한글 IME 버그: localContent 로컬 state + blur 시 Firestore 저장 방식으로 해결
- throttle: lodash 없이 lib/throttle.ts에 직접 구현 (커서 100ms 간격)
- Claude API 키: 서버 전용 환경변수(ANTHROPIC_API_KEY, NEXT_PUBLIC_ 접두사 없음), Vercel 대시보드 설정

**코드 리뷰 이슈 (Sprint 4, 2026-03-14):**
- CR-1 (Medium): useCluster.ts - requestCluster가 빈 노트도 API에 전송 (nonEmpty 필터 후 notes.map 사용). L69
- CR-2 (Medium): ClusterGroupOverlay.tsx - AnimatePresence 없이 exit prop 선언. exit 애니메이션 동작 안함. L52-82

**코드 리뷰 이슈 (Sprint 5, 2026-03-14):**
- CR-3 (Medium): TemplateZoneOverlay.tsx - onZoneChange가 pointermove마다 Firestore updateDoc 호출. throttling 없어 드래그 시 과다 쓰기 발생. 드래그 종료(pointerup) 시점에 저장 권장.
- CR-4 (Medium): applyTemplate.ts - Firestore batch 500 ops 한계. 기존 노트 499개+templateId+zones 업데이트 시 실패 가능. MVP 범위 허용, 추후 청크 처리 필요.
- CR-5 (Medium): RoomPage - canvasCenter 인라인 객체로 매 렌더마다 재생성. useMemo 메모이제이션 권장.

**알려진 이슈 (Sprint 3에서 이월):**
- I-1: firebase.ts: initializeFirestore HMR 중복 호출 위험
- I-2: firestore.rules: 커서 쓰기 권한 과도 허용 (tabId와 auth.uid 불일치)
- I-3: useSpeechToText: addNote가 content 파라미터를 받지 않아 STT 텍스트가 포스트잇에 미반영
- I-4: useCanvasGesture: transformOrigin 좌표가 viewport 기준이라 핀치줌 중간점 부정확 가능
- I-5: BottomToolbar 음성 메모 버튼 크기 44px (목표 48px 미달)
- I-6 (Sprint 4 신규): rate limiting 서버리스 한계 - Vercel 인스턴스 간 rateLimitMap 공유 안됨

**Why:** Sprint 5에서 캔버스 템플릿(브레인스토밍/KPT) 추가 완료. 이후 백로그 항목(SWOT 등 추가 템플릿, 소셜 로그인, 내보내기 등)은 추후 고려.
**How to apply:** 다음 개선 작업 시 코드 리뷰 이슈(CR-1~CR-5)와 알려진 이슈(I-1~I-6)를 참고하여 우선순위 결정. Sprint 5 신규 알려진 이슈: Zone 드래그 시 Firestore 과다 쓰기(CR-3).
