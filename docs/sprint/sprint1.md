# Sprint 1: 정적 캔버스 UI + 로컬 상태 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Firebase 없이 로컬 상태만으로 동작하는 포스트잇 캔버스 UI를 구현하여, 노트 생성/편집/이동/삭제가 가능한 정적 프로토타입을 완성한다.

**Architecture:** Next.js App Router 기반의 단일 캔버스 페이지를 구성하고, 모든 상태는 커스텀 훅(`useNotes`)으로 추상화하여 향후 Firebase 전환이 용이하도록 설계한다. Framer Motion의 `drag` prop으로 드래그를 처리하고, 컴포넌트는 Canvas / StickyNote / BottomToolbar 3개 레이어로 명확히 분리한다.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion

---

## 스프린트 개요

- **스프린트 번호**: Sprint 1
- **해당 Phase**: Phase 1 - 프로젝트 셋업 및 정적 캔버스 UI
- **기간**: 2026-03-13 ~ 2026-03-27 (2주)
- **마일스톤**: M1 - 정적 프로토타입 (로컬 동작 캔버스 데모, 사용자 검토용)
- **브랜치**: `sprint1`

## 구현 범위

### 포함 (In Scope)

- Next.js 프로젝트 초기화 및 기본 설정
- TypeScript 타입 정의 (`Note`, `Cursor`, `User`, 색상 팔레트)
- 무한 캔버스 컴포넌트 (CSS transform 기반 패닝)
- 포스트잇(`StickyNote`) 컴포넌트
- Framer Motion `drag` 기반 드래그 이동
- 로컬 상태 기반 노트 CRUD (`useNotes` 훅 - `useReducer` 사용)
- 하단 고정 툴바 (노트 추가 FAB 버튼, 터치 타겟 48px 이상)
- 노트 인라인 텍스트 편집 (더블클릭/더블탭)
- 노트 삭제 (× 버튼)
- 노트 색상 변경 팔레트 (6가지 색상)

### 제외 (Out of Scope)

- Firebase 연동 (Phase 2에서 구현)
- 실시간 동기화 (Phase 2에서 구현)
- 익명 인증 / 사용자 세션 (Phase 2에서 구현)
- 핀치줌 제스처 (Phase 3에서 구현)
- 음성 메모 STT (Phase 3에서 구현)
- AI 클러스터링 (Phase 4에서 구현)

---

## 기술적 접근 방법

### karpathy-guidelines 준수 원칙

- **최소 구현**: Firebase 코드를 미리 작성하지 않음. 로컬 상태로만 동작하는 최소 구현으로 시작
- **인터페이스 먼저**: `useNotes` 훅의 공개 인터페이스(`notes`, `addNote`, `updateNote`, `moveNote`, `deleteNote`, `changeColor`)를 먼저 확정하고 내부 구현은 단순한 `useReducer`로 시작
- **단순한 캔버스 패닝**: CSS `transform` 기반 최소 구현. 복잡한 가상화(virtualizing) 없음
- **상수 파일 최소화**: 색상 팔레트 등 상수는 `src/lib/constants.ts`에 정의하되 과도한 추상화 금지

### 드래그 구현 전략

Framer Motion의 `drag` prop을 사용하며 `dragMomentum={false}`로 관성을 비활성화한다. `onDragEnd`에서 최종 좌표를 `useNotes`의 `moveNote`로 업데이트한다. 편집 중(`isEditing === true`)에는 드래그를 비활성화하여 텍스트 선택과의 충돌을 방지한다.

### Phase 1 → Phase 2 전환 전략

`useNotes` 훅의 공개 인터페이스를 변경하지 않고 내부 구현만 Firestore `onSnapshot`으로 교체한다. 컴포넌트(`Canvas`, `StickyNote`, `page.tsx`)는 수정 없이 Phase 2에서도 그대로 사용된다.

---

## 작업 분해 (Task Breakdown)

### Task 1: 프로젝트 초기화

**파일:**
- 생성: 프로젝트 루트 (Next.js 전체 구조)
- 생성: `.prettierrc`

