# Sprint 1 검증 보고서

- **작성일**: 2026-03-13
- **스프린트**: Sprint 1 - 정적 캔버스 UI + 로컬 상태 구현
- **브랜치**: master (sprint1 커밋 포함)

---

## 빌드 검증

| 항목 | 결과 | 비고 |
|------|------|------|
| `npm run build` | ✅ 성공 | 사용자 확인 완료 |

---

## 코드 리뷰 결과

Critical/High 이슈: **없음**

### Medium 이슈 (추후 개선 권장)

| # | 파일 | 이슈 | 설명 |
|---|------|------|------|
| 1 | `src/components/StickyNote.tsx` | 색상 변경 버튼 터치 타겟 미달 | `w-4 h-4` (16px) → 접근성 기준 최소 48px 미달. 모바일에서 탭 조작이 어려울 수 있음. Phase 2에서 개선 권장. |
| 2 | `src/components/StickyNote.tsx` | `<p role="button">` 혼용 | 비편집 상태 노트 본문에 `role="button"`이 적용된 `<p>` 태그 사용. 스크린리더에서 혼동 가능. `<div>` 또는 `<button>` 태그로 교체 권장. |
| 3 | `src/components/StickyNote.tsx` | 드래그 좌표 계산 의존성 | `handleDragEnd`에서 `note.x + dragX.get()` 방식으로 위치 계산. 빠른 드래그 종료 시 motion value 최신 값 의존으로 미세 오차 가능성 존재. |

### Suggestion (선택적 개선)

| # | 파일 | 이슈 | 설명 |
|---|------|------|------|
| 1 | `src/components/Canvas.tsx` | `motion` import 미사용 | `framer-motion`에서 `motion`을 import하지만 실제로 `<div>`만 사용. 불필요한 import 제거 권장. |
| 2 | `src/lib/constants.ts` | `NEW_NOTE_OFFSET` 미사용 | 정의된 상수이나 `useNotes.ts`에서 참조하지 않음. 제거하거나 `useNotes.ts`에서 활용하도록 통일 권장. |
| 3 | `src/app/layout.tsx` | Geist 폰트 미연결 | `globals.css`에 `--font-geist-sans` 변수 참조가 있으나 `layout.tsx`에서 Geist 폰트 import가 누락됨. 폰트가 fallback(Arial)으로 동작하고 있음. |

---

## Playwright UI 검증

`npm run dev` 서버가 실행 중이지 않아 자동 검증 불가. **수동 검증 필요** 항목으로 분류됩니다.

검증 방법: `deploy.md` 참고

---

## 전체 DoD 검증 현황

| 완료 기준 | 상태 | 방법 |
|----------|------|------|
| `npm run dev` 로컬 렌더링 정상 | ⬜ 수동 확인 필요 | `npm run dev` 후 브라우저에서 확인 |
| 포스트잇 CRUD 동작 | ⬜ 수동 확인 필요 | 브라우저 직접 조작 |
| 모바일 뷰포트(375px) 툴바 고정 | ⬜ 수동 확인 필요 | Chrome DevTools 모바일 에뮬레이션 |
| `npm run build` 성공 | ✅ 완료 | 빌드 성공 확인됨 |
| Lighthouse 접근성 90+ | ⬜ 수동 확인 필요 | Chrome DevTools Lighthouse 실행 |
