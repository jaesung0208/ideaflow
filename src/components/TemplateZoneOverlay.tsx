'use client'

import { useCallback, useRef } from 'react'
import { getTemplate } from '@/lib/templates'

type ZoneRect = { x: number; y: number; w: number; h: number }

type Props = {
  templateId: string | null
  zoneRects: Record<string, ZoneRect>
  canvasCenter: { x: number; y: number }
  onZoneChange: (zoneId: string, rect: ZoneRect) => void
}

type DraggableZoneProps = {
  id: string
  label: string
  color: string
  borderColor: string
  rect: ZoneRect
  onZoneChange: (zoneId: string, rect: ZoneRect) => void
}

function DraggableZone({ id, label, color, borderColor, rect, onZoneChange }: DraggableZoneProps) {
  const rectRef = useRef(rect)
  rectRef.current = rect

  // 드래그 (라벨 바 영역)
  const handleDragPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const startX = e.clientX
    const startY = e.clientY
    const startRect = { ...rectRef.current }

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      onZoneChange(id, { ...startRect, x: startRect.x + dx, y: startRect.y + dy })
    }
    const onUp = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
  }, [id, onZoneChange])

  // 리사이즈 (우하단 핸들)
  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const startX = e.clientX
    const startY = e.clientY
    const startRect = { ...rectRef.current }

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      onZoneChange(id, {
        ...startRect,
        w: Math.max(100, startRect.w + dx),
        h: Math.max(80, startRect.h + dy),
      })
    }
    const onUp = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
  }, [id, onZoneChange])

  return (
    <div
      style={{
        position: 'absolute',
        left:   rect.x,
        top:    rect.y,
        width:  rect.w,
        height: rect.h,
        background:   color,
        border:       `2px dashed ${borderColor}`,
        borderRadius: 8,
        pointerEvents: 'none',
      }}
    >
      {/* 드래그 핸들: 라벨 바 */}
      <div
        data-zone-handle="drag"
        onPointerDown={handleDragPointerDown}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 32,
          cursor: 'grab',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          borderRadius: '6px 6px 0 0',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: borderColor,
          opacity: 0.9,
        }}>
          {label}
        </span>
      </div>

      {/* 리사이즈 핸들: 우하단 */}
      <div
        data-zone-handle="resize"
        onPointerDown={handleResizePointerDown}
        style={{
          position: 'absolute',
          bottom: 0, right: 0,
          width: 20, height: 20,
          cursor: 'se-resize',
          pointerEvents: 'auto',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: 3,
        }}
      >
        {/* 리사이즈 아이콘 (두 줄 dots) */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill={borderColor} opacity={0.6}>
          <circle cx="9" cy="9" r="1.5" />
          <circle cx="5" cy="9" r="1.5" />
          <circle cx="9" cy="5" r="1.5" />
        </svg>
      </div>
    </div>
  )
}

export default function TemplateZoneOverlay({
  templateId,
  zoneRects,
  canvasCenter,
  onZoneChange,
}: Props) {
  const template = getTemplate(templateId)
  if (!template || template.zones.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {template.zones.map((zone) => {
        // Firestore에 저장된 절대 좌표 우선, 없으면 canvasCenter 기준으로 계산
        const rect: ZoneRect = zoneRects[zone.id] ?? {
          x: canvasCenter.x + zone.x,
          y: canvasCenter.y + zone.y,
          w: zone.w,
          h: zone.h,
        }
        return (
          <DraggableZone
            key={zone.id}
            id={zone.id}
            label={zone.label}
            color={zone.color}
            borderColor={zone.borderColor}
            rect={rect}
            onZoneChange={onZoneChange}
          />
        )
      })}
    </div>
  )
}