**Step 1: Next.js 프로젝트 생성**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

예상 출력: `Success! Created the Next.js app`

**Step 2: Framer Motion 설치**

```bash
npm install framer-motion
```

예상 출력: `added X packages`

**Step 3: Prettier 설정 추가**

`.prettierrc` 파일 생성:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Step 4: 불필요한 보일러플레이트 제거**

`src/app/page.tsx`를 최소 구조로 교체:

```tsx
export default function Home() {
  return <main>IdeaFlow</main>
}
```

**Step 5: 개발 서버 기동 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → "IdeaFlow" 텍스트 확인

**검증 기준:**
- `http://localhost:3000`에서 페이지 정상 렌더링
- 브라우저 콘솔에 에러 없음
- `npm run build` 성공

**Step 6: 커밋**

```bash
git add -A
git commit -m "feat: Next.js 프로젝트 초기화 (App Router, TypeScript, Tailwind, Framer Motion)"
```

---

### Task 2: 타입 정의 및 상수 설정

**파일:**
- 생성: `src/types/index.ts`
- 생성: `src/lib/constants.ts`

**Step 1: 타입 파일 작성**

`src/types/index.ts`:

```typescript
export interface Note {
  id: string
  content: string
  x: number
  y: number
  colorIndex: number
  editorId: string | null
}

export interface Cursor {
  id: string
  x: number
  y: number
  lastSeen: number
}

export interface User {
  id: string
  nickname: string
  color: string
}
```

**Step 2: 색상 팔레트 상수 정의**

`src/lib/constants.ts`:

```typescript
// 포스트잇 배경 색상 팔레트 (6가지)
export const NOTE_COLORS = [
  '#FEF08A', // 노란색 (기본)
  '#86EFAC', // 초록색
  '#93C5FD', // 파란색
  '#F9A8D4', // 분홍색
  '#FCA5A5', // 빨간색
  '#D8B4FE', // 보라색
] as const

export const DEFAULT_COLOR_INDEX = 0

// 노트 기본 크기
export const NOTE_SIZE = { width: 150, height: 120 }

// 터치 타겟 최소 크기 (px) - PRD 접근성 요구사항
export const MIN_TOUCH_TARGET = 48
```

**검증 기준:**
- `npx tsc --noEmit` 실행 시 에러 없음
- `NOTE_COLORS`의 타입이 `readonly string[]`로 추론됨

**Step 3: 커밋**

```bash
git add src/types/index.ts src/lib/constants.ts
git commit -m "feat: Note/Cursor/User 타입 정의 및 색상 팔레트 상수 추가"
```

---

### Task 3: useNotes 커스텀 훅 구현

**파일:**
- 생성: `src/hooks/useNotes.ts`

이 훅은 Phase 2에서 Firestore로 교체될 인터페이스를 제공한다. 현재는 `useReducer`로 로컬 상태만 관리한다. 공개 인터페이스(`notes`, `addNote`, `updateNote`, `moveNote`, `deleteNote`, `changeColor`)는 Phase 2에서도 변경하지 않는다.

**Step 1: 훅 파일 작성**

`src/hooks/useNotes.ts`:

