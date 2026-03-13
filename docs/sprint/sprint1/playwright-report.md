# Sprint 1 Playwright 검증 보고서

- **작성일**: 2026-03-13
- **스프린트**: Sprint 1 - 정적 캔버스 UI + 로컬 상태 구현
- **브랜치**: sprint1
- **검증 환경**: Next.js dev server (localhost:3000)

---

## 검증 결과 요약

| 시나리오 | 결과 | 비고 |
|---------|------|------|
| 캔버스 초기 렌더링 | ✅ 통과 | 격자 배경 + 하단 툴바 정상 표시 |
| 콘솔 에러 없음 (초기) | ✅ 통과 | 에러 0건 |
| 노트 추가 (FAB 클릭) | ✅ 통과 | 캔버스 중앙에 노란색 노트 생성 |
| 노트 편집 (더블클릭) | ✅ 통과 | textarea 활성화, 텍스트 입력 정상 |
| 노트 색상 변경 | ✅ 통과 | 팔레트 표시 → 초록색 선택 → 배경색 변경 |
| 노트 삭제 (× 버튼) | ✅ 통과 | 노트 제거 확인 |
| 모바일 375x812 렌더링 | ✅ 통과 | 툴바 하단 고정, 노트 추가 정상 |
| 콘솔 에러 없음 (최종) | ✅ 통과 | 에러 0건 |

**전체 결과: ✅ 8/8 통과**

---

## 시나리오 상세

### 1. 캔버스 초기 렌더링

- `browser_navigate` → http://localhost:3000
- 타이틀: `IdeaFlow - 실시간 아이디어 캔버스` 확인
- 격자 배경(radial-gradient 24px) 렌더링 확인
- 하단 툴바: 노트 추가(활성), AI 정리(비활성), 음성 메모(비활성) 3버튼 확인
- 스크린샷: `screenshot-01-initial.png`

### 2. 노트 CRUD

- `add-note-button` 클릭 → 노란색 포스트잇 캔버스 중앙 생성 확인
- 스크린샷: `screenshot-02-note-added.png`
- 노트 더블클릭 → `textarea[aria-label="노트 내용 편집"]` 활성화
- "테스트 아이디어" 입력 → 텍스트 표시 확인
- 스크린샷: `screenshot-03-note-edited.png`

### 3. 색상 변경

- 색상 변경 버튼 클릭 → 6색 팔레트 팝업 표시
- `색상 2 선택` (초록 #86EFAC) 클릭 → 배경색 변경 확인
- 스크린샷: `screenshot-04-color-changed.png`

### 4. 노트 삭제

- `delete-note-button` 클릭 → 노트 DOM에서 제거 확인

### 5. 모바일 뷰포트 (375x812)

- 뷰포트 375x812 설정
- 노트 추가 버튼 클릭 → 중앙에 노트 생성 정상
- 하단 툴바 고정 표시 확인 (safe-area-inset-bottom 처리)
- 스크린샷: `screenshot-05-mobile.png`

---

## 스크린샷 목록

| 파일 | 설명 |
|------|------|
| `screenshot-01-initial.png` | 초기 캔버스 (격자 배경 + 툴바) |
| `screenshot-02-note-added.png` | 노트 추가 후 |
| `screenshot-03-note-edited.png` | 텍스트 편집 후 ("테스트 아이디어") |
| `screenshot-04-color-changed.png` | 색상 변경 후 (노란→초록) |
| `screenshot-05-mobile.png` | 모바일 375x812 뷰포트 |
