import { useOutletContext } from 'react-router-dom'

export const HomeFeedPage = () => {
  const { user } = useOutletContext()

  return (
    <div>
      <h1 className='text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight'>
        Welcome{user?.full_name ? `, ${user.full_name}` : ''}
      </h1>
      <p className='text-sm text-slate-500 mt-1'>Here's what's happening today.</p>

      <div className='mt-6 bg-white rounded-2xl border border-slate-200 p-6'>
        <p className='text-sm text-slate-400'>Home feed content goes here.</p>
      </div>
    </div>
  )
}