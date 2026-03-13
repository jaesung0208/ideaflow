'use client'

import { useState } from 'react'

interface NicknameModalProps {
  onConfirm: (nickname: string) => void
}

export function NicknameModal({ onConfirm }: NicknameModalProps) {
  const [nickname, setNickname] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(nickname.trim() || '익명 사용자')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <h2 className="text-lg font-bold mb-2">닉네임을 입력하세요</h2>
        <p className="text-sm text-gray-500 mb-4">다른 참여자에게 표시됩니다. (선택 사항)</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nickname-input" className="sr-only">닉네임</label>
          <input
            id="nickname-input"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="익명 사용자"
            maxLength={20}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 transition-colors"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  )
}
