'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ClusterGroup } from '@/types'

interface Props {
  isOpen: boolean
  groups: ClusterGroup[]
  onApply: () => void
  onCancel: () => void
}

const DOT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function ClusterPreviewModal({ isOpen, groups, onApply, onCancel }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 96,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 배경 */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
            onClick={onCancel}
          />

          {/* 패널 */}
          <motion.div
            style={{
              position: 'relative', zIndex: 10,
              background: 'rgba(255,252,245,0.98)',
              borderRadius: 20, padding: '20px 20px 16px',
              width: '90%', maxWidth: 360,
              boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
              border: '1px solid rgba(200,170,110,0.3)',
            }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.82)', marginBottom: 14 }}>
              AI 정리 결과
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
              {groups.map((group, idx) => (
                <div key={group.groupId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: DOT_COLORS[idx % DOT_COLORS.length],
                  }} />
                  <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.75)', fontWeight: 600 }}>
                    {group.groupName}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', marginLeft: 'auto' }}>
                    {group.noteIds.length}개
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12,
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: 'none', fontSize: 14, color: 'rgba(0,0,0,0.6)',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                취소
              </button>
              <button
                onClick={onApply}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12,
                  background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
                  border: 'none', fontSize: 14, color: '#fff',
                  cursor: 'pointer', fontWeight: 700,
                  boxShadow: '0 3px 12px rgba(99,102,241,0.4)',
                }}
              >
                적용
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
