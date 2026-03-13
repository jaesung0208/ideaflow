import {
  collection, getDocs, writeBatch, addDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTemplate } from '@/lib/templates'

export async function applyTemplate(
  roomId: string,
  templateId: string | null,
  viewportCenter: { x: number; y: number },
  currentUserId: string,
): Promise<void> {
  const notesRef = collection(db, 'rooms', roomId, 'notes')
  const roomRef  = doc(db, 'rooms', roomId)

  const snapshot = await getDocs(notesRef)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  batch.update(roomRef, { templateId })
  await batch.commit()

  const template = getTemplate(templateId)
  if (!template) return

  const addPromises = template.notes.map((note) =>
    addDoc(notesRef, {
      content:        note.content,
      x:              viewportCenter.x + note.x,
      y:              viewportCenter.y + note.y,
      colorIndex:     note.colorIndex,
      editorId:       null,
      isTemplateNote: note.isTemplateNote,
      createdAt:      serverTimestamp(),
      createdBy:      currentUserId,
    }),
  )
  await Promise.all(addPromises)
}
