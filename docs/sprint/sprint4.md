# Sprint 4 구현 계획 — AI 클러스터링 및 최종 배포

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Claude API를 활용한 스마트 클러스터링으로 흩어진 아이디어를 자동 그룹화하고, Vercel에 최종 배포하여 프로덕션 릴리스를 완료한다.

**Architecture:** Next.js Route Handler(`app/api/cluster/route.ts`)가 Claude API 프록시 역할을 하며 API 키를 서버 측에서만 관리한다. 클러스터링 프롬프트와 파싱 로직은 `lib/ai.ts`로 분리하고, 컴포넌트는 클러스터링 결과만 받아 Framer Motion layout animation으로 노트를 재배치한다. rate limiting은 외부 의존성 없이 메모리 기반 카운터로 구현한다.

**Tech Stack:** Next.js 15 App Router, TypeScript, Framer Motion v12, Firebase Firestore, Claude API (@anthropic-ai/sdk), Tailwind CSS v4, Vercel

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | Sprint 4 |
| 기간 | 2026-03-28 ~ 2026-04-11 (2주) |
| 브랜치 | `sprint4` |
| 마일스톤 | M4 - 프로덕션 릴리스 |
| 전체 예상 공수 | 30시간 (Must Have) + 7시간 (Should Have) |

---

## 완료 기준 (Definition of Done)

- ⬜ "AI 정리" 버튼 클릭 시 노트들이 주제별로 그룹화되어 재배치됨
- ⬜ 그룹 영역이 시각적으로 구분됨 (배경색 또는 점선 테두리)
- ⬜ 클러스터링 결과를 Undo로 취소하여 원래 위치로 복원 가능
- ⬜ Vercel 배포 URL에서 전체 기능 동작 확인
- ⬜ Open Graph 메타태그로 링크 공유 시 미리보기 정상 표시
- ⬜ 두 대의 실제 디바이스(PC + 모바일)에서 동시 접속 협업 확인 (수동)
- ⬜ Lighthouse Performance 90+, Accessibility 90+
- ⬜ Firebase 일일 무료 할당량 내에서 정상 운영 확인

---

## 구현 범위

### 포함 항목
- Claude API 프록시 Route Handler + rate limiting
- `lib/ai.ts` 프롬프트/파싱 유틸리티
- 클러스터링 기능: 노트 텍스트 수집 → AI 요청 → 재배치 애니메이션
- 그룹 경계 시각화 컴포넌트
- 클러스터링 UX: 로딩 스피너, 결과 미리보기, 적용/취소, Undo
- Vercel 배포: 환경변수 설정, OG 메타태그
- 에러 처리: Claude 실패 메시지, 오프라인 감지, Firebase 재연결
- 성능: 뷰포트 외 노트 렌더링 최적화 (노트 100개 이상 기준)

### 제외 항목
- Redis, Upstash 등 외부 rate limiting 인프라 (메모리 카운터로 충분)
- 클러스터링 결과 Firestore 영구 저장 (재배치된 노트 위치는 Firestore에 저장, 그룹 메타데이터는 로컬 상태)
- 소셜 로그인, 비공개 방 등 MVP 이후 기능

---

## 의존성 및 리스크

| 항목 | 내용 | 대응 방안 |
|------|------|-----------|
| Claude API rate limit | 분당 요청 제한 초과 시 429 | 사용자당 분당 5회 rate limiting + 클라이언트 버튼 쿨다운 |
| Sprint 3 useCanvasGesture scale 상태 | 노트 재배치 좌표가 scale에 따라 달라질 수 있음 | 재배치 시 현재 scale 값을 고려한 좌표 역변환 필요 |
| Vercel 서버리스 메모리 rate limiting | 요청별 독립 실행으로 전역 카운터 공유 불가 | 클라이언트 측 쿨다운 + 서버 rate limiting 병행 |
| Claude 응답 파싱 실패 | JSON 파싱 에러 시 기능 중단 | JSON 파싱 try/catch + fallback 에러 메시지 |

---

## Task 목록

---

### Task 0: 브랜치 확인 및 개발 환경 준비

**파일:**
- 없음 (환경 확인만)

**Step 1: 현재 브랜치 확인**

```bash
git branch --show-current
```
예상 결과: `sprint4`

**Step 2: sprint4 브랜치가 없으면 생성**

```bash
git checkout -b sprint4
```

**Step 3: 개발 서버 정상 실행 확인**

```bash
npm run dev
```
예상 결과: `http://localhost:3000` 에서 캔버스 페이지 정상 렌더링

