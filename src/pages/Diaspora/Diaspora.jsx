import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Compass,
  Filter,
  MapPin,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { getAccessToken } from '../../services/authService'

const listingFilters = ['all', 'investors', 'partnerships', 'mentorship', 'market-entry']
const API_BASE =  `${import.meta.env.VITE_API_URL}`

const emptyForm = {
  type: 'DIASPORA_PARTNER',
  title: '',
  description: '',
  location: '',
  tags: '',
}

const classifyListing = (post) => {
  const text = `${post.title || ''} ${post.description || ''} ${post.tags?.join(' ') || ''}`.toLowerCase()

  if (post.type === 'DIASPORA_INVESTOR') return 'investors'
  if (post.type === 'DIASPORA_PARTNER') return 'partnerships'
  if (text.includes('mentor') || text.includes('mentorship')) return 'mentorship'

  return 'market-entry'
}

const formatProfileName = (profile) => profile?.business_name || profile?.full_name || 'Community member'

const truncateText = (value, maxLength = 140) => {
  if (!value) return ''
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

const normalizePost = (post) => ({
  id: post._id,
  title: post.title,
  type: post.type,
  category: classifyListing(post),
  location: post.location || 'Remote / global',
  summary: truncateText(post.description || 'No description provided yet.'),
  description: post.description || 'No description provided yet.',
  tags: (post.tags || []).slice(0, 6),
  match: post.is_featured ? 'Featured' : 'Live',
  name: formatProfileName(post.profile_id),
})

const authHeaders = () => {
  const accessToken = getAccessToken()
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

export const DiasporaPage = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchListings = async () => {
    setIsLoading(true)
    setError('')

    const params = new URLSearchParams({
      page: '1',
      limit: '50',
      type: 'DIASPORA_PARTNER,DIASPORA_INVESTOR',
    })

    try {
      const response = await fetch(`${API_BASE}/posts?${params.toString()}`, {
        headers: authHeaders(),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load diaspora listings right now.')
      }

      setListings((result.data || []).map(normalizePost))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const partnerRequests = useMemo(
    () => listings.filter((item) => item.type === 'DIASPORA_PARTNER').slice(0, 3),
    [listings]
  )

  const filteredListings = useMemo(() => {
    const keyword = query.toLowerCase().trim()

    return listings.filter((listing) => {
      const matchesFilter = activeFilter === 'all' || listing.category === activeFilter
      const matchesQuery =
        keyword.length === 0 ||
        [listing.title, listing.summary, listing.location, listing.name, ...listing.tags]
          .join(' ')
          .toLowerCase()
          .includes(keyword)

      return matchesFilter && matchesQuery
    })
  }, [activeFilter, query, listings])

  const handleCreateListing = async (event) => {
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
          ...form,
          tags: form.tags
            .split(',')
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to create diaspora listing.')
      }

      setListings((current) => [normalizePost(result.data.post), ...current])
      setForm(emptyForm)
      setIsCreateOpen(false)
      setNotice('Diaspora listing created.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendResponse = async (event) => {
    event.preventDefault()
    if (!selectedListing || !responseText.trim()) return

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
          post_id: selectedListing.id,
          content: responseText,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to send your response.')
      }

      setResponseText('')
      setSelectedListing(null)
      setNotice('Response sent.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <section className='rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-6 text-white shadow-sm'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur'>
              <Sparkles size={16} />
              Diaspora Hub
            </div>
            <h1 className='mt-3 text-2xl font-semibold tracking-tight sm:text-3xl'>Discover trusted listings, partners, and business opportunities across the diaspora.</h1>
            <p className='mt-3 text-sm text-primary-50 sm:text-base'>Find collaborations that match your location, industry, and growth stage in one place.</p>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row lg:items-end'>
            <div className='rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur'>
              <p className='text-sm text-primary-100'>Live community signal</p>
              <div className='mt-2 flex items-end gap-3'>
                <span className='text-3xl font-semibold'>{listings.length}</span>
                <span className='text-sm text-primary-100'>active opportunities</span>
              </div>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className='inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100'
            >
              <Plus size={16} />
              Add listing
            </button>
          </div>
        </div>
      </section>

      {(error || notice) && (
        <div className={`rounded-2xl border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || notice}
        </div>
      )}

      <section className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>Listings</h2>
              <p className='text-sm text-slate-500'>Filter by what you need next.</p>
            </div>
            <div className='flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600'>
              <Filter size={14} />
              Smart filters
            </div>
          </div>

          <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
            <label className='flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500'>
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search by keyword or location'
                className='w-full border-0 bg-transparent outline-none placeholder:text-slate-400'
              />
            </label>
            <div className='flex flex-wrap gap-2'>
              {listingFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
                    activeFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className='mt-4 space-y-3'>
            {isLoading ? (
              <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500'>Loading diaspora listings from the backend...</div>
            ) : filteredListings.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500'>No listings match those filters yet. Try broadening your search.</div>
            ) : (
              filteredListings.map((listing) => (
                <article key={listing.id} className='rounded-2xl border border-slate-200 p-4 transition hover:border-primary-200 hover:shadow-sm'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='text-base font-semibold text-slate-900'>{listing.title}</h3>
                        <span className='rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700'>{listing.match}</span>
                      </div>
                      <p className='mt-2 text-sm text-slate-600'>{listing.summary}</p>
                    </div>
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className='inline-flex items-center gap-2 text-sm font-medium text-primary-700'
                    >
                      View match <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className='mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500'>
                    <span className='flex items-center gap-1'><MapPin size={14} /> {listing.location}</span>
                    {listing.tags.map((tag) => (
                      <span key={tag} className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'>{tag}</span>
                    ))}
                  </div>
                  <p className='mt-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400'>Posted by {listing.name}</p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <Users size={18} className='text-primary-600' />
              <h2 className='text-lg font-semibold text-slate-900'>Partner requests</h2>
            </div>
            <div className='mt-4 space-y-3'>
              {partnerRequests.length === 0 ? (
                <div className='rounded-2xl bg-slate-50 p-3 text-sm text-slate-500'>No partner requests are available from the backend yet.</div>
              ) : partnerRequests.map((request) => (
                <div key={request.id} className='rounded-2xl bg-slate-50 p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-semibold text-slate-900'>{request.name}</p>
                      <p className='text-sm text-slate-500'>Diaspora listing</p>
                    </div>
                    <BadgeCheck size={16} className='text-primary-600' />
                  </div>
                  <p className='mt-2 text-sm text-slate-600'>{request.summary}</p>
                  <div className='mt-3 flex items-center justify-between text-sm'>
                    <span className='text-slate-500'>{request.location}</span>
                    <button onClick={() => setSelectedListing(request)} className='font-medium text-primary-700'>Respond</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <BriefcaseBusiness size={18} className='text-primary-600' />
              <h2 className='text-lg font-semibold text-slate-900'>Why this works</h2>
            </div>
            <ul className='mt-4 space-y-2 text-sm text-slate-600'>
              <li className='flex items-start gap-2'><Compass size={14} className='mt-0.5 text-primary-600' /> Match diaspora professionals with relevant business opportunities.</li>
              <li className='flex items-start gap-2'><Clock3 size={14} className='mt-0.5 text-primary-600' /> Move from discovery to collaboration without leaving the dashboard.</li>
              <li className='flex items-start gap-2'><BadgeCheck size={14} className='mt-0.5 text-primary-600' /> Keep partner requests visible and easy to respond to.</li>
            </ul>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
          <form onSubmit={handleCreateListing} className='w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>Add diaspora listing</h2>
                <p className='text-sm text-slate-500'>Create a partner request or investor listing.</p>
              </div>
              <button type='button' onClick={() => setIsCreateOpen(false)} className='text-slate-400 hover:text-slate-700'>
                <X size={20} />
              </button>
            </div>

            <div className='mt-4 grid gap-3'>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              >
                <option value='DIASPORA_PARTNER'>Partner request</option>
                <option value='DIASPORA_INVESTOR'>Investor listing</option>
              </select>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
                maxLength={200}
                placeholder='Title'
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={5}
                maxLength={5000}
                placeholder='Describe the opportunity, ideal partner, and next step'
                className='resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
              <input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder='Location, for example Lagos / London'
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder='Tags separated by commas'
                className='rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
              />
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <button type='button' onClick={() => setIsCreateOpen(false)} className='rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200'>Cancel</button>
              <button disabled={isSubmitting} className='inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60'>
                <Plus size={16} />
                {isSubmitting ? 'Creating...' : 'Create listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedListing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'>
          <form onSubmit={handleSendResponse} className='w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>{selectedListing.title}</h2>
                <p className='mt-1 text-sm text-slate-500'>{selectedListing.location} - posted by {selectedListing.name}</p>
              </div>
              <button type='button' onClick={() => setSelectedListing(null)} className='text-slate-400 hover:text-slate-700'>
                <X size={20} />
              </button>
            </div>
            <p className='mt-4 text-sm text-slate-600'>{selectedListing.description}</p>
            <textarea
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
              required
              rows={4}
              maxLength={2000}
              placeholder='Write your response'
              className='mt-4 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500'
            />
            <div className='mt-5 flex justify-end gap-2'>
              <button type='button' onClick={() => setSelectedListing(null)} className='rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200'>Cancel</button>
              <button disabled={isSubmitting} className='inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60'>
                <Send size={16} />
                {isSubmitting ? 'Sending...' : 'Send response'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
