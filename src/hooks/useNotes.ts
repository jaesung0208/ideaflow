import { useReducer, useCallback } from 'react'
import { Note } from '@/types'
import { NOTE_COLORS, NOTE_SIZE } from '@/lib/constants'

type NoteAction =
  | { type: 'ADD_NOTE'; payload: { x: number; y: number } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; content: string } }
  | { type: 'MOVE_NOTE'; payload: { id: string; x: number; y: number } }
  | { type: 'DELETE_NOTE'; payload: { id: string } }
  | { type: 'CHANGE_COLOR'; payload: { id: string; colorIndex: number } }

function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function notesReducer(state: Note[], action: NoteAction): Note[] {
  switch (action.type) {
    case 'ADD_NOTE':
      return [
        ...state,
        {
          id: generateId(),
          content: '',
          x: action.payload.x - NOTE_SIZE.width / 2,
          y: action.payload.y - NOTE_SIZE.height / 2,
          colorIndex: Math.floor(Math.random() * NOTE_COLORS.length),
          editorId: null,
        },
      ]
    case 'UPDATE_NOTE':
      return state.map((note) =>
        note.id === action.payload.id ? { ...note, content: action.payload.content } : note
      )
    case 'MOVE_NOTE':
      return state.map((note) =>
        note.id === action.payload.id
          ? { ...note, x: action.payload.x, y: action.payload.y }
          : note
      )
    case 'DELETE_NOTE':
      return state.filter((note) => note.id !== action.payload.id)
    case 'CHANGE_COLOR':
      return state.map((note) =>
        note.id === action.payload.id ? { ...note, colorIndex: action.payload.colorIndex } : note
      )
    default:
      return state
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useNotes(_roomId?: string) {
  const [notes, dispatch] = useReducer(notesReducer, [])

  const addNote = useCallback((x: number, y: number) => {
    dispatch({ type: 'ADD_NOTE', payload: { x, y } })
  }, [])

  const updateNote = useCallback((id: string, content: string) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { id, content } })
  }, [])

  const moveNote = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_NOTE', payload: { id, x, y } })
  }, [])

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: { id } })
  }, [])

  const changeColor = useCallback((id: string, colorIndex: number) => {
    dispatch({ type: 'CHANGE_COLOR', payload: { id, colorIndex } })
  }, [])

  return { notes, addNote, updateNote, moveNote, deleteNote, changeColor }
}
