# Sprint 2 Playwright 검증 보고서

**검증 일시:** 2026-03-14
**검증 대상:** http://localhost:3000
**브랜치:** sprint2
**검증 도구:** Playwright MCP

---

## 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 메인 페이지 렌더링 | ✅ 통과 |
| 새 캔버스 만들기 (방 생성) | ✅ 통과 |
| 닉네임 모달 표시 | ✅ 통과 |
| Firebase Anonymous Auth | ✅ 통과 |
| Firestore 실시간 동기화 | ✅ 통과 |
| 노트 추가 | ✅ 통과 |
| 노트 텍스트 편집 | ✅ 통과 |
| 동일 방 URL 재접속 시 노트 복원 | ✅ 통과 |
| 재접속 시 닉네임 모달 미표시 | ✅ 통과 |
| 모바일 뷰(375x812) 레이아웃 | ✅ 통과 |
| 콘솔 에러 없음 | ✅ 통과 |

**전체 결과: 11/11 통과 (0 실패)**

---

## 시나리오별 상세 결과

### 시나리오 1: 메인 페이지 및 방 생성

**단계:**
1. `http://localhost:3000` 접속
2. 페이지 제목 "IdeaFlow - 실시간 아이디어 캔버스" 확인
3. "새 캔버스 만들기" 버튼 클릭
4. `/room/01mn83riui1x` URL로 이동 확인

**결과:** ✅ 통과
**스크린샷:** 없음 (URL 이동으로 확인)

---

### 시나리오 2: 닉네임 모달 및 Firebase Anonymous Auth

**단계:**
1. 방 페이지 로드 후 닉네임 입력 모달 표시 확인
2. "닉네임을 입력하세요" 제목과 입력 필드 렌더링 확인
3. Firebase `identitytoolkit.googleapis.com` Auth 호출 200 응답 확인
4. "테스터" 닉네임 입력 후 "시작하기" 버튼 클릭
5. 모달 닫힘 확인

**결과:** ✅ 통과
**스크린샷:** [01-nickname-modal.png](01-nickname-modal.png)

Firebase 네트워크 요청:
- `POST identitytoolkit.googleapis.com/v1/accounts:lookup` → **200**
- `POST firestore.googleapis.com/.../Listen/channel` → **200**
- `POST firestore.googleapis.com/.../Write/channel` → **200**

---

### 시나리오 3: 캔버스 렌더링 및 노트 추가

**단계:**
1. 캔버스 영역 및 하단 툴바 렌더링 확인
2. "노트 추가(+)" 버튼 클릭
3. 포스트잇 노트 캔버스에 생성 확인
4. 노트 더블클릭으로 편집 모드 진입
5. "실시간 협업 테스트" 텍스트 입력 확인

**결과:** ✅ 통과
**스크린샷:**
- [02-canvas-empty.png](02-canvas-empty.png) - 빈 캔버스
- [03-note-added.png](03-note-added.png) - 노트 추가됨
- [04-note-editing.png](04-note-editing.png) - 텍스트 편집 중

---

### 시나리오 4: Firestore 실시간 동기화 확인

**단계:**
1. 동일 방 URL(`/room/01mn83riui1x`) 재접속
2. 이전에 생성한 노트가 Firestore에서 복원되는지 확인
3. 닉네임 모달이 재표시되지 않는지 확인 (sessionStorage 기반)

**결과:** ✅ 통과
**확인 내용:**
- 재접속 시 "연결 중..." 로딩 후 기존 노트 자동 복원됨
- sessionStorage 기반으로 이미 인사한 탭은 모달 미표시
- Firestore Listen/Write 채널 모두 200 응답

---

### 시나리오 5: 모바일 뷰 검증

**단계:**
1. 뷰포트를 375x812로 조정
2. 캔버스 및 하단 툴바 고정 표시 확인

**결과:** ✅ 통과
**스크린샷:** [05-mobile-view.png](05-mobile-view.png)

---

### 시나리오 6: 콘솔 에러 검증

**결과:** ✅ 통과 (에러 0건)

---

## 네트워크 요청 분석

| 엔드포인트 | 메서드 | 상태 | 역할 |
|-----------|--------|------|------|
| `identitytoolkit.googleapis.com/v1/accounts:lookup` | POST | 200 | Firebase 익명 인증 |
| `firestore.googleapis.com/.../Listen/channel` | POST/GET | 200 | Firestore onSnapshot 구독 |
| `firestore.googleapis.com/.../Write/channel` | POST/GET | 200 | Firestore 노트/커서 쓰기 |

모든 Firebase 요청이 200 응답을 반환하였습니다.

---

## 수동 검증 완료 항목 (사용자 직접 확인)

| 항목 | 결과 |
|------|------|
| 두 탭/브라우저에서 동일 URL 접속 → 실시간 동기화 확인 | ✅ 완료 |
| 다른 브라우저에서 닉네임 모달 표시 확인 | ✅ 완료 |
| 탭마다 다른 색상/커서 부여 확인 | ✅ 완료 |
| Firebase 일일 할당량 콘솔에서 확인 | ✅ 완료 |
| 한글 입력 정상 동작 확인 | ✅ 완료 |

---

## 미검증 항목 (자동화 불가)

- 30초 비활성 후 커서 자동 제거 (타이머 대기 필요)
- 두 탭 간 실시간 커서 위치 동기화 시각적 확인 (멀티탭 Playwright 미지원)

