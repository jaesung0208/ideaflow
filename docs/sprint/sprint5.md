# Sprint 5: 캔버스 템플릿 기능 구현

## 개요

| 항목 | 내용 |
|------|------|
| **스프린트 번호** | Sprint 5 (Phase 2.5) |
| **기간** | 2026-03-14 ~ 2026-03-21 (1주) |
| **브랜치** | `sprint5` (main에서 분기) |
| **프로덕션 URL** | https://ideaflow-sooty.vercel.app |
| **참조 스펙** | `docs/superpowers/specs/2026-03-13-canvas-templates-design.md` |
| **참조 계획** | `docs/superpowers/plans/2026-03-13-canvas-templates.md` |

---

## 스프린트 목표

새 캔버스 생성 시 및 기존 캔버스에서 사전 정의된 템플릿(브레인스토밍 / KPT 회고)을 선택·적용할 수 있는 기능을 구현한다. 영역 가이드라인(`TemplateZoneOverlay`)과 안내 노트가 자동 배치되며, `rooms/{roomId}.templateId` 필드를 통해 모든 참여자가 동일한 Zone 가이드를 실시간으로 확인한다.

---

## 구현 범위

### 포함 (In Scope)

- 템플릿 데이터 레이어: `lib/templates.ts` 정적 TEMPLATES 상수 (타입 + 브레인스토밍/KPT 정의)
- 템플릿 적용 함수: `lib/applyTemplate.ts` (Firestore batch write, replace 모드)
- `TemplatePickerModal` 컴포넌트: 빈 캔버스 + 2종 템플릿 카드 선택 UI
- `TemplateZoneOverlay` 컴포넌트: KPT 영역 점선 가이드라인 렌더러
- 진입점 1: `src/app/page.tsx` — "새 캔버스 만들기" 클릭 시 picker 표시
- 진입점 2: `src/app/room/[roomId]/page.tsx` — 첫 로드 시 템플릿 노트 자동 배치 + TemplateZoneOverlay 추가
- 진입점 3: `src/components/BottomToolbar.tsx` — "템플릿" 버튼 추가 (4버튼 균등 배치)
- Firestore `rooms/{roomId}.templateId` 필드 실시간 동기화
- `src/types/index.ts` — Note 타입에 `isTemplateNote?`, `createdAt?`, `createdBy?` 필드 추가

### 제외 (Out of Scope)

- merge 모드 (기존 노트 유지하며 템플릿 노트 추가) — MVP는 replace 단일 모드
- SWOT, 사용자 지정 템플릿 등 추가 템플릿 종류
- 템플릿 노트 잠금(고정) 기능 — `isTemplateNote` 필드는 향후 확장 목적 마커로만 저장
- 500개 초과 노트 삭제 처리 (MVP 범위 외)

---

## 기술 아키텍처

### 데이터 흐름

```
사용자 클릭
  └─ TemplatePickerModal (onSelect)
       └─ applyTemplate(roomId, templateId, viewportCenter, userId)
            ├─ Firestore batch: 기존 notes 삭제 + rooms/{roomId}.templateId 업데이트
            └─ Promise.all: 템플릿 notes 추가

Firestore onSnapshot (rooms/{roomId})
  └─ templateId 변경 감지
       └─ TemplateZoneOverlay 리렌더링 (모든 참여자 동시 반영)
```

### 신규 파일

| 파일 | 역할 |
|------|------|
| `src/lib/templates.ts` | TemplateZone / TemplateNote / CanvasTemplate 타입 + TEMPLATES 상수 |
| `src/lib/applyTemplate.ts` | Firestore batch 기반 템플릿 적용 함수 |
| `src/components/TemplatePickerModal.tsx` | 템플릿 선택 모달 (확인 다이얼로그 내장) |
| `src/components/TemplateZoneOverlay.tsx` | 캔버스 배경 Zone 가이드라인 렌더러 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/page.tsx` | "새 캔버스 만들기" → picker 표시 후 이동 |
| `src/app/room/[roomId]/page.tsx` | TemplateZoneOverlay 추가, 첫 로드 시 applyTemplate 호출, TemplatePickerModal 연결 |
| `src/components/BottomToolbar.tsx` | "템플릿" 버튼 추가 (총 4버튼) |
| `src/types/index.ts` | Note 타입 필드 확장 |

---

## 작업 목록 (Task Breakdown)

### Chunk 1: 데이터 레이어

#### Task 1: lib/templates.ts 생성 (복잡도: 낮음, 예상: 1시간)

**파일:**
- 생성: `src/lib/templates.ts`

**Step 1: 타입 및 TEMPLATES 상수 작성**

`src/lib/templates.ts`를 아래와 같이 작성한다:

```ts
export type TemplateZone = {
  id: string
  label: string
  x: number        // 캔버스 중앙 기준 상대 좌표 (px)
  y: number
  w: number
  h: number
  color: string    // 반투명 배경색
  borderColor: string
}

