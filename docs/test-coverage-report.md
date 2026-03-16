# 테스트 커버리지 리포트

> 실행일: 2026-03-16
> 실행 명령: `npx jest --coverage`

## 테스트 결과 요약

```
Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
Snapshots:   0 total
```

## 파일별 커버리지

| 파일 | 구문(Stmts) | 분기(Branch) | 함수(Funcs) | 라인(Lines) | 미커버 라인 |
|------|------------|-------------|------------|------------|-----------|
| **전체** | **97.28%** | **84.61%** | **100%** | **97.28%** | |
| `hooks/useAuth.ts` | 95.94% | 84.61% | 100% | 95.94% | 56-58 |
| `hooks/useCluster.ts` | 96.24% | 83.33% | 100% | 96.24% | 66-70 |
| `hooks/useNotes.ts` | 100% | 84.61% | 100% | 100% | |
| `lib/constants.ts` | 100% | 100% | 100% | 100% | |
| `lib/userColors.ts` | 100% | 100% | 100% | 100% | |

## 테스트 파일 목록

### `src/__tests__/hooks/useAuth.test.ts` (7개)
- 초기 상태에서 loading=true, session=null
- Firebase 인증 완료 후 session 설정
- 인증되지 않은 사용자 → signInAnonymously 호출
- signInAnonymously 실패 시 loading=false 처리
- updateNickname 호출 시 session.nickname 업데이트
- 로컬스토리지에 닉네임 저장
- 컴포넌트 언마운트 시 onAuthStateChanged 구독 해제

### `src/__tests__/hooks/useCluster.test.ts` (9개)
- 초기 상태 (idle, groups=[], errorMessage=null)
- 빈 노트 필터링 후 2개 미만이면 error 상태
- requestCluster 성공 시 preview 상태로 전환
- API 오류 응답 시 error 상태
- 네트워크 오류 시 error 상태
- applyCluster 호출 시 노트 위치 재배치 및 applied 상태
- cancelCluster 호출 시 idle 상태 복귀
- undoCluster 호출 시 이전 노트 위치 복원
- 클라이언트 쿨다운(12초) 적용 확인

### `src/__tests__/hooks/useNotes.test.ts` (12개)
- 초기 상태 (빈 배열)
- Firestore onSnapshot으로 노트 실시간 동기화
- addNote — Firestore addDoc 호출
- updateNote — Firestore updateDoc 호출
- moveNote — x, y를 updateDoc에 전달
- deleteNote — Firestore deleteDoc 호출
- changeColor — colorIndex를 updateDoc에 전달
- 여러 노트 동시 구독 처리
- 노트 정렬 순서 유지
- 컴포넌트 언마운트 시 구독 해제
- createdAt 타임스탬프 포함 확인
- editorId 필드 처리

## CI/CD 연동

GitHub Actions (`.github/workflows/ci.yml`)에서 `npm run test:ci` 명령으로 자동 실행됩니다.
`master` 및 `sprint*` 브랜치 push, PR 생성 시 트리거됩니다.
