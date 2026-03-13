'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { Note } from '@/types'
import { NOTE_COLORS, NOTE_SIZE } from '@/lib/constants'

interface StickyNoteProps {
  note: Note
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, colorIndex: number) => void
}

// 노트 ID로 일관된 숫자 생성 (스타일 결정용)
function hashId(id: string): number {
  return [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

const PIN_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#27ae60', '#2980b9', '#9b59b6']

export default function StickyNote({ note, onMove, onUpdate, onDelete, onColorChange }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hash = hashId(note.id)
  const rotation = ((hash % 13) - 6) * 0.55          // -3.3 ~ +3.3도
  const usePin = hash % 3 !== 0                        // 2/3은 핀, 1/3은 테이프
  const pinColor = PIN_COLORS[hash % PIN_COLORS.length]

  const handleEnterEdit = useCallback((e?: React.MouseEvent) => {
    let caretOffset: number | null = null
    if (e) {
      const range = 'caretRangeFromPoint' in document
        ? (document as Document).caretRangeFromPoint(e.clientX, e.clientY)
        : null
      if (range) caretOffset = range.startOffset
    }
    setIsEditing(true)
    setTimeout(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      const pos = caretOffset !== null ? caretOffset : textarea.value.length
      textarea.setSelectionRange(pos, pos)
    }, 0)
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    setShowColorPicker(false)
  }, [])

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      onMove(note.id, note.x + info.offset.x, note.y + info.offset.y)
    },
    [note.id, note.x, note.y, onMove]
  )

  const bg = NOTE_COLORS[note.colorIndex] ?? NOTE_COLORS[0]
  const bgColor = useMotionValue(bg)
  useEffect(() => { bgColor.set(bg) }, [bg, bgColor])

  return (
    <motion.div
      drag={!isEditing}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: note.x, y: note.y, opacity: 0, scale: 0.82, rotate: rotation }}
      animate={{ x: note.x, y: note.y, opacity: 1, scale: 1, rotate: rotation }}
      whileDrag={{ scale: 1.07, zIndex: 50, rotate: rotation * 0.4 }}
      style={{
        position: 'absolute',
        width: `clamp(140px, 42vw, ${NOTE_SIZE.width}px)`,
        height: `clamp(112px, 33.6vw, ${NOTE_SIZE.height}px)`,
        backgroundColor: bgColor,
        // 접착면 느낌의 상단 그라데이션 + 종이 질감 미세 선
        backgroundImage: `
          linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 14px),
          repeating-linear-gradient(
            180deg,
            transparent 0px,
            transparent 23px,
            rgba(0,0,0,0.032) 24px
          )
        `,
        borderRadius: '2px 3px 4px 2px',
        boxShadow: `
          0 1px 2px  rgba(0,0,0,0.18),
          0 3px 6px  rgba(0,0,0,0.14),
          0 8px 18px rgba(0,0,0,0.10),
          4px 8px 20px rgba(0,0,0,0.08)
        `,
        cursor: isEditing ? 'text' : 'grab',
        zIndex: isEditing ? 40 : 10,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
      onDoubleClick={(e) => handleEnterEdit(e)}
      data-testid="sticky-note"
    >
      {/* ── 핀 또는 테이프 장식 ── */}
      {usePin ? (
        <div style={{
          position: 'absolute', top: -15, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none', zIndex: 3,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: `radial-gradient(circle at 38% 32%, ${pinColor}bb, ${pinColor})`,
            boxShadow: `0 2px 6px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.45)`,
          }} />
          <div style={{
            width: 2, height: 7,
            background: 'linear-gradient(180deg, #d0d0d0, #909090)',
          }} />
        </div>
      ) : (
        <div style={{
          position: 'absolute', top: -7, left: '50%',
          transform: 'translateX(-50%)',
          width: 44, height: 14,
          background: 'rgba(255,255,255,0.48)',
          border: '1px solid rgba(255,255,255,0.75)',
          borderRadius: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
          pointerEvents: 'none', zIndex: 3,
        }} />
      )}

      {/* ── 상단 바 (색상 + 삭제) ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 6px 2px 6px', height: 30, position: 'relative', zIndex: 3,
      }}>
        {/* 색상 변경 버튼 */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: 22, height: 22, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', padding: 0,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowColorPicker((v) => !v) }}
            aria-label="색상 변경"
          >
            <span style={{
              width: 13, height: 13, borderRadius: '50%', display: 'block',
              background: 'rgba(0,0,0,0.2)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            }} />
          </button>

          {showColorPicker && (
            <div
              style={{
                position: 'absolute', top: 26, left: 0,
                display: 'flex', gap: 6,
                background: 'rgba(255,252,245,0.97)',
                backdropFilter: 'blur(12px)',
                borderRadius: 12, padding: '7px 10px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.9)',
                zIndex: 60,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {NOTE_COLORS.map((color, index) => (
                <button
                  key={color}
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    backgroundColor: color, cursor: 'pointer',
                    border: note.colorIndex === index
                      ? '2.5px solid rgba(0,0,0,0.55)'
                      : '2px solid rgba(0,0,0,0.08)',
                    transition: 'transform 0.12s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
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

        {/* 삭제 버튼 */}
        <button
          className="note-delete-btn"
          style={{
            width: 24, height: 24, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0)', color: 'rgba(0,0,0,0.28)',
            fontSize: 18, fontWeight: 'bold', lineHeight: 1,
            border: 'none', cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
          aria-label="노트 삭제"
          data-testid="delete-note-button"
        >
          ×
        </button>
      </div>

      {/* ── 내용 영역 ── */}
      <div style={{ flex: 1, padding: '0 8px 8px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="note-textarea"
            style={{
              width: '100%', height: '100%',
              background: 'transparent', resize: 'none',
              outline: 'none', border: 'none', padding: 0,
              color: 'rgba(0,0,0,0.72)',
            }}
            value={note.content}
            onChange={(e) => onUpdate(note.id, e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === 'Escape') handleBlur() }}
            placeholder="아이디어를 입력하세요..."
            aria-label="노트 내용 편집"
          />
        ) : (
          <div
            style={{
              height: '100%',
              fontFamily: "'Caveat', cursive",
              fontSize: 16,
              lineHeight: 1.55,
              color: 'rgba(0,0,0,0.68)',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              cursor: 'text',
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEnterEdit() }}
            tabIndex={0}
            role="button"
            aria-label={note.content ? `노트: ${note.content}` : '빈 노트. Enter로 편집'}
          >
            {note.content || (
              <span style={{ color: 'rgba(0,0,0,0.28)', fontStyle: 'italic', fontSize: 14 }}>
                더블클릭하여 편집
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 페이지 필 (우하단) ── */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 0 18px 18px',
        borderColor: `transparent transparent rgba(255,255,255,0.55) transparent`,
        filter: 'drop-shadow(-1px -1px 2px rgba(0,0,0,0.15))',
        pointerEvents: 'none',
      }} />
    </motion.div>
  )
}