```typescript
import { useReducer, useCallback } from 'react'
import { Note } from '@/types'
import { DEFAULT_COLOR_INDEX, NOTE_SIZE } from '@/lib/constants'

// 액션 타입 정의
type NoteAction =
  | { type: 'ADD_NOTE'; payload: { x: number; y: number } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; content: string } }
  | { type: 'MOVE_NOTE'; payload: { id: string; x: number; y: number } }
  | { type: 'DELETE_NOTE'; payload: { id: string } }
  | { type: 'CHANGE_COLOR'; payload: { id: string; colorIndex: number } }

// 고유 ID 생성 유틸리티
function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// 리듀서
function notesReducer(state: Note[], action: NoteAction): Note[] {
  switch (action.type) {
    case 'ADD_NOTE':
      return [
        ...state,
        {
          id: generateId(),
          content: '',
          x: action.payload.x - NOTE_SIZE.width / 2,
          y: action.payload.y - NOTE_SIZE.height / 2,
          colorIndex: DEFAULT_COLOR_INDEX,
          editorId: null,
        },
      ]
    case 'UPDATE_NOTE':
      return state.map((note) =>
        note.id === action.payload.id
          ? { ...note, content: action.payload.content }
          : note
      )
    case 'MOVE_NOTE':
      return state.map((note) =>
        note.id === action.payload.id
          ? { ...note, x: action.payload.x, y: action.payload.y }
          : note
      )
    case 'DELETE_NOTE':
      return state.filter((note) => note.id !== action.payload.id)
    case 'CHANGE_COLOR':
      return state.map((note) =>
        note.id === action.payload.id
          ? { ...note, colorIndex: action.payload.colorIndex }
          : note
      )
    default:
      return state
  }
}

// 훅 공개 인터페이스 (Phase 2에서 내부 구현만 교체, 이 인터페이스는 유지)
export function useNotes() {
  const [notes, dispatch] = useReducer(notesReducer, [])

  const addNote = useCallback((x: number, y: number) => {
    dispatch({ type: 'ADD_NOTE', payload: { x, y } })
  }, [])

  const updateNote = useCallback((id: string, content: string) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { id, content } })
  }, [])

  const moveNote = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_NOTE', payload: { id, x, y } })
  }, [])

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: { id } })
  }, [])

  const changeColor = useCallback((id: string, colorIndex: number) => {
    dispatch({ type: 'CHANGE_COLOR', payload: { id, colorIndex } })
  }, [])

  return { notes, addNote, updateNote, moveNote, deleteNote, changeColor }
}
```

**검증 기준:**
- `npx tsc --noEmit` 에러 없음
- 훅의 반환 타입이 `{ notes: Note[], addNote: ..., ... }`로 추론됨

**Step 2: 커밋**

```bash
git add src/hooks/useNotes.ts
git commit -m "feat: useNotes 훅 구현 (로컬 상태 CRUD, Phase 2 Firestore 전환 대비 인터페이스)"
```

---

### Task 4: StickyNote 컴포넌트 구현

**파일:**
- 생성: `src/components/StickyNote.tsx`

**Step 1: StickyNote 컴포넌트 작성**

`src/components/StickyNote.tsx`:

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Note } from '@/types'
import { NOTE_COLORS, NOTE_SIZE } from '@/lib/constants'

interface StickyNoteProps {
  note: Note
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, colorIndex: number) => void
}

