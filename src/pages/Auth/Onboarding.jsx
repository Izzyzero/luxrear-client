import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAccessToken } from '../../services/authService'

const onboardingSchema = z.object({
  country: z.string().min(1, "Please select a location"),
  business_type: z.string().min(1, "Please select a business type"),
  role: z.string().min(1, "Please select a role"),
});

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  })

  const onSubmit = async (data) => {
    setServerError('')
    setIsSubmitting(true)

    const accessToken = getAccessToken()

    if (!accessToken) {
      setServerError("Your session has expired. Please log in again.")
      setIsSubmitting(false)
      navigate("/login")
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong. Please try again.");
      }

      navigate("/dashboard");

    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50 px-4 py-6 sm:py-10'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-8 sm:px-8 sm:py-10'>

        <div className='mb-6 sm:mb-8'>
          <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Tell us about your business</h2>
          <p className='text-sm text-slate-500 mt-1'>Just a few more details to finish setting up</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Country</label>
          <select
            {...register("country")}
            defaultValue=""
            className='rounded-lg border border-slate-300 px-3 py-2.5 mb-1 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
          >
            <option value="" disabled>Select Country</option>
            <option value="nigeria">Nigeria</option>
            <option value="ghana">Ghana</option>
             <option value="south africa">South Africa</option>
            <option value="other">Other</option>
          </select>
          {errors.country ? (
            <p className='text-xs text-red-600 mt-1 mb-4'>{errors.country.message}</p>
          ) : (
            <div className='mb-5' />
          )}

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Business type</label>
          <select
            {...register("business_type")}
            defaultValue=""
            className='rounded-lg border border-slate-300 px-3 py-2.5 mb-1 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
          >
            <option value="" disabled>Select type</option>
            <option value="retail">Retail</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
          {errors.business_type ? (
            <p className='text-xs text-red-600 mt-1 mb-4'>{errors.business_type.message}</p>
          ) : (
            <div className='mb-5' />
          )}

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Role</label>
          <select
            {...register("role")}
            defaultValue=""
            className='rounded-lg border border-slate-300 px-3.5 py-2.5 mb-1 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100 bg-white'
          >
            <option value="" disabled>Select role</option>
            <option value="founder">Founder</option>
            <option value="investor">Investor</option>
            <option value="service provider">Service Provider</option>
             <option value="student">Student</option>
          </select>
          {errors.role ? (
            <p className='text-xs text-red-600 mt-1 mb-7'>{errors.role.message}</p>
          ) : (
            <div className='mb-7' />
          )}

          {serverError && (
            <p className='text-sm text-red-600 text-center mb-4'>{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-900 text-white font-medium py-2.5 text-sm transition hover:bg-blue-800 active:bg-blue-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Finish setup'}
          </button>
        </form>
      </div>
    </div>
  );
}