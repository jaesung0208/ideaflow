# Sprint 2 배포 및 검증 체크리스트

**스프린트:** Sprint 2 - Firebase 연동 및 실시간 동기화
**완료일:** 2026-03-14
**브랜치:** sprint2

---

## 자동 검증 완료 항목

> sprint-close 에이전트가 Playwright MCP로 자동 실행한 항목입니다.

- ✅ 메인 페이지(`/`) 정상 렌더링
- ✅ "새 캔버스 만들기" 버튼 클릭 시 `/room/[roomId]` 이동
- ✅ 방 최초 접속 시 닉네임 입력 모달 표시
- ✅ Firebase Anonymous Auth 인증 성공 (HTTP 200)
- ✅ Firestore Listen/Write 채널 정상 연결 (HTTP 200)
- ✅ 노트 추가 버튼 동작 - 포스트잇 생성 확인
- ✅ 포스트잇 더블클릭 편집 모드 진입
- ✅ 텍스트 입력 정상 동작
- ✅ 동일 방 URL 재접속 시 노트 Firestore 복원 확인
- ✅ 재접속 시 닉네임 모달 미표시 (sessionStorage 기반)
- ✅ 모바일 뷰(375x812)에서 캔버스 및 하단 툴바 정상 표시
- ✅ 콘솔 에러 없음 (0건)

**자동 검증 결과:** 12/12 통과

---

## 수동 검증 완료 항목

> 사용자가 직접 브라우저에서 확인한 항목입니다.

- ✅ 두 탭/브라우저에서 동일 URL 접속 → 노트 실시간 동기화 확인
- ✅ 다른 브라우저에서 닉네임 모달 표시 확인
- ✅ 탭마다 다른 색상/커서 부여 확인
- ✅ Firebase 일일 할당량 콘솔에서 확인
- ✅ 한글 입력 정상 동작 확인 (IME 버그 수정 후)

---

## 수동 검증 필요 항목

> 자동화가 불가하거나 사용자가 직접 수행해야 하는 항목입니다.

### Firebase 프로젝트 설정 (신규 환경 배포 시)
- ⬜ Firebase 콘솔에서 Anonymous Auth 활성화 확인
  - Firebase Console > Authentication > Sign-in method > Anonymous > 사용 설정
- ⬜ `.env.local` 파일에 Firebase 설정값 입력
  - `.env.local.example`을 복사하여 `.env.local` 생성
  - Firebase Console > 프로젝트 설정 > 내 앱에서 설정값 복사
- ⬜ Firestore 보안 규칙 배포
  ```bash
  firebase deploy --only firestore:rules
  ```
  - 또는 Firebase Console > Firestore > 규칙 탭에서 `firestore.rules` 내용 직접 붙여넣기

### 실시간 기능 검증
- ⬜ 30초 이상 비활성 후 커서 자동 제거 확인
  - 방에 접속 후 30초간 마우스 이동 없이 대기
  - 다른 탭에서 해당 커서가 사라지는지 확인
- ⬜ 두 탭 간 실시간 커서 위치 동기화 시각적 확인
  - 같은 방 URL을 두 탭에서 열고 각기 다른 닉네임 입력
  - 한 탭에서 마우스 이동 시 다른 탭에서 색상/닉네임 라벨 커서 표시 확인

### Vercel 배포 (Phase 4에서 수행)
- ⬜ Vercel 프로젝트 연결
  ```bash
  vercel link
  ```
- ⬜ Vercel 환경변수 설정 (Firebase 설정값 전체)
  ```bash
  vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
  # ... 나머지 환경변수 동일하게 추가
  ```
- ⬜ 프로덕션 빌드 및 배포
  ```bash
  vercel --prod
  ```
- ⬜ 배포 URL에서 전체 기능 동작 확인

---

## 빌드 검증

```bash
npm run build
```

- ✅ 빌드 성공 (에러 없음)

---

## 참고 링크

- [Playwright 검증 보고서](playwright-report.md)
- [Sprint 2 계획 문서](../sprint2.md)
- [ROADMAP.md](../../ROADMAP.md)

