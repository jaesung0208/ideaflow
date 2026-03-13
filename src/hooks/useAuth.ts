'use client'

import { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserColor } from '@/lib/userColors'
import type { UserSession } from '@/types'

const NICKNAME_KEY = 'ideaflow_nickname'       // localStorage - 닉네임 기억용 (같은 브라우저)
const TAB_ID_KEY = 'ideaflow_tab_id'           // sessionStorage - 탭 전용 ID

// 모듈-레벨 플래그: 페이지 로드마다 초기화됨 (sessionStorage 상속 문제 방지)
let _tabGreeted = false

function getOrCreateTabId(): string {
  let tabId = sessionStorage.getItem(TAB_ID_KEY)
  if (!tabId) {
    tabId = crypto.randomUUID()
    sessionStorage.setItem(TAB_ID_KEY, tabId)
  }
  return tabId
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 탭 전용 ID (커서/표시용) - 탭마다 다른 색상과 구분을 위해 사용
        const tabId = getOrCreateTabId()
        const nickname = localStorage.getItem(NICKNAME_KEY) ?? '익명 사용자'
        const isNew = !_tabGreeted

        const newSession: UserSession = {
          uid: tabId,          // Firestore 커서 문서 ID로 tabId 사용 (탭마다 고유)
          firebaseUid: user.uid, // 실제 Firebase UID (보안 규칙용)
          nickname,
          color: getUserColor(tabId),
          isNew,
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
    _tabGreeted = true
    localStorage.setItem(NICKNAME_KEY, nickname)
  }

  return { session, loading, updateNickname }
}
