import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, X, Info } from 'lucide-react'
import { getAccessToken } from '../../services/authService'

const INDUSTRIES = [
  'Agriculture',
  'Technology',
  'Education',
  'Real Estate',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Fashion',
]

const API_BASE = "http://localhost:5000/api/profiles"

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  business_name: z.string().min(1, "Business name is required"),
  description: z.string().min(1, "Business description is required"),
  industry: z.string().min(1, "Please select an industry"),
  location: z.string().min(1, "Location is required"),
  services: z.array(
    z.object({ value: z.string().min(1, "Service can't be empty") })
  ).min(1, "Add at least one service"),
  origin_country: z.string().optional(),
  current_country: z.string().optional(),
  show_in_diaspora: z.boolean().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const ProfilePage = () => {
  const [profilePicture, setProfilePicture] = useState(null) // Cloudinary URL once uploaded
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [saveStatus, setSaveStatus] = useState('') // '' | 'saving' | 'saved'
  const [saveError, setSaveError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      business_name: '',
      description: '',
      industry: '',
      location: '',
      services: [{ value: '' }],
      origin_country: '',
      current_country: '',
      show_in_diaspora: false,
      website: '',
      linkedin: '',
      whatsapp: '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'services' })
  const watchedValues = watch()

  // Load existing profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const accessToken = getAccessToken()
      if (!accessToken) {
        setLoadError("Your session has expired. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE}/me`, {
          headers: { "Authorization": `Bearer ${accessToken}` },
        });
        const result = await response.json();

        if (response.status === 404) {
          // No profile yet — that's fine, user fills the form fresh.
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error(result.message || "Failed to load profile.");
        }

        const profile = result.data.profile;

        reset({
          full_name: profile.full_name || '',
          business_name: profile.business_name || '',
          description: profile.description || '',
          industry: profile.industry || '',
          location: profile.location || '',
          services: profile.services?.length
            ? profile.services.map((s) => ({ value: s }))
            : [{ value: '' }],
          origin_country: profile.origin_country || '',
          current_country: profile.current_country || '',
          show_in_diaspora: profile.show_in_diaspora || false,
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          whatsapp: profile.whatsapp || '',
        });

        if (profile.profile_picture) setProfilePicture(profile.profile_picture);

      } catch (error) {
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [reset])

  // Profile picture uploads immediately on selection, separate from the main form
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError('')
    setIsUploadingPhoto(true)

    const accessToken = getAccessToken()
    const formData = new FormData()
    formData.append('image', file) // field name assumed — confirm with backend dev if upload fails

    try {
      const response = await fetch(`${API_BASE}/me/picture`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload photo.");
      }

      setProfilePicture(result.data.profile_picture);

    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  const handleRemovePhoto = async () => {
    setPhotoError('')
    setIsUploadingPhoto(true)
    const accessToken = getAccessToken()

    try {
      const response = await fetch(`${API_BASE}/me/picture`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to remove photo.");
      }

      setProfilePicture(null);

    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  // Profile completion: photo, description, services, contact (website/linkedin/whatsapp)
  const completion = (() => {
    let complete = 0
    if (profilePicture) complete += 1
    if (watchedValues.description?.trim()) complete += 1
    if (watchedValues.services?.some((s) => s.value?.trim())) complete += 1
    if (watchedValues.website?.trim() || watchedValues.linkedin?.trim() || watchedValues.whatsapp?.trim()) complete += 1
    return Math.round((complete / 4) * 100)
  })()

  const missingItems = [
    { label: 'Profile photo', isMissing: !profilePicture },
    { label: 'Business description', isMissing: !watchedValues.description?.trim() },
    { label: 'Services', isMissing: !watchedValues.services?.some((s) => s.value?.trim()) },
    {
      label: 'Contact information',
      isMissing: !(watchedValues.website?.trim() || watchedValues.linkedin?.trim() || watchedValues.whatsapp?.trim()),
    },
  ].filter((item) => item.isMissing)

  const onSubmit = async (data) => {
    setSaveStatus('saving')
    setSaveError('')

    const accessToken = getAccessToken()

    const payload = {
      full_name: data.full_name,
      business_name: data.business_name,
      description: data.description,
      industry: data.industry,
      location: data.location,
      services: data.services.map((s) => s.value).filter(Boolean),
      origin_country: data.origin_country,
      current_country: data.current_country,
      show_in_diaspora: data.show_in_diaspora,
      website: data.website,
      linkedin: data.linkedin,
      whatsapp: data.whatsapp,
    };

    try {
      const response = await fetch(`${API_BASE}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save profile.");
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);

    } catch (error) {
      setSaveError(error.message);
      setSaveStatus('');
    }
  }

  if (isLoading) {
    return <p className='text-sm text-slate-400'>Loading your profile...</p>
  }

  return (
    <div className='max-w-2xl'>

      <div className='mb-6'>
        <h1 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>
          Welcome to Your Business Passport
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          Your Business Passport is your professional identity on Luxrear Business Club.
          Complete your profile to help other members discover your business, build trust, and connect with you.
        </p>
      </div>

      {loadError && (
        <p className='text-sm text-red-600 mb-4'>{loadError}</p>
      )}

      <div className='bg-white rounded-2xl border border-slate-200 p-5 mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-sm font-semibold text-slate-900'>Complete Your Profile</h2>
          <span className='text-sm font-semibold text-primary-700'>{completion}%</span>
        </div>
        <div className='w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3'>
          <div
            className='h-full bg-primary-600 transition-all duration-300'
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className='text-sm text-slate-500'>
          A complete profile increases your visibility, improves credibility, and helps members
          find your services and opportunities.
        </p>

        {missingItems.length > 0 && (
          <div className='mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3'>
            <p className='text-sm font-medium text-amber-800 mb-1.5'>Please add the following:</p>
            <ul className='text-sm text-amber-700 list-disc list-inside space-y-0.5'>
              {missingItems.map((item) => (
                <li key={item.label}>{item.label}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col gap-5'>

        {/* Profile photo — uploads immediately, independent of form save */}
        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Profile Photo</label>
          <p className='text-xs text-slate-400 mb-3'>Upload a clear business logo or professional profile picture.</p>

          <div className='flex items-center gap-4'>
            <div className='h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0'>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className='h-full w-full object-cover' />
              ) : (
                <Camera size={22} className='text-slate-400' />
              )}
            </div>
            <div>
              <div className='flex items-center gap-3'>
                <label className='inline-block rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition'>
                  {isUploadingPhoto ? 'Uploading...' : profilePicture ? 'Change photo' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                    className='hidden'
                  />
                </label>
                {profilePicture && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className='text-sm text-slate-400 hover:text-red-600 transition'
                  >
                    Remove
                  </button>
                )}
              </div>
              {!profilePicture && !photoError && (
                <p className='text-xs text-slate-400 mt-1.5'>Upload a profile picture to increase trust and visibility.</p>
              )}
              {photoError && (
                <p className='text-xs text-red-600 mt-1.5'>{photoError}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Full Name</label>
          <input
            type="text"
            placeholder='Enter your full name'
            {...register("full_name")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
          />
          {errors.full_name && <p className='text-xs text-red-600 mt-1'>{errors.full_name.message}</p>}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Business Name</label>
          <p className='text-xs text-slate-400 mb-1.5'>Enter the official name of your business or brand.</p>
          <input
            type="text"
            placeholder='Enter your business name'
            {...register("business_name")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
          />
          {errors.business_name && <p className='text-xs text-red-600 mt-1'>{errors.business_name.message}</p>}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Business Description</label>
          <p className='text-xs text-slate-400 mb-1.5'>Describe your business, products, services, and the value you provide.</p>
          <textarea
            rows={4}
            placeholder='Tell us about your business'
            {...register("description")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full resize-none"
          />
          {errors.description ? (
            <p className='text-xs text-red-600 mt-1'>{errors.description.message}</p>
          ) : (
            <p className='text-xs text-slate-400 mt-1.5 flex items-start gap-1.5'>
              <Info size={13} className='mt-0.5 flex-shrink-0' />
              e.g. "We provide digital marketing solutions that help small businesses increase
              their online visibility, generate leads, and grow revenue."
            </p>
          )}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Industry</label>
          <p className='text-xs text-slate-400 mb-1.5'>Select the industry that best represents your business.</p>
          <select
            {...register("industry")}
            className='rounded-lg border border-slate-300 px-3 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white w-full'
          >
            <option value="" disabled>Select your industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && <p className='text-xs text-red-600 mt-1'>{errors.industry.message}</p>}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Location</label>
          <p className='text-xs text-slate-400 mb-1.5'>Provide your city, state, and country to help members find businesses near them.</p>
          <input
            type="text"
            placeholder='Enter your city and country'
            {...register("location")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
          />
          {errors.location && <p className='text-xs text-red-600 mt-1'>{errors.location.message}</p>}
        </div>

        {/* Diaspora */}
        <div className='border border-slate-200 rounded-lg p-4 bg-slate-50'>
          <p className='text-sm font-medium text-slate-700 mb-3'>Diaspora connection</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>Origin country</label>
              <input
                type="text"
                placeholder='e.g. Nigeria'
                {...register("origin_country")}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full bg-white"
              />
            </div>
            <div>
              <label className='text-xs text-slate-500 mb-1 block'>Current country</label>
              <input
                type="text"
                placeholder='e.g. United Kingdom'
                {...register("current_country")}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full bg-white"
              />
            </div>
          </div>
          <label className='flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none'>
            <input
              type="checkbox"
              {...register("show_in_diaspora")}
              className='h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-100'
            />
            Show my business in the Diaspora Hub
          </label>
        </div>

        {/* Services */}
        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Services</label>
          <p className='text-xs text-slate-400 mb-2'>List the products or services your business offers.</p>

          {fields.length === 0 && (
            <p className='text-sm text-slate-400 mb-2'>You have not added any services yet.</p>
          )}

          <div className='flex flex-col gap-2'>
            {fields.map((field, index) => (
              <div key={field.id} className='flex gap-2'>
                <input
                  type="text"
                  placeholder='List the services you offer'
                  {...register(`services.${index}.value`)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className='text-slate-400 hover:text-red-600 transition px-2'
                    aria-label="Remove service"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.services && <p className='text-xs text-red-600 mt-1'>{errors.services.message}</p>}

          <button
            type="button"
            onClick={() => append({ value: '' })}
            className='mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 transition'
          >
            <Plus size={16} />
            Add service
          </button>
        </div>

        {/* Contact / links */}
        <div>
          <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Contact Information</label>
          <p className='text-xs text-slate-400 mb-2'>Add your preferred contact method so members can easily reach you.</p>

          <div className='flex flex-col gap-3'>
            <input
              type="url"
              placeholder='Enter your website address'
              {...register("website")}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
            />
            <input
              type="text"
              placeholder='LinkedIn profile URL'
              {...register("linkedin")}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
            />
            <input
              type="tel"
              placeholder='WhatsApp number'
              {...register("whatsapp")}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 w-full"
            />
          </div>
        </div>

        {saveError && (
          <p className='text-sm text-red-600 text-center'>{saveError}</p>
        )}

        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="rounded-lg bg-primary-600 text-white font-medium py-2.5 text-sm transition hover:bg-primary-700 active:bg-primary-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save changes'}
        </button>

        {saveStatus === 'saved' && (
          <p className='text-sm text-green-600 text-center'>✅ Profile updated successfully.</p>
        )}
      </form>

      <div className='bg-white rounded-2xl border border-slate-200 p-5 mt-6'>
        <h3 className='text-sm font-semibold text-slate-900 mb-3'>Profile Tips</h3>
        <ul className='text-sm text-slate-600 space-y-1.5 list-disc list-inside'>
          <li>Use a professional profile photo.</li>
          <li>Provide accurate business information.</li>
          <li>Keep your description clear and concise.</li>
          <li>List all your major services.</li>
          <li>Update your profile regularly.</li>
          <li>Add contact information members can trust.</li>
        </ul>
      </div>
    </div>
  )
}