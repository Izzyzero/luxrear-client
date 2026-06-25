import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, MobileSidebarToggle } from './Sidebar'
import { useCurrentUser } from '../../services/useCurrentUser'

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, isLoading } = useCurrentUser()

  return (
    <div className='min-h-screen bg-slate-50'>
      <Sidebar
        role={user?.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className='lg:pl-64'>
        <header className='flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white lg:hidden'>
          <MobileSidebarToggle onOpen={() => setIsSidebarOpen(true)} />
          <span className='text-sm font-medium text-slate-700'>Dashboard</span>
        </header>

        <main className='p-4 sm:p-6'>
          {isLoading ? (
            <p className='text-sm text-slate-400'>Loading...</p>
          ) : (
            <Outlet context={{ user }} />
          )}
        </main>
      </div>
    </div>
  )
}