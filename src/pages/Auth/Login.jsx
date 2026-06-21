import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.jpeg'

export const LoginPage = () => {

  const { handleSubmit, register, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    console.log(data)
  };

  return (
   <>
    <div>
        <Link to="/">
           <img src={logo} alt=""  className='size-24' />
          </Link>
     </div>
   

    <div className='flex items-center justify-center  bg-slate-50 px-4 py-10 max sm: py=10'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-8 sm:px-8 sm:py-10'>

        <div className='mb-6 sm:mb-8'>
          <h2 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>Welcome back</h2>
          <p className='text-sm text-slate-500 mt-1'>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Email</label>
          <input
            type="email"
            placeholder='luxrear@company.com'
            {...register("email")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 mb-5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <label className='text-sm font-medium text-slate-700 mb-1.5'>Password</label>
          <input
            type="password"
            placeholder='Enter your password'
            {...register("password")}
            className="rounded-lg border border-slate-300 px-3.5 py-2.5 mb-4 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="flex items-center justify-between mb-6 gap-2">
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

          <button
            type="submit"
            className="rounded-lg bg-blue-900 text-white font-medium py-2.5 text-sm transition hover:bg-blue-800 active:bg-blue-800 shadow-sm"
          >
            Login
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