**Step 4: 빌드 상태 확인**

```bash
npm run build
```
예상 결과: 에러 없이 빌드 성공

---

### Task 1: Claude AI 유틸리티 및 타입 정의

**파일:**
- 생성: `src/lib/ai.ts`
- 수정: `src/types/index.ts`

**Step 1: ClusterResult 타입 추가 (`src/types/index.ts`)**

기존 `Note` 타입 아래에 추가:

```typescript
/** AI 클러스터링 결과 — 단일 그룹 */
export interface ClusterGroup {
  groupId: string;     // 고유 그룹 ID (예: "group-0")
  groupName: string;   // AI가 제안한 그룹명 (예: "개발 아이디어")
  noteIds: string[];   // 이 그룹에 속하는 Note ID 목록
}

/** AI 클러스터링 전체 응답 */
export interface ClusterResult {
  groups: ClusterGroup[];
}

/** 클러스터링 API 요청 바디 */
export interface ClusterRequest {
  notes: Array<{ id: string; content: string }>;
}
```

**Step 2: `src/lib/ai.ts` 작성**

Claude API 호출 로직과 프롬프트를 분리한다.

```typescript
import { ClusterResult } from '@/types';

/** Claude API 응답에서 클러스터 결과를 파싱한다 */
export function parseClusterResponse(raw: string): ClusterResult {
  // Claude가 마크다운 코드 블록으로 감싸는 경우 제거
  const cleaned = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.groups || !Array.isArray(parsed.groups)) {
    throw new Error('응답 형식이 올바르지 않습니다: groups 필드가 없습니다');
  }

  return parsed as ClusterResult;
}

/** Claude에 전달할 클러스터링 프롬프트를 생성한다 */
export function buildClusterPrompt(
  notes: Array<{ id: string; content: string }>
): string {
  const noteList = notes
    .map((n) => `- ID: ${n.id}, 내용: "${n.content}"`)
    .join('\n');

  return `다음 아이디어들을 유사한 주제별로 그룹화하고 각 그룹에 간결한 이름을 제안하세요.

아이디어 목록:
${noteList}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "groups": [
    {
      "groupId": "group-0",
      "groupName": "그룹 이름",
      "noteIds": ["note-id-1", "note-id-2"]
    }
  ]
}

규칙:
- 모든 Note ID는 반드시 응답에 포함되어야 합니다
- 각 Note ID는 정확히 하나의 그룹에만 속해야 합니다
- 그룹명은 10자 이내로 간결하게 작성하세요
- 노트가 2개 미만이면 "기타" 그룹으로 묶으세요`;
}
```

**Step 3: 커밋**

```bash
git add src/lib/ai.ts src/types/index.ts
git commit -m "feat: Claude 클러스터링 유틸리티 및 ClusterResult 타입 추가"
```

---

### Task 2: Claude API Route Handler 구현

**파일:**
- 생성: `src/app/api/cluster/route.ts`

**Step 1: `src/app/api/cluster/route.ts` 작성**

서버 측에서만 Claude API를 호출하며, rate limiting은 메모리 기반 카운터로 구현한다.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildClusterPrompt, parseClusterResponse } from '@/lib/ai';
import { ClusterRequest } from '@/types';

