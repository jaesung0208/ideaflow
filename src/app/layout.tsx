import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IdeaFlow',
  description: '실시간 공유형 아이디어 캔버스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
