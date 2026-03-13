# Sprint 2: Firebase 연동 및 실시간 동기화 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Firebase Anonymous Auth로 익명 세션을 구현하고, Firestore onSnapshot을 통해 모든 노트 변경 사항이 0.5초 이내에 전 클라이언트에 동기화되는 실시간 협업 엔진을 완성한다.

**Architecture:** Sprint 1에서 완성된 `useNotes` 훅의 외부 인터페이스를 유지하면서 내부 구현만 Firestore로 교체한다. 방(Room) 개념을 `/room/[roomId]` 라우팅으로 도입하여 URL 공유만으로 협업이 가능하도록 한다. Firebase 연동 코드는 훅 단위로 격리하여 컴포넌트가 Firebase에 직접 의존하지 않도록 설계한다.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Firebase SDK (Firestore + Anonymous Auth), Framer Motion (기존 유지), Tailwind CSS (기존 유지)

---

## 스프린트 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | Sprint 2 |
| Phase | Phase 2: Firebase 연동 및 실시간 동기화 |
| 기간 | 2026-03-13 ~ 2026-03-27 (2주) |
| 총 예상 작업 시간 | 28시간 |
| 마일스톤 | M2 - 실시간 협업 MVP |
| 브랜치 | `sprint2` |

---

## Sprint 1 이월 이슈 (선행 처리)

Sprint 1 코드 리뷰에서 발견된 이슈 중 Sprint 2 시작 전 처리할 항목:

- ⬜ StickyNote 색상 선택 버튼 터치 타겟 16px → 48px로 개선 (접근성)
- ⬜ `<p role="button">` → 시맨틱 `<button>` 태그로 교체
- ⬜ `Canvas.tsx` 미사용 import 및 상수 정리

---

## 구현 범위

### 포함 항목 (Must Have)
1. Firebase 프로젝트 설정 및 환경변수 구성
2. 익명 인증 및 사용자 세션 (`useAuth` 훅)
3. Firestore 실시간 동기화 (`useNotes` 훅 교체)
4. 실시간 커서 공유 (`useCursors` 훅)
5. 방(Room) 개념 도입 (`/room/[roomId]` 라우팅)

### 제외 항목 (Out of Scope)
- 소셜 로그인 (Phase 4 이후 Backlog)
- 핀치줌 제스처 (Phase 3)
- AI 클러스터링 (Phase 4)
- Vercel 배포 (Phase 4)

---

## Task 목록

### Task 0: Sprint 1 이월 이슈 해소 (예상: 1시간)

**Files:**
- Modify: `src/components/StickyNote.tsx`
- Modify: `src/components/Canvas.tsx`

**Step 1: StickyNote 색상 버튼 터치 타겟 수정**

`src/components/StickyNote.tsx`에서 색상 선택 버튼을 찾아 `w-8 h-8` (32px) 이상으로 수정:

```tsx
// 변경 전 (예시)
<button className="w-4 h-4 rounded-full" ...>

// 변경 후
<button
  className="w-12 h-12 rounded-full"
  aria-label={`색상 변경: ${color}`}
  ...
>
```

**Step 2: `<p role="button">` 시맨틱 태그 교체**

`role="button"`이 부여된 `<p>` 태그를 `<button>` 또는 `<div role="button" tabIndex={0}>`으로 교체.

**Step 3: Canvas.tsx 미사용 import 제거**

`src/components/Canvas.tsx` 상단의 미사용 `motion` import와 미사용 상수 참조를 제거.

**Step 4: 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공

**Step 5: 커밋**

```bash
git add src/components/StickyNote.tsx src/components/Canvas.tsx
git commit -m "fix: Sprint 1 이월 이슈 해소 - 터치 타겟, 시맨틱 태그, 미사용 import"
```

---

### Task 1: Firebase 프로젝트 설정 (예상: 2시간)

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `.env.local.example`
- Create: `firestore.rules`

**Step 1: Firebase SDK 패키지 설치**

```bash
npm install firebase
```

예상 출력: `package.json`에 `"firebase": "^11.x.x"` 추가됨

**Step 2: `.env.local.example` 파일 작성**