/** 사용자별 요청 카운터 (서버리스 환경에서는 인스턴스별 독립 — 클라이언트 쿨다운으로 보완) */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 5;          // 분당 최대 요청 수
const WINDOW_MS = 60 * 1000;  // 1분

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. API 키 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // 2. Rate limiting (userId는 요청 헤더에서 추출)
    const userId = req.headers.get('x-user-id') ?? 'anonymous';
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'AI 기능은 분당 5회까지만 사용할 수 있습니다' },
        { status: 429 }
      );
    }

    // 3. 요청 바디 파싱
    const body: ClusterRequest = await req.json();
    if (!body.notes || body.notes.length < 2) {
      return NextResponse.json(
        { error: '클러스터링하려면 노트가 2개 이상 필요합니다' },
        { status: 400 }
      );
    }

    // 4. Claude API 호출 (claude-haiku-4-5: 빠르고 저렴, 클러스터링에 충분)
    const client = new Anthropic({ apiKey });
    const prompt = buildClusterPrompt(body.notes);
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const rawText = (message.content[0] as { type: string; text: string }).text;

    // 5. 응답 파싱
    const clusterResult = parseClusterResponse(rawText);

    return NextResponse.json(clusterResult);
  } catch (error) {
    console.error('[/api/cluster] 오류:', error);
    return NextResponse.json(
      { error: 'AI 기능을 일시적으로 사용할 수 없습니다' },
      { status: 500 }
    );
  }
}
```

**Step 2: `@anthropic-ai/sdk` 패키지 설치**

```bash
npm install @anthropic-ai/sdk
```

**Step 3: `.env.local`에 Claude API 키 추가**

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

`.env.local.example`에도 키 추가:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Step 4: 엔드포인트 수동 테스트**

`npm run dev` 실행 후:

```bash
curl -X POST http://localhost:3000/api/cluster \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"notes":[{"id":"1","content":"React 학습"},{"id":"2","content":"Next.js 라우팅"},{"id":"3","content":"저녁 메뉴"},{"id":"4","content":"점심 추천"}]}'
```

예상 결과: HTTP 200 + `{"groups":[...]}` JSON 응답

**Step 5: API 키 없을 때 500 응답 확인**

`ANTHROPIC_API_KEY`를 임시로 제거 후 요청 → HTTP 500 확인

**Step 6: 커밋**

```bash
git add src/app/api/cluster/route.ts .env.local.example package.json package-lock.json
git commit -m "feat: Claude API 프록시 Route Handler 구현 (rate limiting 포함)"
```

---

### Task 3: `useCluster` 훅 구현

**파일:**
- 생성: `src/hooks/useCluster.ts`

**Step 1: `src/hooks/useCluster.ts` 작성**

클러스터링 API 호출과 상태 관리, Undo 기능을 담당한다.

```typescript
import { useState, useCallback } from 'react';
import { Note, ClusterGroup, ClusterResult } from '@/types';

type ClusterStatus = 'idle' | 'loading' | 'preview' | 'applied' | 'error';

interface UseClusterReturn {
  status: ClusterStatus;
  groups: ClusterGroup[];
  errorMessage: string | null;
  requestCluster: (notes: Note[], userId: string) => Promise<void>;
  applyCluster: (notes: Note[]) => Note[];   // 적용: 노트 위치 재배치
  cancelCluster: () => void;                  // 미리보기 취소
  undoCluster: () => Note[] | null;           // 적용 후 Undo
}

/** 그룹별 노트 배치 좌표를 계산한다 (그룹 인덱스 기반 격자 배치) */
function calcGroupPositions(
  groups: ClusterGroup[],
  notes: Note[]
): Map<string, { x: number; y: number }> {
  const noteMap = new Map(notes.map((n) => [n.id, n]));
  const positions = new Map<string, { x: number; y: number }>();

  const GROUP_COL_WIDTH = 360;  // 그룹 열 너비 (px)
  const NOTE_HEIGHT = 180;      // 노트 카드 높이 (px)
  const PADDING = 40;           // 그룹 내 노트 간격

  groups.forEach((group, groupIdx) => {
    const baseX = 80 + groupIdx * GROUP_COL_WIDTH;
    group.noteIds.forEach((noteId, noteIdx) => {
      if (noteMap.has(noteId)) {
        positions.set(noteId, {
          x: baseX,
          y: 80 + noteIdx * (NOTE_HEIGHT + PADDING),
        });
      }
    });
  });

  return positions;
}

