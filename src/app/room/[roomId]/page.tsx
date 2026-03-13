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
      // 음성 인식 완료 시 현재 뷰 중앙에 새 포스트잇 생성 (빈 노트 — 내용은 사용자가 편집)
      const offset = (notes.length % 10) * 20
      addNote(
        viewOffset.x + (viewSize.width || window.innerWidth) / 2 + offset,
        viewOffset.y + (viewSize.height || window.innerHeight) / 2 + offset,
      )
      // addNote는 content를 받지 않으므로, 인식된 텍스트(text)는 현재 콘솔에만 기록
      // 향후 addNote(x, y, content) 시그니처 확장 시 활용 가능
      console.info('[STT] 인식된 텍스트:', text)
    },
  })

  const handleMicClick = useCallback(() => {
    if (isMicListening) stopMic()
    else startMic()
  }, [isMicListening, startMic, stopMic])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#c4a472]">
        <div className="text-white/70 text-sm">연결 중...</div>
      </div>
    )
  }

  return (
    <div
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
            clusterStatus === 'applied' && clusterGroups.length > 0
              ? <ClusterGroupOverlay groups={clusterGroups} notes={notes} />
              : undefined
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
      />

      <ClusterPreviewModal
        isOpen={clusterStatus === 'preview'}
        groups={clusterGroups}
        onApply={handleApplyCluster}
        onCancel={cancelCluster}
      />

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
    </div>
  )
}
