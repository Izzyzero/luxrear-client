import { useState, useRef } from 'react'
import { ChevronUp } from 'lucide-react'
import { getAccessToken } from '../../services/authService'

const API_REACTIONS = 'http://localhost:5000/api/reactions'

export const UpvoteButton = ({ post, size = 'md' }) => {
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [count, setCount] = useState(post.reaction_count ?? 0)
  const isSubmitting = useRef(false)

  const handleUpvote = async () => {
    if (isSubmitting.current) return
    isSubmitting.current = true

    // Optimistic update
    const wasUpvoted = isUpvoted
    setIsUpvoted(!wasUpvoted)
    setCount((c) => wasUpvoted ? Math.max(0, c - 1) : c + 1)

    const accessToken = getAccessToken()
    try {
      const response = await fetch(API_REACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ post_id: post._id, type: 'like' }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      // Sync with server truth
      if (!result.data.reacted) {
        setIsUpvoted(false)
        setCount((c) => Math.max(0, c - 1))
      }
    } catch {
      // Revert on failure
      setIsUpvoted(wasUpvoted)
      setCount(post.reaction_count ?? 0)
    } finally {
      isSubmitting.current = false
    }
  }

  const isLarge = size === 'lg'

  return (
    <button
      onClick={handleUpvote}
      className={`flex flex-col items-center gap-0.5 rounded-xl border transition-all ${
        isUpvoted
          ? 'border-primary-300 bg-primary-50 text-primary-700'
          : 'border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
      } ${isLarge ? 'px-3 py-2.5' : 'px-2.5 py-1.5'}`}
      aria-label={isUpvoted ? 'Remove upvote' : 'Upvote'}
    >
      <ChevronUp
        size={isLarge ? 20 : 16}
        strokeWidth={isUpvoted ? 2.5 : 2}
      />
      <span className={`font-semibold leading-none ${isLarge ? 'text-sm' : 'text-xs'}`}>
        {count}
      </span>
    </button>
  )
}