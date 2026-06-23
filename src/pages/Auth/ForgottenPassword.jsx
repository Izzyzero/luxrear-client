import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import logo from '../../assets/images/logo.jpeg'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export const ForgotPasswordPage = () => {
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setServerError('')
    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong. Please try again.");
      }

      // Backend always returns success here regardless of whether the email
      // exists, to prevent user enumeration — so we just show the same message.
      setIsSubmitted(true);

    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div>
        <Link to="/">
          <img src={logo} alt="Back to home" className='size-24' />
        </Link>
      </div>

      <div className='flex items-center justify-center min-h-screen bg-slate-50 px-4 py-6 sm:py-10'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-8 sm:px-8 sm:py-10'>

          {isSubmitted ? (
            <div className='text-center'>
              <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mb-2'>Check your email</h2>
              <p className='text-sm text-slate-500'>
                If an account exists for that email, we've sent a link to reset your password. It'll expire in 1 hour.
              </p>
              <Link
                to="/login"
                className='inline-block mt-6 text-sm text-blue-600 font-medium hover:underline'
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className='mb-6 sm:mb-8'>
                <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Forgot your password?</h2>
                <p className='text-sm text-slate-500 mt-1'>Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

                <label className='text-sm font-medium text-slate-700 mb-1.5'>Email address</label>
                <input
                  type="email"
                  placeholder='luxrear@company.com'
                  {...register("email")}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.email ? (
                  <p className='text-xs text-red-600 mt-1 mb-5'>{errors.email.message}</p>
                ) : (
                  <div className='mb-5' />
                )}

                {serverError && (
                  <p className='text-sm text-red-600 text-center mb-4'>{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-900 text-white font-medium py-2.5 text-sm transition hover:bg-blue-800 active:bg-blue-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send reset link'}
                </button>

                <p className='text-sm text-slate-500 text-center mt-5'>
                  <Link to="/login" className='text-blue-600 font-medium hover:underline'>
                    Back to login
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}