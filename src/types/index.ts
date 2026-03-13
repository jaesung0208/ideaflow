export interface Note {
  id: string
  content: string
  x: number
  y: number
  colorIndex: number
  editorId: string | null
}

export interface Cursor {
  id: string
  x: number
  y: number
  lastSeen: number
}

export interface User {
  id: string
  nickname: string
  color: string
}
