'use client'

import React, { useState } from 'react'

const CreatePost = () => {
  const [articleLink, setArticleLink] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Article:', articleLink)
    console.log('Comment:', comment)
    setArticleLink('')
    setComment('')
  }

  return (
    <div className="min-h-screen w-full bg-white text-black p-6 flex flex-col justify-between">
      <div>
        <button className="text-xl mb-4">{}</button>
        <h2 className="text-3xl font-bold mb-2">User Content Review</h2>
        <p className="mb-6 text-lg">Share an article</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            placeholder="Article link"
            value={articleLink}
            onChange={(e) => setArticleLink(e.target.value)}
            className="w-full p-3 rounded border border-gray-300 bg-gray-100"
            required
          />
          <textarea
            placeholder="Comment here"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 h-40 rounded border border-gray-300 bg-gray-100 resize-none"
            required
          />
           <button
        onClick={handleSubmit}
        className="w-full mt-6 p-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
      >
        Submit post to feed
      </button>
        </form>
        
      </div>

     
    </div>
  )
}

export default CreatePost