export type TemplateNote = {
  content: string
  x: number        // 캔버스 중앙 기준 상대 좌표 (px)
  y: number
  colorIndex: number
  isTemplateNote: boolean
}

export type CanvasTemplate = {
  id: string
  name: string
  description: string
  zones: TemplateZone[]
  notes: TemplateNote[]
}

export const TEMPLATES: CanvasTemplate[] = [
  {
    id: 'brainstorm',
    name: '🧠 브레인스토밍',
    description: '중심 주제 주변에 아이디어를 자유롭게 배치합니다',
    zones: [],
    notes: [
      { content: '💡 중심 주제를 입력하세요',         x:    0, y:    0, colorIndex: 2, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 ↓',  x:    0, y: -200, colorIndex: 1, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 ↑',  x:    0, y:  200, colorIndex: 1, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 →',  x: -300, y:    0, colorIndex: 1, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 ←',  x:  300, y:    0, colorIndex: 1, isTemplateNote: true },
    ],
  },
  {
    id: 'kpt',
    name: '🔄 KPT 회고',
    description: 'Keep / Problem / Try 세 영역으로 팀 회고를 진행합니다',
    zones: [
      { id: 'keep',    label: 'Keep',    x: -600, y: -300, w: 400, h: 600, color: 'rgba(107,203,119,0.1)', borderColor: '#6BCB77' },
      { id: 'problem', label: 'Problem', x: -100, y: -300, w: 400, h: 600, color: 'rgba(255,107,107,0.1)', borderColor: '#FF6B6B' },
      { id: 'try',     label: 'Try',     x:  400, y: -300, w: 400, h: 600, color: 'rgba(77,150,255,0.1)',  borderColor: '#4D96FF' },
    ],
    notes: [
      // 제목 노트 (Zone 상단 내부, y=-230)
      { content: '✅ Keep - 잘 된 것',            x: -400, y: -230, colorIndex: 1, isTemplateNote: true },
      { content: '⚠️ Problem - 문제점',           x:  100, y: -230, colorIndex: 0, isTemplateNote: true },
      { content: '🚀 Try - 시도할 것',            x:  600, y: -230, colorIndex: 3, isTemplateNote: true },
      // 안내 노트 (Zone 중앙)
      { content: '여기에 포스트잇을 추가하세요', x: -400, y:    0, colorIndex: 5, isTemplateNote: true },
      { content: '여기에 포스트잇을 추가하세요', x:  100, y:    0, colorIndex: 5, isTemplateNote: true },
      { content: '여기에 포스트잇을 추가하세요', x:  600, y:    0, colorIndex: 5, isTemplateNote: true },
    ],
  },
]

/** id로 템플릿 조회. 없으면 undefined 반환 */
export function getTemplate(id: string | null): CanvasTemplate | undefined {
  if (!id) return undefined
  return TEMPLATES.find((t) => t.id === id)
}
```

**Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: `src/lib/templates.ts` 관련 에러 없음

**Step 3: 커밋**

```bash
git add src/lib/templates.ts
git commit -m "feat: 캔버스 템플릿 타입 및 TEMPLATES 상수 정의"
```

---

#### Task 2: Note 타입 확장 (복잡도: 낮음, 예상: 30분)

**파일:**
- 수정: `src/types/index.ts`

**Step 1: Note 타입에 신규 필드 추가**

`src/types/index.ts`를 열어 `Note` 타입에 아래 선택적 필드를 추가한다:

```ts
// 기존 Note 타입에 추가
isTemplateNote?: boolean   // 템플릿이 생성한 노트 표시 (편집/삭제 가능, 향후 고정 기능 확장용)
createdAt?: unknown        // Firestore Timestamp (serverTimestamp() 반환값)
createdBy?: string         // 노트 생성자 userId
```

**Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 3: 커밋**

```bash
git add src/types/index.ts
git commit -m "feat: Note 타입에 isTemplateNote, createdAt, createdBy 필드 추가"
```

---

#### Task 3: lib/applyTemplate.ts 생성 (복잡도: 중간, 예상: 1시간)

**파일:**
- 생성: `src/lib/applyTemplate.ts`

이 함수는 Firestore batch 쓰기로 기존 노트를 모두 삭제하고 템플릿 노트를 추가한 뒤 `rooms/{roomId}.templateId`를 업데이트한다.

**Step 1: applyTemplate 함수 작성**

`src/lib/applyTemplate.ts`를 작성한다. `src/lib/firebase.ts`의 `db` 인스턴스를 import하며, 경로는 실제 파일을 확인하여 맞춘다.

```ts
import {
  collection,
  getDocs,
  writeBatch,
  addDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTemplate } from '@/lib/templates'

