import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  User,
  Repeat,
  Users,
  Globe,
  LifeBuoy,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import logo from '../../assets/images/logo.png'
import { logout } from '../../services/authService'

const navItems = [
  { label: 'Home Feed', to: '/dashboard', icon: Home, end: true },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
  { label: 'Exchange', to: '/dashboard/exchange', icon: Repeat },
  { label: 'Community', to: '/dashboard/community', icon: Users },
  { label: 'Diaspora Hub', to: '/dashboard/diaspora-hub', icon: Globe },
  { label: 'Support Board', to: '/dashboard/support', icon: LifeBuoy },
]

const adminItem = { label: 'Admin Dashboard', to: '/dashboard/admin', icon: ShieldCheck }

export const Sidebar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const items = role === 'admin' ? [...navItems, adminItem] : navItems

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
    onClose()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop, mobile only, shown when sidebar is open */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 lg:hidden'
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className='flex items-center justify-between px-5 py-5 border-b border-slate-200'>
          <img src={logo} alt="Luxrear" className='h-9 w-auto' />
          <button
            onClick={onClose}
            className='lg:hidden text-slate-400 hover:text-slate-600'
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className='flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto'>
          {items.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='px-3 py-4 border-t border-slate-200'>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors w-full disabled:opacity-60'
          >
            <LogOut size={18} />
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </aside>
    </>
  )
}

export const MobileSidebarToggle = ({ onOpen }) => (
  <button
    onClick={onOpen}
    className='lg:hidden text-slate-600 hover:text-slate-900 p-2 -ml-2'
    aria-label="Open menu"
  >
    <Menu size={22} />
  </button>
)