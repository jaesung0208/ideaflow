import {
  collection, getDocs, writeBatch, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTemplate } from '@/lib/templates'

/** Firestore writeBatch 최대 허용 ops 수 */
const BATCH_LIMIT = 499

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

  // 기존 노트 삭제: 499개 단위로 분할하여 배치 처리
  const snapshot = await getDocs(notesRef)
  const deleteDocs = snapshot.docs

  for (let i = 0; i < deleteDocs.length; i += BATCH_LIMIT) {
    const chunk = deleteDocs.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    chunk.forEach((d) => batch.delete(d.ref))
    // 마지막 청크에 roomRef 업데이트 포함
    if (i + BATCH_LIMIT >= deleteDocs.length) {
      batch.update(roomRef, { templateId, zones: zonesMap })
    }
    await batch.commit()
  }

  // 삭제할 노트가 없었던 경우 roomRef 업데이트 별도 처리
  if (deleteDocs.length === 0) {
    const batch = writeBatch(db)
    batch.update(roomRef, { templateId, zones: zonesMap })
    await batch.commit()
  }

  if (!template) return

  // 새 노트 생성: 499개 단위로 분할하여 배치 처리
  const noteData = template.notes.map((note) => ({
    content:        note.content,
    x:              viewportCenter.x + note.x,
    y:              viewportCenter.y + note.y,
    colorIndex:     note.colorIndex,
    editorId:       null,
    isTemplateNote: note.isTemplateNote,
    createdAt:      serverTimestamp(),
    createdBy:      currentUserId,
  }))

  for (let i = 0; i < noteData.length; i += BATCH_LIMIT) {
    const chunk = noteData.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    chunk.forEach((data) => batch.set(doc(notesRef), data))
    await batch.commit()
  }
}
