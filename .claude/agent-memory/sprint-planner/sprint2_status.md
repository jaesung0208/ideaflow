---
name: Sprint 2 현황
description: IdeaFlow Sprint 2 계획 및 주요 결정 사항 (2026-03-13 기준)
type: project
---

Sprint 2는 Phase 2(Firebase 연동 + 실시간 동기화)에 해당하며 docs/sprint/sprint2.md에 계획이 문서화되어 있다.

**기간:** 2026-03-13 ~ 2026-03-27 (2주)
**브랜치:** sprint2
**마일스톤:** M2 - 실시간 협업 MVP

**Task 목록 (7개):**
- Task 0: Sprint 1 이월 이슈 해소 (터치 타겟 48px, 시맨틱 태그, 미사용 import)
- Task 1: Firebase 프로젝트 설정 (lib/firebase.ts, .env.local.example, firestore.rules)
- Task 2: 익명 인증 및 사용자 세션 (useAuth 훅, NicknameModal, userColors 유틸)
- Task 3: 방 라우팅 구현 (/room/[roomId] 동적 라우트, 메인 랜딩 페이지)
- Task 4: Firestore 실시간 동기화 (useNotes 훅 Firestore 전환, 편집 잠금)
- Task 5: 실시간 커서 공유 (useCursors 훅, throttle 유틸, CursorLayer 컴포넌트)
- Task 6: 방 페이지 최종 통합

**완료 기준 (2026-03-13 기준):**
- 모든 항목: ⬜ 예정

**핵심 기술 결정:**
- useNotes 외부 인터페이스는 Sprint 1과 동일하게 유지 (내부 구현만 Firestore로 교체)
- throttle은 lodash 없이 lib/throttle.ts에 커서 전용 최소 구현
- Firestore 데이터 구조: rooms/{roomId}/notes/{noteId}, rooms/{roomId}/cursors/{userId}
- 커서 100ms throttling으로 Firebase 무료 할당량 보존

**Why:** Sprint 2 계획 수립 완료. Firebase 연동 전 환경변수 설정이 선행 필요.
**How to apply:** Sprint 3 계획 시 useCursors/useNotes 훅 인터페이스 안정성 확인 후 모바일 제스처 확장 계획 수립
