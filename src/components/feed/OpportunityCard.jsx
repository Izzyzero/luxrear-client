import { useState } from 'react'
import { MapPin, Tag, MessageCircle, Bookmark } from 'lucide-react'
import { EXCHANGE_POST_TYPES } from '../../services/Exchangetypes'
import { ReactionBar } from './Reactionbar'
import { CommentSection } from './Commentsection'

const formatRelativeTime = (isoString) => {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getInitials = (name) =>
  name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

export const OpportunityCard = ({ post, currentProfileId }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0)
  const [isSaved, setIsSaved] = useState(false)

  const typeConfig = EXCHANGE_POST_TYPES[post.type]
  const TypeIcon = typeConfig?.icon
  const profile = post.profile_id

  return (
    <article className='bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3 hover:border-slate-300 transition-colors'>

      {/* Type badge — full pill, prominent, sits at top */}
      {typeConfig && (
        <div className='flex items-center justify-between'>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig.badgeClass}`}>
            {TypeIcon && <TypeIcon size={12} />}
            {typeConfig.label}
          </span>
          {post.is_featured && (
            <span className='text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full'>
              Featured
            </span>
          )}
        </div>
      )}

      {/* Title — larger and more prominent than feed card */}
      <div>
        <h3 className='text-sm font-semibold text-slate-900 leading-snug'>{post.title}</h3>
        <p className='text-sm text-slate-600 mt-1 leading-relaxed line-clamp-3'>{post.description}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt=''
          className='rounded-xl w-full object-cover max-h-52 border border-slate-200'
        />
      )}

      {/* Metadata row — location + tags */}
      {(post.location || post.tags?.length > 0) && (
        <div className='flex flex-wrap items-center gap-2'>
          {post.location && (
            <span className='flex items-center gap-1 text-xs text-slate-500'>
              <MapPin size={11} />
              {post.location}
            </span>
          )}
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className='flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full'
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author row — at the bottom, like a business card footer */}
      <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
        <div className='h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden'>
          {profile?.profile_picture
            ? <img src={profile.profile_picture} alt={profile.full_name} className='h-full w-full object-cover' />
            : getInitials(profile?.full_name)
          }
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-xs font-medium text-slate-900 truncate'>{profile?.full_name}</p>
          <p className='text-xs text-slate-400 truncate'>{profile?.business_name}</p>
        </div>
        <span className='text-xs text-slate-400 flex-shrink-0'>{formatRelativeTime(post.created_at)}</span>
      </div>

      {/* Interaction bar */}
      <div className='flex items-center gap-3 -mb-1'>
        <ReactionBar post={post} currentProfileId={currentProfileId} />

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className={`flex items-center gap-1.5 text-xs transition px-1 py-1 rounded-lg hover:bg-slate-50 ${
            showComments ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageCircle size={15} />
          {commentCount > 0 && commentCount}
        </button>

        <button
          onClick={() => setIsSaved((prev) => !prev)}
          className={`ml-auto transition ${isSaved ? 'text-primary-700' : 'text-slate-400 hover:text-slate-600'}`}
          aria-label={isSaved ? 'Remove from saved' : 'Save post'}
        >
          <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          currentProfileId={currentProfileId}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
          onCommentDeleted={() => setCommentCount((c) => Math.max(0, c - 1))}
        />
      )}
    </article>
  )
}