/**
 * 방에 템플릿을 적용한다 (replace 모드).
 * - 기존 notes 컬렉션을 모두 삭제 (최대 500개, MVP 범위)
 * - 템플릿 노트를 새로 추가
 * - rooms/{roomId}.templateId 업데이트
 *
 * @param roomId          대상 방 ID
 * @param templateId      적용할 템플릿 ID (null이면 빈 캔버스로 초기화)
 * @param viewportCenter  현재 뷰포트 중앙 절대 좌표 — 상대 좌표 → 절대 좌표 변환에 사용
 * @param currentUserId   노트 생성자 ID (createdBy)
 */
export async function applyTemplate(
  roomId: string,
  templateId: string | null,
  viewportCenter: { x: number; y: number },
  currentUserId: string,
): Promise<void> {
  const notesRef = collection(db, 'rooms', roomId, 'notes')
  const roomRef  = doc(db, 'rooms', roomId)

  // 1) 기존 노트 전체 삭제 + templateId 업데이트 (batch)
  const snapshot = await getDocs(notesRef)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  batch.update(roomRef, { templateId })
  await batch.commit()

  // 2) 템플릿 노트 추가 (templateId가 null이면 빈 캔버스 → 추가 없음)
  const template = getTemplate(templateId)
  if (!template) return

  const addPromises = template.notes.map((note) =>
    addDoc(notesRef, {
      content:        note.content,
      x:              viewportCenter.x + note.x,
      y:              viewportCenter.y + note.y,
      colorIndex:     note.colorIndex,
      editorId:       null,
      isTemplateNote: note.isTemplateNote,
      createdAt:      serverTimestamp(),
      createdBy:      currentUserId,
    }),
  )
  await Promise.all(addPromises)
}
```

**Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 3: 커밋**

```bash
git add src/lib/applyTemplate.ts
git commit -m "feat: applyTemplate 함수 구현 (replace 모드, Firestore batch)"
```

---

### Chunk 2: 컴포넌트

#### Task 4: TemplateZoneOverlay 컴포넌트 (복잡도: 낮음, 예상: 1시간)

**파일:**
- 생성: `src/components/TemplateZoneOverlay.tsx`

이 컴포넌트는 캔버스 배경에 Zone 가이드라인을 렌더링한다. `templateId` prop을 받아 `getTemplate()`으로 zones를 조회하여 표시한다.

**Step 1: TemplateZoneOverlay 컴포넌트 작성**

```tsx
'use client'

import { getTemplate } from '@/lib/templates'

type Props = {
  templateId: string | null
  /** 캔버스 중앙의 절대 좌표 (캔버스 변환 기준점) */
  canvasCenter: { x: number; y: number }
}

