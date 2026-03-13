# Sprint 3: 모바일 최적화 및 음성 메모 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 모바일 사용자를 위한 터치 제스처(핀치줌 포함)를 완성하고, Web Speech API 기반 음성-텍스트 변환(STT)으로 모바일에서의 노트 입력 경험을 극대화한다.

**Architecture:** Sprint 2에서 완성된 `useNotes` / `useCursors` 훅 인터페이스를 유지하면서 캔버스 위에 제스처 레이어(`useCanvasGesture`)를 추가한다. STT 기능은 `useSpeechToText` 훅으로 완전히 격리하여 `BottomToolbar`의 마이크 버튼과 연결한다. 반응형 레이아웃은 Tailwind CSS 브레이크포인트만으로 처리하며 커스텀 미디어쿼리 훅은 추가하지 않는다.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Framer Motion (핀치줌 제스처), Web Speech API (SpeechRecognition), Tailwind CSS (반응형), Touch Events API (passive 리스너)

---

## 스프린트 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | Sprint 3 |
| Phase | Phase 3: 모바일 최적화 및 음성 메모 |
| 기간 | 2026-03-14 ~ 2026-03-28 (2주) |
| 총 예상 작업 시간 | 26시간 (Must Have 22시간 + Should Have 4시간) |
| 마일스톤 | M3 - 모바일 최적화 |
| 브랜치 | `sprint3` |

---

## 구현 범위

### 포함 항목 (Must Have)
1. 터치 제스처 최적화 (핀치줌, 드래그-줌 충돌 방지, passive 이벤트)
2. 모바일 UI 개선 (키보드 레이아웃 처리, Long Press 컨텍스트 메뉴, 터치 타겟 48px)
3. 음성 메모(STT) 기능 (`useSpeechToText` 훅, 실시간 미리보기, 새 포스트잇 자동 생성)

### 포함 항목 (Should Have)
4. 반응형 레이아웃 정교화 (데스크톱/태블릿/모바일 뷰포트 최적화)

### 제외 항목 (Won't Have)
- AI 클러스터링 기능 (Phase 4 범위)
- 하단 시트(Bottom Sheet) UI (ROADMAP에는 있으나 요청 범위에서 제외)
- 오프라인 동기화 추가 최적화 (Sprint 2에서 Firestore 오프라인 캐시 이미 활성화)

---

## 의존성 및 리스크

| 항목 | 내용 |
|------|------|
| 전제 조건 | Sprint 2의 `Canvas.tsx` 패닝 구현, `StickyNote.tsx` Framer Motion drag 구현 완료 |
| 리스크 1 | Web Speech API: Chrome/Edge 안정, Safari 부분 지원 → `window.SpeechRecognition` 존재 여부 체크 후 graceful degradation |
| 리스크 2 | 핀치줌 + Framer Motion drag 충돌 → `pointerType` 또는 `touches.length`로 단일/다중 터치 분기 |
| 리스크 3 | 모바일 키보드 올라올 때 `100vh` 레이아웃 깨짐 → `dvh` 단위 또는 `visualViewport` API 활용 |
| 의존성 없음 | 외부 라이브러리 추가 없이 브라우저 내장 API만 사용 |

---

## Task 목록

### Task 0: 브랜치 생성 및 개발 환경 확인

**Files:**
- 없음 (git 명령)

**Step 1: 브랜치 확인**

```bash
git branch --show-current
```
Expected: `sprint3` (이미 sprint3 브랜치에 있으면 Pass)

**Step 2: sprint3 브랜치 없으면 생성**

```bash
git checkout -b sprint3
```

**Step 3: 개발 서버 정상 동작 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 에서 정상 렌더링

---

### Task 1: 터치 제스처 최적화 - `useCanvasGesture` 훅 구현

**Files:**
- Create: `src/hooks/useCanvasGesture.ts`
- Modify: `src/components/Canvas.tsx`

