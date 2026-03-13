---
name: IdeaFlow 프로젝트 개요
description: IdeaFlow 프로젝트의 기술 스택, 아키텍처, 마일스톤 등 핵심 맥락 정보
type: project
---

IdeaFlow는 가입 없이 링크 공유만으로 실시간 포스트잇 협업이 가능한 모바일-퍼스트 캔버스 도구이다. 운영비 0원을 핵심 제약으로 설계됨.

**기술 스택:**
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
- 애니메이션/제스처: Framer Motion
- DB/실시간: Firebase Firestore (Spark 요금제 무료)
- 인증: Firebase Anonymous Auth
- AI: Gemini 2.5 Flash
- STT: Web Speech API (브라우저 내장)
- 배포: Vercel Hobby Plan

**Phase 구조 (각 2주 스프린트):**
- Phase 1 (Sprint 1): 정적 캔버스 UI - Firebase 없이 로컬 상태만으로 동작하는 프로토타입. 마감: 2026-03-27
- Phase 2 (Sprint 2): Firebase 연동 + 실시간 동기화. 마감: 2026-04-10
- Phase 3 (Sprint 3): 모바일 최적화 + 터치 제스처 + STT. 마감: 2026-04-24
- Phase 4 (Sprint 4): AI 클러스터링 + Vercel 배포. 마감: 2026-05-08

**핵심 아키텍처 결정:**
- useNotes 훅으로 데이터 레이어를 추상화하여 Phase 2에서 내부 구현만 Firestore로 교체
- 컴포넌트 분리: Canvas / StickyNote / BottomToolbar
- 폴더 구조: src/app/, src/components/, src/lib/, src/hooks/, src/types/

**Why:** 운영비 0원 제약과 "Firebase 없이 먼저 UI를 검증"하는 프론트 우선 개발 원칙
**How to apply:** 스프린트 계획 수립 시 Phase 간 의존성과 훅 인터페이스 안정성을 항상 고려
