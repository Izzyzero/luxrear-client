import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.jpeg'

export const RegisterPage = () => {
  const { handleSubmit, register, formState: { errors } } = useForm()
  const [contactMethod, setContactMethod] = useState('email') // 'email' | 'phone'

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
  <>
  <div>
   <Link to="/">
    <img src={logo} alt=""  className='size-24' />
   </Link>
  </div>
    <div className='flex items-center justify-center min-h-screen bg-slate-50 px-4 py-6 max sm:py-10'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-8 sm:px-8 sm:py-10'>

        <div className='mb-6 sm:mb-8'>
          <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Create your account</h2>
          <p className='text-sm text-slate-500 mt-1'>Fill in the details below to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Name</label>
          <input
            type="text"
            placeholder='Jane Doe'
            {...register("name")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 mb-5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {/* Segmented toggle */}
          <div className='grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1 mb-5'>
            <button
              type="button"
              onClick={() => setContactMethod('email')}
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
              onClick={() => setContactMethod('phone')}
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
              <div className='flex  sm:flex-row gap-2'>
                <select
                  {...register("phoneCountryCode")}
                  className='rounded-lg border border-slate-300 px-2.5 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white sm:w-auto'
                >
                  <option value="+234"> +234</option>
                  <option value="+1">+1</option>
                  <option value="+44"> +44</option>
                </select>
                <input
                  type="number"
                  placeholder='801 234 5678'
                  {...register("phone")}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full"
                />
              </div>
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
            </div>
          )}

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Password</label>
          <input
            type="password"
            placeholder='At least 8 characters'
            {...register("password")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 mb-5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5'>
            <div className='flex flex-col'>
              <label className='text-sm font-medium text-slate-700 mb-1.5'>Location</label>
              <select
                {...register("location")}
                className='rounded-lg border border-slate-300 px-3 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
              >
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className='flex flex-col'>
              <label className='text-sm font-medium text-slate-700 mb-1.5'>Business type</label>
              <select
                {...register("businessType")}
                className='rounded-lg border border-slate-300 px-3 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
              >
                <option value="retail">Retail</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Role</label>
          <select
            {...register("role")}
            className='rounded-lg border border-slate-300 px-3.5 py-2.5 mb-7 text-base sm:text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100 bg-white'
          >
            <option value="owner">Owner</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-900 text-white font-medium py-2.5 text-sm transition hover:bg-blue-800 active:bg-blue-800 shadow-sm"
          >
            Create account
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
  </>
  );
}