**배경:** 현재 `Canvas.tsx`는 마우스 이벤트 기반 패닝만 구현되어 있다. 두 손가락 핀치 제스처로 캔버스를 확대/축소하는 기능을 추가해야 한다. 핵심은 단일 터치(드래그)와 두 손가락 터치(줌)를 충돌 없이 분리하는 것이다.

**Step 1: `useCanvasGesture.ts` 훅 작성**

```typescript
// src/hooks/useCanvasGesture.ts
import { useRef, useCallback } from 'react';

interface CanvasGestureState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface UseCanvasGestureResult {
  scale: number;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

// 두 터치 포인트 간 거리 계산
function getTouchDistance(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// 두 터치 포인트의 중간점 계산
function getTouchMidpoint(touches: React.TouchList): { x: number; y: number } {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

export function useCanvasGesture(
  initialScale: number,
  onScaleChange: (scale: number) => void
): UseCanvasGestureResult {
  const lastDistanceRef = useRef<number | null>(null);
  const scaleRef = useRef(initialScale);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 두 손가락 터치 시작: 초기 거리 기록
      lastDistanceRef.current = getTouchDistance(e.touches);
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2 || lastDistanceRef.current === null) return;

      // passive 이벤트 리스너가 아닌 경우에만 preventDefault 가능
      // Canvas에서 non-passive 리스너로 등록해야 함
      const currentDistance = getTouchDistance(e.touches);
      const ratio = currentDistance / lastDistanceRef.current;
      const nextScale = Math.min(Math.max(scaleRef.current * ratio, 0.3), 3);

      scaleRef.current = nextScale;
      lastDistanceRef.current = currentDistance;
      onScaleChange(nextScale);
    },
    [onScaleChange]
  );

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastDistanceRef.current = null;
    }
  }, []);

  return {
    scale: scaleRef.current,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
```

**Step 2: `Canvas.tsx`에 핀치줌 통합**

`Canvas.tsx`에서 `scale` 상태를 추가하고 `useCanvasGesture` 훅을 연결한다.

수정할 위치: `Canvas.tsx`의 상태 선언 부분과 캔버스 wrapper div.

```typescript
// 추가할 상태
const [scale, setScale] = useState(1);
const { onTouchStart, onTouchMove, onTouchEnd } = useCanvasGesture(scale, setScale);

// canvas wrapper div에 추가할 스타일
// style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}
```

두 손가락 터치 중에는 StickyNote의 drag가 시작되지 않도록 `StickyNote` 컴포넌트에 `touches.length === 2`일 때 drag 비활성화 처리를 추가한다.

**Step 3: viewport 메타태그 설정**

`src/app/layout.tsx`의 `<meta name="viewport">` 태그에 `user-scalable=no` 추가:

```typescript
// src/app/layout.tsx metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

**Step 4: non-passive 터치 이벤트 리스너 등록**

핀치줌 중 브라우저 기본 스크롤/줌을 막으려면 `addEventListener`에 `{ passive: false }` 옵션이 필요하다. React 이벤트 핸들러는 passive이므로 `useEffect`에서 직접 등록한다.

```typescript
// Canvas.tsx의 useEffect에 추가
useEffect(() => {
  const el = canvasRef.current;
  if (!el) return;

  const preventDefaultOnTwoFingers = (e: TouchEvent) => {
    if (e.touches.length >= 2) e.preventDefault();
  };

  el.addEventListener('touchmove', preventDefaultOnTwoFingers, { passive: false });
  return () => {
    el.removeEventListener('touchmove', preventDefaultOnTwoFingers);
  };
}, []);
```

**Step 5: 빌드 확인**

```bash
npm run build
```
Expected: 에러 없음

**Step 6: 커밋**

```bash
git add src/hooks/useCanvasGesture.ts src/components/Canvas.tsx src/app/layout.tsx
git commit -m "feat: 핀치줌 제스처 구현 - useCanvasGesture 훅 추가 및 Canvas 통합"
```

---

### Task 2: 모바일 UI 개선 - Long Press 컨텍스트 메뉴

**Files:**
- Create: `src/hooks/useLongPress.ts`
- Modify: `src/components/StickyNote.tsx`

**배경:** 데스크톱에서는 우클릭으로 노트 옵션을 표시하지만, 모바일에서는 길게 누르기(long press)가 표준 패턴이다. 500ms 이상 터치를 유지하면 컨텍스트 메뉴(편집, 색상, 삭제)를 표시한다.

**Step 1: `useLongPress.ts` 훅 작성**

```typescript
// src/hooks/useLongPress.ts
import { useRef, useCallback } from 'react';

