'use client'

type ClusterStatus = 'idle' | 'loading' | 'preview' | 'applied' | 'error'

interface BottomToolbarProps {
  onAddNote: () => void
  onMicClick?: () => void
  isMicListening?: boolean
  isMicSupported?: boolean
  interimText?: string
  onCluster?: () => void
  clusterStatus?: ClusterStatus
  onUndo?: () => void
  canUndo?: boolean
  onOpenTemplatePicker?: () => void
}

export default function BottomToolbar({
  onAddNote,
  onMicClick,
  isMicListening = false,
  isMicSupported = false,
  interimText,
  onCluster,
  clusterStatus = 'idle',
  onUndo,
  canUndo = false,
  onOpenTemplatePicker,
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

          {/* AI 정리 버튼 */}
          <button
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12,
              background: clusterStatus === 'loading'
                ? 'rgba(99,102,241,0.12)'
                : clusterStatus === 'applied'
                  ? 'rgba(99,102,241,0.18)'
                  : 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(99,102,241,0.2)',
              cursor: clusterStatus === 'loading' ? 'not-allowed' : 'pointer',
              opacity: clusterStatus === 'loading' ? 0.7 : 1,
              transition: 'background 0.2s',
            }}
            onClick={onCluster}
            disabled={clusterStatus === 'loading'}
            aria-label="AI 정리"
            title="노트를 주제별로 자동 정리"
          >
            {clusterStatus === 'loading' ? (
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2.5px solid rgba(99,102,241,0.3)',
                borderTopColor: 'rgba(99,102,241,0.9)',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="rgba(99,102,241,0.85)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            )}
          </button>

          {/* 되돌리기 버튼 (클러스터링 적용 후에만 표시) */}
          {canUndo && (
            <button
              style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 12,
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
              onClick={onUndo}
              aria-label="되돌리기"
              title="AI 정리 취소"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="rgba(80,50,20,0.65)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" />
              </svg>
            </button>
          )}

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

          {/* 템플릿 버튼 */}
          <button
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={onOpenTemplatePicker}
            aria-label="템플릿 선택"
            title="캔버스 템플릿 선택"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="rgba(80,50,20,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
