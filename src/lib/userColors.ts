// 사용자 ID 기반으로 결정론적 색상 반환
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7B731',
]

export function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return USER_COLORS[hash % USER_COLORS.length]
}
