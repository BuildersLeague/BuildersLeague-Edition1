import { render, screen } from '@testing-library/react'
import NoteCard from './index'
import { Note } from '@/schemas/notes'

// Mock data for different note types
const mockNotes: Record<string, Note> = {
  public: {
    id: 1,
    note_content: 'I love this topic! It really helped me understand the concepts better.',
    employee_id: 'user-123',
    is_public: true,
    is_approved_cbh: true,
    is_approved_emp: true,
    address: 'Topic 1, Item 2',
    quote: null,
    note_type: 'public',
    view_count: 15,
    like_count: 3,
    article_link: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  private: {
    id: 2,
    note_content: 'This is my private note for later reference.',
    employee_id: 'user-123',
    is_public: false,
    is_approved_cbh: false,
    is_approved_emp: false,
    address: 'Topic 1, Item 3',
    quote: null,
    note_type: 'private',
    view_count: 0,
    like_count: 0,
    article_link: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  'shared-article': {
    id: 3,
    note_content: 'Great article about workplace communication!',
    employee_id: 'user-123',
    is_public: true,
    is_approved_cbh: true,
    is_approved_emp: true,
    address: 'Communication Resources',
    quote: null,
    note_type: 'shared-article',
    view_count: 42,
    like_count: 8,
    article_link: 'https://example.com/communication-guide',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  'under-review': {
    id: 4,
    note_content: 'This quote really resonates with me in my daily work.',
    employee_id: 'user-123',
    is_public: true,
    is_approved_cbh: false,
    is_approved_emp: true,
    address: 'Topic 1, Item 4',
    quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    note_type: 'under-review',
    view_count: 5,
    like_count: 1,
    article_link: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  comment: {
    id: 5,
    note_content: 'Adding my thoughts on this discussion.',
    employee_id: 'user-123',
    is_public: false,
    is_approved_cbh: false,
    is_approved_emp: false,
    address: 'Discussion Thread #123',
    quote: null,
    note_type: 'comment',
    view_count: 0,
    like_count: 0,
    article_link: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  article: {
    id: 6,
    note_content: 'I found this article very insightful and practical.',
    employee_id: 'user-123',
    is_public: true,
    is_approved_cbh: true,
    is_approved_emp: true,
    address: 'Resource Library',
    quote: null,
    note_type: 'article',
    view_count: 28,
    like_count: 6,
    article_link: 'https://example.com/leadership-tips',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
}

describe('NoteCard Component', () => {
  describe('Public Note', () => {
    it('renders public note with stats and edit & sharing button', () => {
      render(<NoteCard note={mockNotes.public} />)
      
      expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
      expect(screen.getByText('Topic 1, Item 2')).toBeInTheDocument()
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument() // view count
      expect(screen.getByText('3')).toBeInTheDocument() // like count
      expect(screen.queryByText('Under review')).not.toBeInTheDocument()
    })
  })

  describe('Private Note', () => {
    it('renders private note without stats', () => {
      render(<NoteCard note={mockNotes.private} />)
      
      expect(screen.getByText('This is my private note for later reference.')).toBeInTheDocument()
      expect(screen.getByText('Topic 1, Item 3')).toBeInTheDocument()
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
      expect(screen.queryByText('0')).not.toBeInTheDocument() // no stats shown
      expect(screen.queryByText('Under review')).not.toBeInTheDocument()
    })
  })

  describe('Shared Article Note', () => {
    it('renders shared article note with stats and article link', () => {
      render(<NoteCard note={mockNotes['shared-article']} />)
      
      expect(screen.getByText('Great article about workplace communication!')).toBeInTheDocument()
      expect(screen.getByText('Communication Resources')).toBeInTheDocument()
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument() // view count
      expect(screen.getByText('8')).toBeInTheDocument() // like count
      expect(screen.queryByText('Under review')).not.toBeInTheDocument()
    })
  })

  describe('Under Review Note', () => {
    it('renders under review note with quote and edit button only', () => {
      render(<NoteCard note={mockNotes['under-review']} />)
      
      expect(screen.getByText('This quote really resonates with me in my daily work.')).toBeInTheDocument()
      expect(screen.getByText('Topic 1, Item 4')).toBeInTheDocument()
      expect(screen.getByText('"Success is not final, failure is not fatal: it is the courage to continue that counts."')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.queryByText('Edit & Sharing')).not.toBeInTheDocument()
      expect(screen.getByText('Under review')).toBeInTheDocument()
      expect(screen.queryByText('5')).not.toBeInTheDocument() // no stats shown for under review
    })
  })

  describe('Comment Note', () => {
    it('renders comment note with address only', () => {
      render(<NoteCard note={mockNotes.comment} />)
      
      expect(screen.getByText('Adding my thoughts on this discussion.')).toBeInTheDocument()
      expect(screen.getByText('Discussion Thread #123')).toBeInTheDocument()
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
      expect(screen.queryByText('Under review')).not.toBeInTheDocument()
      expect(screen.queryByText('0')).not.toBeInTheDocument() // no stats shown
    })
  })

  describe('Article Note', () => {
    it('renders article note with clickable article link', () => {
      render(<NoteCard note={mockNotes.article} />)
      
      expect(screen.getByText('I found this article very insightful and practical.')).toBeInTheDocument()
      
      const articleLink = screen.getByRole('link', { name: 'Resource Library' })
      expect(articleLink).toBeInTheDocument()
      expect(articleLink).toHaveAttribute('href', 'https://example.com/leadership-tips')
      expect(articleLink).toHaveAttribute('target', '_blank')
      
      expect(screen.getByText('Edit & Sharing')).toBeInTheDocument()
      expect(screen.getByText('28')).toBeInTheDocument() // view count
      expect(screen.getByText('6')).toBeInTheDocument() // like count
    })
  })

  describe('Interaction Callbacks', () => {
    it('calls onEdit when edit button is clicked', () => {
      const mockOnEdit = jest.fn()
      render(<NoteCard note={mockNotes.public} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByText('Edit & Sharing')
      editButton.click()
      
      expect(mockOnEdit).toHaveBeenCalledWith(1)
    })

    it('calls onEdit when edit button is clicked on under review note', () => {
      const mockOnEdit = jest.fn()
      render(<NoteCard note={mockNotes['under-review']} onEdit={mockOnEdit} />)

      const editButton = screen.getByText('Edit')
      editButton.click()

      expect(mockOnEdit).toHaveBeenCalledWith(4)
    })
  })

  describe('Visual Regression Tests', () => {
    it('matches snapshot for public note', () => {
      const { container } = render(<NoteCard note={mockNotes.public} />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot for private note', () => {
      const { container } = render(<NoteCard note={mockNotes.private} />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot for under review note with quote', () => {
      const { container } = render(<NoteCard note={mockNotes['under-review']} />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot for article note', () => {
      const { container } = render(<NoteCard note={mockNotes.article} />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
