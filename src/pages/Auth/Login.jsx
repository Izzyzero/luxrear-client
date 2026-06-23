import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/images/logo.jpeg'

const loginSchema = z
  .object({
    contactMethod: z.enum(["email", "phone"]),
    email: z.string().optional(),
    phoneCountryCode: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contactMethod === "email") {
      if (!data.email || data.email.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is required",
          path: ["email"],
        });
      } else if (!z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email address",
          path: ["email"],
        });
      }
    }

    if (data.contactMethod === "phone") {
      if (!data.phone || data.phone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required",
          path: ["phone"],
        });
      } else if (!/^\d{6,15}$/.test(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid phone number",
          path: ["phone"],
        });
      }
    }
  });

export const LoginPage = () => {
  const navigate = useNavigate()
  const [contactMethod, setContactMethod] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      contactMethod: 'email',
    },
  })

  const handleContactMethodChange = (method) => {
    setContactMethod(method)
    setValue('contactMethod', method)
  }

  const onSubmit = async (data) => {
    setServerError('')
    setIsSubmitting(true)

    // Backend expects flat email/phone/password, no contactMethod, no leftover fields
    const payload = {
      password: data.password,
      ...(data.contactMethod === 'email'
        ? { email: data.email }
        : { phone: `${data.phoneCountryCode}${data.phone}` }), // e.g. +2348012345678
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed. Please try again.");
      }

      // Backend wraps the payload under `data`
      const { access_token, refresh_token } = result.data;

      // "Remember me" checked -> survive browser restarts (localStorage).
      // Unchecked -> cleared when the tab closes (sessionStorage).
      const storage = data.rememberMe ? localStorage : sessionStorage;
      storage.setItem("access_token", access_token);
      storage.setItem("refresh_token", refresh_token);

      navigate("/dashboard");


    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div>
        <Link to="/">
          <img src={logo} alt="Back to home" className='size-24' />
        </Link>
      </div>

      <div className='flex items-center justify-center bg-slate-50 px-4 py-10 sm:py-10'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-8 sm:px-8 sm:py-10'>

          <div className='mb-6 sm:mb-8'>
            <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Welcome back</h2>
            <p className='text-sm text-slate-500 mt-1'>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

            {/* Segmented toggle */}
            <div className='grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1 mb-5'>
              <button
                type="button"
                onClick={() => handleContactMethodChange('email')}
                className={`rounded-md py-2 text-sm font-medium transition-all ${
                  contactMethod === 'email'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => handleContactMethodChange('phone')}
                className={`rounded-md py-2 text-sm font-medium transition-all ${
                  contactMethod === 'phone'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Phone
              </button>
            </div>

            {contactMethod === 'phone' ? (
              <div className='mb-5'>
                <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Phone number</label>
                <div className='flex sm:flex-row gap-2'>
                  <select
                    {...register("phoneCountryCode")}
                    className='rounded-lg border border-slate-300 px-2.5 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white sm:w-auto'
                  >
                    <option value="+234">+234</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder='8012345678'
                    {...register("phone")}
                    className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                  />
                </div>
                {errors.phone && (
                  <p className='text-xs text-red-600 mt-1'>{errors.phone.message}</p>
                )}
              </div>
            ) : (
              <div className='mb-5'>
                <label className='text-sm font-medium text-slate-700 mb-1.5 block'>Email address</label>
                <input
                  type="email"
                  placeholder='luxrear@company.com'
                  {...register("email")}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                />
                {errors.email && (
                  <p className='text-xs text-red-600 mt-1'>{errors.email.message}</p>
                )}
              </div>
            )}

            <label className='text-sm font-medium text-slate-700 mb-1.5'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
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
              <p className='text-xs text-red-600 mt-1 mb-1'>{errors.password.message}</p>
            ) : (
              <div className='mb-1' />
            )}

            <div className="flex items-center justify-between mb-6 gap-2 mt-4">
              <label className='flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none'>
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className='h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-2 focus:ring-blue-100'
                />
                Remember me
              </label>

              <Link to="/forgottenpassword" className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap">
                Forgot password?
              </Link>
            </div>

            {serverError && (
              <p className='text-sm text-red-600 text-center mb-4'>{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-900 text-white font-medium py-2.5 text-sm transition hover:bg-blue-800 active:bg-blue-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>

            <p className='text-sm text-slate-500 text-center mt-5'>
              Don't have an account?{' '}
              <Link to="/register" className='text-blue-600 font-medium hover:underline'>
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}