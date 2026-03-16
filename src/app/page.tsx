'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateRoomId } from '@/lib/roomId'
import { doc, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import TemplatePickerModal from '@/components/TemplatePickerModal'

export default function Home() {
  const router = useRouter()
  const [showPicker, setShowPicker] = useState(false)

  const handleTemplateSelect = async (templateId: string | null) => {
    const roomId = generateRoomId()
    // Firestore 쓰기 전 인증 보장 (익명 로그인)
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
    await setDoc(doc(db, 'rooms', roomId), { templateId })
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="min-h-screen bg-[#c4a472] flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow mb-2">IdeaFlow</h1>
        <p className="text-white/80">링크 공유만으로 실시간 협업 캔버스를 시작하세요</p>
      </div>
      <button
        onClick={() => setShowPicker(true)}
        className="bg-[#FFE566] text-gray-800 px-8 py-4 rounded-2xl text-lg font-semibold
                   shadow-lg hover:brightness-105 active:scale-95 transition-all min-h-[48px]"
      >
        새 캔버스 만들기
      </button>

      {showPicker && (
        <TemplatePickerModal
          existingNoteCount={0}
          onSelect={handleTemplateSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </main>
  )
}