export default function StickyNote({
  note,
  onMove,
  onUpdate,
  onDelete,
  onColorChange,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 더블클릭/Enter 키 시 편집 모드 진입
  const handleEnterEdit = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [])

  // 편집 완료 (blur 또는 Escape)
  const handleBlur = useCallback(() => {
    setIsEditing(false)
    setShowColorPicker(false)
  }, [])

  // 드래그 종료 시 위치 업데이트
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      onMove(note.id, note.x + info.offset.x, note.y + info.offset.y)
    },
    [note.id, note.x, note.y, onMove]
  )

  const backgroundColor = NOTE_COLORS[note.colorIndex] ?? NOTE_COLORS[0]

  return (
    <motion.div
      drag={!isEditing}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: note.x, y: note.y, opacity: 0, scale: 0.8 }}
      animate={{ x: note.x, y: note.y, opacity: 1, scale: 1 }}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      style={{
        position: 'absolute',
        width: NOTE_SIZE.width,
        height: NOTE_SIZE.height,
        backgroundColor,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        cursor: isEditing ? 'text' : 'grab',
        zIndex: isEditing ? 40 : 10,
      }}
      className="flex flex-col p-2 select-none"
      onDoubleClick={handleEnterEdit}
      data-testid="sticky-note"
    >
      {/* 상단 액션 바 */}
      <div className="flex justify-between items-center mb-1 h-6">
        {/* 색상 변경 버튼 - 최소 터치 타겟을 위해 래퍼로 감쌈 */}
        <div className="relative">
          <button
            className="w-6 h-6 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              setShowColorPicker((v) => !v)
            }}
            aria-label="색상 변경"
          >
            <span
              className="w-4 h-4 rounded-full border border-black/20 block"
              style={{ backgroundColor }}
            />
          </button>
          {/* 색상 선택 팔레트 */}
          {showColorPicker && (
            <div
              className="absolute top-7 left-0 flex gap-1 bg-white rounded-lg shadow-lg p-1.5 z-50"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {NOTE_COLORS.map((color, index) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: color,
                    borderColor: note.colorIndex === index ? '#000' : 'transparent',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onColorChange(note.id, index)
                    setShowColorPicker(false)
                  }}
                  aria-label={`색상 ${index + 1} 선택`}
                />
              ))}
            </div>
          )}
        </div>
        {/* 삭제 버튼 - 48px 터치 타겟 */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-black/10 text-black/40 hover:text-black/70 text-base font-bold leading-none"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          aria-label="노트 삭제"
          data-testid="delete-note-button"
        >
          ×
        </button>
      </div>

      {/* 본문 영역 */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-black/80 placeholder:text-black/30"
          value={note.content}
          onChange={(e) => onUpdate(note.id, e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleBlur()
          }}
          placeholder="아이디어를 입력하세요..."
          aria-label="노트 내용 편집"
        />
      ) : (
        <div
          className="flex-1 text-sm text-black/80 overflow-hidden whitespace-pre-wrap break-words cursor-text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEnterEdit()
          }}
          tabIndex={0}
          role="button"
          aria-label={note.content ? `노트: ${note.content}. Enter로 편집` : '빈 노트. Enter로 편집'}
        >
          {note.content || (
            <span className="text-black/30 italic text-xs">더블클릭하여 편집</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
```

**검증 기준:**
- 노트를 드래그하면 새 위치로 이동됨
- 노트를 더블클릭하면 textarea가 활성화되고 텍스트 입력 가능
- Escape 또는 blur 시 편집 모드 종료
- × 버튼 클릭 시 노트 삭제됨
- 색상 버튼 클릭 시 팔레트 표시, 색상 선택 시 배경색 변경됨

**Step 2: 커밋**

```bash
git add src/components/StickyNote.tsx
git commit -m "feat: StickyNote 컴포넌트 구현 (Framer Motion 드래그, 인라인 편집, 색상 변경, 삭제)"
```

---

### Task 5: Canvas 컴포넌트 구현

**파일:**
- 생성: `src/components/Canvas.tsx`

**Step 1: Canvas 컴포넌트 작성**

`src/components/Canvas.tsx`:

```tsx
'use client'

import { useRef, useCallback } from 'react'
import { Note } from '@/types'
import StickyNote from './StickyNote'

interface CanvasProps {
  notes: Note[]
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, colorIndex: number) => void
}

export default function Canvas({
  notes,
  onMove,
  onUpdate,
  onDelete,
  onColorChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // 빈 캔버스 영역 클릭 시 편집 중인 노트의 포커스 해제
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      (document.activeElement as HTMLElement)?.blur()
    }
  }, [])

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      onClick={handleCanvasClick}
      data-testid="canvas"
    >
      {/* 격자 배경 패턴 (CSS 배경으로 GPU 가속) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* 노트 렌더링 */}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onMove={onMove}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onColorChange={onColorChange}
        />
      ))}
    </div>
  )
}
```

**검증 기준:**
- 캔버스 영역이 전체 화면을 채움
- 격자 배경이 렌더링됨
- 노트가 캔버스 위에 올바르게 렌더링됨
- 빈 캔버스 클릭 시 편집 중인 노트가 blur됨

**Step 2: 커밋**

```bash
git add src/components/Canvas.tsx
git commit -m "feat: Canvas 컴포넌트 구현 (격자 배경, 노트 렌더링, 빈 영역 클릭 처리)"
```

---

### Task 6: 하단 툴바 컴포넌트 구현

**파일:**
- 생성: `src/components/BottomToolbar.tsx`

모바일 한 손 조작을 위한 하단 고정 툴바. 모든 버튼의 터치 타겟은 최소 48px 이상이어야 한다 (PRD 접근성 요구사항).

**Step 1: BottomToolbar 컴포넌트 작성**

`src/components/BottomToolbar.tsx`:

```tsx
'use client'

