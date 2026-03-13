# Sprint 5 배포 체크리스트

## 개요

| 항목 | 내용 |
|------|------|
| 스프린트 | Sprint 5 — 캔버스 템플릿 기능 |
| 브랜치 | `sprint5` → `main` |
| 배포 환경 | Vercel Hobby Plan (https://ideaflow-sooty.vercel.app) |
| 기준일 | 2026-03-14 |

---

## 자동 검증 항목

### 빌드 및 타입 검사

- ⬜ `npm run build` — 프로덕션 빌드 성공 여부
- ⬜ `npx tsc --noEmit` — TypeScript 컴파일 에러 없음

### Playwright UI 검증 (sprint-close 자동 실행)

- ⬜ 메인 페이지 로드 정상
- ⬜ "새 캔버스 만들기" 클릭 시 TemplatePickerModal 표시
- ⬜ KPT 템플릿 선택 후 캔버스 이동 및 Zone 가이드라인 렌더링
- ⬜ 하단 툴바 "템플릿" 버튼 동작
- ⬜ 기존 노트 있을 때 확인 다이얼로그 표시
- ⬜ 모바일(375x812) 4버튼 균등 배치
- ⬜ 콘솔 에러 없음

---

## 수동 검증 항목

### Firebase Console — Firestore 규칙 배포 (필수)

- ⬜ Firebase Console(https://console.firebase.google.com) 접속
- ⬜ 해당 프로젝트 선택 → Firestore Database → 규칙 탭 이동
- ⬜ 아래 규칙이 적용되어 있는지 확인 (Sprint 5에서 추가된 `rooms/{roomId}` read/write 포함):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true;
      match /notes/{noteId} {
        allow read, write: if true;
      }
      match /cursors/{cursorId} {
        allow read, write: if true;
      }
    }
  }
}
```

- ⬜ "게시" 버튼 클릭하여 규칙 배포

> 이 규칙이 배포되지 않으면 `rooms/{roomId}.templateId` 및 `rooms/{roomId}.zones` 업데이트가 권한 오류로 실패합니다.

---

### Vercel 배포 확인

- ⬜ `main` 브랜치 PR 머지 후 Vercel 자동 배포 완료 대기
- ⬜ https://ideaflow-sooty.vercel.app 접속하여 정상 렌더링 확인
- ⬜ 새 캔버스 만들기 → KPT 템플릿 선택 → Zone 가이드라인 표시 확인
- ⬜ 실제 기기(모바일)에서 템플릿 선택 및 Zone 드래그 동작 확인

---

### 브라우저 UI 시각적 확인

- ⬜ KPT Zone (Keep/Problem/Try) 점선 테두리 및 반투명 배경 색상 정상 표시
- ⬜ Zone 라벨 바 드래그로 위치 이동 정상 동작
- ⬜ Zone 우하단 리사이즈 핸들로 크기 변경 정상 동작
- ⬜ 브레인스토밍 템플릿 노트 5개 배치 확인 (중심 1개 + 방향 4개)
- ⬜ 두 탭에서 동일 방 접속 시 templateId / zones 변경이 실시간 동기화되는지 확인

---

## 알려진 제약 사항

| 항목 | 내용 |
|------|------|
| batch 500개 제한 | 기존 노트 500개 초과 시 템플릿 적용 실패 (MVP 범위 외, 추후 청크 처리 필요) |
| merge 모드 미지원 | 기존 노트 유지 + 템플릿 노트 추가 기능 미구현 (replace 단일 모드) |
| SWOT 등 추가 템플릿 | MVP 범위 외, Backlog에 기록 |
