---
name: Sprint 3 현황
description: IdeaFlow Sprint 3 계획 및 주요 결정 사항 (2026-03-14 기준)
type: project
---

Sprint 3는 Phase 3(모바일 최적화 + 터치 제스처 + STT)에 해당하며 docs/sprint/sprint3.md에 계획이 문서화되어 있다.

**기간:** 2026-03-14 ~ 2026-03-28 (2주)
**브랜치:** sprint3
**마일스톤:** M3 - 모바일 최적화

**Task 목록 (7개):**
- Task 0: 브랜치 생성 및 개발 환경 확인
- Task 1: 터치 제스처 최적화 - useCanvasGesture 훅 구현 및 Canvas 통합
- Task 2: 모바일 UI 개선 - useLongPress 훅, Long Press 컨텍스트 메뉴, h-dvh 키보드 처리
- Task 3: 음성 메모(STT) - useSpeechToText 훅 구현
- Task 4: 음성 메모 UI - BottomToolbar 마이크 버튼 연결, 실시간 미리보기
- Task 5: 반응형 레이아웃 정교화 (Should Have) - 데스크톱 사이드바
- Task 6: Playwright MCP 검증 시나리오 실행

**핵심 기술 결정:**
- 핀치줌: useCanvasGesture 훅으로 격리, CSS transform scale GPU 가속
- 줌-드래그 충돌 방지: touches.length === 2일 때 Framer Motion drag 비활성화
- STT: useSpeechToText 훅 단일 책임 (시작/중지/결과 반환만), webkitSpeechRecognition 폴백
- Long Press: useLongPress 훅 500ms 타이머, 이동 시 취소
- 반응형: Tailwind 브레이크포인트만 사용, 커스텀 미디어쿼리 훅 금지
- viewport: user-scalable=no + next.js viewport export로 브라우저 기본 줌 차단
- 모바일 키보드: h-screen → h-dvh 교체

**완료 기준 상태 (2026-03-14 기준):**
- 모든 항목: ⬜ 예정

**Why:** Sprint 3 계획 수립 완료. Sprint 2의 useNotes/useCursors 훅 인터페이스를 유지하면서 제스처/STT 레이어 추가.
**How to apply:** Sprint 4 계획 시 useCanvasGesture의 scale 상태가 Gemini AI 클러스터링 노트 재배치 애니메이션에 영향을 줄 수 있으므로 확인 필요.