interface BottomToolbarProps {
  onAddNote: () => void
}

export default function BottomToolbar({ onAddNote }: BottomToolbarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      data-testid="bottom-toolbar"
    >
      {/* 배경 블러 패널 */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-white/50">
        {/* 노트 추가 FAB 버튼 - 48px 터치 타겟 확보 */}
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all shadow-md"
          onClick={onAddNote}
          aria-label="노트 추가"
          data-testid="add-note-button"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* AI 정리 버튼 (Phase 4에서 활성화, 현재 비활성) */}
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 opacity-40 cursor-not-allowed"
          disabled
          aria-label="AI 정리 (Phase 4에서 활성화)"
          title="Phase 4에서 구현 예정"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
        </button>

        {/* 음성 메모 버튼 (Phase 3에서 활성화, 현재 비활성) */}
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 opacity-40 cursor-not-allowed"
          disabled
          aria-label="음성 메모 (Phase 3에서 활성화)"
          title="Phase 3에서 구현 예정"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

**검증 기준:**
- 모바일 뷰포트(375px)에서 하단에 고정 표시됨
- 노트 추가 버튼의 높이/너비가 48px (`w-12 h-12` = 48px)
- AI 정리, 음성 메모 버튼이 비활성화 상태로 표시됨
- iOS 안전 영역(safe-area-inset-bottom)이 패딩으로 처리됨

**Step 2: 커밋**

```bash
git add src/components/BottomToolbar.tsx
git commit -m "feat: BottomToolbar 컴포넌트 구현 (노트 추가 FAB, AI/음성 버튼 플레이스홀더)"
```

---

### Task 7: 메인 페이지 통합

**파일:**
- 수정: `src/app/page.tsx`
- 수정: `src/app/layout.tsx`
- 수정: `src/app/globals.css`

**Step 1: globals.css 업데이트**

`src/app/globals.css`에서 Tailwind 지시문 아래에 추가:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
  overflow: hidden;
  touch-action: none; /* 브라우저 기본 스크롤/줌 방지 */
}

/* 캔버스 컨테이너 스크롤바 숨기기 */
.canvas-container::-webkit-scrollbar {
  display: none;
}
```

**Step 2: layout.tsx 업데이트**

`src/app/layout.tsx`에서 viewport 메타태그 추가 (PRD `user-scalable=no` 요구사항):

```tsx
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IdeaFlow - 실시간 아이디어 캔버스',
  description: '가입 없이 링크 공유만으로 실시간 포스트잇 협업',
}

// PRD 요구사항: 브라우저 기본 줌 비활성화 (핀치줌은 Phase 3 커스텀 구현 예정)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} h-full`}>{children}</body>
    </html>
  )
}
```

**Step 3: 메인 페이지 작성**

`src/app/page.tsx`:

```tsx
'use client'

import { useCallback, useRef } from 'react'
import { useNotes } from '@/hooks/useNotes'
import Canvas from '@/components/Canvas'
import BottomToolbar from '@/components/BottomToolbar'

export default function Home() {
  const { notes, addNote, updateNote, moveNote, deleteNote, changeColor } = useNotes()
  const containerRef = useRef<HTMLDivElement>(null)

  // 캔버스 컨테이너 중앙에 노트 추가
  const handleAddNote = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    addNote(rect.width / 2, rect.height / 2)
  }, [addNote])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-50 canvas-container"
    >
      <Canvas
        notes={notes}
        onMove={moveNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onColorChange={changeColor}
      />
      <BottomToolbar onAddNote={handleAddNote} />
    </div>
  )
}
```

**Step 4: 동작 수동 확인**

```bash
npm run dev
```

브라우저에서 다음을 수동 확인:
- 캔버스 페이지가 격자 배경과 함께 렌더링됨
- "+" 버튼 클릭 시 노란색 포스트잇이 캔버스 중앙에 생성됨
- 포스트잇을 드래그하여 이동 가능
- 포스트잇을 더블클릭하여 텍스트 편집 가능
- "×" 버튼으로 노트 삭제 가능
- 색상 버튼으로 색상 변경 가능

**Step 5: 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공 (`✓ Compiled successfully`)

**Step 6: 커밋**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: 메인 페이지 통합 - 캔버스 + 툴바 조립, 모바일 viewport 설정"
```