export function useCluster(): UseClusterReturn {
  const [status, setStatus] = useState<ClusterStatus>('idle');
  const [groups, setGroups] = useState<ClusterGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previousNotes, setPreviousNotes] = useState<Note[] | null>(null);

  const requestCluster = useCallback(async (notes: Note[], userId: string) => {
    if (notes.length < 2) {
      setErrorMessage('클러스터링하려면 노트가 2개 이상 필요합니다');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          notes: notes.map((n) => ({ id: n.id, content: n.content })),
        }),
      });

      const data: ClusterResult & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'AI 기능을 일시적으로 사용할 수 없습니다');
      }

      setGroups(data.groups);
      setStatus('preview');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 기능을 일시적으로 사용할 수 없습니다';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  const applyCluster = useCallback(
    (notes: Note[]): Note[] => {
      // Undo를 위해 현재 상태 저장
      setPreviousNotes(notes);

      const positions = calcGroupPositions(groups, notes);
      const updatedNotes = notes.map((note) => {
        const pos = positions.get(note.id);
        return pos ? { ...note, x: pos.x, y: pos.y } : note;
      });

      setStatus('applied');
      return updatedNotes;
    },
    [groups]
  );

  const cancelCluster = useCallback(() => {
    setGroups([]);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const undoCluster = useCallback((): Note[] | null => {
    if (!previousNotes) return null;
    const restored = previousNotes;
    setPreviousNotes(null);
    setGroups([]);
    setStatus('idle');
    return restored;
  }, [previousNotes]);

  return {
    status,
    groups,
    errorMessage,
    requestCluster,
    applyCluster,
    cancelCluster,
    undoCluster,
  };
}
```

**Step 2: TypeScript 타입 에러 확인**

```bash
npx tsc --noEmit
```

예상 결과: 에러 없음

**Step 3: 커밋**

```bash
git add src/hooks/useCluster.ts
git commit -m "feat: useCluster 훅 구현 (AI 클러스터링 상태 관리 및 Undo)"
```

---

### Task 4: 그룹 경계 시각화 컴포넌트

**파일:**
- 생성: `src/components/ClusterGroupOverlay.tsx`

**Step 1: `src/components/ClusterGroupOverlay.tsx` 작성**

각 그룹의 배경 영역을 그려 노트 그룹을 시각적으로 구분한다.

```typescript
'use client';

import { motion } from 'framer-motion';
import { ClusterGroup, Note } from '@/types';

interface ClusterGroupOverlayProps {
  groups: ClusterGroup[];
  notes: Note[];
}

/** 그룹에 속한 노트들의 경계 박스를 계산한다 */
function calcBoundingBox(noteIds: string[], notes: Note[]) {
  const noteMap = new Map(notes.map((n) => [n.id, n]));
  const NOTE_WIDTH = 200;
  const NOTE_HEIGHT = 160;
  const PADDING = 24;

  const groupNotes = noteIds
    .map((id) => noteMap.get(id))
    .filter(Boolean) as Note[];

  if (groupNotes.length === 0) return null;

  const xs = groupNotes.map((n) => n.x);
  const ys = groupNotes.map((n) => n.y);

  return {
    left: Math.min(...xs) - PADDING,
    top: Math.min(...ys) - PADDING,
    width: Math.max(...xs) - Math.min(...xs) + NOTE_WIDTH + PADDING * 2,
    height: Math.max(...ys) - Math.min(...ys) + NOTE_HEIGHT + PADDING * 2,
  };
}

/** 그룹 인덱스에 따라 배경색을 반환한다 */
const GROUP_COLORS = [
  'rgba(147, 197, 253, 0.15)',  // blue
  'rgba(167, 243, 208, 0.15)',  // green
  'rgba(253, 230, 138, 0.15)',  // yellow
  'rgba(252, 165, 165, 0.15)',  // red
  'rgba(216, 180, 254, 0.15)',  // purple
];

const GROUP_BORDER_COLORS = [
  'rgba(59, 130, 246, 0.4)',
  'rgba(16, 185, 129, 0.4)',
  'rgba(245, 158, 11, 0.4)',
  'rgba(239, 68, 68, 0.4)',
  'rgba(139, 92, 246, 0.4)',
];

export function ClusterGroupOverlay({ groups, notes }: ClusterGroupOverlayProps) {
  return (
    <>
      {groups.map((group, idx) => {
        const bbox = calcBoundingBox(group.noteIds, notes);
        if (!bbox) return null;

        const colorIdx = idx % GROUP_COLORS.length;

        return (
          <motion.div
            key={group.groupId}
            className="absolute rounded-2xl pointer-events-none"
            style={{
              left: bbox.left,
              top: bbox.top,
              width: bbox.width,
              height: bbox.height,
              backgroundColor: GROUP_COLORS[colorIdx],
              border: `2px dashed ${GROUP_BORDER_COLORS[colorIdx]}`,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* 그룹 이름 레이블 */}
            <div
              className="absolute -top-7 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: GROUP_BORDER_COLORS[colorIdx],
                color: 'white',
              }}
            >
              {group.groupName}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
```

**Step 2: 빌드 에러 확인**

```bash
npx tsc --noEmit
```

**Step 3: 커밋**

```bash
git add src/components/ClusterGroupOverlay.tsx
git commit -m "feat: 클러스터 그룹 경계 시각화 오버레이 컴포넌트 추가"
```

---

### Task 5: 클러스터링 UX — 미리보기 및 적용/취소 UI

**파일:**
- 생성: `src/components/ClusterPreviewModal.tsx`
- 수정: `src/components/BottomToolbar.tsx`

**Step 1: `src/components/ClusterPreviewModal.tsx` 작성**

클러스터링 결과 미리보기와 적용/취소 버튼을 포함한 모달이다.

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ClusterGroup } from '@/types';

interface ClusterPreviewModalProps {
  isOpen: boolean;
  groups: ClusterGroup[];
  onApply: () => void;
  onCancel: () => void;
}

export function ClusterPreviewModal({
  isOpen,
  groups,
  onApply,
  onCancel,
}: ClusterPreviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* 미리보기 패널 */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl p-5 w-[90%] max-w-sm z-10"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <h3 className="text-base font-bold text-gray-800 mb-3">
              AI 정리 결과
            </h3>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {groups.map((group, idx) => (
                <div
                  key={group.groupId}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                    backgroundColor: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'][idx % 5]
                  }} />
                  <span className="font-medium">{group.groupName}</span>
                  <span className="text-gray-400 ml-auto">
                    {group.noteIds.length}개
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium"
              >
                취소
              </button>
              <button
                onClick={onApply}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-sm text-white font-semibold"
              >
                적용
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: `BottomToolbar.tsx`에 AI 정리 버튼 상태 연결**

`BottomToolbar` 컴포넌트의 "AI 정리" 버튼에 `onCluster`, `clusterStatus`, `onUndo` props를 추가한다. 기존 인터페이스를 확인한 후 다음 props를 추가한다:

```typescript
// 추가할 props 타입
interface BottomToolbarProps {
  // ... 기존 props 유지 ...
  onCluster: () => void;
  clusterStatus: 'idle' | 'loading' | 'preview' | 'applied' | 'error';
  onUndo: () => void;
  canUndo: boolean;
}
```

"AI 정리" 버튼 구현:

```typescript
// AI 정리 버튼
<button
  onClick={onCluster}
  disabled={clusterStatus === 'loading'}
  className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center disabled:opacity-50"
  aria-label="AI 정리"
>
  {clusterStatus === 'loading' ? (
    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
  ) : (
    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 010-.707 1 1 0 00-1.414-1.414.5.5 0 01-.707 0L9.343 17.343a.5.5 0 01-.707 0l-.343-.343" />
    </svg>
  )}
  <span className="text-[10px] text-purple-500">AI 정리</span>
</button>

{/* Undo 버튼 (적용 후에만 표시) */}
{canUndo && (
  <button
    onClick={onUndo}
    className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
    aria-label="되돌리기"
  >
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
    <span className="text-[10px] text-gray-500">되돌리기</span>
  </button>
)}
```

**Step 3: TypeScript 에러 확인**

```bash
npx tsc --noEmit
```

**Step 4: 커밋**

```bash
git add src/components/ClusterPreviewModal.tsx src/components/BottomToolbar.tsx
git commit -m "feat: 클러스터링 미리보기 모달 및 BottomToolbar AI 정리 버튼 연결"
```

---

### Task 6: 방 페이지에 클러스터링 기능 통합

**파일:**
- 수정: `src/app/room/[roomId]/page.tsx`
- 수정: `src/components/Canvas.tsx`

**Step 1: `src/app/room/[roomId]/page.tsx`에 useCluster 통합**

기존 `useNotes`, `useAuth` 훅과 함께 `useCluster`를 추가한다:

```typescript
// 기존 import에 추가
import { useCluster } from '@/hooks/useCluster';
import { ClusterGroupOverlay } from '@/components/ClusterGroupOverlay';
import { ClusterPreviewModal } from '@/components/ClusterPreviewModal';

// 훅 사용
const { user } = useAuth();
const { notes, updateNote } = useNotes(roomId);
const {
  status: clusterStatus,
  groups,
  errorMessage: clusterError,
  requestCluster,
  applyCluster,
  cancelCluster,
  undoCluster,
} = useCluster();

// 핸들러
const handleCluster = useCallback(async () => {
  if (!user) return;
  await requestCluster(notes, user.id);
}, [notes, user, requestCluster]);

const handleApplyCluster = useCallback(() => {
  const updatedNotes = applyCluster(notes);
  // 재배치된 노트 위치를 Firestore에 저장
  updatedNotes.forEach((note) => updateNote(note.id, { x: note.x, y: note.y }));
}, [notes, applyCluster, updateNote]);

const handleUndoCluster = useCallback(() => {
  const restoredNotes = undoCluster();
  if (restoredNotes) {
    restoredNotes.forEach((note) => updateNote(note.id, { x: note.x, y: note.y }));
  }
}, [undoCluster, updateNote]);

// 에러 표시 (status가 error일 때 토스트 또는 인라인 메시지)
```

**Step 2: Canvas 컴포넌트에 ClusterGroupOverlay 추가**

Canvas 컴포넌트에 `groups`와 `notes` props를 추가하여 오버레이를 렌더링한다:

```typescript
// Canvas.tsx 내부 캔버스 영역에 추가
{clusterStatus === 'applied' && (
  <ClusterGroupOverlay groups={groups} notes={notes} />
)}
```

**Step 3: ClusterPreviewModal 렌더링 추가**

페이지 최상단 레벨에:

```typescript
<ClusterPreviewModal
  isOpen={clusterStatus === 'preview'}
  groups={groups}
  onApply={handleApplyCluster}
  onCancel={cancelCluster}
/>
```

**Step 4: BottomToolbar에 props 연결**

```typescript
<BottomToolbar
  // ... 기존 props ...
  onCluster={handleCluster}
  clusterStatus={clusterStatus}
  onUndo={handleUndoCluster}
  canUndo={clusterStatus === 'applied'}
/>
```

**Step 5: 에러 메시지 표시**

`clusterStatus === 'error'`일 때 화면 하단에 에러 토스트를 표시한다:

```typescript
{clusterStatus === 'error' && clusterError && (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
    {clusterError}
  </div>
)}
```

**Step 6: TypeScript 에러 확인 및 빌드**

```bash
npx tsc --noEmit && npm run build
```

**Step 7: 커밋**

```bash
git add src/app/room/[roomId]/page.tsx src/components/Canvas.tsx
git commit -m "feat: 방 페이지에 AI 클러스터링 기능 통합"
```

---

### Task 7: Open Graph 메타태그 및 Vercel 배포 준비

**파일:**
- 수정: `src/app/layout.tsx`
- 수정: `src/app/room/[roomId]/page.tsx` (동적 메타데이터)
- 생성: `public/og-image.png` (선택적 — 없으면 생략)

**Step 1: `src/app/layout.tsx`에 기본 OG 메타태그 추가**

Next.js 15 Metadata API를 사용한다:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IdeaFlow — 실시간 아이디어 캔버스',
  description: '가입 없이 링크 공유만으로 팀과 아이디어를 실시간으로 모아보세요',
  openGraph: {
    title: 'IdeaFlow — 실시간 아이디어 캔버스',
    description: '가입 없이 링크 공유만으로 팀과 아이디어를 실시간으로 모아보세요',
    type: 'website',
    locale: 'ko_KR',
    // images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaFlow — 실시간 아이디어 캔버스',
    description: '가입 없이 링크 공유만으로 팀과 아이디어를 실시간으로 모아보세요',
  },
};
```

**Step 2: 방 페이지 동적 메타데이터 추가 (`src/app/room/[roomId]/page.tsx`)**

```typescript
export async function generateMetadata(
  { params }: { params: { roomId: string } }
): Promise<Metadata> {
  return {
    title: `IdeaFlow 캔버스 — ${params.roomId.slice(0, 8)}`,
    description: '이 링크로 실시간 아이디어 캔버스에 참여하세요',
    openGraph: {
      title: `IdeaFlow 캔버스 — ${params.roomId.slice(0, 8)}`,
      description: '이 링크로 실시간 아이디어 캔버스에 참여하세요',
    },
  };
}
```

**Step 3: 프로덕션 빌드 최종 확인**

```bash
npm run build
```

예상 결과: 에러 없이 빌드 성공

**Step 4: Vercel 배포 설정 (수동 작업 — `docs/sprint/sprint4/deploy.md` 참조)**

아래 환경변수를 Vercel 대시보드에 설정해야 한다:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `ANTHROPIC_API_KEY` (서버 전용, NEXT_PUBLIC_ 접두사 없음)

**Step 5: 커밋**

```bash
git add src/app/layout.tsx src/app/room/[roomId]/page.tsx
git commit -m "feat: Open Graph 메타태그 추가 및 Vercel 배포 준비"
```

---

### Task 8: 에러 처리 및 안정성 강화 (Should Have)

**파일:**
- 생성: `src/hooks/useOnlineStatus.ts`
- 수정: `src/hooks/useNotes.ts`
- 수정: `src/app/room/[roomId]/page.tsx`

**Step 1: `src/hooks/useOnlineStatus.ts` 작성**

```typescript
import { useState, useEffect } from 'react';

/** 브라우저 네트워크 연결 상태를 모니터링한다 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**Step 2: 오프라인 배너 컴포넌트를 방 페이지에 추가**

```typescript
// src/app/room/[roomId]/page.tsx 내부
const isOnline = useOnlineStatus();

// JSX
{!isOnline && (
  <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-yellow-900 text-xs text-center py-1.5 font-medium">
    오프라인 상태 — 인터넷 연결을 확인해주세요
  </div>
)}
```

**Step 3: Firebase 재연결 로직 확인**

Firestore 오프라인 캐시(`enableIndexedDbPersistence`)가 Sprint 2에서 이미 활성화되어 있는지 `src/lib/firebase.ts`에서 확인한다. 없으면 추가:

```typescript
// src/lib/firebase.ts에 없는 경우 추가
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Firestore 초기화 후
enableIndexedDbPersistence(db).catch((err) => {
  console.warn('Firestore 오프라인 캐시 활성화 실패:', err.code);
});
```

**Step 4: TypeScript 에러 확인**

```bash
npx tsc --noEmit
```

**Step 5: 커밋**

```bash
git add src/hooks/useOnlineStatus.ts src/lib/firebase.ts src/app/room/[roomId]/page.tsx
git commit -m "feat: 오프라인 상태 감지 및 Firebase 재연결 로직 추가"
```

---

### Task 9: 성능 최적화 — 뷰포트 외 노트 가상화 (Should Have)

**파일:**
- 생성: `src/hooks/useViewportNotes.ts`
- 수정: `src/components/Canvas.tsx`

> **karpathy-guidelines 주의:** 먼저 노트 100개 이상 시나리오를 실제로 테스트하여 성능 문제가 확인된 경우에만 이 Task를 수행한다.

**Step 1: 성능 측정 먼저 수행**

Chrome DevTools Performance 탭에서 노트 100개 시나리오를 녹화하여 렌더링 시간이 16ms(60fps)를 초과하는지 확인한다. 문제가 없으면 이 Task를 건너뛴다.

**Step 2: `src/hooks/useViewportNotes.ts` 작성 (성능 문제 확인 시)**

```typescript
import { useMemo } from 'react';
import { Note } from '@/types';

interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

const OVERSCAN = 200; // 뷰포트 밖 여유 영역 (px)

/** 현재 뷰포트 범위 내에 있는 노트만 필터링한다 */
export function useViewportNotes(notes: Note[], viewport: ViewportBounds): Note[] {
  return useMemo(() => {
    const NOTE_WIDTH = 200;
    const NOTE_HEIGHT = 160;

    const viewLeft = -viewport.x / viewport.scale - OVERSCAN;
    const viewTop = -viewport.y / viewport.scale - OVERSCAN;
    const viewRight = viewLeft + viewport.width / viewport.scale + OVERSCAN * 2;
    const viewBottom = viewTop + viewport.height / viewport.scale + OVERSCAN * 2;

    return notes.filter((note) => {
      return (
        note.x + NOTE_WIDTH > viewLeft &&
        note.x < viewRight &&
        note.y + NOTE_HEIGHT > viewTop &&
        note.y < viewBottom
      );
    });
  }, [notes, viewport]);
}
```

**Step 3: Canvas.tsx에서 viewportNotes 사용**

```typescript
// Canvas.tsx 내부
const viewportNotes = useViewportNotes(notes, { x: panX, y: panY, width, height, scale });

// notes.map 대신 viewportNotes.map 사용
```

**Step 4: Lighthouse 측정**

```bash
npm run build && npm run start
```

Chrome DevTools Lighthouse 탭에서 Performance, Accessibility 측정 → 90+ 달성 확인

**Step 5: 커밋**

```bash
git add src/hooks/useViewportNotes.ts src/components/Canvas.tsx
git commit -m "perf: 뷰포트 외 노트 렌더링 최적화 (가상화)"
```

---

### Task 10: Playwright MCP 검증 시나리오 실행

> `npm run dev` 실행 상태에서 아래 시나리오를 순서대로 실행한다.

**Step 1: AI 클러스터링 기본 검증**

1. `browser_navigate` → `http://localhost:3000/room/test-room` 접속
2. `browser_resize` → 375x812 (모바일 뷰포트)
3. `browser_snapshot` → 하단 툴바에 "AI 정리" 버튼 존재 확인
4. 노트 추가 버튼 5회 클릭 → 각 노트에 텍스트 입력:
   - "React 학습", "Next.js 라우팅", "저녁 메뉴", "점심 추천", "운동 계획"
5. `browser_click` → "AI 정리" 버튼 클릭
6. `browser_wait_for` → 로딩 스피너 표시 대기 (최대 10초)
7. `browser_snapshot` → 클러스터링 결과 미리보기 모달 확인
8. `browser_click` → "적용" 버튼 클릭
9. `browser_snapshot` → 노트가 그룹별로 재배치 및 그룹 경계 표시 확인
10. `browser_network_requests` → `/api/cluster` 요청 200 응답 확인
11. `browser_console_messages(level: "error")` → 에러 없음 확인

**Step 2: Undo 기능 검증**

1. `browser_snapshot` → 클러스터링 적용 상태 (Undo 버튼 존재 확인)
2. `browser_click` → "되돌리기" 버튼 클릭
3. `browser_snapshot` → 노트가 원래 위치로 복원되었는지 확인

**Step 3: 취소(Cancel) 기능 검증**

1. `browser_click` → "AI 정리" 버튼 클릭
2. `browser_wait_for` → 미리보기 모달 표시 대기
3. `browser_click` → "취소" 버튼 클릭
4. `browser_snapshot` → 노트 위치 변화 없이 모달이 닫혔는지 확인

**Step 4: 에러 처리 검증**

1. `browser_navigate` → `http://localhost:3000/room/test-room` 접속 (노트 0개 상태)
2. `browser_click` → "AI 정리" 버튼 클릭
3. `browser_snapshot` → "노트가 2개 이상 필요합니다" 에러 메시지 확인

**Step 5: Open Graph 메타태그 검증**

1. `browser_navigate` → `http://localhost:3000`
2. `browser_evaluate` → `document.querySelector('meta[property="og:title"]').content` 실행
3. 예상 결과: `"IdeaFlow — 실시간 아이디어 캔버스"`

**Step 6: 데스크톱 레이아웃 검증**

1. `browser_resize` → 1440x900
2. `browser_navigate` → `http://localhost:3000/room/test-room`
3. `browser_snapshot` → 데스크톱 레이아웃 및 AI 정리 버튼 확인
4. `browser_console_messages(level: "error")` → 에러 없음 확인

---

## 예상 산출물

| 파일 | 설명 |
|------|------|
| `src/lib/ai.ts` | Claude 프롬프트 빌더 및 응답 파서 |
| `src/app/api/cluster/route.ts` | Claude API 프록시 Route Handler (rate limiting 포함) |
| `src/hooks/useCluster.ts` | 클러스터링 상태 관리 훅 (Undo 포함) |
| `src/components/ClusterGroupOverlay.tsx` | 그룹 경계 시각화 컴포넌트 |
| `src/components/ClusterPreviewModal.tsx` | 클러스터링 결과 미리보기 모달 |
| `src/hooks/useOnlineStatus.ts` | 오프라인 상태 감지 훅 |
| `src/hooks/useViewportNotes.ts` | 뷰포트 내 노트 필터링 훅 (성능 필요 시) |
| `docs/sprint/sprint4/deploy.md` | 수동 배포 절차 및 환경변수 가이드 |

---

## 수동 작업 항목 (deploy.md 참조)

다음 항목은 자동화할 수 없어 수동으로 수행해야 한다:

- ⬜ Google AI Studio에서 Claude API 키 발급
- ⬜ Vercel 프로젝트 연결 (`vercel link`)
- ⬜ Vercel 환경변수 설정 (Firebase 6개 + `ANTHROPIC_API_KEY`)
- ⬜ Vercel 배포 URL에서 전체 기능 동작 확인
- ⬜ 실제 디바이스 2대(PC + 모바일)에서 협업 테스트
- ⬜ Chrome DevTools Lighthouse Performance 90+ 확인
- ⬜ 음성 메모 + AI 정리 연동 테스트 (모바일 Chrome)

---

## 기술 고려사항

- **Claude API 키 보안**: `ANTHROPIC_API_KEY`는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. Route Handler에서만 `process.env.ANTHROPIC_API_KEY`로 접근한다.
- **노트 재배치 좌표**: `applyCluster` 에서 좌표를 계산할 때 `useCanvasGesture`의 현재 `scale` 값과 무관한 절대 캔버스 좌표를 사용한다 (Framer Motion `drag`가 캔버스 transform 공간에서 동작하므로).
- **Firestore 재배치 저장**: 클러스터링 적용 시 `updateNote(id, {x, y})`를 호출하여 Firestore에 새 위치를 저장한다. Undo 시에도 동일하게 원래 좌표로 복원한다.
- **rate limiting 서버리스 한계**: Vercel 서버리스 함수는 요청별로 독립 실행되므로 메모리 `rateLimitMap`이 인스턴스 간 공유되지 않는다. 클라이언트 측 쿨다운(버튼 비활성화 타이머)을 추가로 구현하여 보완한다.
- **Claude 응답 안정성**: 프롬프트에 `JSON만 응답` 지침을 명시하고, `parseClusterResponse`에서 마크다운 코드 블록 제거 후 파싱한다.

---

_작성일: 2026-03-14_
_작성자: sprint-planner 에이전트_