```bash
# .env.local.example
# Firebase 프로젝트 설정값 - Firebase 콘솔 > 프로젝트 설정 > 내 앱에서 확인
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Step 3: `src/lib/firebase.ts` 작성**

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// SSR 환경에서 중복 초기화 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const db = getFirestore(app)
export const auth = getAuth(app)

// 오프라인 캐시 활성화 (클라이언트 전용)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // 여러 탭이 열려 있는 경우 - 무시
      console.warn('Firestore 오프라인 캐시: 여러 탭이 열려 있어 비활성화됨')
    } else if (err.code === 'unimplemented') {
      // 브라우저 미지원
      console.warn('Firestore 오프라인 캐시: 브라우저 미지원')
    }
  })
}
```

**Step 4: `firestore.rules` 작성**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // rooms/{roomId}/notes/{noteId} - 익명 사용자 읽기/쓰기 허용
    match /rooms/{roomId}/notes/{noteId} {
      allow read, write: if request.auth != null;
    }
    // rooms/{roomId}/cursors/{userId} - 익명 사용자 읽기/쓰기 허용
    match /rooms/{roomId}/cursors/{userId} {
      allow read: if request.auth != null;
      // 자신의 커서만 쓰기 허용
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // 기타 모든 경로 접근 차단
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Step 5: `.gitignore`에 `.env.local` 추가 확인**

```bash
grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

**Step 6: 커밋**

```bash
git add src/lib/firebase.ts .env.local.example firestore.rules .gitignore
git commit -m "feat: Firebase SDK 초기화 및 Firestore 보안 규칙 설정"
```

> **주의:** `.env.local` 파일은 절대 커밋하지 않는다. `.env.local.example`만 커밋한다.

---

### Task 2: 익명 인증 및 사용자 세션 (예상: 4시간)

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/lib/userColors.ts`
- Create: `src/components/NicknameModal.tsx`
- Modify: `src/types/index.ts`

**Step 1: 사용자 색상 유틸리티 작성**

`src/lib/userColors.ts`:

```typescript
// 사용자 ID 기반으로 결정론적 색상/아이콘 반환
const USER_COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 파랑
  '#96CEB4', // 민트
  '#FFEAA7', // 노랑
  '#DDA0DD', // 보라
  '#98D8C8', // 연두
  '#F7B731', // 주황
]

export function getUserColor(userId: string): string {
  // userId의 문자 코드 합산으로 인덱스 결정
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return USER_COLORS[hash % USER_COLORS.length]
}
```

**Step 2: User 타입 확장**

`src/types/index.ts`에 세션 관련 타입 추가:

```typescript
export interface UserSession {
  uid: string
  nickname: string
  color: string
  isNew: boolean // 최초 접속 여부 (닉네임 모달 표시용)
}
```

**Step 3: `useAuth` 훅 작성**

`src/hooks/useAuth.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserColor } from '@/lib/userColors'
import type { UserSession } from '@/types'

const SESSION_KEY = 'ideaflow_session'

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // localStorage에서 기존 세션 정보 복원
        const stored = localStorage.getItem(SESSION_KEY)
        const stored_session = stored ? JSON.parse(stored) : null

        const newSession: UserSession = {
          uid: user.uid,
          nickname: stored_session?.nickname ?? '익명 사용자',
          color: getUserColor(user.uid),
          isNew: !stored_session,
        }

        setSession(newSession)
        setLoading(false)
      } else {
        // 미로그인 상태 -> 익명 로그인 시도
        try {
          await signInAnonymously(auth)
        } catch (error) {
          console.error('익명 로그인 실패:', error)
          setLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const updateNickname = (nickname: string) => {
    if (!session) return
    const updated = { ...session, nickname, isNew: false }
    setSession(updated)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: session.uid, nickname }))
  }

  return { session, loading, updateNickname }
}
```

**Step 4: 닉네임 입력 모달 컴포넌트 작성**

`src/components/NicknameModal.tsx`:

```tsx
'use client'

import { useState } from 'react'

interface NicknameModalProps {
  onConfirm: (nickname: string) => void
}

export function NicknameModal({ onConfirm }: NicknameModalProps) {
  const [nickname, setNickname] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(nickname.trim() || '익명 사용자')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <h2 className="text-lg font-bold mb-2">닉네임을 입력하세요</h2>
        <p className="text-sm text-gray-500 mb-4">
          다른 참여자에게 표시됩니다. (선택 사항)
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="익명 사용자"
            maxLength={20}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 transition-colors"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 5: 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공 (Firebase 환경변수 없어도 빌드는 통과해야 함)

**Step 6: 커밋**

```bash
git add src/hooks/useAuth.ts src/lib/userColors.ts src/components/NicknameModal.tsx src/types/index.ts
git commit -m "feat: 익명 인증 useAuth 훅 및 닉네임 모달 구현"
```

---

### Task 3: 방(Room) 라우팅 구현 (예상: 4시간)

**Files:**
- Create: `src/app/room/[roomId]/page.tsx`
- Create: `src/lib/roomId.ts`
- Modify: `src/app/page.tsx`

**Step 1: roomId 생성 유틸리티 작성**

`src/lib/roomId.ts`:

```typescript
// 랜덤 방 ID 생성 (예: "abc123def456")
export function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}
```

**Step 2: 메인 페이지 수정**

`src/app/page.tsx`를 "새 캔버스 만들기" 랜딩 페이지로 교체:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { generateRoomId } from '@/lib/roomId'

export default function Home() {
  const router = useRouter()

  const handleCreateCanvas = () => {
    const roomId = generateRoomId()
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">IdeaFlow</h1>
        <p className="text-gray-500">
          링크 공유만으로 실시간 협업 캔버스를 시작하세요
        </p>
      </div>
      <button
        onClick={handleCreateCanvas}
        className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold
                   shadow-lg hover:bg-blue-600 active:scale-95 transition-all
                   min-h-[48px]"
      >
        새 캔버스 만들기
      </button>
    </main>
  )
}
```

