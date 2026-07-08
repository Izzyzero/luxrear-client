import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { COMMUNITY_BOARDS, COMMUNITY_POST_TYPES } from '../../services/communityboards'
import { getAccessToken } from '../../services/authService'

const API_BASE = 'http://localhost:5000/api/posts'

const schema = z.object({
  board: z.string().min(1, 'Please select a board'),
  type: z.enum(['ANNOUNCEMENT', 'UPDATE', 'OPPORTUNITY'], {
    required_error: 'Please choose a post type',
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  tags: z.string().optional(),
})

export const CreateThreadModal = ({ onClose, onThreadCreated, defaultBoard = '' }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      board: defaultBoard,
      type: 'ANNOUNCEMENT',
      title: '',
      description: '',
      tags: '',
    },
  })

  const selectedBoard = watch('board')
  const boardConfig = COMMUNITY_BOARDS.find((b) => b.slug === selectedBoard)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const onSubmit = async (data) => {
    const accessToken = getAccessToken()

    // TODO: replace hardcoded category_id with real MongoDB _id fetched from
    // GET /api/categories?type=COMMUNITY once backend dev creates the board categories.
    const payload = {
      type: data.type,
      title: data.title,
      description: data.description,
      // category_id: <real ObjectId from categories API>,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to create thread.')
      onThreadCreated?.(result.data.post)
      onClose()
    } catch (err) {
      console.error(err.message)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      <div className='relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl'>

        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10'>
          <h2 className='text-base font-semibold text-slate-900'>Start a Discussion</h2>
          <button onClick={onClose} className='text-slate-400 hover:text-slate-600 transition'>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='px-6 py-5 flex flex-col gap-4'>

          {/* Board selector */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block'>
              Board <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {COMMUNITY_BOARDS.map(({ slug, label, icon: Icon, color, bg, border }) => {
                const isSelected = selectedBoard === slug
                return (
                  <label
                    key={slug}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `${bg} ${color} ${border}`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type='radio'
                      value={slug}
                      {...register('board')}
                      className='sr-only'
                    />
                    <Icon size={14} className='flex-shrink-0' />
                    <span className='text-xs font-medium leading-tight'>{label}</span>
                  </label>
                )
              })}
            </div>
            {errors.board && <p className='text-xs text-red-600 mt-1'>{errors.board.message}</p>}
          </div>

          {/* Post type */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
              Post Type <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('type')}
              className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            >
              {COMMUNITY_POST_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.type && <p className='text-xs text-red-600 mt-1'>{errors.type.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
              Title <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              placeholder={boardConfig ? getPlaceholderTitle(selectedBoard) : 'What do you want to discuss?'}
              {...register('title')}
              className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            />
            {errors.title && <p className='text-xs text-red-600 mt-1'>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              rows={5}
              placeholder='Share your thoughts, questions, or insights in detail...'
              {...register('description')}
              className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none'
            />
            {errors.description && <p className='text-xs text-red-600 mt-1'>{errors.description.message}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
              Tags <span className='text-slate-400 font-normal normal-case'>(comma separated)</span>
            </label>
            <input
              type='text'
              placeholder='e.g. funding, nigeria, ecommerce'
              {...register('tags')}
              className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            />
          </div>

          <div className='flex items-center justify-end gap-3 pt-2 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='text-sm font-medium text-slate-500 hover:text-slate-700 transition px-4 py-2'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='rounded-xl bg-primary-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const getPlaceholderTitle = (board) => {
  const map = {
    'general-business': 'What business lessons have you learned this year?',
    'startups': 'How did you validate your first business idea?',
    'real-estate': 'Best areas to invest in Nigerian real estate right now?',
    'import-export': 'Tips for clearing goods at Lagos port?',
    'tech-ai': 'Which AI tools are you using in your business?',
    'finance': 'How do you manage business cash flow?',
  }
  return map[board] || 'What do you want to discuss?'
}