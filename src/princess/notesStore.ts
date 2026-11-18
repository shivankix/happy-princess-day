import { useSyncExternalStore } from 'react'

/**
 * The note wall. Notes live in one shared store so that the composer in the
 * corner and the wall in the page are always looking at the same list, and so
 * that a note pinned in one window appears in every other open window right
 * away (localStorage event + BroadcastChannel).
 */
export type Note = {
  id: string
  text: string
  color: number
  rotate: number
  at: number
}

export const NOTE_COLORS = 5

const KEY = 'princess.notes.v2'
const EMPTY: Note[] = []

let notes: Note[] = EMPTY
const listeners = new Set<() => void>()
let started = false
let channel: BroadcastChannel | null = null

function emit() {
  for (const notify of listeners) notify()
}

function read(): Note[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is Note =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Note).text === 'string' &&
        typeof (item as Note).id === 'string',
    )
  } catch {
    return []
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(notes))
  } catch {
    /* private mode, no storage */
  }
}

function commit(next: Note[], broadcast: boolean) {
  notes = next
  persist()
  emit()
  if (broadcast) channel?.postMessage({ type: 'notes', notes })
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  notes = read()
  emit()

  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return
    notes = read()
    emit()
  })

  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel('princess-notes')
    channel.addEventListener('message', (event: MessageEvent<{ type?: string; notes?: Note[] }>) => {
      const data = event.data
      if (data?.type !== 'notes' || !Array.isArray(data.notes)) return
      notes = data.notes
      persist()
      emit()
    })
  }
}

function subscribe(notify: () => void) {
  start()
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

export function useNotes() {
  return useSyncExternalStore(
    subscribe,
    () => notes,
    () => EMPTY,
  )
}

export function addNote(text: string) {
  start()
  const clean = text.trim().slice(0, 180)
  if (!clean) return null
  const note: Note = {
    id: `n${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    text: clean,
    color: Math.floor(Math.random() * NOTE_COLORS),
    rotate: (Math.random() - 0.5) * 5,
    at: Date.now(),
  }
  commit([note, ...notes], true)
  return note
}

export function removeNote(id: string) {
  start()
  commit(
    notes.filter((note) => note.id !== id),
    true,
  )
}

export function timeOnWall(at: number) {
  const minutes = Math.round((Date.now() - at) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
