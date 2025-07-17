'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Eye, Edit2, Share2 } from 'lucide-react'
import { Note } from '@/schemas/notes'
import { cn } from '@/utils/tailwind'

interface NoteCardProps {
  note: Note
  onEdit?: (noteId: number) => void
  onShare?: (noteId: number) => void
}

export default function NoteCard({ note, onEdit, onShare }: NoteCardProps) {
  // Handle both new note_type field and legacy is_public field
  const noteType = note.note_type || (note.is_public ? 'public' : 'private')
  const isUnderReview = noteType === 'under-review'
  const isPublicNote = noteType === 'public'
  const isSharedArticle = noteType === 'shared-article'
  const isComment = noteType === 'comment'
  const isArticle = noteType === 'article'
  const isQuoteNote = !!note.quote

  // Show stats for public notes and shared articles
  const showStats = isPublicNote || isSharedArticle

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(note.id)
    }
  }

  const renderQuoteWithAddress = () => {
    if (!isQuoteNote) return null

    return (
      <div className="mt-4">
        {/* Quote */}
        <div className="border-l-4 border-gray-300 bg-gray-50 p-3">
          <p className="text-sm italic text-gray-700">
            &ldquo;{note.quote}&rdquo;
          </p>
        </div>
        {/* Resource page address below the quote */}
        {note.address && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">{note.address}</p>
          </div>
        )}
      </div>
    )
  }

  const renderCommentAddress = () => {
    // For comments, only show the resource page address
    if (!isComment || !note.address) return null

    return (
      <div className="mt-3">
        <p className="text-sm text-gray-600">{note.address}</p>
      </div>
    )
  }

  const renderArticleLink = () => {
    // For articles, show the link to the article
    if (!isArticle || !note.article_link) return null

    return (
      <div className="mt-3">
        <a
          href={note.article_link}
          className="text-sm text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {note.address || 'View Article'}
        </a>
      </div>
    )
  }

  const renderRegularAddress = () => {
    // For regular notes (not quotes, comments, or articles), show address
    if (isQuoteNote || isComment || isArticle || !note.address) return null

    return (
      <div className="mt-3">
        <p className="text-sm text-gray-600">{note.address}</p>
      </div>
    )
  }

  const renderActionButton = () => {
    if (isUnderReview) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditClick}
        className="flex items-center gap-2"
      >
        <Edit2 className="h-4 w-4" />
        Edit & Sharing
      </Button>
    )
  }

  const renderStats = () => {
    if (!showStats) return null

    return (
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <Heart className="h-4 w-4 text-red-500" />
          {note.like_count || 0}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <Eye className="h-4 w-4 text-gray-500" />
          {note.view_count || 0}
        </span>
      </div>
    )
  }

  const renderUnderReviewLabel = () => {
    if (!isUnderReview) return null

    return (
      <span className="text-sm font-medium text-yellow-600">Under review</span>
    )
  }

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-6">
        {/* Note Content Section */}
        <div className="mb-4">
          <p className="text-base text-gray-900">{note.note_content}</p>
        </div>

        {/* Quote with resource page address (for quote notes) */}
        {renderQuoteWithAddress()}

        {/* Comment address (for comment notes) */}
        {renderCommentAddress()}

        {/* Article link (for article notes) */}
        {renderArticleLink()}

        {/* Regular address (for other notes) */}
        {renderRegularAddress()}

        {/* Action Row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">{renderActionButton()}</div>

          <div className="flex items-center gap-4">
            {renderStats()}
            {renderUnderReviewLabel()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