export default function TemplateZoneOverlay({ templateId, canvasCenter }: Props) {
  const template = getTemplate(templateId)
  if (!template || template.zones.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {template.zones.map((zone) => (
        <div
          key={zone.id}
          style={{
            position:     'absolute',
            left:         canvasCenter.x + zone.x,
            top:          canvasCenter.y + zone.y,
            width:        zone.w,
            height:       zone.h,
            background:   zone.color,
            border:       `2px dashed ${zone.borderColor}`,
            borderRadius: 8,
          }}
        >
          <span
            style={{
              position:   'absolute',
              top:        8,
              left:       12,
              fontSize:   13,
              fontWeight: 600,
              color:      zone.borderColor,
              opacity:    0.7,
              userSelect: 'none',
            }}
          >
            {zone.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 3: 커밋**

```bash
git add src/components/TemplateZoneOverlay.tsx
git commit -m "feat: TemplateZoneOverlay 컴포넌트 추가"
```

---

#### Task 5: TemplatePickerModal 컴포넌트 (복잡도: 중간, 예상: 2시간)

**파일:**
- 생성: `src/components/TemplatePickerModal.tsx`

선택 목록: "빈 캔버스" + TEMPLATES 2종. 기존 노트가 있을 때는 확인 다이얼로그를 먼저 표시한다. "취소" 클릭 시 picker로 돌아가지 않고 캔버스로 직접 복귀한다(스펙 요구사항).

**Step 1: TemplatePickerModal 컴포넌트 작성**

```tsx
'use client'

import { useState } from 'react'
import { TEMPLATES, CanvasTemplate } from '@/lib/templates'

type Props = {
  /** 기존 노트 수 — 0이면 확인 다이얼로그 없이 즉시 적용 */
  existingNoteCount: number
  onSelect: (templateId: string | null) => void
  onClose: () => void
}

export default function TemplatePickerModal({ existingNoteCount, onSelect, onClose }: Props) {
  // undefined = picker 화면, string | null = 확인 다이얼로그 대기 중
  const [pendingId, setPendingId] = useState<string | null | undefined>(undefined)

  function handleCardClick(templateId: string | null) {
    if (existingNoteCount > 0) {
      setPendingId(templateId)
    } else {
      onSelect(templateId)
    }
  }

  function handleConfirm() {
    if (pendingId !== undefined) onSelect(pendingId)
  }

  // 확인 다이얼로그
  if (pendingId !== undefined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
          <h3 className="text-lg font-bold mb-2">기존 노트를 삭제하고 적용할까요?</h3>
          <p className="text-sm text-gray-500 mb-6">
            현재 캔버스의 노트 {existingNoteCount}개가 모두 삭제됩니다.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 템플릿 선택 모달
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md mx-0 sm:mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">템플릿 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* 빈 캔버스 */}
          <button
            onClick={() => handleCardClick(null)}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-400 text-left transition-colors"
          >
            <span className="text-2xl">⬜</span>
            <div>
              <p className="font-semibold text-sm">빈 캔버스로 시작</p>
              <p className="text-xs text-gray-400">자유롭게 시작합니다</p>
            </div>
          </button>

          {/* 템플릿 카드 */}
          {TEMPLATES.map((t: CanvasTemplate) => (
            <button
              key={t.id}
              onClick={() => handleCardClick(t.id)}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-400 text-left transition-colors"
            >
              <span className="text-2xl">{t.name.split(' ')[0]}</span>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

**Step 3: 커밋**

```bash
git add src/components/TemplatePickerModal.tsx
git commit -m "feat: TemplatePickerModal 컴포넌트 추가"
```

---

### Chunk 3: 진입점 연결

#### Task 6: app/page.tsx 수정 — 새 캔버스 생성 시 Picker 표시 (복잡도: 중간, 예상: 1시간)

**파일:**
- 수정: `src/app/page.tsx`

Phase 2에서 "새 캔버스 만들기" 버튼은 즉시 `/room/[roomId]`로 이동했다. 이를 수정하여 `TemplatePickerModal`을 먼저 표시하고 선택 후 이동하도록 변경한다.

**Step 1: app/page.tsx 읽기**

`src/app/page.tsx`를 먼저 읽어 현재 `handleCreateCanvas` 함수의 구조를 파악한다.

**Step 2: picker 상태 및 핸들러 추가**

기존 "새 캔버스 만들기" 핸들러를 아래 패턴으로 수정한다:

```tsx
import { useState } from 'react'
import TemplatePickerModal from '@/components/TemplatePickerModal'

// 컴포넌트 내부에 상태 추가
const [showPicker, setShowPicker] = useState(false)

// 새 핸들러: 선택 완료 시 roomId 생성 + rooms 문서 초기화 + 이동
async function handlePickerSelect(templateId: string | null) {
  setShowPicker(false)
  const roomId = generateRoomId()  // Phase 2에서 구현된 유틸 (src/lib/roomId.ts)
  await setDoc(doc(db, 'rooms', roomId), {
    createdAt:  serverTimestamp(),
    templateId: templateId ?? null,
  })
  router.push(`/room/${roomId}`)
}
```

버튼 onClick을 `() => setShowPicker(true)`로 변경하고 picker 마운트를 추가한다:

```tsx
<>
  <button onClick={() => setShowPicker(true)}>새 캔버스 만들기</button>
  {showPicker && (
    <TemplatePickerModal
      existingNoteCount={0}
      onSelect={handlePickerSelect}
      onClose={() => setShowPicker(false)}
    />
  )}
</>
```

> 주의: 기존 `handleCreateCanvas` 함수가 rooms 문서를 초기화하는 방식(setDoc 경로, 초기 필드)을 그대로 유지하고 `templateId` 필드만 추가한다. 기존 코드 구조를 최대한 보존한다.

**Step 3: 로컬 동작 확인**

```bash
npm run dev
```

- http://localhost:3000 접속
- "새 캔버스 만들기" 클릭 → TemplatePickerModal 표시 확인
- "빈 캔버스로 시작" 선택 → `/room/[roomId]`로 이동 확인

**Step 4: 커밋**

```bash
git add src/app/page.tsx
git commit -m "feat: 새 캔버스 만들기 시 TemplatePickerModal 표시"
```

---

#### Task 7: app/room/[roomId]/page.tsx 수정 — Zone Overlay + 첫 로드 템플릿 적용 (복잡도: 높음, 예상: 3시간)

**파일:**
- 수정: `src/app/room/[roomId]/page.tsx`

두 가지 변경을 수행한다:
1. `TemplateZoneOverlay` 렌더링 추가
2. 첫 접속 시 (`templateId` 있고 notes가 비어있을 때) `applyTemplate` 1회 호출

**Step 1: app/room/[roomId]/page.tsx 읽기**

파일을 먼저 읽어 현재 구조(onSnapshot 훅, isLoading 상태명, canvasCenter 관리 방식)를 파악한다.

**Step 2: templateId 상태 추가 및 rooms 구독**

Phase 2에서 구현된 `rooms/{roomId}` 문서 onSnapshot 구독이 있다면 templateId 읽기를 추가하고, 없다면 신규 구독을 추가한다:

```tsx
const [templateId, setTemplateId] = useState<string | null>(null)

// rooms/{roomId} 구독 (Phase 2 구독 로직 내부에 templateId 읽기 추가)
onSnapshot(doc(db, 'rooms', roomId), (snap) => {
  setTemplateId(snap.data()?.templateId ?? null)
})
```

**Step 3: TemplateZoneOverlay 렌더링 추가**

캔버스 컴포넌트 내부 배경 레이어(z-index 0)에 추가한다:

```tsx
import TemplateZoneOverlay from '@/components/TemplateZoneOverlay'

<TemplateZoneOverlay
  templateId={templateId}
  canvasCenter={canvasCenter}
/>
```

> 주의: `canvasCenter`는 현재 캔버스의 pan offset 기준점이다. Phase 2에서 관리하는 변수명을 확인하고 동일하게 사용한다. 만약 캔버스 중앙 좌표를 별도로 관리하지 않는다면 `{ x: window.innerWidth / 2, y: window.innerHeight / 2 }` 등으로 초기값을 설정한다.

**Step 4: 첫 로드 시 applyTemplate 1회 호출**

```tsx
import { applyTemplate } from '@/lib/applyTemplate'

const templateApplied = useRef(false)

useEffect(() => {
  if (templateApplied.current) return
  // isLoading 가드 필수: 없으면 Firestore 데이터 로드 전 notes.length === 0 조건이
  // 참이 되어 applyTemplate이 조기 실행됨
  if (!isLoading && notes.length === 0 && templateId) {
    templateApplied.current = true
    applyTemplate(roomId, templateId, canvasCenter, currentUserId)
  }
}, [isLoading, notes, templateId])
```

> 주의: `isLoading` 상태명은 Phase 2 구현에 따라 다를 수 있다. `useNotes` 훅이 반환하는 로딩 상태 변수명을 확인하고 동일하게 사용한다.

**Step 5: 로컬 동작 확인**

```bash
npm run dev
```

- "새 캔버스 만들기" → KPT 선택 후 `/room/[id]` 진입
- Keep / Problem / Try 점선 Zone이 배경에 표시되는지 확인
- 제목 노트 3개 + 안내 노트 3개(총 6개)가 올바른 위치에 배치되는지 확인

**Step 6: 커밋**

```bash
git add src/app/room/[roomId]/page.tsx
git commit -m "feat: 캔버스에 TemplateZoneOverlay 추가 및 첫 로드 시 템플릿 적용"
```

---

#### Task 8: BottomToolbar 수정 — 템플릿 버튼 추가 (복잡도: 중간, 예상: 1.5시간)

**파일:**
- 수정: `src/components/BottomToolbar.tsx`
- 수정: `src/app/room/[roomId]/page.tsx` (TemplatePickerModal 연결)

"템플릿" 버튼을 추가하여 총 4개 버튼이 균등 배치되도록 한다.

**Step 1: BottomToolbar.tsx 읽기**

현재 prop 타입과 버튼 구조를 파악한다.

**Step 2: BottomToolbar.tsx 수정**

`onOpenTemplatePicker` prop을 추가하고 템플릿 버튼을 삽입한다:

```tsx
type BottomToolbarProps = {
  // ... 기존 props
  onOpenTemplatePicker: () => void  // 신규
}

// 4버튼 균등 배치
// 모바일(< sm): 아이콘만, 데스크톱(sm 이상): 아이콘 + 레이블
<div className="flex justify-around items-center gap-1">
  <ToolbarButton icon="➕" label="추가"    onClick={onAddNote} />
  <ToolbarButton icon="🗂️" label="템플릿" onClick={onOpenTemplatePicker} />
  <ToolbarButton icon="🤖" label="AI 정리" onClick={onAICluster} />
  <ToolbarButton icon="🎤" label="음성"    onClick={onVoiceMemo} />
</div>
```

`ToolbarButton` 서브컴포넌트에서 모바일 레이블 숨김을 처리한다:

```tsx
function ToolbarButton({
  icon, label, onClick, disabled,
}: {
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 rounded-xl disabled:opacity-40"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] text-gray-500 hidden sm:block">{label}</span>
    </button>
  )
}
```

> 주의: 기존 BottomToolbar.tsx의 `ToolbarButton` 구현 방식을 먼저 확인하고, 이미 비슷한 패턴이 있다면 그 패턴을 유지한다. 새 코드를 강제로 덮어쓰지 않는다.

**Step 3: app/room/[roomId]/page.tsx에 TemplatePickerModal 연결**

```tsx
const [showTemplatePicker, setShowTemplatePicker] = useState(false)

async function handleTemplateSelect(templateId: string | null) {
  setShowTemplatePicker(false)
  if (templateId === null) {
    // "빈 캔버스로 시작": 기존 노트 유지, templateId만 null로 업데이트 (Zone 제거)
    await updateDoc(doc(db, 'rooms', roomId), { templateId: null })
  } else {
    await applyTemplate(roomId, templateId, canvasCenter, currentUserId)
  }
}

// JSX
<BottomToolbar
  onAddNote={handleAddNote}
  onAICluster={handleAICluster}
  onVoiceMemo={handleVoiceMemo}
  onOpenTemplatePicker={() => setShowTemplatePicker(true)}
/>
{showTemplatePicker && (
  <TemplatePickerModal
    existingNoteCount={notes.length}
    onSelect={handleTemplateSelect}
    onClose={() => setShowTemplatePicker(false)}
  />
)}
```

**Step 4: 전체 플로우 확인**

```bash
npm run dev
```

아래 시나리오를 수동으로 확인한다:
- 하단 툴바 4개 버튼 균등 배치 확인
- "템플릿" 버튼 클릭 → TemplatePickerModal 표시
- 브레인스토밍 선택 (기존 노트 있음) → 확인 다이얼로그 표시
- "적용" → 기존 노트 삭제 + 브레인스토밍 노트 배치 확인
- "취소" → 변경 없이 캔버스로 복귀 (picker로 돌아가지 않음)
- 모바일 뷰(375x812)에서 4버튼 균등 배치, 레이블 숨김, 터치 타겟 48px 이상 확인

**Step 5: npm run build 확인**

```bash
npm run build
```

Expected: 에러 없이 성공

**Step 6: 커밋**

```bash
git add src/components/BottomToolbar.tsx src/app/room/[roomId]/page.tsx
git commit -m "feat: 하단 툴바에 템플릿 버튼 추가 및 TemplatePickerModal 연결"
```

---

## 의존성 및 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|-----------|
| `canvasCenter` 좌표 추적 방식이 Phase 2와 다를 수 있음 | 중간 | Task 7 Step 1에서 page.tsx를 먼저 읽어 기존 pan offset 관리 방식 파악 후 맞춤 |
| `isLoading` 상태명 불일치 | 중간 | `useNotes` 훅의 반환값을 확인하고 실제 상태명 사용 |
| `rooms/{roomId}` 문서 onSnapshot이 Phase 2에서 구독 안 된 경우 | 낮음 | 신규 onSnapshot 구독 추가, 기존 notes 구독과 별도로 관리 |
| Firestore batch 500개 제한 (노트 초과 시) | 낮음 | MVP 범위에서 500개 초과 시나리오 불필요, 추후 필요 시 청크 처리 추가 |
| React StrictMode 이중 마운트로 applyTemplate 중복 호출 | 중간 | `useRef(false)` 플래그로 방어 (Task 7 Step 4) |

---

## 완료 기준 (Definition of Done)

- ✅ 새 캔버스 생성 시 TemplatePickerModal이 표시된다
- ✅ KPT 선택 시 Keep / Problem / Try Zone 가이드라인(점선 테두리)이 캔버스 배경에 표시된다
- ✅ KPT 선택 시 제목 노트 3개 + 안내 노트 3개가 올바른 영역에 배치된다
- ✅ 브레인스토밍 선택 시 중심 노트 1개 + 방향 안내 노트 4개가 배치된다
- ✅ 기존 캔버스 하단 툴바 "템플릿" 버튼 클릭 시 TemplatePickerModal이 표시된다
- ✅ 기존 노트가 있을 때 템플릿 선택 시 확인 다이얼로그가 표시된다
- ✅ 확인 다이얼로그 "취소" 클릭 시 picker로 돌아가지 않고 캔버스로 직접 복귀한다
- ✅ templateId 변경이 Firestore를 통해 모든 참여자에게 실시간으로 반영된다
- ✅ KPT Zone 드래그·리사이즈 및 Firestore 실시간 동기화 (rooms/{roomId}.zones)
- ✅ 모바일(375px) 하단 툴바에 4개 버튼이 균등 배치되고 레이블이 숨겨진다
- ✅ `npm run build` 에러 없음

## 단위 테스트 (Jest)

해커톤 피드백(테스트 전략 4/8, CI/CD 3/7) 반영으로 Sprint 5에서 Jest 단위 테스트 및 GitHub Actions CI 파이프라인을 추가했다.

### 설정
| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Jest 30 + React Testing Library 16 |
| 환경 | jest-environment-jsdom |
| 설정 파일 | `jest.config.ts`, `jest.setup.ts` |
| 스크립트 | `npm run test`, `npm run test:ci` (커버리지 포함) |

### 테스트 파일

#### `src/__tests__/hooks/useCluster.test.ts` — 9개
| 테스트 케이스 | 내용 |
|--------------|------|
| 초기 상태 | idle, groups 빈 배열, errorMessage null |
| 노트 부족 에러 | 유효 노트 1개 이하 시 error 상태 |
| 빈 노트 필터 | 공백 노트는 카운트에서 제외 |
| API 성공 | preview 상태 + groups 설정, fetch 호출 파라미터 검증 |
| API 실패 (ok:false) | error 상태 + 서버 에러 메시지 |
| 네트워크 오류 | fetch reject 시 error 상태 |
| cancelCluster | idle로 리셋 |
| applyCluster | 노트 좌표 재배치, applied 상태, 그룹 간 x좌표 차이 검증 |
| undoCluster | 이전 노트 복원 후 idle / apply 전 호출 시 null 반환 |

#### `src/__tests__/hooks/useNotes.test.ts` — 9개
| 테스트 케이스 | 내용 |
|--------------|------|
| 초기 상태 | notes 빈 배열 |
| onSnapshot 매핑 | Firestore 문서를 Note 객체로 변환 |
| addNote | addDoc 호출 + content/x/y 파라미터 |
| addNote (content) | STT 텍스트 content 전달 |
| updateNote | updateDoc에 content 전달 |
| moveNote | updateDoc에 x/y 전달 |
| deleteNote | deleteDoc 호출 |
| changeColor | updateDoc에 colorIndex 전달 |
| 언마운트 | onSnapshot 구독 해제 |

#### `src/__tests__/hooks/useAuth.test.ts` — 7개
| 테스트 케이스 | 내용 |
|--------------|------|
| 초기 상태 | loading true, session null |
| 미인증 시 | signInAnonymously 자동 호출 |
| 인증 완료 | session 설정, loading false |
| 닉네임 복원 | localStorage에서 기존 닉네임 로드 |
| updateNickname | session 업데이트 + localStorage 저장 |
| isNew 플래그 | updateNickname 후 isNew → false |
| 모바일 감지 | matchMedia pointer:coarse → device: 'mobile' |

### 실행 결과
```
Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
```

### GitHub Actions CI (`.github/workflows/ci.yml`)
PR 및 `sprint*` 브랜치 push 시 자동 실행:
```
Lint → Jest 단위 테스트 (--ci --coverage) → Next.js 빌드 검증
```

---

## 검증 결과

- [Playwright 테스트 보고서](sprint5/playwright-report.md)
- [배포 체크리스트](sprint5/deploy.md)

---

## Playwright MCP 검증 시나리오

`npm run dev` 실행 상태에서 아래를 순서대로 검증한다:

```
# 새 캔버스 + KPT 템플릿 적용
1.  browser_navigate → http://localhost:3000
2.  browser_click → "새 캔버스 만들기" 버튼
3.  browser_snapshot → TemplatePickerModal 표시 확인
4.  browser_click → "🔄 KPT 회고" 카드 선택
5.  browser_snapshot → /room/[id]로 이동, KPT Zone 가이드라인 + 노트 배치 확인
6.  browser_console_messages(level: "error") → 에러 없음

# 기존 캔버스에서 템플릿 교체
7.  browser_click → 하단 툴바 "🗂️ 템플릿" 버튼
8.  browser_snapshot → TemplatePickerModal 표시 확인
9.  browser_click → "🧠 브레인스토밍" 카드 선택
10. browser_snapshot → 확인 다이얼로그 표시 확인 (기존 노트 있으므로)
11. browser_click → "적용" 버튼
12. browser_snapshot → KPT 노트 → 브레인스토밍 노트로 교체 확인

# 취소 동작
13. browser_click → 하단 툴바 "🗂️ 템플릿" 버튼
14. browser_click → "🔄 KPT 회고" 선택
15. browser_click → "취소" 버튼
16. browser_snapshot → 브레인스토밍 상태 유지 확인 (변경 없음)

# 모바일 레이아웃
17. browser_resize → 375x812
18. browser_snapshot → 툴바 4버튼 균등 배치, 아이콘만 표시 확인

# 에러 및 네트워크 최종 확인
19. browser_console_messages(level: "error") → 에러 없음
20. browser_network_requests → Firestore 쓰기 요청 성공(200) 확인
```

---

## 예상 산출물

| 파일 | 설명 |
|------|------|
| `src/lib/templates.ts` | 템플릿 타입 + TEMPLATES 상수 (브레인스토밍, KPT) |
| `src/lib/applyTemplate.ts` | Firestore batch 템플릿 적용 함수 |
| `src/components/TemplatePickerModal.tsx` | 템플릿 선택 모달 컴포넌트 |
| `src/components/TemplateZoneOverlay.tsx` | KPT Zone 가이드라인 렌더러 |
| `src/app/page.tsx` | 새 캔버스 생성 시 picker 표시 적용 |
| `src/app/room/[roomId]/page.tsx` | TemplateZoneOverlay + 첫 로드 applyTemplate + TemplatePickerModal 연결 |
| `src/components/BottomToolbar.tsx` | 템플릿 버튼 추가 (4버튼 레이아웃) |
| `src/types/index.ts` | Note 타입 필드 확장 |

---

## 기술 고려사항

- **TEMPLATES 상수 배열**: 훅 추상화 없음. 추후 서버 기반 템플릿이 필요할 때만 래핑한다 (YAGNI).
- **좌표 계산**: 템플릿 노트 좌표는 캔버스 중앙 기준 상대값. `applyTemplate` 호출 시 `viewportCenter`를 전달하여 절대 좌표로 변환한다.
- **applyTemplate 타이밍**: `useRef(false)` 플래그로 React StrictMode 이중 마운트 방어. `isLoading` 가드 없이는 Firestore 로드 전 빈 배열에 반응하여 조기 실행된다.
- **Zone 데이터 저장 위치**: Firestore에는 `templateId`만 저장. 클라이언트가 `TEMPLATES` 배열에서 조회하여 Zone을 렌더링한다.
- **"빈 캔버스로 시작" (기존 캔버스)**: 기존 노트는 유지하고 `templateId: null`만 업데이트하여 Zone을 제거한다.
- **karpathy-guidelines 준수**: 측정하지 않은 성능 최적화 금지. Zone 렌더링에 가상화 불필요 (Zone 수 최대 3개).
