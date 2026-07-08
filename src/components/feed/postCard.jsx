import { useState } from 'react'
import { MessageCircle, Bookmark, MapPin } from 'lucide-react'
import { POST_TYPES } from '../../services/postType'
import { ReactionBar } from './Reactionbar'
import { CommentSection } from './Commentsection'

const formatRelativeTime = (isoString) => {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getInitials = (name) =>
  name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?'

export const PostCard = ({ post, currentProfileId }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0)
  const [isSaved, setIsSaved] = useState(false)

  const typeConfig = POST_TYPES[post.type]
  const TypeIcon = typeConfig?.icon
  const profile = post.profile_id

  return (
    <article className='py-4 border-b border-slate-200 last:border-b-0'>
      <div className='flex items-start gap-3'>

        {/* Avatar */}
        <div className='h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden'>
          {profile?.profile_picture
            ? <img src={profile.profile_picture} alt={profile.full_name} className='h-full w-full object-cover' />
            : getInitials(profile?.full_name)
          }
        </div>

        <div className='flex-1 min-w-0'>

          {/* Header row */}
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-baseline gap-1.5 flex-wrap min-w-0'>
              <span className='text-sm font-semibold text-slate-900 truncate'>{profile?.full_name}</span>
              <span className='text-sm text-slate-400 truncate'>{profile?.business_name}</span>
              <span className='text-xs text-slate-400 flex-shrink-0'>· {formatRelativeTime(post.created_at)}</span>
            </div>
            {typeConfig && (
              <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium ${typeConfig.textClass}`}>
                {TypeIcon && <TypeIcon size={12} />}
                {typeConfig.label}
              </span>
            )}
          </div>

          {/* Content */}
          <h3 className='text-sm font-medium text-slate-900 mt-1.5'>{post.title}</h3>
          <p className='text-sm text-slate-600 whitespace-pre-line leading-snug mt-0.5'>{post.description}</p>

          {post.location && (
            <p className='text-xs text-slate-400 flex items-center gap-1 mt-1.5'>
              <MapPin size={11} />
              {post.location}
            </p>
          )}

          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className='rounded-lg mt-2 w-full object-cover max-h-72 border border-slate-200'
            />
          )}

          {/* Interaction bar */}
          <div className='flex items-center gap-3 mt-2.5'>

            {/* Real reaction toggle */}
            <ReactionBar
              post={post}
              currentProfileId={currentProfileId}
            />

            {/* Comment toggle */}
            <button
              onClick={() => setShowComments((prev) => !prev)}
              className={`flex items-center gap-1.5 text-xs transition px-1 py-1 rounded-lg hover:bg-slate-50 ${
                showComments ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MessageCircle size={15} />
              {commentCount > 0 && commentCount}
            </button>

            {/* Save */}
            <button
              onClick={() => setIsSaved((prev) => !prev)}
              className={`ml-auto transition ${isSaved ? 'text-primary-700' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Comment section — lazy-rendered, only when toggled open */}
          {showComments && (
            <CommentSection
              postId={post._id}
              currentProfileId={currentProfileId}
              onCommentAdded={() => setCommentCount((prev) => prev + 1)}
              onCommentDeleted={() => setCommentCount((prev) => Math.max(0, prev - 1))}
            />
          )}

        </div>
      </div>
    </article>
  )
}