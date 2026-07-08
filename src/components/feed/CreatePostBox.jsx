import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Link2, X, MapPin } from 'lucide-react'
import { POST_TYPES } from '../../services/postType'
import { getCategoriesForType } from '../../services/categories'
import { getAccessToken } from '../../services/authService'

const API_BASE = `${import.meta.env.VITE_API_URL}/posts`

const CreatePostSchema = z.object({
  type: z.string().min(1, "Please choose a post type"),
  category_id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().optional(),
  location: z.string().optional(),
  video_url: z.string().optional(),
  tags: z.string().optional(), // comma-separated input, split before sending
});

export const CreatePostBox = ({ currentUser, onPostCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showVideoField, setShowVideoField] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: { type: '', category_id: '', title: '', description: '', location: '', video_url: '', tags: '' },
  })

  const selectedType = watch('type')
  const availableCategories = selectedType ? getCategoriesForType(selectedType) : []

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCollapse = () => {
    setIsExpanded(false)
    setSubmitError('')
    reset()
    removeImage()
    setShowVideoField(false)
  }

  const onSubmit = async (data) => {
    setSubmitError('')
    setIsSubmitting(true)
    const accessToken = getAccessToken()

    // Build payload and only include fields the server expects
    const payload = {
      type: data.type,
      title: data.title,
      description: data.description || '',
      location: data.location || null,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    // Only include category_id if it looks like a Mongo ObjectId (24 hex chars)
    if (data.category_id && /^[0-9a-fA-F]{24}$/.test(data.category_id)) {
      payload.category_id = data.category_id;
    }

    // Only include video_url when non-empty (server validates URL format)
    if (data.video_url && data.video_url.trim() !== '') {
      payload.video_url = data.video_url.trim();
    }
    // console.log('Sending payload:', JSON.stringify(payload))

    try {
      // Step 1: create the post (text fields only)
        console.log('Sending payload:', JSON.stringify(payload))
      const response = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Server response:', JSON.stringify(result))

      if (!response.ok) {
        throw new Error(result.message || "Failed to create post.");
      }

      let createdPost = result.data.post;

      // Step 2: if an image was attached, upload it now that we have a post ID
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const imageResponse = await fetch(`${API_BASE}/${createdPost._id}/image`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${accessToken}` },
          body: formData,
        });

        const imageResult = await imageResponse.json();

        if (imageResponse.ok) {
          createdPost = imageResult.data.post;
        }
        // If image upload fails, the post itself still succeeded — we don't
        // block on this, just leave image_url null. Worth surfacing to the
        // user at some point, but not a hard failure for the whole post.
      }

      onPostCreated?.(createdPost);
      handleCollapse();

    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const getInitials = (name) =>
    name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className='w-full flex items-center gap-3 py-3 mb-2 text-left border-b border-slate-200'
      >
        <div className='h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0'>
          {getInitials(currentUser?.full_name)}
        </div>
        <span className='text-sm text-slate-400'>Share an opportunity, update, or question...</span>
      </button>
    )
  }

  return (
    <div className='border-b border-slate-200 pb-4 mb-2'>
      <form onSubmit={handleSubmit(onSubmit)} className='pt-3'>

        <div className='flex items-start gap-3 mb-3'>
          <div className='h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0'>
            {getInitials(currentUser?.full_name)}
          </div>
          <div className='flex-1'>
            <input
              type="text"
              placeholder="Title"
              {...register("title")}
              className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none border-0 p-0 mb-1"
              autoFocus
            />
            {errors.title && <p className='text-xs text-red-600'>{errors.title.message}</p>}

            <textarea
              rows={2}
              placeholder="Add more detail (optional)..."
              {...register("description")}
              className="w-full text-sm text-slate-600 placeholder:text-slate-400 outline-none border-0 p-0 resize-none mt-1"
            />
          </div>
          <button type="button" onClick={handleCollapse} className='text-slate-400 hover:text-slate-600 flex-shrink-0'>
            <X size={18} />
          </button>
        </div>

        {/* Type + category */}
        <div className='grid grid-cols-2 gap-2 mb-3'>
          <select
            {...register("type")}
            defaultValue=""
            className='rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white'
          >
            <option value="" disabled>Post type</option>
            {Object.entries(POST_TYPES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            {...register("category_id")}
            defaultValue=""
            disabled={!selectedType}
            className='rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white disabled:bg-slate-50 disabled:text-slate-400'
          >
            <option value="">{selectedType ? 'Category (optional)' : 'Choose type first'}</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {errors.type && <p className='text-xs text-red-600 mb-3'>{errors.type.message}</p>}

        {/* Location + tags */}
        <div className='grid grid-cols-2 gap-2 mb-3'>
          <input
            type="text"
            placeholder="Location (optional)"
            {...register("location")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <input
            type="text"
            placeholder="Tags, comma separated"
            {...register("tags")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Video URL, toggled */}
        {showVideoField && (
          <div className='mb-3'>
            <input
              type="url"
              placeholder="Video URL (YouTube, Vimeo, etc.)"
              {...register("video_url")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div className='relative mb-3 inline-block'>
            <img src={imagePreview} alt="" className='rounded-lg max-h-48 border border-slate-200' />
            <button
              type="button"
              onClick={removeImage}
              className='absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition'
            >
              <X size={14} />
            </button>
          </div>
        )}

        {submitError && <p className='text-sm text-red-600 mb-3'>{submitError}</p>}

        {/* Action row */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition px-2 py-1.5 rounded-lg hover:bg-slate-50'
            >
              <Image size={17} />
              Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className='hidden' />

            <button
              type="button"
              onClick={() => setShowVideoField((prev) => !prev)}
              className={`flex items-center gap-1.5 text-sm transition px-2 py-1.5 rounded-lg hover:bg-slate-50 ${
                showVideoField ? 'text-primary-600' : 'text-slate-500 hover:text-primary-600'
              }`}
            >
              <Link2 size={17} />
              Video
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary-600 text-white text-sm font-medium px-4 py-2 hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}