**Step 3: 방 페이지 작성**

`src/app/room/[roomId]/page.tsx`:

```tsx
'use client'

import { use } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { NicknameModal } from '@/components/NicknameModal'
import { Canvas } from '@/components/Canvas'
import { BottomToolbar } from '@/components/BottomToolbar'
import { useNotes } from '@/hooks/useNotes'

interface Props {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: Props) {
  const { roomId } = use(params)
  const { session, loading, updateNickname } = useAuth()
  const { notes, addNote, updateNote, deleteNote } = useNotes(roomId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">연결 중...</div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* 최초 접속 시 닉네임 모달 표시 */}
      {session?.isNew && (
        <NicknameModal onConfirm={updateNickname} />
      )}

      <Canvas
        notes={notes}
        onUpdateNote={updateNote}
        roomId={roomId}
        currentUserId={session?.uid ?? ''}
      />

      <BottomToolbar
        onAddNote={() =>
          addNote({
            content: '',
            x: window.innerWidth / 2 - 80,
            y: window.innerHeight / 2 - 80,
            colorIndex: 0,
          })
        }
      />
    </div>
  )
}
```

**Step 4: 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공

**Step 5: 커밋**

```bash
git add src/app/room/[roomId]/page.tsx src/lib/roomId.ts src/app/page.tsx
git commit -m "feat: Room 라우팅 구현 - /room/[roomId] 동적 라우트 및 메인 랜딩 페이지"
```

---

### Task 4: Firestore 실시간 동기화 (예상: 12시간)

**Files:**
- Modify: `src/hooks/useNotes.ts`
- Create: `src/types/firestore.ts`

> 이 Task는 Sprint 2의 핵심. `useNotes` 훅의 외부 인터페이스(addNote, updateNote, deleteNote, notes 배열)를 Sprint 1과 동일하게 유지하면서 내부 구현만 Firestore로 교체한다.

**Step 1: Firestore 데이터 타입 정의**

`src/types/firestore.ts`:

