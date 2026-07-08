import { useState, useEffect, useRef } from 'react'
import { ThumbsUp } from 'lucide-react'
import { getAccessToken } from '../../services/authService'

const API_REACTIONS = `${import.meta.env.VITE_API_URL}/reactions`

const REACTION_TYPES = [
  { type: 'like',       emoji: '👍', label: 'Like',       color: 'text-blue-600' },
  { type: 'love',       emoji: '❤️',  label: 'Love',       color: 'text-red-500' },
  { type: 'insightful', emoji: '💡', label: 'Insightful', color: 'text-amber-500' },
  { type: 'support',    emoji: '🤝', label: 'Support',    color: 'text-green-600' },
]

const getReactionConfig = (type) =>
  REACTION_TYPES.find((r) => r.type === type) || null

export const ReactionBar = ({ post, currentProfileId }) => {
  const [myReaction, setMyReaction] = useState(post.my_reaction ?? null)
  const [reactionCount, setReactionCount] = useState(post.reaction_count ?? 0)
  const [showPicker, setShowPicker] = useState(false)

  // useRef instead of useState for isSubmitting — prevents re-render race
  // conditions where two rapid clicks could both pass the guard check before
  // either one finishes and sets state back to false.
  const isSubmitting = useRef(false)
  const hoverTimeout = useRef(null)
  const hideTimeout = useRef(null)

  const activeConfig = getReactionConfig(myReaction)

  // On mount, fetch the current user's existing reaction for this specific
  // post. Scoped to this post's _id so each PostCard is fully independent.
  useEffect(() => {
    if (!currentProfileId) return

    let cancelled = false // prevent state update if component unmounts mid-fetch

    const loadMyReaction = async () => {
      try {
        const accessToken = getAccessToken()
        const response = await fetch(
          `${API_REACTIONS}?post_id=${post._id}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        )
        const result = await response.json()
        if (!response.ok || cancelled) return

        const mine = result.data.reactions?.find((r) => {
          const pid = r.profile_id
          return pid && (pid._id === currentProfileId || pid === currentProfileId)
        })

        if (mine) setMyReaction(mine.type)
        if (typeof result.data.total === 'number') setReactionCount(result.data.total)

      } catch {
        // silently ignore — keep optimistic initial values from post object
      }
    }

    loadMyReaction()
    return () => { cancelled = true }
  }, [post._id, currentProfileId]) // post._id ensures each card's effect is independent

  const sendReaction = async (type) => {
    // Hard guard using ref — immune to stale closure issues
    if (isSubmitting.current) return
    isSubmitting.current = true

    const wasSameType = myReaction === type
    const wasReacting = myReaction !== null

    // Optimistic update
    if (wasSameType) {
      setMyReaction(null)
      setReactionCount((c) => Math.max(0, c - 1))
    } else {
      setMyReaction(type)
      if (!wasReacting) setReactionCount((c) => c + 1)
    }
    setShowPicker(false)

    const accessToken = getAccessToken()
    try {
      const response = await fetch(API_REACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ post_id: post._id, type }),
      })
      const result = await response.json()


        console.log("Status:", response.status);
        console.log("Response:", result);

      if (!response.ok) {
        throw new Error(result.message || 'Reaction failed.')
      }

      // Server confirmed removal
      if (!result.data.reacted) {
        setMyReaction(null)
        if (!wasSameType) setReactionCount((c) => Math.max(0, c - 1))
      }

    } catch {
      // Revert optimistic update on any failure
      setMyReaction(wasSameType ? null : (wasReacting ? myReaction : null))
      setReactionCount(post.reaction_count ?? 0)
    } finally {
      isSubmitting.current = false
    }
  }

  const handleMainClick = () => {
    sendReaction(myReaction || 'like')
  }

  const handleMouseEnter = () => {
    clearTimeout(hideTimeout.current)
    hoverTimeout.current = setTimeout(() => setShowPicker(true), 400)
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current)
    hideTimeout.current = setTimeout(() => setShowPicker(false), 300)
  }

  return (
    <div
      className='relative flex items-center'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleMainClick}
        className={`flex items-center gap-1.5 text-xs font-medium px-1 py-1 rounded-lg hover:bg-slate-50 transition select-none ${
          activeConfig ? activeConfig.color : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {activeConfig && myReaction !== 'like' ? (
          <span className='text-base leading-none'>{activeConfig.emoji}</span>
        ) : (
          <ThumbsUp
            size={15}
            fill={myReaction === 'like' ? 'currentColor' : 'none'}
            strokeWidth={myReaction === 'like' ? 1.5 : 2}
          />
        )}
        <span>{activeConfig ? activeConfig.label : 'Like'}</span>
        {reactionCount > 0 && (
          <span className='text-slate-400 font-normal ml-0.5'>{reactionCount}</span>
        )}
      </button>

      {showPicker && (
        <div
          className='absolute bottom-8 left-0 z-20 flex items-center gap-1 bg-white border border-slate-200 rounded-2xl shadow-lg px-2 py-2'
          onMouseEnter={() => clearTimeout(hideTimeout.current)}
          onMouseLeave={handleMouseLeave}
        >
          {REACTION_TYPES.map(({ type, emoji, label }) => (
            <button
              key={type}
              onClick={() => sendReaction(type)}
              title={label}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl transition-all hover:scale-125 hover:bg-slate-50 group ${
                myReaction === type ? 'scale-110' : ''
              }`}
            >
              <span className='text-2xl leading-none'>{emoji}</span>
              <span className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
                myReaction === type ? 'opacity-100' : ''
              } ${getReactionConfig(type)?.color || 'text-slate-500'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}