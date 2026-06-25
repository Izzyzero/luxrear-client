import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/images/logo.png'

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    contactMethod: z.enum(["email", "phone"]),
    email: z.string().optional(),
    phoneCountryCode: z.string().optional(),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
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

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [contactMethod, setContactMethod] = useState('email') // 'email' | 'phone'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
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

    // Build the payload the backend actually expects:
    // flat email/phone/password/full_name, no contactMethod, no leftover fields
    const payload = {
      full_name: data.full_name,
      password: data.password,
      ...(data.contactMethod === 'email'
        ? { email: data.email }
        : { phone: `${data.phoneCountryCode}${data.phone}` }), // e.g. +2348012345678
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed. Please try again.");
      }

      // Backend wraps the payload under `data`
      const { access_token, refresh_token } = result.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      navigate("/onboarding");

    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='bg-slate-50'>
      <div>
        <Link to="/">
          <img src={logo} alt="Back to home" className='size-24' />
        </Link>
      </div>
      <div className='flex items-center justify-center bg-slate-50 px-4 py-6 sm:py-10'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-8 sm:px-8 sm:py-10'>

          <div className='mb-6 sm:mb-8'>
            <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Create your account</h2>
            <p className='text-sm text-slate-500 mt-1'>Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

            <label className='text-sm font-medium text-slate-700 mb-1.5'>Name</label>
            <input
              type="text"
              placeholder='Luxrear'
              {...register("full_name")}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {errors.full_name && (
              <p className='text-xs text-red-600 mt-1 mb-4'>{errors.full_name.message}</p>
            )}
            <div className={errors.full_name ? '' : 'mb-5'} />

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

            {serverError && (
              <p className='text-sm text-red-600 text-center mb-4'>{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-900 text-white font-medium py-2.5 text-sm transition hover:bg-blue-800 active:bg-blue-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <p className='text-sm text-slate-500 text-center mt-5'>
              Already have an account?{' '}
              <Link to="/login" className='text-blue-600 font-medium hover:underline'>
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}