// src/schemas/notesSchema.ts

import { z } from 'zod'

// Define note types
export const NoteTypeSchema = z.enum([
  'public',
  'private',
  'shared-article',
  'under-review',
  'comment',
  'article'
])

// Extended NotesSchema with all required fields for the Note Display Feature
// Made new fields optional to work with existing database structure
export const NotesSchema = z.object({
  id: z.number(),
  textrange: z.array(z.number()).optional().nullable(),
  note_content: z.string().min(1),
  topic_id: z.number().optional().nullable(),
  employee_id: z.string().uuid(),
  is_public: z.boolean(),
  is_approved_cbh: z.boolean(),
  is_approved_emp: z.boolean(),
  address: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  note_type: NoteTypeSchema.optional(),
  view_count: z.number().optional(),
  like_count: z.number().optional(),
  article_link: z.string().url().optional().nullable().or(z.literal('')),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Note = z.infer<typeof NotesSchema>
export type NoteType = z.infer<typeof NoteTypeSchema>

// Helper type for display purposes
export interface NoteDisplayProps {
  note: Note
  onEdit?: (noteId: number) => void
  onShare?: (noteId: number) => void
}
