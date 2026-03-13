# Sprint 4 배포 체크리스트

**프로덕션 URL:** https://ideaflow-sooty.vercel.app
**배포 플랫폼:** Vercel Hobby Plan
**최종 업데이트:** 2026-03-14

---

## 자동 검증 완료 항목

- ✅ `/api/cluster` 엔드포인트 — 200 OK, Claude 그룹화 정상 동작 (프로덕션 검증)
- ✅ AI 정리 버튼 → 미리보기 모달 → 적용 → 그룹 오버레이 전체 플로우 정상
- ✅ 되돌리기(Undo) 기능 — 원래 위치로 정상 복원
- ✅ 콘솔 에러 0건 확인
- ✅ `.env*` 패턴 `.gitignore`에 포함 — API 키 Git 미포함 확인
- ✅ `ANTHROPIC_API_KEY` Vercel 대시보드 환경변수 설정 완료
- ✅ `npm run build` 에러 없이 성공 (Vercel 자동 빌드)

---

## 수동 검증 필요 항목

### 기능 검증

- ⬜ 두 대의 실제 디바이스(PC + 모바일)에서 동시 접속 후 실시간 노트 동기화 확인
  - 방법: https://ideaflow-sooty.vercel.app → "새 캔버스 만들기" → URL 복사 → 다른 기기에서 접속 → 노트 추가 확인

- ⬜ 음성 메모 + AI 정리 연동 테스트 (모바일 Chrome)
  - 방법: Android Chrome에서 마이크 버튼 클릭 → 음성 입력 → 노트 생성 → AI 정리 실행

### 성능 검증

- ⬜ Lighthouse Performance 90+ 확인
  - 방법: Chrome DevTools → Lighthouse → Performance 탭 → https://ideaflow-sooty.vercel.app 분석

- ⬜ Lighthouse Accessibility 90+ 확인
  - 방법: 위와 동일

### Firebase 운영 검증

- ⬜ Firebase 일일 무료 할당량 내에서 정상 운영 확인
  - 방법: [Firebase 콘솔](https://console.firebase.google.com) → 프로젝트 → 사용량 탭 확인
  - 기준: 일일 읽기 50,000건, 쓰기 20,000건, 삭제 20,000건 미만 유지

---

## 환경변수 설정 현황

### Vercel 대시보드에 설정된 환경변수

| 변수명 | 용도 | 설정 여부 |
|--------|------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 클라이언트 인증 | ✅ 설정됨 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | ✅ 설정됨 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | ✅ 설정됨 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage | ✅ 설정됨 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging | ✅ 설정됨 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 앱 ID | ✅ 설정됨 |
| `ANTHROPIC_API_KEY` | Claude API (서버 전용) | ✅ 설정됨 |

> 참고: `.env.local.example` 파일을 참조하여 로컬 개발 환경 설정

---

## 알려진 제한사항

- **Rate Limiting 서버리스 한계**: Vercel 서버리스 함수는 인스턴스 간 메모리를 공유하지 않아 `/api/cluster`의 `rateLimitMap`이 인스턴스별로 독립 동작함. 클라이언트 측 버튼 쿨다운으로 보완되어 있으나, 엄격한 분당 5회 제한은 보장되지 않음.
  - 향후 개선: Upstash Redis 또는 Vercel KV 사용 고려

- **OG 이미지 없음**: Open Graph 메타태그는 설정되었으나 OG 이미지(`/og-image.png`)가 없어 링크 미리보기에 이미지가 표시되지 않음.
  - 향후 개선: 1200x630 OG 이미지 추가

---

_작성: sprint-close 에이전트 / 2026-03-14_