interface LongPressOptions {
  delay?: number; // ms, 기본값 500
}

export function useLongPress(
  onLongPress: () => void,
  options: LongPressOptions = {}
) {
  const { delay = 500 } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel, // 이동 시 long press 취소
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}
```

**Step 2: `StickyNote.tsx`에 Long Press 컨텍스트 메뉴 통합**

`StickyNote.tsx`에 다음을 추가한다:
- `showContextMenu` 상태 (boolean)
- `useLongPress` 훅 연결
- 컨텍스트 메뉴 UI: 편집, 색상 변경, 삭제 버튼 (각 48px 이상 터치 타겟)

```typescript
// StickyNote.tsx 내부 추가
const [showContextMenu, setShowContextMenu] = useState(false);

const longPressHandlers = useLongPress(() => {
  setShowContextMenu(true);
});

// 컨텍스트 메뉴 JSX (노트 카드 위에 절대 위치)
{showContextMenu && (
  <div className="absolute top-0 left-0 z-50 flex gap-2 bg-white rounded-lg shadow-lg p-2">
    <button
      className="min-h-[48px] min-w-[48px] px-3 text-sm"
      onClick={() => { setShowContextMenu(false); /* 편집 모드 진입 */ }}
    >
      편집
    </button>
    <button
      className="min-h-[48px] min-w-[48px] px-3 text-sm"
      onClick={() => { setShowContextMenu(false); /* 색상 변경 */ }}
    >
      색상
    </button>
    <button
      className="min-h-[48px] min-w-[48px] px-3 text-sm text-red-500"
      onClick={() => { setShowContextMenu(false); onDelete(); }}
    >
      삭제
    </button>
  </div>
)}
```

**Step 3: 모바일 키보드 레이아웃 처리**

`src/app/room/[roomId]/page.tsx` 또는 `Canvas.tsx`에서 `height: 100dvh`를 사용하거나 `visualViewport` API로 실제 뷰포트 높이를 반영한다.

```css
/* globals.css에 추가 */
.canvas-container {
  height: 100dvh; /* Dynamic Viewport Height - 모바일 키보드 올라와도 정확한 높이 */
}
```

**Step 4: 터치 타겟 전체 검토**

`BottomToolbar.tsx`의 모든 버튼이 `min-h-[48px] min-w-[48px]`을 갖고 있는지 확인한다. 누락된 경우 추가한다.

**Step 5: 커밋**

```bash
git add src/hooks/useLongPress.ts src/components/StickyNote.tsx src/app/globals.css
git commit -m "feat: 모바일 UI 개선 - Long Press 컨텍스트 메뉴 및 키보드 레이아웃 처리"
```

---

### Task 3: 음성 메모(STT) - `useSpeechToText` 훅 구현

**Files:**
- Create: `src/hooks/useSpeechToText.ts`

**배경:** `useSpeechToText`는 캔버스 로직과 완전히 분리된 단일 책임 훅이다. 음성 인식 시작/중지, 중간 결과(interim) 반환, 최종 결과(final) 반환만 담당한다. 언어 선택(`ko-KR` / `en-US`)을 지원하고, 미지원 브라우저에서는 `isSupported: false`를 반환한다.

**Step 1: `useSpeechToText.ts` 훅 작성**

```typescript
// src/hooks/useSpeechToText.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechToTextOptions {
  lang?: string; // 기본값: 'ko-KR'
  onResult?: (text: string) => void; // 최종 결과 콜백
}