```typescript
import type { Timestamp } from 'firebase/firestore'

// Firestore에 저장되는 Note 문서 형식
export interface FirestoreNote {
  content: string
  x: number
  y: number
  colorIndex: number
  editorId: string | null  // 현재 편집 중인 사용자 ID (잠금용)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Step 2: `useNotes` 훅을 Firestore 기반으로 전환**

`src/hooks/useNotes.ts` 전체를 다음으로 교체:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Note } from '@/types'

interface AddNoteInput {
  content: string
  x: number
  y: number
  colorIndex: number
}

interface UseNotesReturn {
  notes: Note[]
  addNote: (input: AddNoteInput) => Promise<void>
  updateNote: (id: string, changes: Partial<Omit<Note, 'id'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setEditor: (id: string, editorId: string | null) => Promise<void>
}

export function useNotes(roomId: string): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    if (!roomId) return

    const notesRef = collection(db, 'rooms', roomId, 'notes')
    const q = query(notesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated: Note[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Note[]
      setNotes(updated)
    }, (error) => {
      console.error('Firestore onSnapshot 오류:', error)
    })

    return () => unsubscribe()
  }, [roomId])

  const addNote = useCallback(async (input: AddNoteInput) => {
    const notesRef = collection(db, 'rooms', roomId, 'notes')
    await addDoc(notesRef, {
      ...input,
      editorId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [roomId])

  const updateNote = useCallback(async (id: string, changes: Partial<Omit<Note, 'id'>>) => {
    const noteRef = doc(db, 'rooms', roomId, 'notes', id)
    await updateDoc(noteRef, {
      ...changes,
      updatedAt: serverTimestamp(),
    })
  }, [roomId])

  const deleteNote = useCallback(async (id: string) => {
    const noteRef = doc(db, 'rooms', roomId, 'notes', id)
    await deleteDoc(noteRef)
  }, [roomId])

  // 편집 잠금: editorId 설정/해제
  const setEditor = useCallback(async (id: string, editorId: string | null) => {
    const noteRef = doc(db, 'rooms', roomId, 'notes', id)
    await updateDoc(noteRef, { editorId, updatedAt: serverTimestamp() })
  }, [roomId])

  return { notes, addNote, updateNote, deleteNote, setEditor }
}
```

**Step 3: `StickyNote` 컴포넌트에 편집 잠금 연동**

`src/components/StickyNote.tsx`에서 편집 시작/종료 시 `setEditor` 호출하도록 수정:

```tsx
// 편집 모드 진입 시
const handleDoubleClick = () => {
  if (note.editorId && note.editorId !== currentUserId) {
    // 다른 사람이 편집 중 - 편집 불가
    return
  }
  onSetEditor?.(note.id, currentUserId)
  setIsEditing(true)
}

// 편집 모드 종료 시
const handleBlur = () => {
  setIsEditing(false)
  onSetEditor?.(note.id, null)
}
```

편집 잠금 상태 시각화 (다른 사용자가 편집 중인 경우 테두리 색상 표시):

```tsx
<motion.div
  className={cn(
    'sticky-note',
    note.editorId && note.editorId !== currentUserId
      ? 'ring-2 ring-red-400 opacity-80'
      : ''
  )}
  ...
>
```

**Step 4: Optimistic UI 확인**

Firestore onSnapshot은 `metadata.hasPendingWrites`를 통해 로컬 쓰기 대기 상태를 구분한다. 현재 구현은 onSnapshot이 로컬 캐시를 즉시 반영하므로 별도 Optimistic UI 코드 없이도 빠른 피드백이 가능하다.

필요 시 로딩 상태 표시:

```typescript
// onSnapshot 콜백에서
const isFromCache = snapshot.metadata.fromCache
if (isFromCache) {
  console.log('캐시에서 로드 (오프라인 상태일 수 있음)')
}
```

**Step 5: 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공

**Step 6: 커밋**

```bash
git add src/hooks/useNotes.ts src/types/firestore.ts src/components/StickyNote.tsx
git commit -m "feat: useNotes 훅을 Firestore onSnapshot 기반으로 전환 및 편집 잠금 구현"
```

---

### Task 5: 실시간 커서 공유 (예상: 6시간)

**Files:**
- Create: `src/hooks/useCursors.ts`
- Create: `src/lib/throttle.ts`
- Create: `src/components/CursorLayer.tsx`
- Modify: `src/components/Canvas.tsx`

**Step 1: throttle 유틸리티 작성 (커서 전용 최소 구현)**

`src/lib/throttle.ts`:

```typescript
// 커서 업데이트 전용 throttle - lodash 없이 최소 구현
export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= ms) {
      lastCall = now
      fn(...args)
    }
  }) as T
}
```

**Step 2: `useCursors` 훅 작성**

`src/hooks/useCursors.ts`:

