'use client'

import { use, useCallback, useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { useCursors } from '@/hooks/useCursors'
import { useSpeechToText } from '@/hooks/useSpeechToText'
import { NicknameModal } from '@/components/NicknameModal'
import Canvas from '@/components/Canvas'
import BottomToolbar from '@/components/BottomToolbar'
import MiniMap from '@/components/MiniMap'
import CursorLayer from '@/components/CursorLayer'
import dynamic from 'next/dynamic'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { applyTemplate } from '@/lib/applyTemplate'
import TemplatePickerModal from '@/components/TemplatePickerModal'
import TemplateZoneOverlay from '@/components/TemplateZoneOverlay'

const ClusterGroupOverlay = dynamic(
  () => import('@/components/ClusterGroupOverlay').then((m) => m.ClusterGroupOverlay),
  { ssr: false }
)
const ClusterPreviewModal = dynamic(
  () => import('@/components/ClusterPreviewModal').then((m) => m.ClusterPreviewModal),
  { ssr: false }
)
import { useCluster } from '@/hooks/useCluster'

interface Props {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: Props) {
  const { roomId } = use(params)
  const { session, loading, updateNickname } = useAuth()
  const { notes, addNote, updateNote, moveNote, deleteNote, changeColor } = useNotes(roomId)
  const { cursors, updateCursor } = useCursors(
    roomId,
    session?.uid ?? '',
    session?.nickname ?? '익명 사용자',
    session?.color ?? '#4ECDC4',
    session?.device ?? 'desktop'
  )
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 템플릿 관련 상태
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const templateApplied = useRef(false)

  // rooms/{roomId} onSnapshot으로 templateId 구독
  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId)
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setTemplateId(data.templateId ?? null)
      }
    })
    return () => unsubscribe()
  }, [roomId])

  // 첫 로드 시 템플릿 자동 적용 (노트가 없고 templateId가 있을 때 1회)
  useEffect(() => {
    if (loading) return
    if (templateApplied.current) return
    if (!session) return
    if (notes.length === 0 && templateId) {
      templateApplied.current = true
      const center = {
        x: viewOffset.x + (viewSize.width || window.innerWidth) / 2,
        y: viewOffset.y + (viewSize.height || window.innerHeight) / 2,
      }
      applyTemplate(roomId, templateId, center, session.uid)
    }
  // notes.length 변화 전 최초 1회만 실행되도록 의도적으로 의존성 제한
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, templateId, session?.uid])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setViewSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handlePan = useCallback((dx: number, dy: number) => {
    setViewOffset(prev => ({ x: prev.x - dx, y: prev.y - dy }))
  }, [])

  const handleAddNote = useCallback(() => {
    const offset = (notes.length % 10) * 20
    addNote(
      viewOffset.x + (viewSize.width || window.innerWidth) / 2 + offset,
      viewOffset.y + (viewSize.height || window.innerHeight) / 2 + offset,
    )
  }, [addNote, notes.length, viewOffset, viewSize])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // 캔버스 좌표계로 변환 (viewOffset 적용)
    updateCursor(e.clientX + viewOffset.x, e.clientY + viewOffset.y)
  }, [updateCursor, viewOffset])

  // 모바일 터치 이동 시 커서 위치 업데이트 (단일 터치만)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      updateCursor(touch.clientX + viewOffset.x, touch.clientY + viewOffset.y)
    }
  }, [updateCursor, viewOffset])

  // 세션 시작 시 초기 커서 등록 (모바일 포함 — 마우스 이동 없어도 접속자로 표시)
  useEffect(() => {
    if (!session || loading) return
    updateCursor(
      viewOffset.x + window.innerWidth / 2,
      viewOffset.y + window.innerHeight / 2,
    )
  // session.uid가 확정될 때 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid])

  // 클러스터링 훅
  const {
    status: clusterStatus,
    groups: clusterGroups,
    errorMessage: clusterError,
    requestCluster,
    applyCluster,
    cancelCluster,
    undoCluster,
  } = useCluster()

  const handleCluster = useCallback(async () => {
    if (!session) return
    await requestCluster(notes, session.uid)
  }, [notes, session, requestCluster])

  const handleApplyCluster = useCallback(() => {
    const updated = applyCluster(notes)
    updated.forEach((note) => {
      const original = notes.find((n) => n.id === note.id)
      if (original && (original.x !== note.x || original.y !== note.y)) {
        moveNote(note.id, note.x, note.y)
      }
    })
  }, [notes, applyCluster, moveNote])

  const handleUndoCluster = useCallback(() => {
    const restored = undoCluster()
    if (restored) {
      restored.forEach((note) => moveNote(note.id, note.x, note.y))
    }
  }, [undoCluster, moveNote])

  // 음성 인식 훅
  const {
    isSupported: isMicSupported,
    isListening: isMicListening,
    interimText,
    start: startMic,
    stop: stopMic,
  } = useSpeechToText({
    lang: 'ko-KR',
    onResult: (text) => {
      const offset = (notes.length % 10) * 20
      addNote(
        viewOffset.x + (viewSize.width || window.innerWidth) / 2 + offset,
        viewOffset.y + (viewSize.height || window.innerHeight) / 2 + offset,
        text,
      )
    },
  })

  const handleMicClick = useCallback(() => {
    if (isMicListening) stopMic()
    else startMic()
  }, [isMicListening, startMic, stopMic])

  // 템플릿 선택 핸들러
  const handleTemplateSelect = useCallback(async (selectedTemplateId: string | null) => {
    setShowTemplatePicker(false)
    if (!session) return
    templateApplied.current = true
    const center = {
      x: viewOffset.x + (viewSize.width || window.innerWidth) / 2,
      y: viewOffset.y + (viewSize.height || window.innerHeight) / 2,
    }
    await applyTemplate(roomId, selectedTemplateId, center, session.uid)
  }, [session, roomId, viewOffset, viewSize])

  // 캔버스 중심점 (TemplateZoneOverlay용)
  const canvasCenter = {
    x: (viewSize.width || window.innerWidth) / 2 - viewOffset.x,
    y: (viewSize.height || window.innerHeight) / 2 - viewOffset.y,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#c4a472]">
        <div className="text-white text-sm font-medium">연결 중...</div>
      </div>
    )
  }

  return (
    <main
      ref={containerRef}
      className="relative flex w-screen h-dvh overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {session?.isNew && <NicknameModal onConfirm={updateNickname} />}

      {/* 메인 캔버스 영역 */}
      <div className="relative flex-1 overflow-hidden">
        <Canvas
          notes={notes}
          viewOffset={viewOffset}
          onMove={moveNote}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onColorChange={changeColor}
          onPan={handlePan}
          overlay={
            <>
              <TemplateZoneOverlay templateId={templateId} canvasCenter={canvasCenter} />
              {clusterStatus === 'applied' && clusterGroups.length > 0
                ? <ClusterGroupOverlay groups={clusterGroups} notes={notes} />
                : null}
            </>
          }
        />

        <CursorLayer cursors={cursors} viewOffset={viewOffset} />

        {viewSize.width > 0 && (
          <MiniMap
            notes={notes}
            viewOffset={viewOffset}
            viewSize={viewSize}
            onNavigate={(x, y) => setViewOffset({ x, y })}
          />
        )}
      </div>

      {/* 데스크톱 전용 우측 사이드바 (lg: 1024px 이상) */}
      <aside className="hidden lg:flex lg:flex-col w-56 border-l border-amber-200/50 bg-amber-50/80 backdrop-blur-sm p-4 z-10">
        <h2 className="text-xs font-semibold text-amber-700/70 uppercase tracking-wider mb-3">
          접속자 {cursors.length + (session ? 1 : 0)}명
        </h2>
        <div className="flex flex-col gap-2">
          {session && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: session.color }} />
              <span className="text-sm text-amber-900/80 truncate">
                {session.device === 'mobile' ? '📱' : '💻'} {session.nickname} (나)
              </span>
            </div>
          )}
          {cursors.map((cursor) => (
            <div key={cursor.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cursor.color }} />
              <span className="text-sm text-amber-900/80 truncate">
                {cursor.device === 'mobile' ? '📱' : '💻'} {cursor.nickname}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <BottomToolbar
        onAddNote={handleAddNote}
        onMicClick={handleMicClick}
        isMicListening={isMicListening}
        isMicSupported={isMicSupported}
        interimText={interimText}
        onCluster={handleCluster}
        clusterStatus={clusterStatus}
        onUndo={handleUndoCluster}
        canUndo={clusterStatus === 'applied'}
        onOpenTemplatePicker={() => setShowTemplatePicker(true)}
      />

      <ClusterPreviewModal
        isOpen={clusterStatus === 'preview'}
        groups={clusterGroups}
        onApply={handleApplyCluster}
        onCancel={cancelCluster}
      />

      {/* 템플릿 선택 모달 */}
      {showTemplatePicker && (
        <TemplatePickerModal
          existingNoteCount={notes.length}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* 에러 토스트 */}
      {clusterStatus === 'error' && clusterError && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(239,68,68,0.95)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          padding: '8px 16px', borderRadius: 99,
          boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
          zIndex: 60, whiteSpace: 'nowrap',
        }}>
          {clusterError}
        </div>
      )}
    </main>
  )
}
