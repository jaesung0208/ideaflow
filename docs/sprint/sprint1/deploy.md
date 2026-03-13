# Sprint 1 배포 가이드

## 자동 검증 완료 항목

- ✅ `npm run build` — Turbopack 빌드 성공
- ✅ Playwright 검증 — 8/8 시나리오 통과 (캔버스 렌더링, 노트 CRUD, 색상 변경, 모바일 375px)
- ✅ 콘솔 에러 없음

## 수동 검증 필요 항목

- ⬜ **Lighthouse 접근성 점수 90+**
  1. `npm run dev` 실행
  2. Chrome에서 http://localhost:3000 접속
  3. DevTools → Lighthouse → Accessibility 실행

- ⬜ **드래그 이동 수동 확인** (Playwright로 드래그 좌표 검증 미지원)
  1. `npm run dev` 실행
  2. 노트 추가 → 마우스로 드래그하여 위치 변경 확인

- ⬜ **GitHub 원격 저장소 연결 및 PR 생성** (현재 원격 저장소 미설정)
  ```bash
  # GitHub에 저장소 생성 후 실행
  git remote add origin https://github.com/<user>/<repo>.git
  git push -u origin sprint1
  gh pr create --title "feat: Sprint 1 완료 - 정적 캔버스 UI + 로컬 상태 구현" \
    --body "## 요약
  - Next.js App Router + TypeScript + Tailwind CSS v4 + Framer Motion
  - 포스트잇 CRUD (생성/드래그/편집/삭제/색상 변경)
  - 로컬 상태 기반 (Phase 2에서 Firebase로 전환 예정)
  - 하단 고정 툴바, 모바일 375px 대응" \
    --base main
  ```

## Sprint 2 준비 사항

1. Firebase 프로젝트 생성 (Firebase 콘솔에서 직접 수행)
2. `.env.local` 파일 생성 (`.env.local.example` 참고)
3. Firebase Authentication (익명 로그인) 활성화
4. Firestore 데이터베이스 생성 (테스트 모드)
