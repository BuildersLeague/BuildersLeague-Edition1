import NotesDisplay from '@/components/NotesDisplay'
import { Heart, Eye, Edit2, X, Save, Trash2, Share2 } from 'lucide-react'

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* New Dynamic Notes Display */}
      <NotesDisplay />

      {/* Original Hardcoded Examples - Kept for Reference/Demo */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Demo Examples (Original Hardcoded Content)</h2>

        {/* Standard Note */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="mb-2 text-lg font-semibold">I love it...</p>
          <p className="mb-4 text-sm text-gray-600">Topic 1, Item 2 ---</p>
          <div className="flex items-center justify-between">
            <button className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
              <Edit2 className="mr-2 inline-block h-4 w-4" />
              Edit & Sharing
            </button>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Heart className="mr-1 h-5 w-5 text-red-500" /> 1
              </span>
              <span className="flex items-center">
                <Eye className="mr-1 h-5 w-5 text-gray-500" /> 1
              </span>
            </div>
          </div>
        </div>

        {/* Editing Note */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="mb-2 text-lg font-semibold">I love it...</p>
          <textarea
            className="mb-4 w-full rounded-lg border px-3 py-2 text-gray-700 focus:outline-none"
            rows={4}
            defaultValue='"Lorem ipsum, this is the quote efiwojfweoifjwe feiwojfwe"'
          ></textarea>
          <p className="mb-4 text-sm text-gray-600">Topic 1, Item 2 ---</p>
          <button className="rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600">
            <X className="mr-2 inline-block h-4 w-4" />
            Cancel Edit
          </button>
        </div>



        {/* Article section */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="mb-2 text-lg font-semibold">I love this article...</p>
          <a href="#" className="mb-4 block text-blue-500 hover:underline">
            Article link
          </a>
          <div className="flex items-center justify-between">
            <button className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
              <Edit2 className="mr-2 inline-block h-4 w-4" />
              Edit & Sharing
            </button>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Heart className="mr-1 h-5 w-5 text-red-500" /> 1
              </span>
              <span className="flex items-center">
                <Eye className="mr-1 h-5 w-5 text-gray-500" /> 1
              </span>
            </div>
          </div>
        </div>

        {/* Article under review */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="mb-2 text-lg font-semibold">I love this article...</p>
          <a href="#" className="mb-4 block text-blue-500 hover:underline">
            Article link
          </a>
          <div className="flex items-center justify-between">
            <button className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
              <Edit2 className="mr-2 inline-block h-4 w-4" />
              Edit
            </button>
            <span className="font-semibold text-yellow-500">Under review</span>
          </div>
        </div>
      </div>
    </div>
  )
}