```typescript
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { throttle } from '@/lib/throttle'
import type { Cursor } from '@/types'

const CURSOR_INACTIVE_MS = 30_000 // 30초 비활성 시 제거

interface UseCursorsReturn {
  cursors: Cursor[]
  updateCursor: (x: number, y: number) => void
  removeCursor: () => void
}

export function useCursors(roomId: string, userId: string, nickname: string, color: string): UseCursorsReturn {
  const [cursors, setCursors] = useState<Cursor[]>([])

  // 다른 사용자 커서 구독
  useEffect(() => {
    if (!roomId || !userId) return

    const cursorsRef = collection(db, 'rooms', roomId, 'cursors')

    const unsubscribe = onSnapshot(cursorsRef, (snapshot) => {
      const now = Date.now()
      const active: Cursor[] = snapshot.docs
        .filter((d) => d.id !== userId) // 자신의 커서 제외
        .map((d) => {
          const data = d.data()
          return {
            id: d.id,
            x: data.x,
            y: data.y,
            nickname: data.nickname,
            color: data.color,
            lastSeen: (data.lastSeen as Timestamp)?.toMillis() ?? 0,
          }
        })
        .filter((c) => now - c.lastSeen < CURSOR_INACTIVE_MS) // 30초 이상 비활성 필터링

      setCursors(active)
    })

    return () => unsubscribe()
  }, [roomId, userId])

  // 자신의 커서 업데이트 (100ms throttling)
  const updateCursorThrottled = useRef(
    throttle(async (x: number, y: number) => {
      if (!roomId || !userId) return
      const cursorRef = doc(db, 'rooms', roomId, 'cursors', userId)
      await setDoc(cursorRef, {
        x,
        y,
        nickname,
        color,
        lastSeen: serverTimestamp(),
      })
    }, 100)
  ).current

  const updateCursor = useCallback((x: number, y: number) => {
    updateCursorThrottled(x, y)
  }, [updateCursorThrottled])

  // 페이지 이탈 시 커서 제거
  const removeCursor = useCallback(async () => {
    if (!roomId || !userId) return
    const cursorRef = doc(db, 'rooms', roomId, 'cursors', userId)
    await deleteDoc(cursorRef)
  }, [roomId, userId])

  // 언마운트 시 커서 제거
  useEffect(() => {
    return () => {
      removeCursor()
    }
  }, [removeCursor])

  return { cursors, updateCursor, removeCursor }
}
```

**Step 3: `CursorLayer` 컴포넌트 작성**

`src/components/CursorLayer.tsx`:

```tsx
'use client'

import type { Cursor } from '@/types'

interface CursorLayerProps {
  cursors: Cursor[]
}

export function CursorLayer({ cursors }: CursorLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transition-transform duration-100"
          style={{ left: cursor.x, top: cursor.y }}
        >
          {/* 커서 포인터 */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M0 0L0 12L3.5 8.5L6 14L8 13L5.5 7.5L10 7.5L0 0Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          {/* 닉네임 라벨 */}
          <span
            className="absolute left-4 top-0 text-xs text-white px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.nickname}
          </span>
        </div>
      ))}
    </div>
  )
}
```

**Step 4: `Canvas` 컴포넌트에 커서 레이어 통합**

`src/components/Canvas.tsx`에 마우스 이동 이벤트와 `CursorLayer` 통합:

```tsx
// Canvas props 확장
interface CanvasProps {
  notes: Note[]
  onUpdateNote: (id: string, changes: Partial<Omit<Note, 'id'>>) => void
  roomId: string
  currentUserId: string
  cursors?: Cursor[]
  onCursorMove?: (x: number, y: number) => void
}

// Canvas 내부에 마우스 이동 핸들러 추가
const handleMouseMove = (e: React.MouseEvent) => {
  onCursorMove?.(e.clientX, e.clientY)
}

// JSX에 CursorLayer 추가
<div className="relative w-full h-full" onMouseMove={handleMouseMove}>
  {/* 기존 캔버스 내용 */}
  <CursorLayer cursors={cursors ?? []} />
</div>
```

**Step 5: Cursor 타입에 nickname/color 필드 추가**

`src/types/index.ts`의 `Cursor` 타입 확인 및 필드 추가:

```typescript
export interface Cursor {
  id: string
  x: number
  y: number
  lastSeen: number
  nickname: string  // 추가
  color: string     // 추가
}
```

