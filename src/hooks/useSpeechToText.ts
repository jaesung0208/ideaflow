'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechToTextOptions {
  lang?: string        // 기본값: 'ko-KR'
  onResult?: (text: string) => void  // 최종 결과 콜백
}

interface UseSpeechToTextResult {
  isSupported: boolean
  isListening: boolean
  interimText: string  // 실시간 중간 결과
  start: () => void
  stop: () => void
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextResult {
  const { lang = 'ko-KR', onResult } = options
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // 브라우저 호환성: webkit prefix 처리
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = lang
    recognition.interimResults = true   // 중간 결과 활성화
    recognition.continuous = false       // 발화 완료 시 자동 중지

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      setInterimText(interim)

      if (final && onResult) {
        onResult(final.trim())
        setInterimText('')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[STT] 오류:', event.error)
      setIsListening(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, lang, onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  // 언마운트 시 인식 중지
  useEffect(() => {
    return () => { recognitionRef.current?.stop() }
  }, [])

  return { isSupported, isListening, interimText, start, stop }
}
