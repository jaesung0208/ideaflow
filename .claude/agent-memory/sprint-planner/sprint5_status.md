---
name: Sprint 5 현황
description: Sprint 5 캔버스 템플릿 기능 Task 목록, 핵심 결정 사항, 완료 기준
type: project
---

## Sprint 5: 캔버스 템플릿 기능 구현

**브랜치:** sprint5 (main 분기)
**기간:** 2026-03-14 ~ 2026-03-21
**스펙:** docs/superpowers/specs/2026-03-13-canvas-templates-design.md
**계획:** docs/superpowers/plans/2026-03-13-canvas-templates.md
**스프린트 문서:** docs/sprint/sprint5.md

**Why:** Phase 2.5로 분류된 기능. ROADMAP Backlog의 "캔버스 템플릿" 항목을 실제 구현 스프린트로 승격.

**How to apply:** Sprint 5 계획 수립 시 위 문서를 참조하고, sprint-close 시 ROADMAP Phase 2.5 섹션 완료 표시.

---

## 신규 파일 목록

| 파일 | 역할 |
|------|------|
| `src/lib/templates.ts` | TemplateZone/TemplateNote/CanvasTemplate 타입 + TEMPLATES 상수 |
| `src/lib/applyTemplate.ts` | Firestore batch 기반 템플릿 적용 함수 (replace 모드) |
| `src/components/TemplatePickerModal.tsx` | 템플릿 선택 모달 (확인 다이얼로그 내장) |
| `src/components/TemplateZoneOverlay.tsx` | KPT Zone 가이드라인 렌더러 (pointerEvents: none) |

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/app/page.tsx` | "새 캔버스 만들기" → TemplatePickerModal 먼저 표시 |
| `src/app/room/[roomId]/page.tsx` | TemplateZoneOverlay 추가 + 첫 로드 applyTemplate 1회 호출 + TemplatePickerModal 연결 |
| `src/components/BottomToolbar.tsx` | "템플릿" 버튼 추가 → 4버튼 균등 배치 |
| `src/types/index.ts` | Note 타입에 isTemplateNote?, createdAt?, createdBy? 추가 |

---

## 핵심 아키텍처 결정 사항

- **TEMPLATES 상수 배열**: 정적 JSON. 훅 추상화 없음 (YAGNI). 서버 기반 템플릿 필요 시 래핑.
- **Zone 데이터 저장**: Firestore에는 `rooms/{roomId}.templateId`(string|null)만 저장. 클라이언트가 TEMPLATES 배열에서 조회.
- **MVP 모드**: replace 단일 모드만 지원 (merge 제외).
- **applyTemplate 타이밍**: `useRef(false)` 플래그 + `isLoading` 가드로 React StrictMode 이중 마운트 방어.
- **"빈 캔버스로 시작" (기존 캔버스)**: 기존 노트 유지 + `templateId: null`만 업데이트 (Zone 제거).
- **확인 다이얼로그 "취소"**: picker로 돌아가지 않고 캔버스로 직접 복귀 (스펙 명시).
- **좌표**: 템플릿 노트 좌표는 캔버스 중앙 기준 상대값. applyTemplate에서 viewportCenter 더해 절대 좌표 변환.

---

## Task 완료 기준 (Definition of Done)

- ⬜ 새 캔버스 생성 시 TemplatePickerModal 표시
- ⬜ KPT 선택 시 Zone 가이드라인 + 노트 6개 배치
- ⬜ 브레인스토밍 선택 시 노트 5개 배치
- ⬜ 기존 캔버스 툴바 "템플릿" 버튼 동작
- ⬜ 기존 노트 있을 때 확인 다이얼로그 표시
- ⬜ templateId Firestore 실시간 동기화 (모든 참여자 동일 Zone)
- ⬜ 모바일(375px) 4버튼 균등 배치
- ⬜ npm run build 에러 없음
