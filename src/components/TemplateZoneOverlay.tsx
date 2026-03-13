'use client'

import { getTemplate } from '@/lib/templates'

type Props = {
  templateId: string | null
  canvasCenter: { x: number; y: number }
}

export default function TemplateZoneOverlay({ templateId, canvasCenter }: Props) {
  const template = getTemplate(templateId)
  if (!template || template.zones.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {template.zones.map((zone) => (
        <div
          key={zone.id}
          style={{
            position: 'absolute',
            left:   canvasCenter.x + zone.x,
            top:    canvasCenter.y + zone.y,
            width:  zone.w,
            height: zone.h,
            background:   zone.color,
            border:       `2px dashed ${zone.borderColor}`,
            borderRadius: 8,
            pointerEvents: 'none',
          }}
        >
          <span style={{
            position: 'absolute', top: 8, left: 12,
            fontSize: 13, fontWeight: 600,
            color: zone.borderColor, opacity: 0.7,
            userSelect: 'none',
            pointerEvents: 'none',
          }}>
            {zone.label}
          </span>
        </div>
      ))}
    </div>
  )
}
