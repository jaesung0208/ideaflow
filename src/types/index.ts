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
  nickname: string
  color: string
}

export interface UserSession {
  uid: string          // 탭 전용 ID (커서 식별용, 탭마다 고유)
  firebaseUid: string  // 실제 Firebase UID (보안 규칙용)
  nickname: string
  color: string
  isNew: boolean       // 최초 접속 여부 (닉네임 모달 표시용)
}

export interface User {
  id: string
  nickname: string
  color: string
}
