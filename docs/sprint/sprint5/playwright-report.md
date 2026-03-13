# Sprint 5 Playwright 검증 보고서

## 검증 개요

| 항목 | 내용 |
|------|------|
| 검증 일시 | 2026-03-14 |
| 검증 환경 | localhost:3000 (npm run dev) |
| 브라우저 | Playwright (Chromium) |
| 검증 시나리오 | 6개 |
| 전체 결과 | ✅ 통과 (에러 0건) |

---

## 시나리오별 결과

### 시나리오 1: 메인 페이지 로드

- ✅ http://localhost:3000 접속 성공
- ✅ "새 캔버스 만들기" 버튼 렌더링 확인
- ✅ 콘솔 에러 없음

### 시나리오 2: TemplatePickerModal 표시

- ✅ "새 캔버스 만들기" 클릭 시 TemplatePickerModal 표시
- ✅ 모달 내 3개 항목 확인: 빈 캔버스로 시작 / 브레인스토밍 / KPT 회고
- ✅ 모달 닫기(✕) 버튼 존재 확인

**스크린샷:** [01-template-picker-modal.png](01-template-picker-modal.png)

### 시나리오 3: KPT 템플릿 선택 후 캔버스 이동

- ✅ "KPT 회고" 선택 후 `/room/[roomId]`로 이동 확인
- ✅ KPT Zone 가이드라인 (Keep/Problem/Try 점선 테두리) 캔버스 배경에 렌더링
- ✅ KPT 템플릿 노트 배치 확인 (Problem 존 노트 포함)
- ✅ 하단 툴바 4버튼 (노트 추가 / 즐겨찾기 / 음성 / 템플릿 선택) 렌더링

**스크린샷:** [02-kpt-canvas-with-zones.png](02-kpt-canvas-with-zones.png), [03-kpt-canvas-full.png](03-kpt-canvas-full.png)

### 시나리오 4: 기존 캔버스에서 TemplatePickerModal 재호출

- ✅ 하단 툴바 "템플릿 선택" 버튼 클릭 시 TemplatePickerModal 표시
- ✅ 3개 템플릿 카드 정상 표시

### 시나리오 5: 기존 노트 있을 때 확인 다이얼로그

- ✅ 브레인스토밍 선택 시 확인 다이얼로그 표시
- ✅ "현재 캔버스의 노트 6개가 모두 삭제됩니다." 문구 정상 표시
- ✅ 취소 / 적용 버튼 렌더링

**스크린샷:** [04-confirm-dialog.png](04-confirm-dialog.png)

### 시나리오 6: 취소 후 캔버스 직접 복귀

- ✅ "취소" 클릭 시 TemplatePickerModal로 돌아가지 않고 캔버스로 직접 복귀
- ✅ 기존 KPT 상태 유지 (변경 없음)

### 시나리오 7: 모바일(375x812) 레이아웃

- ✅ 375x812 뷰포트에서 하단 툴바 4버튼 균등 배치 확인
- ✅ KPT Zone 가이드라인 모바일에서도 렌더링

**스크린샷:** [05-mobile-toolbar.png](05-mobile-toolbar.png)

### 시나리오 8: 콘솔 에러 확인

- ✅ 전체 검증 과정에서 콘솔 에러 0건

---

## 수동 검증 필요 항목

아래 항목은 Playwright로 자동 검증이 불가능하여 사용자가 직접 확인해야 합니다.

| 항목 | 이유 |
|------|------|
| Firebase Console Firestore 규칙 배포 | 외부 시스템 접근 필요 |
| KPT Zone 드래그 이동 실제 동작 | 포인터 드래그 시퀀스 검증 한계 |
| KPT Zone 리사이즈 실제 동작 | 포인터 드래그 시퀀스 검증 한계 |
| 두 탭 동시 접속 실시간 동기화 | 다중 탭 시나리오 |
| Vercel 프로덕션 환경 전체 기능 동작 | 배포 후 확인 필요 |
| 실제 모바일 기기 터치 동작 | 실제 디바이스 필요 |

---

## 스크린샷 목록

| 파일 | 설명 |
|------|------|
| [01-template-picker-modal.png](01-template-picker-modal.png) | 메인 페이지 TemplatePickerModal |
| [02-kpt-canvas-with-zones.png](02-kpt-canvas-with-zones.png) | KPT 선택 후 캔버스 (닉네임 모달 포함) |
| [03-kpt-canvas-full.png](03-kpt-canvas-full.png) | KPT 캔버스 전체 (Zone + 노트) |
| [04-confirm-dialog.png](04-confirm-dialog.png) | 기존 노트 삭제 확인 다이얼로그 |
| [05-mobile-toolbar.png](05-mobile-toolbar.png) | 모바일(375x812) 하단 툴바 4버튼 |