---

### Task 8: 접근성 및 Sprint 2 준비

**파일:**
- 수정: `src/components/StickyNote.tsx` (이미 키보드 접근성 포함됨)
- 생성: `.env.local.example`

**Step 1: Sprint 2 Firebase 환경변수 템플릿 생성**

`.env.local.example`:

```
# Firebase 설정 (Sprint 2에서 사용)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Step 2: .gitignore에 .env.local 추가 확인**

Next.js 기본 `.gitignore`에 `.env.local`이 포함되어 있는지 확인:

```bash
grep ".env.local" .gitignore
```

예상 출력: `.env*.local` 또는 `.env.local` 줄이 존재해야 함. 없으면 추가.

**Step 3: 모바일 375px 뷰포트 수동 확인**

Chrome DevTools에서 375x812 (iPhone SE) 뷰포트로 전환하여 확인:
- 하단 툴바가 화면 하단에 고정됨
- 버튼 터치 타겟이 48px 이상 (`w-12 h-12`)
- 포스트잇 드래그가 터치 환경에서 동작함
- 콘솔에 에러 없음

**검증 기준:**
- `npm run build` 에러 없음
- `.env.local.example` 파일 존재
- 모바일 뷰포트에서 툴바 고정 표시 확인 (수동)

**Step 4: 최종 커밋**

```bash
git add .env.local.example
git commit -m "chore: Sprint 2 Firebase 환경변수 템플릿 추가 (.env.local.example)"
```

---

## 완료 기준 (Definition of Done)

- ✅ `npm run dev`로 로컬에서 캔버스 페이지가 정상 렌더링된다
- ✅ 포스트잇 생성(FAB 클릭), 드래그 이동, 텍스트 편집(더블클릭), 삭제(× 버튼), 색상 변경이 로컬 상태로 동작한다
- ✅ 하단 툴바가 모바일 뷰포트(375px)에서 올바르게 고정 표시된다
- ✅ `npm run build`가 에러 없이 성공한다
- ✅ Lighthouse 접근성 점수 90 이상 (수동 검증 필요)

## 검증 결과

- [Sprint 1 검증 보고서](sprint1/validation-report.md)

---

## Playwright MCP 검증 시나리오

> `npm run dev` 실행 후 sprint-close 에이전트가 아래 순서로 자동 검증한다.

### 캔버스 렌더링 검증

1. `browser_navigate` -> `http://localhost:3000` 접속
2. `browser_snapshot` -> `data-testid="canvas"` 캔버스 영역과 `data-testid="bottom-toolbar"` 하단 툴바가 렌더링되었는지 확인
3. `browser_console_messages(level: "error")` -> 콘솔 에러 없음 확인

### 노트 CRUD 검증

1. `browser_click` -> `data-testid="add-note-button"` 클릭
2. `browser_snapshot` -> `data-testid="sticky-note"`가 캔버스에 나타났는지 확인
3. `browser_click` -> 생성된 `data-testid="sticky-note"` 더블클릭 (편집 모드 진입)
4. `browser_type` -> "테스트 아이디어" 텍스트 입력
5. `browser_snapshot` -> 입력한 텍스트가 포스트잇에 표시되는지 확인
6. `browser_click` -> `data-testid="delete-note-button"` 클릭
7. `browser_snapshot` -> `data-testid="sticky-note"`가 제거되었는지 확인

### 색상 변경 검증

