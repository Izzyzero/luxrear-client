import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { PostCard } from '../../components/feed/PostCard'
import { FeedFilters } from '../../components/feed/feedFilters'
import { FeedEmptyState } from '../../components/feed/feedEmptyState'
import { CreatePostBox } from '../../components/feed/CreatePostBox'
import { FEED_WELCOME_MESSAGE, EMPTY_STATES, ENGAGEMENT_PROMPTS } from '../../services/feedContent'
import { getAccessToken } from '../../services/authService'

const API_BASE = "http://localhost:5000/api/posts"

export const HomeFeedPage = () => {
  const { user } = useOutletContext()
  const [activeFilter, setActiveFilter] = useState('all')
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    setError('')

    const accessToken = getAccessToken()
    const params = new URLSearchParams({ page: '1', limit: '20' })
    if (activeFilter !== 'all') params.set('type', activeFilter)

    try {
      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load feed.')
      }

      setPosts(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts, user?._id, user?.id, user?.profile?._id])

  const handlePostCreated = async () => {
    await fetchPosts()
  }

  return (
    <div className='max-w-2xl mx-auto'>

      <div className='mb-5'>
        <h1 className='text-xl font-semibold text-slate-900 tracking-tight'>
          {FEED_WELCOME_MESSAGE.title}
        </h1>
        <p className='text-sm text-slate-500 mt-1'>{FEED_WELCOME_MESSAGE.body}</p>
      </div>

      <div className='bg-primary-50/60 rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5'>
        <Lightbulb size={16} className='text-primary-600 flex-shrink-0 mt-0.5' />
        <p className='text-sm text-primary-800 leading-snug'>
          {ENGAGEMENT_PROMPTS.join('  ·  ')}
        </p>
      </div>

      <CreatePostBox currentUser={user} onPostCreated={handlePostCreated} />

      <FeedFilters activeFilter={activeFilter} onChange={setActiveFilter} />

      {isLoading ? (
        <p className='text-sm text-slate-400 py-6'>Loading feed...</p>
      ) : error ? (
        <p className='text-sm text-red-600 py-6'>{error}</p>
      ) : posts.length === 0 ? (
        activeFilter === 'all' ? (
          <FeedEmptyState title={EMPTY_STATES.noPosts.title} body={EMPTY_STATES.noPosts.body} />
        ) : (
          <FeedEmptyState title={EMPTY_STATES.noOpportunitiesFound.title} body={EMPTY_STATES.noOpportunitiesFound.body} />
        )
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentProfileId={user?.profile?.id || user?.profile?._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}