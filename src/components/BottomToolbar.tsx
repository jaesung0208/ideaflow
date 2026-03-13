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
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-white/50">
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all shadow-md"
          onClick={onAddNote}
          aria-label="노트 추가"
          data-testid="add-note-button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 opacity-40 cursor-not-allowed"
          disabled
          aria-label="AI 정리 (Phase 4에서 활성화)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 opacity-40 cursor-not-allowed"
          disabled
          aria-label="음성 메모 (Phase 3에서 활성화)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
