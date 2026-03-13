'use client'

import { useState } from 'react'
import { TEMPLATES, CanvasTemplate } from '@/lib/templates'

type Props = {
  existingNoteCount: number
  onSelect: (templateId: string | null) => void
  onClose: () => void
}

export default function TemplatePickerModal({ existingNoteCount, onSelect, onClose }: Props) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md mx-0 sm:mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">템플릿 선택</h2>
          <button onClick={onClose} aria-label="닫기" className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="flex flex-col gap-3">
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
