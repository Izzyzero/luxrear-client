import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Image, ChevronDown } from 'lucide-react'
import { EXCHANGE_POST_TYPES, EXCHANGE_TYPE_LIST } from '../../services/exchangeTypes'
import { getAccessToken } from '../../services/authService'

const API_BASE = 'http://localhost:5000/api/posts'

const schema = z.object({
  type: z.string().min(1, 'Please select a post type'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().optional(),
  tags: z.string().optional(),
  video_url: z.string().optional(),
})

// Context-aware title placeholders per type
const getPlaceholderTitle = (type) => {
  const map = {
    NEED_HELP: 'Looking for a bookkeeper in Lagos',
    INVESTMENT: 'Seeking seed funding for agritech startup',
    PARTNERSHIP: 'Looking for a co-founder in fintech',
    SUPPLIER_REQUEST: 'Need reliable packaging supplier in Abuja',
    BUSINESS_OFFER: 'We offer bulk wholesale electronics',
    JOB: 'Hiring a graphic designer with 2+ years experience',
  }
  return map[type] || 'Give your post a clear title'
}

export const ExchangePostModal = ({ onClose, onPostCreated, defaultType = '' }) => {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType, title: '', description: '', location: '', tags: '', video_url: '' },
  })

  const selectedType = watch('type')
  const typeConfig = EXCHANGE_POST_TYPES[selectedType]

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    setSubmitError('')
    setIsSubmitting(true)
    const accessToken = getAccessToken()

    const payload = {
      type: data.type,
      title: data.title,
      description: data.description,
      location: data.location || null,
      video_url: data.video_url || null,
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
      if (!response.ok) throw new Error(result.message || 'Failed to create post.')

      let createdPost = result.data.post

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        const imgRes = await fetch(`${API_BASE}/${createdPost._id}/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
          body: formData,
        })
        if (imgRes.ok) {
          const imgResult = await imgRes.json()
          createdPost = imgResult.data.post
        }
      }

      onPostCreated?.(createdPost)
      onClose()

    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl'>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10'>
          <div>
            <h2 className='text-base font-semibold text-slate-900'>Create Exchange Post</h2>
            {typeConfig && (
              <p className='text-xs text-slate-500 mt-0.5'>{typeConfig.description}</p>
            )}
          </div>
          <button onClick={onClose} className='text-slate-400 hover:text-slate-600 transition'>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='px-6 py-5 flex flex-col gap-4'>

          {/* Post type selector */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block'>
              Post Type
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {EXCHANGE_TYPE_LIST.map(({ value, label, icon: Icon, badgeClass }) => {
                const isSelected = selectedType === value
                return (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `${badgeClass} border-current`
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <input
                      type='radio'
                      value={value}
                      {...register('type')}
                      className='sr-only'
                    />
                    <Icon size={15} className='flex-shrink-0' />
                    <span className='text-xs font-medium leading-tight'>{label}</span>
                  </label>
                )
              })}
            </div>
            {errors.type && <p className='text-xs text-red-600 mt-1'>{errors.type.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
              Title <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              placeholder={typeConfig ? `e.g. ${getPlaceholderTitle(selectedType)}` : 'Give your post a clear title'}
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
              rows={4}
              placeholder={"Provide full details - the more specific you are, the better responses you'll get."}
              {...register('description')}
              className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none'
            />
            {errors.description && <p className='text-xs text-red-600 mt-1'>{errors.description.message}</p>}
          </div>

          {/* Location + Tags side by side */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
                Location
              </label>
              <input
                type='text'
                placeholder='e.g. Lagos, Nigeria'
                {...register('location')}
                className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
                Tags
              </label>
              <input
                type='text'
                placeholder='e.g. agric, tech'
                {...register('tags')}
                className='w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className='text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block'>
              Image (optional)
            </label>
            {imagePreview ? (
              <div className='relative inline-block'>
                <img src={imagePreview} alt='' className='rounded-xl max-h-40 border border-slate-200' />
                <button
                  type='button'
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className='absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition'
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-2 text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl px-4 py-3 hover:border-primary-400 hover:text-primary-600 transition w-full justify-center'
              >
                <Image size={16} />
                Attach an image
              </button>
            )}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              onChange={handleImageChange}
              className='hidden'
            />
          </div>

          {submitError && (
            <p className='text-sm text-red-600 text-center'>{submitError}</p>
          )}

          {/* Footer actions */}
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
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}