1. `browser_click` -> `data-testid="add-note-button"` 클릭 (노트 생성)
2. `browser_click` -> 색상 변경 버튼(`aria-label="색상 변경"`) 클릭
3. `browser_snapshot` -> 색상 팔레트가 표시되는지 확인
4. `browser_click` -> `aria-label="색상 2 선택"` 버튼 클릭 (초록색)
5. `browser_snapshot` -> 포스트잇 배경색이 변경되었는지 확인

### 모바일 뷰 검증

1. `browser_resize` -> 375x812 (모바일 뷰포트)
2. `browser_snapshot` -> 하단 툴바 고정, 터치 타겟(w-12=48px) 확인
3. `browser_click` -> `data-testid="add-note-button"` 클릭
4. `browser_snapshot` -> 모바일 뷰포트에서 노트 생성 확인
5. `browser_console_messages(level: "error")` -> 에러 없음 확인

---

## 의존성 및 리스크

| 항목 | 내용 | 대응 방안 |
|------|------|-----------|
| Framer Motion `drag` + `animate` 좌표 충돌 | `drag`와 `animate`를 동시 사용 시 좌표 충돌 발생 가능 | `dragMomentum={false}` + `onDragEnd`에서 `info.offset` 사용으로 위치 업데이트 |
| Tailwind CSS v4 문법 변화 | v4는 `@layer`/`@apply` 일부 변경됨 | 공식 v4 마이그레이션 가이드 확인, 유틸리티 클래스 직접 사용 우선 |
| 모바일 터치 드래그 이벤트 충돌 | 브라우저 기본 스크롤과 드래그 이벤트 충돌 가능 | `touch-action: none` 전역 설정(`globals.css`) |
| Phase 1 → Phase 2 전환 호환성 | `useNotes` 훅 교체 시 컴포넌트 수정 없어야 함 | 공개 인터페이스 불변 유지 (`notes`, `addNote`, ...) |

---

## 예상 산출물

스프린트 완료 시 다음 결과물이 생성된다:

1. **Next.js 프로젝트** (`/`): App Router, TypeScript, Tailwind CSS, Framer Motion 포함
2. **타입 정의** (`src/types/index.ts`): `Note`, `Cursor`, `User` 인터페이스
3. **상수** (`src/lib/constants.ts`): 색상 팔레트, 노트 크기 상수
4. **useNotes 훅** (`src/hooks/useNotes.ts`): 로컬 상태 CRUD (Phase 2 Firestore 전환 대비 인터페이스)
5. **StickyNote 컴포넌트** (`src/components/StickyNote.tsx`): 드래그, 편집, 색상 변경, 삭제
6. **Canvas 컴포넌트** (`src/components/Canvas.tsx`): 격자 배경, 노트 렌더링
7. **BottomToolbar 컴포넌트** (`src/components/BottomToolbar.tsx`): 노트 추가 FAB, Phase 3/4 버튼 플레이스홀더
8. **메인 페이지** (`src/app/page.tsx`): 전체 조립 및 상태 연결
9. **환경변수 템플릿** (`.env.local.example`): Sprint 2 Firebase 준비

---

## 브랜치 전략

```bash
# Sprint 1 브랜치에서 작업 (이미 생성됨)
git checkout sprint1

# 각 Task 완료 시 커밋 (위 각 Task의 커밋 명령 참고)

# Sprint 완료 후 sprint-close 에이전트가 PR 생성 처리
```

---

## 다음 스프린트 예고 (Sprint 2 준비 사항)

Sprint 1 완료 후 Sprint 2(Firebase 연동)를 위해 준비할 사항:

- Firebase 프로젝트 생성 (Google 계정 필요, Google Firebase 콘솔에서 직접 수행)
- `.env.local` 파일 생성 (`.env.local.example` 참고)
- `useNotes` 훅의 공개 인터페이스는 변경 없이 내부 구현만 Firestore로 교체
- Sprint 1 코드 리뷰 이슈(색상 버튼 터치 타겟, `role="button"` 혼용) Phase 2에서 개선
