---
name: Sprint 4 현황
description: IdeaFlow Sprint 4 계획 및 주요 결정 사항 (2026-03-14 기준)
type: project
---

Sprint 4는 Phase 4(AI 클러스터링 + Vercel 최종 배포)에 해당하며 docs/sprint/sprint4.md에 계획이 문서화되어 있다.

**기간:** 2026-03-28 ~ 2026-04-11 (2주)
**브랜치:** sprint4
**마일스톤:** M4 - 프로덕션 릴리스

**Task 목록 (10개):**
- Task 0: 브랜치 확인 및 개발 환경 준비
- Task 1: Gemini 유틸리티 및 타입 정의 (lib/gemini.ts, ClusterResult/ClusterGroup 타입)
- Task 2: Gemini API Route Handler 구현 (app/api/cluster/route.ts, rate limiting)
- Task 3: useCluster 훅 구현 (클러스터링 상태 관리, Undo)
- Task 4: ClusterGroupOverlay 컴포넌트 (그룹 경계 시각화)
- Task 5: ClusterPreviewModal + BottomToolbar AI 정리 버튼 연결
- Task 6: 방 페이지에 클러스터링 기능 통합
- Task 7: Open Graph 메타태그 + Vercel 배포 준비
- Task 8: 에러 처리 및 안정성 (useOnlineStatus 훅, Firebase 재연결) — Should Have
- Task 9: 성능 최적화 (useViewportNotes 가상화) — Should Have (측정 후 필요 시)
- Task 10: Playwright MCP 검증 시나리오 실행

**핵심 기술 결정:**
- Gemini API: 서버 측 Route Handler에서만 호출, GEMINI_API_KEY는 NEXT_PUBLIC_ 접두사 없음
- 프롬프트/파싱 로직: lib/gemini.ts로 분리 (buildClusterPrompt, parseClusterResponse)
- rate limiting: 메모리 기반 Map 카운터 (Redis 등 외부 의존성 없음) + 클라이언트 쿨다운 병행
- 노트 재배치 좌표: 절대 캔버스 좌표 사용 (scale에 무관), 재배치 후 Firestore에 저장
- Undo: useCluster 훅 내 previousNotes 상태로 구현, 복원 시 Firestore 업데이트
- 그룹 시각화: ClusterGroupOverlay 컴포넌트, Framer Motion AnimatePresence로 등장 애니메이션
- 성능 가상화: useViewportNotes 훅 (측정 후 필요한 경우에만 적용 — karpathy-guidelines)
- 오프라인 감지: useOnlineStatus 훅 (navigator.onLine + online/offline 이벤트)

**완료 기준 상태 (2026-03-14 기준):**
- 모든 항목: ⬜ 예정

**Why:** Sprint 4 계획 수립 완료. 서버리스 환경에서 rate limiting의 한계를 인지하고 클라이언트 쿨다운으로 보완하는 전략을 채택.
**How to apply:** Vercel 배포 시 GEMINI_API_KEY 환경변수 설정이 필수 수동 작업임을 사용자에게 안내.
