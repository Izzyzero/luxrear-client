import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Trash2, CornerDownRight } from 'lucide-react'
import { getAccessToken } from '../../services/authService'

const API_COMMENTS = `${import.meta.env.VITE_API_URL}/comments`

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

const formatTime = (isoString) => {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Single comment row (used for both top-level and replies) ───
const CommentRow = ({ comment, currentProfileId, onDelete, onReply, isReply = false }) => {
  const profile = comment.profile_id
  const isOwner = currentProfileId && profile?._id === currentProfileId

  return (
    <div className={`flex gap-2.5 ${isReply ? 'ml-8 mt-2' : 'mt-3'}`}>
      <div className='h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0'>
        {profile?.profile_picture
          ? <img src={profile.profile_picture} alt={profile.full_name} className='h-full w-full object-cover rounded-full' />
          : getInitials(profile?.full_name)
        }
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-baseline gap-1.5 flex-wrap'>
          <span className='text-xs font-semibold text-slate-900'>{profile?.full_name}</span>
          <span className='text-xs text-slate-400'>{profile?.business_name}</span>
          <span className='text-xs text-slate-400'>· {formatTime(comment.created_at)}</span>
        </div>
        <p className='text-sm text-slate-700 mt-0.5 leading-snug'>{comment.content}</p>
        <div className='flex items-center gap-3 mt-1'>
          {!isReply && (
            <button
              onClick={() => onReply(comment)}
              className='text-xs text-slate-400 hover:text-primary-600 transition flex items-center gap-1'
            >
              <CornerDownRight size={12} />
              Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete(comment._id)}
              className='text-xs text-slate-400 hover:text-red-600 transition flex items-center gap-1'
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Comment input box ───
const CommentInput = ({ postId, parentId = null, replyingTo = null, onSubmitted, onCancelReply }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async ({ content }) => {
    if (!content?.trim()) return
    setIsSubmitting(true)
    const accessToken = getAccessToken()

    try {
      const response = await fetch(API_COMMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          post_id: postId,
          content: content.trim(),
          ...(parentId && { parent_id: parentId }),
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to post comment.')

      onSubmitted(result.data.comment, parentId)
      onCommentAdded?.()
      reset()
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='mt-3'>
      {replyingTo && (
        <div className='flex items-center gap-2 mb-1.5 ml-9'>
          <span className='text-xs text-slate-400'>
            Replying to <span className='text-primary-600 font-medium'>{replyingTo}</span>
          </span>
          <button type='button' onClick={onCancelReply} className='text-xs text-slate-400 hover:text-slate-600'>
            Cancel
          </button>
        </div>
      )}
      <div className='flex gap-2.5 items-center'>
        <input
          {...register('content')}
          placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
          className='flex-1 text-sm rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-slate-400'
          autoFocus={!!parentId}
        />
        <button
          type='submit'
          disabled={isSubmitting}
          className='text-sm font-medium text-white bg-primary-600 px-3 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-60'
        >
          {isSubmitting ? '...' : 'Post'}
        </button>
      </div>
    </form>
  )
}

// ─── Main CommentSection ───
export const CommentSection = ({ postId, currentProfileId, onCommentAdded, onCommentDeleted }) => {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null) // { id, name }

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      const accessToken = getAccessToken()
      try {
        const response = await fetch(`${API_COMMENTS}?post_id=${postId}&limit=50`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
        const result = await response.json()
        if (response.ok) setComments(result.data || [])
      } catch (err) {
        console.error('Failed to load comments:', err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchComments()
  }, [postId])

  const handleCommentSubmitted = (newComment, parentId) => {
    if (parentId) {
      // Add reply to the correct parent comment
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        )
      )
      setReplyingTo(null)
    } else {
      // Add top-level comment
      setComments((prev) => [...prev, { ...newComment, replies: [] }])
    }
  }

  const handleDelete = async (commentId) => {
    const accessToken = getAccessToken()
    try {
      const response = await fetch(`${API_COMMENTS}/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (response.ok) {
        setComments((prev) =>
          prev
            .filter((c) => c._id !== commentId)
            .map((c) => ({
              ...c,
              replies: (c.replies || []).filter((r) => r._id !== commentId),
            }))
        )
        onCommentDeleted?.()
      }
    } catch (err) {
      console.error('Failed to delete comment:', err.message)
    }
  }

  return (
    <div className='mt-3 pt-3 border-t border-slate-100'>
      {isLoading ? (
        <p className='text-xs text-slate-400'>Loading comments...</p>
      ) : (
        <>
          {comments.length === 0 && (
            <p className='text-xs text-slate-400'>No comments yet. Be the first.</p>
          )}
          {comments.map((comment) => (
            <div key={comment._id}>
              <CommentRow
                comment={comment}
                currentProfileId={currentProfileId}
                onDelete={handleDelete}
                onReply={(c) => setReplyingTo({ id: c._id, name: c.profile_id?.full_name })}
              />
              {/* Replies */}
              {(comment.replies || []).map((reply) => (
                <CommentRow
                  key={reply._id}
                  comment={reply}
                  currentProfileId={currentProfileId}
                  onDelete={handleDelete}
                  onReply={() => {}}
                  isReply
                />
              ))}
              {/* Reply input, shown when replying to this specific comment */}
              {replyingTo?.id === comment._id && (
                <div className='ml-8'>
                  <CommentInput
                    postId={postId}
                    parentId={comment._id}
                    replyingTo={replyingTo.name}
                    onSubmitted={handleCommentSubmitted}
                    onCancelReply={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Top-level comment input (always shown, unless replying to a comment) */}
      {!replyingTo && (
        <CommentInput
          postId={postId}
          onSubmitted={handleCommentSubmitted}
        />
      )}
    </div>
  )
}