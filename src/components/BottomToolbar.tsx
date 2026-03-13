'use client'

interface BottomToolbarProps {
  onAddNote: () => void
  onMicClick?: () => void
  isMicListening?: boolean
  isMicSupported?: boolean
  interimText?: string
}

export default function BottomToolbar({
  onAddNote,
  onMicClick,
  isMicListening = false,
  isMicSupported = false,
  interimText,
}: BottomToolbarProps) {
  return (
    <>
      {/* 음성 인식 중간 결과 말풍선 */}
      {interimText && (
        <div style={{
          position: 'fixed', bottom: 96, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,252,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16, padding: '10px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid rgba(200,170,110,0.35)',
          fontSize: 14, color: 'rgba(0,0,0,0.75)',
          maxWidth: 280, textAlign: 'center',
          zIndex: 25,
        }}>
          🎤 {interimText}
        </div>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
        data-testid="bottom-toolbar"
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(160deg, rgba(255,252,245,0.95) 0%, rgba(245,238,225,0.97) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '8px 14px',
          boxShadow: `
            0 8px 32px rgba(80,45,10,0.25),
            0 2px 8px  rgba(80,45,10,0.15),
            inset 0 1px 0 rgba(255,255,255,0.95)
          `,
          border: '1px solid rgba(200,170,110,0.35)',
        }}>

          {/* 노트 추가 FAB */}
          <button
            className="fab-add"
            style={{
              width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 14,
              background: 'linear-gradient(145deg, #FFE566 0%, #FFD000 100%)',
              border: '1px solid rgba(200,160,0,0.3)',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(220,170,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
              transition: 'transform 0.12s, filter 0.12s',
            }}
            onClick={onAddNote}
            aria-label="노트 추가"
            data-testid="add-note-button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,0,0,0.6)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* 구분선 */}
          <div style={{ width: 1, height: 26, background: 'rgba(160,120,60,0.2)', margin: '0 2px' }} />

          {/* AI 정리 버튼 (비활성) */}
          <button
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'not-allowed', opacity: 0.38,
            }}
            disabled
            aria-label="AI 정리 (Phase 4에서 활성화)"
            title="Phase 4에서 구현 예정"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="rgba(80,50,20,0.7)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
          </button>

          {/* 음성 메모 버튼 */}
          <button
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12,
              background: isMicListening
                ? 'linear-gradient(145deg, #ff6b6b, #ee5a24)'
                : 'rgba(0,0,0,0.04)',
              border: isMicListening
                ? '1px solid rgba(200,0,0,0.3)'
                : '1px solid rgba(0,0,0,0.06)',
              cursor: isMicSupported ? 'pointer' : 'not-allowed',
              opacity: isMicSupported ? 1 : 0.38,
              transition: 'background 0.2s, transform 0.1s',
            }}
            onClick={isMicSupported ? onMicClick : undefined}
            disabled={!isMicSupported}
            aria-label={isMicListening ? '음성 인식 중지' : '음성 메모'}
            title={isMicSupported ? undefined : '이 브라우저는 음성 인식을 지원하지 않습니다'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={isMicListening ? 'rgba(255,255,255,0.9)' : 'rgba(80,50,20,0.7)'}
              strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
