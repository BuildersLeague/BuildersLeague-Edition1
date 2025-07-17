'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { Note, NotesSchema } from '@/schemas/notes'
import NoteCard from '@/components/NoteCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle } from 'lucide-react'

interface NotesDisplayProps {
  className?: string
}

interface FilterState {
  public: boolean
  private: boolean
  articles: boolean
}

export default function NotesDisplay({ className }: NotesDisplayProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    public: true,
    private: true,
    articles: true,
  })

  const supabase = createBrowserClient()

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        throw new Error(fetchError.message)
      }

      console.log('Fetched notes data:', data)
      console.log('Number of notes fetched:', data?.length || 0)

      // Transform database notes and add demo notes to showcase all features
      const databaseNotes =
        data
          ?.map((note, index) => {
            try {
              // Add default values for fields that might not exist in the database yet
              const noteWithDefaults = {
                id: note.id,
                textrange: note.textrange || null,
                note_content: note.note_content,
                topic_id: note.topic_id || null,
                employee_id: note.employee_id,
                is_public: note.is_public,
                is_approved_cbh: note.is_approved_cbh,
                is_approved_emp: note.is_approved_emp,
                address:
                  note.address ||
                  `Topic ${note.topic_id || 'Unknown'}, Item ${index + 1}`,
                quote: note.quote || null,
                note_type:
                  note.note_type || (note.is_public ? 'public' : 'private'),
                view_count: note.view_count ?? Math.floor(Math.random() * 50),
                like_count: note.like_count ?? Math.floor(Math.random() * 10),
                article_link: note.article_link || null,
                created_at: note.created_at,
                updated_at: note.updated_at,
              }

              const parsed = NotesSchema.parse(noteWithDefaults)
              console.log('Successfully parsed note:', parsed)
              return parsed
            } catch (validationError) {
              console.warn('Invalid note data:', note)
              console.warn('Validation error details:', validationError)
              return null
            }
          })
          .filter((note): note is Note => note !== null) || []

      // Add demo notes to showcase all note types and features
      const demoNotes: Note[] = [
        {
          id: 1001,
          note_content:
            'This quote really resonates with my daily work experience.',
          employee_id: 'demo-user-1',
          is_public: true,
          is_approved_cbh: false,
          is_approved_emp: true,
          address: 'Truth and Reconciliation Guide, Page 15',
          quote:
            'Reconciliation is not an Aboriginal problem; it is a Canadian opportunity.',
          note_type: 'under-review',
          view_count: 5,
          like_count: 2,
          article_link: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 1002,
          note_content: 'Great insights shared in our team discussion today.',
          employee_id: 'demo-user-2',
          is_public: false,
          is_approved_cbh: false,
          is_approved_emp: false,
          address: 'Team Meeting Discussion Thread #45',
          quote: null,
          note_type: 'comment',
          view_count: 0,
          like_count: 0,
          article_link: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 1003,
          note_content:
            'This article provides excellent practical guidance for workplace implementation.',
          employee_id: 'demo-user-3',
          is_public: true,
          is_approved_cbh: true,
          is_approved_emp: true,
          address: 'Workplace Reconciliation Resources',
          quote: null,
          note_type: 'article',
          view_count: 28,
          like_count: 6,
          article_link:
            'https://www.rcaanc-cirnac.gc.ca/eng/1100100014597/1572547985018',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 1004,
          note_content:
            'I found this topic very enlightening and it changed my perspective.',
          employee_id: 'demo-user-4',
          is_public: true,
          is_approved_cbh: true,
          is_approved_emp: true,
          address: 'Learning Module 3: Understanding History',
          quote: null,
          note_type: 'public',
          view_count: 42,
          like_count: 8,
          article_link: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // Combine database notes with demo notes
      const validatedNotes = [...databaseNotes, ...demoNotes]

      console.log('Validated notes:', validatedNotes)
      console.log('Number of validated notes:', validatedNotes.length)
      setNotes(validatedNotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleEditNote = (noteId: number) => {
    // Placeholder for edit functionality
    console.log('Edit note:', noteId)
  }

  const handleShareNote = (noteId: number) => {
    // Placeholder for share functionality
    console.log('Share note:', noteId)
  }

  const handleFilterChange = (filterType: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  const filteredNotes = notes.filter((note) => {
    // Search filter
    if (
      searchQuery &&
      !note.note_content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Type filters - handle both new note_type field and legacy is_public field
    const noteType = note.note_type || (note.is_public ? 'public' : 'private')

    if (
      filters.public &&
      (noteType === 'public' ||
        noteType === 'shared-article' ||
        noteType === 'under-review' ||
        noteType === 'comment')
    ) {
      return true
    }
    if (filters.private && noteType === 'private') {
      return true
    }
    if (
      filters.articles &&
      (noteType === 'article' || noteType === 'shared-article')
    ) {
      return true
    }

    return false
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading notes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error loading notes</span>
          </div>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotes}
            className="mt-3"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Filter and Search Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Show...</h2>

          {/* Filter Checkboxes */}
          <div className="mb-4 flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public-filter"
                checked={filters.public}
                onCheckedChange={() => handleFilterChange('public')}
              />
              <Label htmlFor="public-filter">Public</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="private-filter"
                checked={filters.private}
                onCheckedChange={() => handleFilterChange('private')}
              />
              <Label htmlFor="private-filter">Private Note</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="articles-filter"
                checked={filters.articles}
                onCheckedChange={() => handleFilterChange('articles')}
              />
              <Label htmlFor="articles-filter">Articles</Label>
            </div>
          </div>

          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                {notes.length === 0
                  ? 'No notes found.'
                  : 'No notes match your current filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onShare={handleShareNote}
            />
          ))
        )}
      </div>
    </div>
  )
}
