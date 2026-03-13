import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// SSR 환경에서 중복 초기화 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// 오프라인 캐시 설정 (클라이언트 전용)
// 서버 환경에서는 persistentLocalCache 미지원으로 기본 Firestore 사용
export const db =
  typeof window !== 'undefined'
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({}),
        }),
      })
    : getFirestore(app)

export const auth = getAuth(app)
