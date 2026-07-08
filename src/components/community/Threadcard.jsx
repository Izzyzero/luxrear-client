import { useNavigate } from 'react-router-dom'
import { MessageCircle, Tag } from 'lucide-react'
import { UpvoteButton } from './Upvotebutton'

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

export const ThreadCard = ({ post }) => {
  const navigate = useNavigate()
  const profile = post.profile_id

  return (
    <div className='flex gap-3 py-4 border-b border-slate-100 last:border-b-0'>

      {/* Upvote column */}
      <div className='flex-shrink-0 pt-0.5'>
        <UpvoteButton post={post} />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <button
          onClick={() => navigate(`/dashboard/community/thread/${post._id}`)}
          className='text-left w-full group'
        >
          <h3 className='text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors leading-snug'>
            {post.title}
          </h3>
          <p className='text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed'>
            {post.description}
          </p>
        </button>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mt-2'>
            {post.tags.map((tag) => (
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

        {/* Meta row */}
        <div className='flex items-center gap-3 mt-2'>
          <div className='flex items-center gap-1.5'>
            <div className='h-5 w-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-semibold overflow-hidden'>
              {profile?.profile_picture
                ? <img src={profile.profile_picture} alt={profile.full_name} className='h-full w-full object-cover' />
                : getInitials(profile?.full_name)
              }
            </div>
            <span className='text-xs text-slate-500'>{profile?.full_name}</span>
          </div>
          <span className='text-xs text-slate-400'>{formatRelativeTime(post.created_at)}</span>
          <button
            onClick={() => navigate(`/dashboard/community/thread/${post._id}`)}
            className='flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition ml-auto'
          >
            <MessageCircle size={12} />
            {post.comment_count ?? 0} {post.comment_count === 1 ? 'reply' : 'replies'}
          </button>
        </div>
      </div>
    </div>
  )
}