'use client'

import { motion } from 'framer-motion'
import type { ClusterGroup, Note } from '@/types'

interface Props {
  groups: ClusterGroup[]
  notes: Note[]
}

const GROUP_BG = [
  'rgba(147,197,253,0.15)',
  'rgba(167,243,208,0.15)',
  'rgba(253,230,138,0.15)',
  'rgba(252,165,165,0.15)',
  'rgba(216,180,254,0.15)',
]
const GROUP_BORDER = [
  'rgba(59,130,246,0.45)',
  'rgba(16,185,129,0.45)',
  'rgba(245,158,11,0.45)',
  'rgba(239,68,68,0.45)',
  'rgba(139,92,246,0.45)',
]

const NOTE_W = 200
const NOTE_H = 160
const PAD = 28

function boundingBox(noteIds: string[], notes: Note[]) {
  const map = new Map(notes.map((n) => [n.id, n]))
  const grouped = noteIds.map((id) => map.get(id)).filter(Boolean) as Note[]
  if (!grouped.length) return null
  const xs = grouped.map((n) => n.x)
  const ys = grouped.map((n) => n.y)
  return {
    left: Math.min(...xs) - PAD,
    top: Math.min(...ys) - PAD,
    width: Math.max(...xs) - Math.min(...xs) + NOTE_W + PAD * 2,
    height: Math.max(...ys) - Math.min(...ys) + NOTE_H + PAD * 2,
  }
}

export function ClusterGroupOverlay({ groups, notes }: Props) {
  return (
    <>
      {groups.map((group, idx) => {
        const bbox = boundingBox(group.noteIds, notes)
        if (!bbox) return null
        const ci = idx % GROUP_BG.length
        return (
          <motion.div
            key={group.groupId}
            style={{
              position: 'absolute',
              left: bbox.left, top: bbox.top,
              width: bbox.width, height: bbox.height,
              backgroundColor: GROUP_BG[ci],
              border: `2px dashed ${GROUP_BORDER[ci]}`,
              borderRadius: 16,
              pointerEvents: 'none',
              zIndex: 0,
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span style={{
              position: 'absolute', top: -22, left: 8,
              fontSize: 11, fontWeight: 700,
              background: GROUP_BORDER[ci],
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 99,
              whiteSpace: 'nowrap',
            }}>
              {group.groupName}
            </span>
          </motion.div>
        )
      })}
    </>
  )
}
