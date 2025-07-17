/**
 * Integration tests for NotesDisplay component
 * These tests focus on the core functionality without complex mocking
 */

import { render, screen } from '@testing-library/react'
import { Note } from '@/schemas/notes'
import NoteCard from '@/components/NoteCard'

// Test data
const mockNote: Note = {
  id: 1,
  note_content: 'Test note content',
  employee_id: 'user-123',
  is_public: true,
  is_approved_cbh: true,
  is_approved_emp: true,
  address: 'Test Address',
  quote: null,
  note_type: 'public',
  view_count: 10,
  like_count: 5,
  article_link: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('Notes Integration Tests', () => {
  describe('NoteCard Component', () => {
    it('renders note content correctly', () => {
      render(<NoteCard note={mockNote} />)
      
      expect(screen.getByText('Test note content')).toBeInTheDocument()
      expect(screen.getByText('Test Address')).toBeInTheDocument()
    })

    it('shows stats for public notes', () => {
      render(<NoteCard note={mockNote} />)
      
      expect(screen.getByText('10')).toBeInTheDocument() // view count
      expect(screen.getByText('5')).toBeInTheDocument() // like count
    })

    it('shows edit & sharing button for public notes', () => {
      render(<NoteCard note={mockNote} />)
      
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
    })
  })

  describe('Note Types', () => {
    it('renders under review note correctly', () => {
      const underReviewNote: Note = {
        ...mockNote,
        note_type: 'under-review',
        quote: 'This is a test quote',
      }

      render(<NoteCard note={underReviewNote} />)
      
      expect(screen.getByText('Test note content')).toBeInTheDocument()
      expect(screen.getByText('"This is a test quote"')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Under review')).toBeInTheDocument()
      expect(screen.queryByText('Edit & Sharing')).not.toBeInTheDocument()
    })

    it('renders article note with link', () => {
      const articleNote: Note = {
        ...mockNote,
        note_type: 'article',
        article_link: 'https://example.com/article',
      }

      render(<NoteCard note={articleNote} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://example.com/article')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders private note without stats', () => {
      const privateNote: Note = {
        ...mockNote,
        note_type: 'private',
        is_public: false,
      }

      render(<NoteCard note={privateNote} />)
      
      expect(screen.getByText('Test note content')).toBeInTheDocument()
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
      // Should not show stats for private notes
      expect(screen.queryByText('10')).not.toBeInTheDocument()
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })
  })

  describe('Interaction Callbacks', () => {
    it('calls onEdit callback when edit button is clicked', () => {
      const mockOnEdit = jest.fn()
      render(<NoteCard note={mockNote} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByText('Edit & Sharing')
      editButton.click()
      
      expect(mockOnEdit).toHaveBeenCalledWith(1)
    })
  })

  describe('Data Validation', () => {
    it('handles missing optional fields gracefully', () => {
      const minimalNote: Note = {
        id: 2,
        note_content: 'Minimal note',
        employee_id: 'user-456',
        is_public: false,
        is_approved_cbh: false,
        is_approved_emp: false,
        note_type: 'private',
        view_count: 0,
        like_count: 0,
      }

      render(<NoteCard note={minimalNote} />)
      
      expect(screen.getByText('Minimal note')).toBeInTheDocument()
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
    })
  })
})

/**
 * Manual Integration Test Instructions:
 * 
 * To manually test the NotesDisplay component:
 * 1. Start the development server: npm run dev
 * 2. Navigate to http://localhost:3002/emp/notes
 * 3. Verify the following:
 *    - Notes are fetched and displayed
 *    - Filter checkboxes work correctly
 *    - Search functionality filters notes
 *    - Different note types display correctly
 *    - Edit buttons are present but non-functional (as required)
 *    - Loading and error states work
 * 
 * Database Integration:
 * 1. Run: npx supabase db reset
 * 2. This will apply the new schema and seed data
 * 3. Test with the seeded notes data
 */
