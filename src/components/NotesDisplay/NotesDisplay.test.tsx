import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import NotesDisplay from './index'

// Mock Supabase client
jest.mock('@/utils/supabase', () => ({
  createBrowserClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          // This will be overridden by MSW handlers
        }))
      }))
    }))
  })
}))

const mockNotesData = [
  {
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
  {
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
  {
    id: 3,
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
  {
    id: 4,
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
]

// Mock successful Supabase response
const mockSupabaseSuccess = () => {
  // Mock the chained Supabase calls
  const mockOrder = jest.fn().mockResolvedValue({
    data: mockNotesData,
    error: null
  })
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
  const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
  
  require('@/utils/supabase').createBrowserClient.mockReturnValue({
    from: mockFrom
  })
}

// Mock Supabase error response
const mockSupabaseError = () => {
  const mockOrder = jest.fn().mockResolvedValue({
    data: null,
    error: { message: 'Database connection failed' }
  })
  const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
  const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
  
  require('@/utils/supabase').createBrowserClient.mockReturnValue({
    from: mockFrom
  })
}

describe('NotesDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading spinner while fetching notes', () => {
      // Mock a delayed response
      const mockOrder = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 1000))
      )
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
      
      require('@/utils/supabase').createBrowserClient.mockReturnValue({
        from: mockFrom
      })

      render(<NotesDisplay />)
      
      expect(screen.getByText('Loading notes...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
    })
  })

  describe('Successful Data Fetching', () => {
    beforeEach(() => {
      mockSupabaseSuccess()
    })

    it('renders notes after successful fetch', async () => {
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
        expect(screen.getByText('This is my private note for later reference.')).toBeInTheDocument()
        expect(screen.getByText('This quote really resonates with me in my daily work.')).toBeInTheDocument()
        expect(screen.getByText('I found this article very insightful and practical.')).toBeInTheDocument()
      })
    })

    it('renders filter controls', async () => {
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('Show...')).toBeInTheDocument()
        expect(screen.getByLabelText('Public')).toBeInTheDocument()
        expect(screen.getByLabelText('Private Note')).toBeInTheDocument()
        expect(screen.getByLabelText('Articles')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabaseError()
    })

    it('shows error message when fetch fails', async () => {
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('Error loading notes')).toBeInTheDocument()
        expect(screen.getByText('Database connection failed')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('allows retry after error', async () => {
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      // Mock successful response for retry
      mockSupabaseSuccess()
      
      fireEvent.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering Functionality', () => {
    beforeEach(() => {
      mockSupabaseSuccess()
    })

    it('filters notes by type when checkboxes are toggled', async () => {
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
        expect(screen.getByText('This is my private note for later reference.')).toBeInTheDocument()
      })

      // Uncheck private notes
      const privateCheckbox = screen.getByLabelText('Private Note')
      fireEvent.click(privateCheckbox)
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
        expect(screen.queryByText('This is my private note for later reference.')).not.toBeInTheDocument()
      })
    })

    it('filters notes by search query', async () => {
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
        expect(screen.getByText('This is my private note for later reference.')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search notes...')
      fireEvent.change(searchInput, { target: { value: 'private' } })
      
      await waitFor(() => {
        expect(screen.queryByText('I love this topic! It really helped me understand the concepts better.')).not.toBeInTheDocument()
        expect(screen.getByText('This is my private note for later reference.')).toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty message when no notes exist', async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
      
      require('@/utils/supabase').createBrowserClient.mockReturnValue({
        from: mockFrom
      })

      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('No notes found.')).toBeInTheDocument()
      })
    })

    it('shows filtered empty message when filters exclude all notes', async () => {
      mockSupabaseSuccess()
      render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
      })

      // Uncheck all filters
      fireEvent.click(screen.getByLabelText('Public'))
      fireEvent.click(screen.getByLabelText('Private Note'))
      fireEvent.click(screen.getByLabelText('Articles'))
      
      await waitFor(() => {
        expect(screen.getByText('No notes match your current filters.')).toBeInTheDocument()
      })
    })
  })

  describe('Visual Regression Tests', () => {
    beforeEach(() => {
      mockSupabaseSuccess()
    })

    it('matches snapshot for loaded notes display', async () => {
      const { container } = render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('I love this topic! It really helped me understand the concepts better.')).toBeInTheDocument()
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('matches snapshot for error state', async () => {
      mockSupabaseError()
      const { container } = render(<NotesDisplay />)
      
      await waitFor(() => {
        expect(screen.getByText('Error loading notes')).toBeInTheDocument()
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
