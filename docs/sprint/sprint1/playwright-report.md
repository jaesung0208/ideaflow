# Sprint 1 Playwright 검증 보고서

- **작성일**: 2026-03-13
- **스프린트**: Sprint 1 - 정적 캔버스 UI + 로컬 상태 구현
- **브랜치**: sprint1
- **검증 환경**: Next.js dev server (localhost:3000)

---

## 검증 결과 요약

| 시나리오 | 결과 | 비고 |
|---------|------|------|
| 캔버스 초기 렌더링 | ✅ 통과 | 코르크보드 배경 + 하단 툴바 + MiniMap 정상 표시 |
| 콘솔 에러 없음 (초기) | ✅ 통과 | 에러 0건 |
| 노트 추가 (FAB 클릭) | ✅ 통과 | 핀/테이프 장식, 랜덤 색상, 회전 적용된 노트 생성 |
| 노트 편집 (더블클릭) | ✅ 통과 | textarea 활성화, 텍스트 입력 정상 |
| 노트 색상 변경 | ✅ 통과 | 6색 팔레트 표시 → 스카이 블루 선택 → 배경색 변경 |
| 노트 삭제 (× 버튼) | ✅ 통과 | 노트 제거 확인, MiniMap 반영 |
| Cascade 배치 | ✅ 통과 | 다중 노트 20px 오프셋 배치, 다양한 색상/장식 |
| MiniMap 렌더링 | ✅ 통과 | 노트 위치/색상 MiniMap에 실시간 반영 |
| 모바일 375x812 렌더링 | ✅ 통과 | 툴바 하단 고정, 노트 추가 정상 |
| 콘솔 에러 없음 (최종) | ✅ 통과 | 에러 0건 |

**전체 결과: ✅ 10/10 통과**

---

## 시나리오 상세

### 1. 캔버스 초기 렌더링

- `browser_navigate` → http://localhost:3000
- 타이틀: `IdeaFlow - 실시간 아이디어 캔버스` 확인
- 코르크보드 배경(`#c4a472` + 노이즈 텍스처 + 주변 그림자) 렌더링 확인
- 하단 툴바: 노트 추가(활성), AI 정리(비활성), 음성 메모(비활성) 3버튼 확인
- MiniMap(우하단 150x100px, 반투명 크림색) 렌더링 확인
- 스크린샷: `01-initial-render.png`

### 2. 노트 생성

- `add-note-button` 클릭 → 핀/테이프 장식, 랜덤 색상, 회전 적용된 포스트잇 생성 확인
- 종이 질감(상단 하이라이트 + 미세 수평선 + 우하단 페이지 필) 렌더링 확인
- MiniMap에 노트 위치/색상 반영 확인
- 스크린샷: `02-note-created.png`

### 3. 노트 편집 (더블클릭)

- 노트 더블클릭 → `textarea[aria-label="노트 내용 편집"]` 활성화
- "테스트 아이디어" 입력 → Caveat 폰트로 텍스트 표시 확인
- 스크린샷: `03-note-editing.png`

### 4. 색상 변경

- 색상 변경 버튼 클릭 → 6색 팔레트 팝업 표시 확인
- `색상 3 선택` (스카이 블루 `#A8D8FF`) 클릭 → 배경색 변경 확인
- MiniMap에도 새 색상 반영 확인
- 스크린샷: `04-color-changed.png`

### 5. 노트 삭제

- `delete-note-button` 클릭 → 노트 DOM에서 제거 확인
- MiniMap에서도 노트 사라짐 확인
- 스크린샷: `05-note-deleted.png`

### 6. Cascade 배치 및 다양한 장식

- 노트 2개 연속 추가 → 20px cascade 오프셋 배치 확인
- 각 노트 다른 색상(파란색, 피치 오렌지) + 다른 장식(테이프, 핀) 적용 확인
- 스크린샷: `06-cascade-notes.png`

### 7. 모바일 뷰포트 (375x812)

- 뷰포트 375x812 설정 후 레이아웃 정상 유지 확인
- 하단 툴바 화면 하단에 고정 표시 확인
- 노트 크기 `clamp(140px, 42vw, 200px)` 반응형 적용 확인 (~157px)
- 노트 추가 버튼(48px) 터치 타겟 정상 확인
- 스크린샷: `07-mobile-view.png`

### 8. 모바일 노트 추가

- 모바일 뷰포트에서 노트 추가 버튼 정상 동작
- 3개 노트 cascade 배치 및 다양한 색상/장식 확인
- 콘솔 에러 0건 확인
- 스크린샷: `08-mobile-note-add.png`

---

## 스크린샷 목록

| 파일 | 설명 |
|------|------|
| `01-initial-render.png` | 초기 캔버스 (코르크보드 배경 + 툴바 + MiniMap) |
| `02-note-created.png` | 노트 생성 후 (핀 장식, 로즈 핑크, 회전) |
| `03-note-editing.png` | 텍스트 편집 중 ("테스트 아이디어", Caveat 폰트) |
| `04-color-changed.png` | 색상 변경 후 (핑크 → 스카이 블루) |
| `05-note-deleted.png` | 노트 삭제 후 (빈 캔버스 복귀) |
| `06-cascade-notes.png` | Cascade 배치 (2개 노트, 20px 오프셋) |
| `07-mobile-view.png` | 모바일 375x812 뷰포트 |
| `08-mobile-note-add.png` | 모바일에서 3개 노트 추가 |

---

## 수동 검증 필요 항목

| 항목 | 이유 |
|------|------|
| 드래그 이동 | Playwright 포인터 드래그와 Framer Motion 충돌 가능성 |
| 캔버스 패닝 | 마우스 드래그 기반 인터랙션 |
| MiniMap 클릭/드래그 이동 | 포인터 이벤트 기반 내비게이션 |
| Lighthouse 접근성 점수 90+ | 브라우저 DevTools에서 직접 실행 필요 |

---

## 코드 리뷰 이슈

### Medium 이슈 (Phase 2에서 개선 예정)

1. **색상 변경 버튼 터치 타겟 크기 미달**
   - 위치: `StickyNote.tsx` 색상 변경 `<button>` (22x22px)
   - 권장: MIN_TOUCH_TARGET 48px 충족
   - 대응: Phase 2에서 버튼 래퍼 확장

2. **`div[role="button"]` 혼용**
   - 위치: `StickyNote.tsx` 노트 내용 표시 div
   - 권장: 실제 `<button>` 태그로 교체
   - 대응: Phase 2에서 접근성 개선

3. **`caretRangeFromPoint` 비표준 API**
   - 위치: `StickyNote.tsx` 37번째 줄
   - 문제: Firefox/Safari 부분 미지원
   - 대응: `document.caretPositionFromPoint` 폴리필 추가 (Phase 2)

4. **MiniMap `useMemo` 최적화 부재**
   - 위치: `MiniMap.tsx` worldW/worldH 계산
   - 문제: 노트 100개 이상 시 매 렌더마다 `flatMap` 재계산
   - 대응: Phase 4 성능 최적화 시 `useMemo` 적용
