import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { ThreadCard } from '../../components/community/ThreadCard'
import { CreateThreadModal } from '../../components/community/Createthreadmodal'
import { FeedEmptyState } from '../../components/feed/feedEmptyState'
import { COMMUNITY_BOARDS, COMMUNITY_POST_TYPES, getBoardBySlug } from '../../services/communityboards'
import { getAccessToken } from '../../services/authService'

const API_BASE = 'http://localhost:5000/api/posts'
const COMMUNITY_POST_TYPE_QUERY = COMMUNITY_POST_TYPES.map((type) => type.value).join(',')

export const CommunityPage = () => {
  const [activeBoard, setActiveBoard] = useState('all')
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [defaultModalBoard, setDefaultModalBoard] = useState('')

  const activeBoardConfig = getBoardBySlug(activeBoard)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setError('')
      const accessToken = getAccessToken()

      const params = new URLSearchParams({ page: '1', limit: '30', type: COMMUNITY_POST_TYPE_QUERY })
      // Once backend has real category slugs, add:
      // if (activeBoard !== 'all') params.set('category', activeBoard)

      try {
        const response = await fetch(`${API_BASE}?${params.toString()}`, {
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Failed to load community.')
        setPosts(result.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [activeBoard])

  const handleThreadCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const openModal = (board = '') => {
    setDefaultModalBoard(board)
    setShowModal(true)
  }

  return (
    <div className='max-w-6xl mx-auto'>

      {/* Page header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-slate-900 tracking-tight'>Community</h1>
          <p className='text-sm text-slate-500 mt-0.5'>
            Connect, learn, and grow through shared discussions.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className='flex items-center gap-2 bg-primary-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-sm'
        >
          <Plus size={16} />
          <span className='hidden sm:inline'>Start Discussion</span>
          <span className='sm:hidden'>Post</span>
        </button>
      </div>

      <div className='flex gap-6'>

        {/* ── Desktop sidebar ── */}
        <aside className='hidden lg:flex flex-col gap-1 w-56 flex-shrink-0'>
          <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2'>
            Boards
          </p>

          <button
            onClick={() => setActiveBoard('all')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              activeBoard === 'all'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Discussions
          </button>

          {COMMUNITY_BOARDS.map(({ slug, label, icon: Icon, color }) => (
            <button
              key={slug}
              onClick={() => setActiveBoard(slug)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeBoard === slug
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} className={activeBoard === slug ? 'text-primary-600' : color} />
              {label}
            </button>
          ))}

          {/* Board cards — quick-post per board */}
          <div className='mt-6 flex flex-col gap-2'>
            {COMMUNITY_BOARDS.map(({ slug, label, icon: Icon, color, bg, border, description }) => (
              <div
                key={slug}
                className={`rounded-xl border p-3 ${bg} ${border}`}
              >
                <div className='flex items-center gap-1.5 mb-1'>
                  <Icon size={13} className={color} />
                  <span className={`text-xs font-semibold ${color}`}>{label}</span>
                </div>
                <p className='text-xs text-slate-500 mb-2 leading-tight'>{description}</p>
                <button
                  onClick={() => openModal(slug)}
                  className={`text-xs font-medium ${color} hover:underline`}
                >
                  + Post here
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className='flex-1 min-w-0'>

          {/* Mobile horizontal board tabs */}
          <div className='lg:hidden mb-4 flex gap-2 overflow-x-auto scrollbar-none pb-1'>
            <button
              onClick={() => setActiveBoard('all')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                activeBoard === 'all'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {COMMUNITY_BOARDS.map(({ slug, label, icon: Icon }) => (
              <button
                key={slug}
                onClick={() => setActiveBoard(slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  activeBoard === slug
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Active board header */}
          {activeBoardConfig && (
            <div className={`flex items-center gap-3 rounded-2xl border p-4 mb-4 ${activeBoardConfig.bg} ${activeBoardConfig.border}`}>
              <activeBoardConfig.icon size={20} className={activeBoardConfig.color} />
              <div>
                <p className={`text-sm font-semibold ${activeBoardConfig.color}`}>{activeBoardConfig.label}</p>
                <p className='text-xs text-slate-500'>{activeBoardConfig.description}</p>
              </div>
              <button
                onClick={() => openModal(activeBoard)}
                className={`ml-auto text-xs font-medium ${activeBoardConfig.color} border ${activeBoardConfig.border} px-3 py-1.5 rounded-lg hover:opacity-80 transition`}
              >
                + Post here
              </button>
            </div>
          )}

          {/* Thread list */}
          <div className='bg-white rounded-2xl border border-slate-200 px-5'>
            {isLoading ? (
              <p className='text-sm text-slate-400 py-8'>Loading discussions...</p>
            ) : error ? (
              <p className='text-sm text-red-600 py-8'>{error}</p>
            ) : posts.length === 0 ? (
              <div className='py-8'>
                <FeedEmptyState
                  title='No Discussions Yet'
                  body='Be the first to start a discussion in this community.'
                />
              </div>
            ) : (
              posts.map((post) => (
                <ThreadCard key={post._id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CreateThreadModal
          defaultBoard={defaultModalBoard}
          onClose={() => setShowModal(false)}
          onThreadCreated={handleThreadCreated}
        />
      )}
    </div>
  )
}