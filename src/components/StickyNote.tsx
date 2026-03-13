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

  const handleEnterEdit = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
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
      <div className="flex justify-between items-center mb-1 h-6">
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