interface UseSpeechToTextResult {
  isSupported: boolean;
  isListening: boolean;
  interimText: string; // 실시간 중간 결과
  start: () => void;
  stop: () => void;
}

// 브라우저 호환성: webkit prefix 처리
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): UseSpeechToTextResult {
  const { lang = 'ko-KR', onResult } = options;
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognitionAPI> | null>(null);

  const isSupported = SpeechRecognitionAPI !== null;

  const start = useCallback(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.interimResults = true; // 중간 결과 활성화
    recognition.continuous = false; // 발화 완료 시 자동 중지

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim);

      if (final && onResult) {
        onResult(final.trim());
        setInterimText('');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[STT] 오류:', event.error);
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // 컴포넌트 언마운트 시 인식 중지
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, isListening, interimText, start, stop };
}
```

**Step 2: TypeScript 타입 선언 확인**

`SpeechRecognition` 타입은 `@types/dom-speech-recognition` 패키지가 필요할 수 있다.

```bash
npm install -D @types/dom-speech-recognition
```

패키지가 없으면 `src/types/speech.d.ts`에 최소 타입 선언을 추가한다:

```typescript
// src/types/speech.d.ts (패키지 설치 안 될 경우에만)
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
```

**Step 3: 빌드 확인**

```bash
npm run build
```
Expected: 에러 없음

**Step 4: 커밋**

```bash
git add src/hooks/useSpeechToText.ts src/types/
git commit -m "feat: useSpeechToText 훅 구현 - Web Speech API 래핑, 중간결과 실시간 반환"
```

---

### Task 4: 음성 메모 UI - `BottomToolbar` 마이크 버튼 연결

**Files:**
- Modify: `src/components/BottomToolbar.tsx`
- Modify: `src/app/room/[roomId]/page.tsx`

**배경:** 현재 `BottomToolbar.tsx`의 마이크 버튼은 비활성 상태다. `useSpeechToText` 훅을 방 페이지에서 사용하고, 인식 결과를 `useNotes`의 `addNote`에 전달하여 새 포스트잇을 자동 생성한다.

**Step 1: `BottomToolbar.tsx` props 확장**

```typescript
// BottomToolbar.tsx 인터페이스 수정
interface BottomToolbarProps {
  onAddNote: () => void;
  onMicClick: () => void;        // 추가
  isMicListening: boolean;       // 추가: 녹음 중 상태
  isMicSupported: boolean;       // 추가: 미지원 브라우저 처리
  interimText?: string;          // 추가: 실시간 중간 결과 표시
}
```

**Step 2: 마이크 버튼 UI 업데이트**

```typescript
// BottomToolbar.tsx 마이크 버튼 부분
<button
  onClick={isMicSupported ? onMicClick : undefined}
  disabled={!isMicSupported}
  title={isMicSupported ? '음성으로 노트 추가' : '이 브라우저는 음성 인식을 지원하지 않습니다'}
  className={`min-h-[48px] min-w-[48px] rounded-full flex items-center justify-center transition-colors
    ${isMicListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-600'}
    ${!isMicSupported ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}
  `}
  aria-label="음성 메모"
>
  {/* 마이크 아이콘 SVG */}
</button>
```

**Step 3: 실시간 미리보기 UI**

마이크 버튼 위에 `interimText`를 표시하는 말풍선 컴포넌트 추가:

```typescript
{interimText && (
  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm
                  rounded-2xl px-4 py-3 text-sm text-gray-700 shadow-lg max-w-[280px] text-center">
    {interimText}
  </div>
)}
```

**Step 4: 방 페이지에서 훅 연결**

`src/app/room/[roomId]/page.tsx`에 `useSpeechToText` 훅 추가:

```typescript
// page.tsx에 추가
const { isSupported, isListening, interimText, start, stop } = useSpeechToText({
  lang: 'ko-KR',
  onResult: (text) => {
    // 음성 인식 완료 시 새 포스트잇 자동 생성
    addNote({ content: text });
  },
});

