# Sprint 3 배포 체크리스트

**작성일:** 2026-03-14
**스프린트:** Sprint 3 - 모바일 최적화 및 음성 메모

---

## 자동 검증 완료 항목

아래 항목은 Playwright MCP를 통해 자동으로 검증되었습니다.

- ✅ `npm run build` 에러 없음
- ✅ 모바일 레이아웃 (375×812): 하단 툴바 정상 배치
- ✅ 노트 추가 버튼 동작 (모바일 뷰포트)
- ✅ 음성 메모 버튼 존재 확인
- ✅ STT 미지원 환경에서 graceful degradation (not-allowed 에러 처리)
- ✅ 반응형 — 데스크톱 (1440×900): 우측 사이드바 표시
- ✅ 반응형 — 태블릿 (768×1024): 사이드바 숨김, 하단 툴바만 표시
- ✅ 반응형 — 모바일 (375×812): 하단 툴바만 표시
- ✅ 콘솔 에러 없음 (STT not-allowed는 테스트 환경에서의 예상 동작)

---

## 수동 검증 필요 항목

> **📌 배포 후 확인 필요:** 아래 항목들은 Vercel 배포 완료 후 실제 URL에서 확인해주세요.
> 로컬 환경에서도 확인 가능하지만, 실제 모바일 기기 접근은 배포 후가 편리합니다.

아래 항목은 실제 모바일 기기 또는 Chrome DevTools에서 직접 확인해야 합니다.

### 핀치줌 제스처

- ⬜ 실제 모바일 기기에서 두 손가락으로 캔버스 핀치줌(확대/축소) 동작 확인
  - 최소 배율 0.3x, 최대 배율 3x 제한 확인
  - 핀치 중 단일 손가락 드래그가 시작되지 않는지 확인 (충돌 방지)
  - 브라우저 기본 핀치줌이 차단되는지 확인 (`user-scalable=no`)

  **검증 방법:**
  ```
  1. Chrome에서 http://localhost:3000/room/test-room 접속
  2. DevTools → Device Toolbar (Ctrl+Shift+M) → 실제 기기 선택 또는
     실제 스마트폰에서 URL 접속
  3. 두 손가락으로 캔버스 영역을 핀치인/핀치아웃
  4. 노트들이 스케일에 맞게 확대/축소되는지 확인
  ```

### 롱프레스 컨텍스트 메뉴

- ⬜ 포스트잇을 500ms 이상 길게 누르면 컨텍스트 메뉴(편집/색상/삭제) 팝업 확인
  - 컨텍스트 메뉴 버튼 각각 동작 확인 (편집 진입, 색상 변경, 삭제)
  - 드래그 중에는 롱프레스가 취소되는지 확인

  **검증 방법:**
  ```
  1. 모바일 기기 또는 DevTools 터치 에뮬레이션에서 접속
  2. 포스트잇 위에서 터치를 500ms 이상 유지
  3. "편집 / 색상 / 삭제" 컨텍스트 메뉴가 표시되는지 확인
  4. 각 버튼 클릭 동작 확인
  ```

### STT 음성 인식

- ⬜ Chrome 브라우저에서 마이크 버튼 클릭 시 권한 요청 다이얼로그 표시 확인
- ⬜ 마이크 권한 허용 후 음성 인식 시작됨 확인 (버튼이 빨간색으로 변경)
- ⬜ 말하는 동안 실시간 중간 결과(interimText)가 말풍선으로 표시됨 확인
- ⬜ 발화 완료 후 새 포스트잇이 캔버스 중앙에 생성됨 확인
- ⬜ Safari(iOS)에서 마이크 버튼이 비활성화(opacity 0.38)되고 툴팁이 표시됨 확인

  **검증 방법:**
  ```
  1. Chrome에서 http://localhost:3000/room/test-room 접속
  2. 하단 툴바의 마이크 버튼 클릭
  3. "마이크 사용 허용" 다이얼로그에서 허용 선택
  4. 짧은 문장을 한국어로 말하기 (예: "안녕하세요 테스트")
  5. 말풍선에 실시간 텍스트가 표시되는지 확인
  6. 발화 완료 후 새 포스트잇 생성 확인
  7. 생성된 포스트잇에 인식된 텍스트 포함 여부 확인
     (현재 구현: 빈 포스트잇 생성 + 콘솔에 텍스트 출력)
  ```

  > **참고:** 현재 구현에서 STT 인식 텍스트는 콘솔(`[STT] 인식된 텍스트: ...`)에 출력되며, 생성되는 포스트잇은 빈 상태입니다. `addNote`에 content 파라미터를 추가하는 것은 향후 개선 항목입니다.

---

## 배포 전 최종 확인

- ⬜ `.env.local`에 Firebase 환경변수 설정 완료
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  ```
- ⬜ Vercel 배포 시 위 환경변수 동일하게 설정
- ⬜ Firebase Firestore 보안 규칙이 프로덕션에 적용되어 있는지 확인

---

## 코드 리뷰 주요 발견 사항

코드 리뷰를 통해 발견된 Medium 이슈 (기록용, 향후 개선 참고):

1. **`useSpeechToText` — STT 결과가 포스트잇에 반영되지 않음** (Medium)
   - 현재: `addNote(x, y)` 시그니처가 content를 받지 않아 인식된 텍스트가 새 포스트잇에 들어가지 않음
   - 개선 방향: `addNote(x, y, content?)` 시그니처 확장

2. **`useCanvasGesture` — `transformOrigin` 좌표계 불일치** (Medium)
   - `originX/Y`는 viewport 기준 좌표이나 `transformOrigin`이 캔버스 컨테이너 상대 좌표여야 함
   - 핀치줌 중 중간점이 정확하지 않을 수 있음. 실제 기기에서 확인 필요.

3. **`useLongPress` — `isLongPressRef` 제거됨** (Minor)
   - 계획 문서에는 있었으나 최종 구현에서 제거됨. 기능에 영향 없으나 `onClick` 이벤트에서 롱프레스 직후 클릭이 같이 발생할 수 있음
   - `onDoubleClick`에서 `setShowContextMenu(false)` 처리로 현재는 정상 동작

4. **`BottomToolbar` — 음성 메모 버튼 터치 타겟 44px** (Minor)
   - 계획의 48px 목표 대비 현재 44px. 접근성 기준(WCAG 2.5.5) 미달
   - 향후 `width: 48, height: 48`로 수정 권장
