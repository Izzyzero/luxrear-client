import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MessageSquareText,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { getAccessToken } from '../../services/authService'

const requestTabs = ['requests', 'responses']
const API_BASE = `${import.meta.env.VITE_API_URL}`

const emptyRequestForm = {
  title: '',
  description: '',
  location: '',
  tags: '',
}

const formatProfileName = (profile) => profile?.business_name || profile?.full_name || 'Community member'

const truncateText = (value, maxLength = 160) => {
  if (!value) return ''
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

const formatDateLabel = (value) => {
  if (!value) return 'Recently posted'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently posted'

  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

const normalizeRequest = (post) => ({
  id: post._id,
  title: post.title,
  owner: formatProfileName(post.profile_id),
  category: post.tags?.[0] || 'Business support',
  status: post.comment_count > 0 ? `${post.comment_count} response${post.comment_count === 1 ? '' : 's'}` : 'Open for collaboration',
  summary: truncateText(post.description || 'No details provided yet.'),
  description: post.description || 'No details provided yet.',
  location: post.location || 'Remote / global',
  tags: post.tags || [],
  createdAt: post.created_at,
})

const normalizeComment = (comment, request) => ({
  id: comment._id,
  postId: comment.post_id,
  requestTitle: request?.title || 'Support request',
  owner: formatProfileName(comment.profile_id),
  category: request?.category || 'Expert response',
  summary: truncateText(comment.content || 'No response content.'),
  content: comment.content || '',
  createdAt: comment.created_at,
  replies: comment.replies || [],
})

const authHeaders = () => {
  const accessToken = getAccessToken()
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

export const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('requests')
  const [query, setQuery] = useState('')
  const [requests, setRequests] = useState([])
  const [responses, setResponses] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyRequestForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isResponsesLoading, setIsResponsesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchResponsesForRequest = async (request) => {
    setIsResponsesLoading(true)

    try {
      const params = new URLSearchParams({ post_id: request.id, page: '1', limit: '20' })
      const response = await fetch(`${API_BASE}/comments?${params.toString()}`, {
        headers: authHeaders(),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load expert responses.')
      }

      const normalized = (result.data || []).map((comment) => normalizeComment(comment, request))
      setResponses(normalized)
      return normalized
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setIsResponsesLoading(false)
    }
  }

  const fetchSupportRequests = async () => {
    setIsLoading(true)
    setError('')

    const params = new URLSearchParams({ page: '1', limit: '20', type: 'SUPPORT_REQUEST' })

    try {
      const response = await fetch(`${API_BASE}/posts?${params.toString()}`, {
        headers: authHeaders(),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load support requests right now.')
      }

      const normalizedRequests = (result.data || []).map(normalizeRequest)
      setRequests(normalizedRequests)

      if (normalizedRequests.length > 0) {
        setSelectedRequest(normalizedRequests[0])
        await fetchResponsesForRequest(normalizedRequests[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSupportRequests()
  }, [])

  const visibleRequests = useMemo(() => {
    const keyword = query.toLowerCase().trim()

    if (!keyword) return requests
    return requests.filter((request) =>
      [request.title, request.owner, request.category, request.summary, request.location, ...request.tags]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    )
  }, [query, requests])

  const visibleResponses = useMemo(() => {
    const keyword = query.toLowerCase().trim()

    if (!keyword) return responses
    return responses.filter((response) =>
      [response.requestTitle, response.owner, response.category, response.summary].join(' ').toLowerCase().includes(keyword)
    )
  }, [query, responses])

  const handleSelectRequest = async (request, nextTab = 'responses') => {
    setSelectedRequest(request)
    setActiveTab(nextTab)
    await fetchResponsesForRequest(request)
  }

  const handleCreateRequest = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          type: 'SUPPORT_REQUEST',
          ...form,
          tags: form.tags
            .split(',')
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to create support request.')
      }

      const created = normalizeRequest(result.data.post)
      setRequests((current) => [created, ...current])
      setSelectedRequest(created)
      setResponses([])
      setForm(emptyRequestForm)
      setIsCreateOpen(false)
      setNotice('Support request created.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateResponse = async (event) => {
    event.preventDefault()
    if (!selectedRequest || !responseText.trim()) return

    setIsSubmitting(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          post_id: selectedRequest.id,
          content: responseText,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit expert response.')
      }

      const created = normalizeComment(result.data.comment, selectedRequest)
      setResponses((current) => [...current, created])
      setRequests((current) =>
        current.map((request) =>
          request.id === selectedRequest.id
            ? { ...request, status: 'Response added' }
            : request
        )
      )
      setResponseText('')
      setNotice('Expert response posted.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <section className='rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium'>
              <Sparkles size={16} />
              Support Board
            </div>
            <h1 className='mt-3 text-2xl font-semibold tracking-tight sm:text-3xl'>Get practical help for the next stage of your business.</h1>
            <p className='mt-3 text-sm text-slate-300 sm:text-base'>Track business support requests and connect with experts ready to respond.</p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className='inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100'
          >
            <BriefcaseBusiness size={16} />
            Request support
          </button>
        </div>
      </section>

      {(error || notice) && (
        <div className={`rounded-2xl border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || notice}
        </div>
      )}

      <section className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>Business Support Requests</h2>
              <p className='text-sm text-slate-500'>Share what you need and find the most relevant expert.</p>
            </div>
            <div className='flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600'>
              <ShieldCheck size={14} />
              Verified support
            </div>
          </div>

          <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
            <label className='flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500'>
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search requests or responses'
                className='w-full border-0 bg-transparent outline-none placeholder:text-slate-400'
              />
            </label>
            <div className='flex gap-2'>
              {requestTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'requests' ? 'Requests' : 'Responses'}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className='mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500'>Loading support requests from the backend...</div>
          ) : activeTab === 'requests' ? (
            <div className='mt-4 space-y-3'>
              {visibleRequests.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500'>No support requests match your search right now.</div>
              ) : visibleRequests.map((request) => (
                <article key={request.id} className={`rounded-2xl border p-4 transition ${selectedRequest?.id === request.id ? 'border-primary-300 bg-primary-50/40' : 'border-slate-200 hover:border-primary-200'}`}>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='text-base font-semibold text-slate-900'>{request.title}</h3>
                      <p className='mt-1 text-sm text-slate-500'>By {request.owner} - {request.category}</p>
                    </div>
                    <span className='rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'>{request.status}</span>
                  </div>
                  <p className='mt-3 text-sm text-slate-600'>{request.summary}</p>
                  <div className='mt-3 flex items-center justify-between text-sm'>
                    <span className='flex items-center gap-1 text-slate-500'><Clock3 size={14} /> {formatDateLabel(request.createdAt)}</span>
                    <button onClick={() => handleSelectRequest(request)} className='font-medium text-primary-700'>Offer help</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className='mt-4 space-y-3'>
              {isResponsesLoading ? (
                <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500'>Loading expert responses...</div>
              ) : visibleResponses.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500'>No expert responses for this request yet.</div>
              ) : visibleResponses.map((item) => (
                <article key={item.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-semibold text-slate-900'>{item.owner}</p>
                      <p className='text-sm text-slate-500'>{item.requestTitle}</p>
                    </div>
                    <BadgeCheck size={16} className='text-primary-600' />
                  </div>
                  <p className='mt-3 text-sm text-slate-600'>{item.summary}</p>
                  <div className='mt-3 flex items-center justify-between text-sm text-slate-500'>
                    <span>{formatDateLabel(item.createdAt)}</span>
                    <button className='inline-flex items-center gap-1 font-medium text-primary-700'>Open thread <ArrowUpRight size={14} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <Users size={18} className='text-primary-600' />
              <h2 className='text-lg font-semibold text-slate-900'>Expert responses</h2>
            </div>
            <p className='mt-2 text-sm text-slate-500'>
              {selectedRequest ? `Current request: ${selectedRequest.title}` : 'Select a request to view and add guidance.'}
            </p>

            {selectedRequest && (
              <form onSubmit={handleCreateResponse} className='mt-4'>
                <textarea
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder='Write an expert response'
                  className='w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
                />
                <button
                  disabled={isSubmitting}
                  className='mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60'
                >
                  <Send size={16} />
                  {isSubmitting ? 'Posting...' : 'Post response'}
                </button>
              </form>
            )}

            <div className='mt-4 space-y-3'>
              {responses.slice(-3).reverse().map((item) => (
                <div key={item.id} className='rounded-2xl bg-slate-50 p-3'>
                  <p className='font-semibold text-slate-900'>{item.owner}</p>
                  <p className='mt-1 text-sm text-slate-600'>{item.summary}</p>
                  <div className='mt-3 flex items-center justify-between text-sm text-slate-500'>
                    <span>{formatDateLabel(item.createdAt)}</span>
                    <span>{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-gradient-to-br from-primary-50 to-slate-100 p-4'>
            <div className='flex items-center gap-2'>
              <MessageSquareText size={18} className='text-primary-600' />
              <h2 className='text-lg font-semibold text-slate-900'>Need a quick response?</h2>
            </div>
            <p className='mt-2 text-sm text-slate-600'>Use the board to flag urgent needs, route them to the right expert, and keep momentum going.</p>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
          <form onSubmit={handleCreateRequest} className='w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>Request business support</h2>
                <p className='text-sm text-slate-500'>Describe the issue so experts can respond with useful guidance.</p>
              </div>
              <button type='button' onClick={() => setIsCreateOpen(false)} className='text-slate-400 hover:text-slate-700'>
                <X size={20} />
              </button>
            </div>

            <div className='mt-4 grid gap-3'>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
                maxLength={200}
                placeholder='Support request title'
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={5}
                maxLength={5000}
                placeholder='Explain what you need help with'
                className='resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
              <input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder='Location'
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder='Tags separated by commas, for example legal, finance'
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <button type='button' onClick={() => setIsCreateOpen(false)} className='rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200'>Cancel</button>
              <button disabled={isSubmitting} className='inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60'>
                <Plus size={16} />
                {isSubmitting ? 'Creating...' : 'Create request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
