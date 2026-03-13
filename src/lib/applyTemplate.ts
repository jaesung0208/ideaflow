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

  const template = getTemplate(templateId)

  // 초기 zone 위치: viewportCenter 기준 절대 좌표로 변환
  const zonesMap: Record<string, { x: number; y: number; w: number; h: number }> = {}
  if (template) {
    for (const zone of template.zones) {
      zonesMap[zone.id] = {
        x: viewportCenter.x + zone.x,
        y: viewportCenter.y + zone.y,
        w: zone.w,
        h: zone.h,
      }
    }
  }

  const snapshot = await getDocs(notesRef)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  batch.update(roomRef, { templateId, zones: zonesMap })
  await batch.commit()

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
