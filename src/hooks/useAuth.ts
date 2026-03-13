'use client'

import { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserColor } from '@/lib/userColors'
import type { UserSession } from '@/types'

const SESSION_KEY = 'ideaflow_session'

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const stored = localStorage.getItem(SESSION_KEY)
        const storedSession = stored ? JSON.parse(stored) : null

        const newSession: UserSession = {
          uid: user.uid,
          nickname: storedSession?.nickname ?? '익명 사용자',
          color: getUserColor(user.uid),
          isNew: !storedSession,
        }

        setSession(newSession)
        setLoading(false)
      } else {
        try {
          await signInAnonymously(auth)
        } catch (error) {
          console.error('익명 로그인 실패:', error)
          setLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const updateNickname = (nickname: string) => {
    if (!session) return
    const updated = { ...session, nickname, isNew: false }
    setSession(updated)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: session.uid, nickname }))
  }

  return { session, loading, updateNickname }
}