**Step 6: 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공

**Step 7: 커밋**

```bash
git add src/hooks/useCursors.ts src/lib/throttle.ts src/components/CursorLayer.tsx src/components/Canvas.tsx src/types/index.ts
git commit -m "feat: 실시간 커서 공유 구현 - useCursors 훅 및 CursorLayer 컴포넌트"
```

---

### Task 6: 방 페이지 최종 통합 (예상: 2시간)

**Files:**
- Modify: `src/app/room/[roomId]/page.tsx`

**Step 1: 모든 훅 통합**

`src/app/room/[roomId]/page.tsx`를 완성형으로 업데이트:

```tsx
'use client'

import { use, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { useCursors } from '@/hooks/useCursors'
import { NicknameModal } from '@/components/NicknameModal'
import { Canvas } from '@/components/Canvas'
import { BottomToolbar } from '@/components/BottomToolbar'

interface Props {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: Props) {
  const { roomId } = use(params)
  const { session, loading, updateNickname } = useAuth()
  const { notes, addNote, updateNote, deleteNote, setEditor } = useNotes(roomId)
  const { cursors, updateCursor, removeCursor } = useCursors(
    roomId,
    session?.uid ?? '',
    session?.nickname ?? '익명 사용자',
    session?.color ?? '#4ECDC4'
  )

  // 페이지 이탈 시 커서 제거
  useEffect(() => {
    return () => {
      removeCursor()
    }
  }, [removeCursor])

  const handleAddNote = () => {
    addNote({
      content: '',
      x: Math.max(0, window.innerWidth / 2 - 80),
      y: Math.max(0, window.innerHeight / 2 - 120),
      colorIndex: Math.floor(Math.random() * 6),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-400 text-sm">연결 중...</div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {session?.isNew && (
        <NicknameModal onConfirm={updateNickname} />
      )}

      <Canvas
        notes={notes}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onSetEditor={setEditor}
        roomId={roomId}
        currentUserId={session?.uid ?? ''}
        cursors={cursors}
        onCursorMove={updateCursor}
      />

      <BottomToolbar onAddNote={handleAddNote} />
    </div>
  )
}
```

**Step 2: 최종 빌드 확인**

```bash
npm run build
```

예상 출력: 에러 없이 빌드 성공

**Step 3: 개발 서버에서 동작 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후:
1. "새 캔버스 만들기" 버튼이 표시되는지 확인
2. 클릭 후 `/room/[랜덤ID]`로 이동하는지 확인
3. 닉네임 모달이 표시되는지 확인

**Step 4: 커밋**

```bash
git add src/app/room/[roomId]/page.tsx
git commit -m "feat: 방 페이지 최종 통합 - useAuth, useNotes, useCursors 훅 연결"
```

---

## 완료 기준 (Definition of Done)

- ⬜ 두 개 이상의 브라우저 탭에서 동일 URL(`/room/[roomId]`) 접속 시 실시간 노트 동기화 확인
- ⬜ 노트 변경이 0.5초 이내에 다른 탭에 반영
- ⬜ 각 탭에 서로 다른 익명 사용자 ID/색상이 부여됨
- ⬜ 커서 위치가 다른 탭에서 실시간으로 표시됨 (닉네임 라벨 포함)
- ⬜ 30초 이상 비활성 커서가 자동으로 사라짐
- ⬜ 닉네임 입력 모달이 최초 접속 시 표시되고, 재접속 시 표시되지 않음
- ⬜ "새 캔버스 만들기" 클릭 시 고유 room URL로 이동
- ⬜ Firebase Firestore 쓰기가 일일 무료 할당량(2만) 내에서 합리적으로 소비됨
- ⬜ `npm run build` 에러 없음

---

## Playwright MCP 검증 시나리오

> `npm run dev` 실행 및 Firebase 프로젝트 연결 완료 후 검증

### 익명 인증 검증
1. `browser_navigate` -> `http://localhost:3000` 접속
2. `browser_snapshot` -> "새 캔버스 만들기" 버튼 표시 확인
3. `browser_click` -> "새 캔버스 만들기" 버튼 클릭
4. `browser_snapshot` -> `/room/[roomId]` 페이지로 이동 및 닉네임 모달 표시 확인
5. `browser_network_requests` -> Firebase Auth 호출 성공(200) 확인

