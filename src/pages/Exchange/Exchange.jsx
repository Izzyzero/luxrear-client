import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { OpportunityCard } from '../../components/feed/OpportunityCard'
import { ExchangePostModal } from '../../components/feed/ExchangePostModal'
import { FeedEmptyState } from '../../components/feed/feedEmptyState'
import { EXCHANGE_POST_TYPES, EXCHANGE_TYPE_LIST } from '../../services/exchangeTypes'
import { getAccessToken } from '../../services/authService'

const API_BASE = 'http://localhost:5000/api/posts'

// The 6 Exchange types as a comma-separated query param so the backend
// filters only Exchange posts, not Home Feed types
const EXCHANGE_TYPES_QUERY = Object.keys(EXCHANGE_POST_TYPES).join(',')

export const ExchangePage = () => {
  const { user } = useOutletContext()
  const [activeFilter, setActiveFilter] = useState('all')
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [defaultModalType, setDefaultModalType] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setError('')
      const accessToken = getAccessToken()

      const params = new URLSearchParams({ page: '1', limit: '20' })
      // Filter to only Exchange types — if a specific type is selected use that,
      // otherwise request all 6 Exchange types at once
      params.set('type', activeFilter === 'all' ? EXCHANGE_TYPES_QUERY : activeFilter)

      try {
        const response = await fetch(`${API_BASE}?${params.toString()}`, {
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Failed to load exchange.')
        setPosts(result.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [activeFilter])

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const openModalWithType = (type = '') => {
    setDefaultModalType(type)
    setShowModal(true)
  }

  return (
    <div className='max-w-6xl mx-auto'>

      {/* Page header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-slate-900 tracking-tight'>Business Exchange</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Connect, collaborate, and grow through business opportunities.
          </p>
        </div>
        <button
          onClick={() => openModalWithType()}
          className='flex items-center gap-2 bg-primary-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-sm'
        >
          <Plus size={16} />
          <span className='hidden sm:inline'>Post Opportunity</span>
          <span className='sm:hidden'>Post</span>
        </button>
      </div>

      <div className='flex gap-6'>

        {/* ── Desktop sidebar ── */}
        <aside className='hidden lg:flex flex-col gap-1 w-52 flex-shrink-0'>
          <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2'>
            Categories
          </p>

          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              activeFilter === 'all'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Opportunities
          </button>

          {EXCHANGE_TYPE_LIST.map(({ value, label, icon: Icon, textClass }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeFilter === value
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} className={activeFilter === value ? 'text-primary-600' : textClass} />
              {label}
            </button>
          ))}

          {/* Quick-post shortcuts per category */}
          <div className='mt-4 pt-4 border-t border-slate-200'>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2'>
              Quick Post
            </p>
            {EXCHANGE_TYPE_LIST.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => openModalWithType(value)}
                className='flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors w-full text-left'
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className='flex-1 min-w-0'>

          {/* Mobile filter bar */}
          <div className='lg:hidden mb-4'>
            <div className='flex gap-2 overflow-x-auto scrollbar-none pb-1'>
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                  activeFilter === 'all'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {EXCHANGE_TYPE_LIST.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                    activeFilter === value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-slate-500'>
              {isLoading ? 'Loading...' : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
              {activeFilter !== 'all' && EXCHANGE_POST_TYPES[activeFilter] && (
                <span className='font-medium text-slate-700'>
                  {' '}in {EXCHANGE_POST_TYPES[activeFilter].label}
                </span>
              )}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <p className='text-sm text-slate-400 py-6'>Loading opportunities...</p>
          ) : error ? (
            <p className='text-sm text-red-600 py-6'>{error}</p>
          ) : posts.length === 0 ? (
            <FeedEmptyState
              title='No Opportunities Found'
              body={
                activeFilter === 'all'
                  ? 'No posts yet. Be the first to share an opportunity with the community.'
                  : 'No posts in this category yet. Try another category or check back later.'
              }
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {posts.map((post) => (
                <OpportunityCard
                  key={post._id}
                  post={post}
                  currentProfileId={user?.profile_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ExchangePostModal
          defaultType={defaultModalType}
          onClose={() => setShowModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  )
}