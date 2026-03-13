import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IdeaFlow — 실시간 아이디어 캔버스',
  description: '가입 없이 링크 공유만으로 팀과 아이디어를 실시간으로 모아보세요',
  openGraph: {
    title: 'IdeaFlow — 실시간 아이디어 캔버스',
    description: '가입 없이 링크 공유만으로 팀과 아이디어를 실시간으로 모아보세요',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaFlow — 실시간 아이디어 캔버스',
    description: '가입 없이 링크 공유만으로 팀과 아이디어를 실시간으로 모아보세요',
  },
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
      <head>
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
