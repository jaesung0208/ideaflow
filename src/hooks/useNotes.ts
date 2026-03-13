'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { NOTE_COLORS } from '@/lib/constants'
import type { Note } from '@/types'

export function useNotes(roomId: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [notesError, setNotesError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return
    const notesRef = collection(db, 'rooms', roomId, 'notes')
    const q = query(notesRef, orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Note)))
      setNotesError(null)
    }, (err) => {
      console.error('Firestore 오류:', err)
      setNotesError('노트를 불러오는 중 오류가 발생했습니다')
    })
    return () => unsubscribe()
  }, [roomId])

  const addNote = useCallback(async (x: number, y: number, content = '') => {
    if (!roomId) return
    const colorIndex = Math.floor(Math.random() * NOTE_COLORS.length)
    await addDoc(collection(db, 'rooms', roomId, 'notes'), {
      content,
      x,
      y,
      colorIndex,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [roomId])

  const updateNote = useCallback(async (id: string, content: string) => {
    await updateDoc(doc(db, 'rooms', roomId, 'notes', id), {
      content, updatedAt: serverTimestamp(),
    })
  }, [roomId])

  const moveNote = useCallback(async (id: string, x: number, y: number) => {
    await updateDoc(doc(db, 'rooms', roomId, 'notes', id), {
      x, y, updatedAt: serverTimestamp(),
    })
  }, [roomId])

  const deleteNote = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'rooms', roomId, 'notes', id))
  }, [roomId])

  const changeColor = useCallback(async (id: string, colorIndex: number) => {
    await updateDoc(doc(db, 'rooms', roomId, 'notes', id), {
      colorIndex, updatedAt: serverTimestamp(),
    })
  }, [roomId])

  return { notes, notesError, addNote, updateNote, moveNote, deleteNote, changeColor }
}
