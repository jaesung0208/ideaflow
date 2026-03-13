import type { Metadata, Viewport } from 'next'
import { Caveat, Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-nunito',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
})

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

// 핀치줌은 Canvas.tsx의 non-passive touchmove 핸들러로 직접 제어
// viewport 레벨 줌 제한은 접근성 위반(WCAG 1.4.4)이므로 사용하지 않음
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${nunito.variable} ${caveat.variable}`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
