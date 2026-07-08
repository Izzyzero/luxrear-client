import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Trash2, CornerDownRight, Tag } from 'lucide-react'
import { UpvoteButton } from '../../components/community/Upvotebutton'
import { getAccessToken } from '../../services/authService'

const API_POSTS = `${import.meta.env.VITE_API_URL}/posts`
const API_COMMENTS = `${import.meta.env.VITE_API_URL}/comments`

const formatTime = (isoString) => {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

// ─── Avatar ───
const Avatar = ({ profile, size = 4 }) => (
  <div className={`h-${size} w-${size} rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden`}>
    {profile?.profile_picture
      ? <img src={profile.profile_picture} alt={profile.full_name} className='h-full w-full object-cover' />
      : getInitials(profile?.full_name)
    }
  </div>
)

// ─── Reply input ───
const ReplyInput = ({ postId, parentId, replyingTo, onSubmitted, onCancel }) => {
  const { register, handleSubmit, reset } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async ({ content }) => {
    if (!content?.trim()) return
    setIsSubmitting(true)
    const accessToken = getAccessToken()
    try {
      const response = await fetch(API_COMMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ post_id: postId, content: content.trim(), ...(parentId && { parent_id: parentId }) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)
      onSubmitted(result.data.comment, parentId)
      reset()
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='mt-2'>
      {replyingTo && (
        <div className='flex items-center gap-2 mb-1.5'>
          <span className='text-xs text-slate-400'>
            Replying to <span className='text-primary-600 font-medium'>{replyingTo}</span>
          </span>
          <button type='button' onClick={onCancel} className='text-xs text-slate-400 hover:text-slate-600'>Cancel</button>
        </div>
      )}
      <div className='flex gap-2'>
        <input
          {...register('content')}
          placeholder={parentId ? 'Write a reply...' : 'Join the discussion...'}
          autoFocus={!!parentId}
          className='flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-slate-400'
        />
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-xl bg-primary-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-primary-700 transition disabled:opacity-60'
        >
          {isSubmitting ? '...' : 'Reply'}
        </button>
      </div>
    </form>
  )
}

// ─── Single comment/reply row ───
const CommentRow = ({ comment, currentProfileId, onDelete, onReplyClick, isReply }) => {
  const profile = comment.profile_id
  const isOwner = profile?._id === currentProfileId || profile === currentProfileId

  return (
    <div className={`flex gap-3 ${isReply ? 'mt-3' : ''}`}>
      <Avatar profile={profile} size={7} />
      <div className='flex-1 min-w-0'>
        <div className='flex items-baseline gap-2 flex-wrap'>
          <span className='text-sm font-semibold text-slate-900'>{profile?.full_name}</span>
          <span className='text-xs text-slate-400'>{profile?.business_name}</span>
          <span className='text-xs text-slate-400'>· {formatTime(comment.created_at)}</span>
        </div>
        <p className='text-sm text-slate-700 mt-1 leading-relaxed'>{comment.content}</p>
        <div className='flex items-center gap-3 mt-1.5'>
          {!isReply && (
            <button
              onClick={() => onReplyClick(comment)}
              className='flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition'
            >
              <CornerDownRight size={12} />
              Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete(comment._id)}
              className='flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition'
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

// ─── Main ThreadPage ───
export const ThreadPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null) // { id, name }
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      const accessToken = getAccessToken()
      try {
        const response = await fetch(`${API_POSTS}/${postId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Thread not found.')
        setPost(result.data.post)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoadingPost(false)
      }
    }

    const fetchComments = async () => {
      const accessToken = getAccessToken()
      try {
        const response = await fetch(`${API_COMMENTS}?post_id=${postId}&limit=100`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
        const result = await response.json()
        if (response.ok) setComments(result.data || [])
      } catch {
        // non-fatal — thread still renders without comments
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchPost()
    fetchComments()
  }, [postId])

  const handleCommentSubmitted = (newComment, parentId) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        )
      )
      setReplyingTo(null)
    } else {
      setComments((prev) => [...prev, { ...newComment, replies: [] }])
    }
    setPost((p) => p ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p)
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
            .map((c) => ({ ...c, replies: (c.replies || []).filter((r) => r._id !== commentId) }))
        )
        setPost((p) => p ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) } : p)
      }
    } catch (err) {
      console.error(err.message)
    }
  }

  if (isLoadingPost) return <p className='text-sm text-slate-400 py-6'>Loading thread...</p>
  if (error) return <p className='text-sm text-red-600 py-6'>{error}</p>
  if (!post) return null

  const profile = post.profile_id

  return (
    <div className='max-w-2xl mx-auto'>

      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard/community')}
        className='flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-5'
      >
        <ArrowLeft size={16} />
        Back to Community
      </button>

      {/* Post body */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
        <div className='flex gap-4'>

          {/* Upvote column */}
          <div className='flex-shrink-0'>
            <UpvoteButton post={post} size='lg' />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>

            {/* Author */}
            <div className='flex items-center gap-2 mb-3'>
              <Avatar profile={profile} size={4} />
              <div>
                <p className='text-sm font-semibold text-slate-900'>{profile?.full_name}</p>
                <p className='text-xs text-slate-400'>{profile?.business_name} · {formatTime(post.created_at)}</p>
              </div>
            </div>

            <h1 className='text-lg font-bold text-slate-900 leading-snug mb-2'>{post.title}</h1>
            <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-line'>{post.description}</p>

            {post.image_url && (
              <img src={post.image_url} alt='' className='rounded-xl mt-4 w-full object-cover border border-slate-200 ' />
            )}

            {post.tags?.length > 0 && (
              <div className='flex flex-wrap gap-1.5 mt-4'>
                {post.tags.map((tag) => (
                  <span key={tag} className='flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full'>
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className='text-xs text-slate-400 mt-4'>
              {post.comment_count ?? 0} {post.comment_count === 1 ? 'reply' : 'replies'}
            </p>
          </div>
        </div>
      </div>

      {/* Reply input — top level */}
      {!replyingTo && (
        <div className='mb-6'>
          <ReplyInput
            postId={postId}
            onSubmitted={handleCommentSubmitted}
          />
        </div>
      )}

      {/* Comments / replies */}
      <div className='bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100'>
        {isLoadingComments ? (
          <p className='text-sm text-slate-400 p-6'>Loading replies...</p>
        ) : comments.length === 0 ? (
          <p className='text-sm text-slate-400 p-6 text-center'>
            No replies yet. Be the first to contribute.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className='p-4'>
              <CommentRow
                comment={comment}
                currentProfileId={user?.profile_id}
                onDelete={handleDelete}
                onReplyClick={(c) => setReplyingTo({ id: c._id, name: c.profile_id?.full_name })}
              />

              {/* Nested replies */}
              {(comment.replies || []).length > 0 && (
                <div className='ml-10 mt-3 pl-4 border-l-2 border-slate-100 flex flex-col gap-3'>
                  {comment.replies.map((reply) => (
                    <CommentRow
                      key={reply._id}
                      comment={reply}
                      currentProfileId={user?.profile_id}
                      onDelete={handleDelete}
                      onReplyClick={() => {}}
                      isReply
                    />
                  ))}
                </div>
              )}

              {/* Reply input inline under the targeted comment */}
              {replyingTo?.id === comment._id && (
                <div className='ml-10 mt-3'>
                  <ReplyInput
                    postId={postId}
                    parentId={comment._id}
                    replyingTo={replyingTo.name}
                    onSubmitted={handleCommentSubmitted}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sticky reply input when replying to a comment */}
      {replyingTo && (
        <div className='mt-4'>
          <ReplyInput
            postId={postId}
            parentId={replyingTo.id}
            replyingTo={replyingTo.name}
            onSubmitted={handleCommentSubmitted}
            onCancel={() => setReplyingTo(null)}
          />
        </div>
      )}
    </div>
  )
}