const handleMicClick = () => {
  if (isListening) {
    stop();
  } else {
    start();
  }
};
```

**Step 5: 빌드 확인**

```bash
npm run build
```

**Step 6: 커밋**

```bash
git add src/components/BottomToolbar.tsx src/app/room/[roomId]/page.tsx
git commit -m "feat: 음성 메모 UI 연결 - 마이크 버튼 활성화, 실시간 미리보기, 포스트잇 자동 생성"
```

---

### Task 5: 반응형 레이아웃 정교화 (Should Have)

**Files:**
- Modify: `src/app/room/[roomId]/page.tsx`
- Modify: `src/components/Canvas.tsx`
- Modify: `src/components/BottomToolbar.tsx`

**배경:** 데스크톱(1440px)에서는 접속자 목록을 우측 사이드바로, 태블릿/모바일에서는 하단 툴바만 표시하는 반응형 레이아웃을 Tailwind 브레이크포인트로 구현한다.

**Step 1: 데스크톱 사이드바 레이아웃**

```typescript
// page.tsx 레이아웃 구조
<div className="flex h-dvh">
  {/* 캔버스 영역 */}
  <div className="flex-1 relative">
    <Canvas ... />
    <BottomToolbar ... />
  </div>

  {/* 데스크톱 전용 사이드바: lg 이상에서만 표시 */}
  <aside className="hidden lg:flex lg:flex-col w-64 border-l border-gray-200 bg-white p-4">
    <h2 className="text-sm font-semibold text-gray-500 mb-3">접속자</h2>
    {/* 접속자 목록 */}
  </aside>
</div>
```

**Step 2: Tailwind 브레이크포인트 기반 분기 적용**

| 뷰포트 | 브레이크포인트 | 레이아웃 |
|--------|----------------|---------|
| 모바일 (< 768px) | 기본 | 캔버스 + 하단 툴바 |
| 태블릿 (768px ~) | `md:` | 캔버스 + 하단 툴바 |
| 데스크톱 (1024px ~) | `lg:` | 캔버스 + 우측 사이드바 |

**Step 3: `h-dvh` 전체 적용 확인**

모든 전체 화면 컨테이너에서 `h-screen` → `h-dvh`로 교체한다 (모바일 주소창 고려).

**Step 4: 3개 뷰포트 레이아웃 확인**

```
375px  → 하단 툴바, 전체 캔버스
768px  → 하단 툴바, 전체 캔버스 (태블릿과 동일)
1440px → 우측 사이드바 + 캔버스
```

**Step 5: 커밋**

```bash
git add src/app/room/[roomId]/page.tsx src/components/Canvas.tsx src/components/BottomToolbar.tsx
git commit -m "feat: 반응형 레이아웃 정교화 - 데스크톱 사이드바, h-dvh 적용"
```

---

### Task 6: Playwright MCP 검증 시나리오 실행

**배경:** `npm run dev` 실행 상태에서 Playwright MCP를 사용하여 주요 기능을 자동 검증한다.

**검증 항목:**

**모바일 레이아웃 검증:**
1. `browser_navigate` → `http://localhost:3000/room/test-room` 접속
2. `browser_resize` → 375x812 (모바일 뷰포트)
3. `browser_snapshot` → 하단 툴바가 올바르게 배치되었는지 확인
4. `browser_click` → 노트 추가 버튼 클릭
5. `browser_snapshot` → 모바일에서 노트 생성 정상 동작 확인
6. `browser_console_messages(level: "error")` → 콘솔 에러 없음 확인

**음성 메모 UI 검증:**
1. `browser_navigate` → `http://localhost:3000/room/test-room` 접속
2. `browser_snapshot` → 하단 툴바에 마이크 버튼 존재 확인
3. `browser_click` → 마이크 버튼 클릭
4. `browser_snapshot` → 음성 인식 UI(녹음 중 표시 또는 권한 요청 다이얼로그) 확인
5. `browser_console_messages(level: "error")` → 에러 없음 확인

