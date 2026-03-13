import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IdeaFlow - 실시간 아이디어 캔버스',
  description: '가입 없이 링크 공유만으로 실시간 포스트잇 협업',
}

// PRD 요구사항: 브라우저 기본 줌 비활성화 (핀치줌은 Phase 3 커스텀 구현 예정)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
