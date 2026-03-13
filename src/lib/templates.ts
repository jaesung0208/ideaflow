export type TemplateZone = {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  color: string
  borderColor: string
}

export type TemplateNote = {
  content: string
  x: number
  y: number
  colorIndex: number
  isTemplateNote: boolean
}

export type CanvasTemplate = {
  id: string
  name: string
  description: string
  zones: TemplateZone[]
  notes: TemplateNote[]
}

export const TEMPLATES: CanvasTemplate[] = [
  {
    id: 'brainstorm',
    name: '🧠 브레인스토밍',
    description: '중심 주제 주변에 아이디어를 자유롭게 배치합니다',
    zones: [],
    notes: [
      { content: '💡 중심 주제를 입력하세요', x: 0,    y: 0,    colorIndex: 2, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 ↓',   x: 0,    y: -200, colorIndex: 1, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 ↑',   x: 0,    y: 200,  colorIndex: 1, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 →',   x: -300, y: 0,    colorIndex: 1, isTemplateNote: true },
      { content: '아이디어를 자유롭게 추가하세요 ←',   x: 300,  y: 0,    colorIndex: 1, isTemplateNote: true },
    ],
  },
  {
    id: 'kpt',
    name: '🔄 KPT 회고',
    description: 'Keep / Problem / Try 세 영역으로 팀 회고를 진행합니다',
    zones: [
      { id: 'keep',    label: 'Keep',    x: -600, y: -300, w: 400, h: 600, color: 'rgba(107,203,119,0.1)', borderColor: '#6BCB77' },
      { id: 'problem', label: 'Problem', x: -100, y: -300, w: 400, h: 600, color: 'rgba(255,107,107,0.1)', borderColor: '#FF6B6B' },
      { id: 'try',     label: 'Try',     x:  400, y: -300, w: 400, h: 600, color: 'rgba(77,150,255,0.1)',  borderColor: '#4D96FF' },
    ],
    notes: [
      { content: '✅ Keep - 잘 된 것',   x: -400, y: -230, colorIndex: 1, isTemplateNote: true },
      { content: '⚠️ Problem - 문제점',  x:  100, y: -230, colorIndex: 0, isTemplateNote: true },
      { content: '🚀 Try - 시도할 것',   x:  600, y: -230, colorIndex: 3, isTemplateNote: true },
      { content: '여기에 포스트잇을 추가하세요', x: -400, y: 0,  colorIndex: 5, isTemplateNote: true },
      { content: '여기에 포스트잇을 추가하세요', x:  100, y: 0,  colorIndex: 5, isTemplateNote: true },
      { content: '여기에 포스트잇을 추가하세요', x:  600, y: 0,  colorIndex: 5, isTemplateNote: true },
    ],
  },
]

export function getTemplate(id: string | null): CanvasTemplate | undefined {
  if (!id) return undefined
  return TEMPLATES.find((t) => t.id === id)
}