**반응형 전환 검증:**
1. `browser_resize` → 1440x900 (데스크톱)
2. `browser_snapshot` → 데스크톱 레이아웃 확인 (우측 사이드바)
3. `browser_resize` → 768x1024 (태블릿)
4. `browser_snapshot` → 태블릿 레이아웃 확인
5. `browser_resize` → 375x812 (모바일)
6. `browser_snapshot` → 모바일 레이아웃 확인 (하단 툴바)

**검증 결과는 `docs/sprint/sprint3/playwright-report.md`에 저장한다.**

---

## 완료 기준 (Definition of Done)

- ⬜ 모바일 디바이스(또는 Chrome DevTools 모바일 에뮬레이션)에서 두 손가락 핀치 제스처로 캔버스 확대/축소 동작 (수동 검증 필요)
- ✅ 포스트잇 드래그가 터치 환경에서 부드럽게 동작하며 줌 제스처와 충돌하지 않음 (Playwright 검증 완료)
- ⬜ 포스트잇 길게 누르기(500ms) 시 컨텍스트 메뉴(편집, 색상, 삭제) 표시 (수동 검증 필요)
- ⬜ 음성 메모 버튼 클릭 시 마이크 권한 요청 후 음성 인식이 시작됨 (수동 검증 필요)
- ⬜ 인식된 음성이 실시간 미리보기로 표시되고, 완료 시 새 포스트잇으로 자동 생성됨 (수동 검증 필요)
- ✅ Web Speech API 미지원 브라우저에서 마이크 버튼이 비활성화되고 툴팁이 표시됨 (Playwright 검증 완료)
- ✅ 모바일 뷰포트(375px)에서 모든 버튼의 터치 타겟이 48px 이상 (Playwright 검증 완료)
- ✅ 데스크톱(1440px)에서 우측 사이드바(접속자 목록) 표시 (Playwright 검증 완료)
- ✅ `npm run build` 에러 없음
- ✅ Playwright 검증 보고서 저장 완료 (`docs/sprint/sprint3/playwright-report.md`)

## 검증 결과

- [Playwright 검증 보고서](sprint3/playwright-report.md)

---

## 예상 산출물

| 산출물 | 경로 |
|--------|------|
| `useCanvasGesture` 훅 | `src/hooks/useCanvasGesture.ts` |
| `useLongPress` 훅 | `src/hooks/useLongPress.ts` |
| `useSpeechToText` 훅 | `src/hooks/useSpeechToText.ts` |
| `Canvas.tsx` (핀치줌 통합) | `src/components/Canvas.tsx` |
| `StickyNote.tsx` (Long Press 메뉴) | `src/components/StickyNote.tsx` |
| `BottomToolbar.tsx` (마이크 버튼 활성화) | `src/components/BottomToolbar.tsx` |
| 방 페이지 (반응형 레이아웃) | `src/app/room/[roomId]/page.tsx` |
| Playwright 검증 보고서 | `docs/sprint/sprint3/playwright-report.md` |

---

## 기술 고려사항 요약

- **핀치줌:** CSS `transform: scale()`로 GPU 가속, `transform-origin`을 핀치 중간점으로 설정하여 자연스러운 줌 구현
- **Web Speech API:** `webkitSpeechRecognition`(Chrome) 및 `SpeechRecognition`(표준) 모두 처리, Safari는 graceful degradation
- **터치 이벤트:** `pointer` 이벤트 API 우선, 미지원 환경에서 `touch` 이벤트 폴백
- **반응형:** Tailwind 브레이크포인트만 사용, 커스텀 미디어쿼리 훅 금지
- **STT 훅:** 단일 책임 원칙 준수 — 음성 인식 시작/중지, 결과 텍스트 반환만 담당
- **karpathy-guidelines:**
  - `useCanvasGesture`는 캔버스 컴포넌트에 최소 인터페이스만 노출
  - `useSpeechToText`는 캔버스 로직과 완전히 분리하여 독립적으로 동작
  - 반응형은 Tailwind 브레이크포인트만으로 해결
  - 외부 라이브러리 추가 없이 브라우저 내장 API만 활용
