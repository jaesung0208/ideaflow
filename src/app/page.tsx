'use client'

import { useRouter } from 'next/navigation'
import { generateRoomId } from '@/lib/roomId'

export default function Home() {
  const router = useRouter()

  const handleCreateCanvas = () => {
    const roomId = generateRoomId()
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="min-h-screen bg-[#c4a472] flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow mb-2">IdeaFlow</h1>
        <p className="text-white/80">링크 공유만으로 실시간 협업 캔버스를 시작하세요</p>
      </div>
      <button
        onClick={handleCreateCanvas}
        className="bg-[#FFE566] text-gray-800 px-8 py-4 rounded-2xl text-lg font-semibold
                   shadow-lg hover:brightness-105 active:scale-95 transition-all min-h-[48px]"
      >
        새 캔버스 만들기
      </button>
    </main>
  )
}
