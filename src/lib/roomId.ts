// 랜덤 방 ID 생성 (12자리 소문자+숫자)
export function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}
