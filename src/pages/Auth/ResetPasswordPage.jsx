import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/images/logo.png'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data) => {
    setServerError('')

    if (!token) {
      setServerError("This reset link is invalid or missing. Please request a new one.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong. Please try again.");
      }

      navigate("/login");

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

          <div className='mb-6 sm:mb-8'>
            <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Set a new password</h2>
            <p className='text-sm text-slate-500 mt-1'>Choose a strong password for your account</p>
          </div>

          {!token ? (
            <p className='text-sm text-red-600 text-center'>
              This reset link is invalid or has expired.{' '}
              <Link to="/forgottenpassword" className='text-blue-600 font-medium hover:underline'>
                Request a new one
              </Link>
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

              <label className='text-sm font-medium text-slate-700 mb-1.5'>New password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='At least 8 characters'
                  {...register("password")}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password ? (
                <p className='text-xs text-red-600 mt-1 mb-5'>{errors.password.message}</p>
              ) : (
                <p className='text-xs text-slate-400 mt-1 mb-5'>
                  Must include an uppercase letter, a number, and a symbol
                </p>
              )}

              <label className='text-sm font-medium text-slate-700 mb-1.5'>Confirm new password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Re-enter your password'
                {...register("confirmPassword")}
                className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {errors.confirmPassword ? (
                <p className='text-xs text-red-600 mt-1 mb-5'>{errors.confirmPassword.message}</p>
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
                {isSubmitting ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}