### 실시간 동기화 검증
1. `browser_navigate` -> `http://localhost:3000/room/test-room` 접속
2. `browser_snapshot` -> 캔버스 및 툴바 렌더링 확인
3. `browser_click` -> 노트 추가 버튼 클릭
4. `browser_type` -> "실시간 테스트" 입력
5. `browser_snapshot` -> 노트 생성 확인
6. `browser_network_requests` -> Firestore 쓰기 요청 성공 확인
7. `browser_console_messages(level: "error")` -> 에러 없음 확인

### 방 공유 검증
1. `browser_navigate` -> `http://localhost:3000` 접속
2. `browser_click` -> "새 캔버스 만들기" 클릭
3. `browser_snapshot` -> 고유 room URL 생성 확인
4. 생성된 URL로 `browser_navigate` -> 동일 방 접속 확인

---

## 의존성 및 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|-----------|
| Firebase 무료 할당량 초과 | 높음 | 커서 100ms throttling 필수, 불필요한 쓰기 최소화 |
| `.env.local` 미설정 시 앱 실행 불가 | 중간 | `.env.local.example` 제공, 개발 시작 전 Firebase 콘솔 설정 선행 |
| Firestore 보안 규칙 설정 오류 | 중간 | `firestore.rules` 파일로 버전 관리, Firebase 콘솔에서 검증 |
| onSnapshot 리스너 누수 | 중간 | useEffect cleanup에서 반드시 `unsubscribe()` 호출 |
| SSR 환경에서 Firebase 초기화 오류 | 중간 | `getApps().length === 0` 중복 초기화 방지, `'use client'` 지시자 확인 |
| 커서 throttle ref 의존성 경고 | 낮음 | `useRef`로 throttle 함수 고정, eslint-disable 주석 불필요하게 사용하지 않음 |

---

## 예상 산출물

Sprint 2 완료 시 다음 결과물이 완성됩니다:

1. **실시간 협업 캔버스**: 동일 URL에 접속한 모든 사용자가 노트 생성/수정/삭제를 실시간으로 공유
2. **익명 사용자 세션**: 가입 없이 자동으로 고유 ID와 색상이 부여됨, 닉네임 커스터마이징 가능
3. **실시간 커서**: 다른 사용자의 마우스 커서와 닉네임이 캔버스에 표시됨
4. **방 공유 기능**: "새 캔버스 만들기"로 고유 URL 생성, URL 공유만으로 협업 참여

이 결과물은 **M2: 실시간 협업 MVP** 마일스톤을 달성하며, Phase 3 모바일 최적화의 기반이 됩니다.

---

## 수동 검증 필요 항목

아래 항목은 자동화가 불가하므로 개발자가 직접 확인해야 합니다:

- ⬜ Firebase 콘솔에서 프로젝트 생성 및 Anonymous Auth 활성화
- ⬜ `.env.local` 파일에 Firebase 설정값 입력
- ⬜ Firebase 콘솔에서 Firestore 보안 규칙 배포 (`firestore.rules` 내용 적용)
- ⬜ 두 대의 실제 디바이스 또는 두 개의 브라우저 탭에서 동시 접속 후 동기화 확인
- ⬜ 커서 공유 시각적 확인 (닉네임 라벨, 색상)
- ⬜ 30초 비활성 후 커서 자동 제거 확인

---

## 기술 고려사항

- Firebase 설정은 환경변수(`.env.local`)로 관리, `NEXT_PUBLIC_` 접두사로 클라이언트에서 접근
- 절대 `.env.local`을 git에 커밋하지 않는다 - `.env.local.example`만 버전 관리
- Firestore 보안 규칙은 익명 사용자 읽기/쓰기 허용, 단 자신의 커서 문서만 쓰기 허용
- throttle은 직접 구현 (lodash 전체 추가 금지 - karpathy-guidelines 의존성 최소화 원칙)
- `useNotes` 훅의 외부 인터페이스는 Sprint 1과 동일하게 유지하여 컴포넌트 변경 최소화
- SSR 환경에서 Firebase 클라이언트 SDK 사용 시 `'use client'` 지시자 필수
- `enableIndexedDbPersistence`는 클라이언트 전용, `typeof window !== 'undefined'` 가드 필수
