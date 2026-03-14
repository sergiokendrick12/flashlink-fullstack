import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, Bell, User, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const sideNav = [
  { icon: LayoutDashboard, label: 'Overview',      to: '/dashboard' },
  { icon: Package,         label: 'My Shipments',  to: '/dashboard/shipments' },
  { icon: FileText,        label: 'Quotes',         to: '/dashboard/quotes' },
  { icon: Bell,            label: 'Notifications',  to: '/dashboard/notifications' },
  { icon: User,            label: 'Profile',        to: '/dashboard/profile' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { await logout(); navigate('/') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center font-display font-black text-navy text-xs">FL</div>
          <span className="font-display font-extrabold text-white">Flash<span className="text-gold">Link</span></span>
        </Link>
      </div>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center font-bold text-navy text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
            <p className="text-white/40 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {sideNav.map(({ icon: Icon, label, to }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-gold text-navy' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link to="/quote" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gold/20 text-gold hover:bg-gold hover:text-navy transition-all mb-1">
          <FileText size={16} /> New Quote Request
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-navy flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              className="fixed inset-y-0 left-0 w-60 bg-navy z-50 lg:hidden flex flex-col">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-navy">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-navy transition-colors">FlashLink</Link>
            <ChevronRight size={12} />
            <span className="text-navy font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="p-2 text-gray-400 hover:text-navy relative">
              <Bell size={18} />
            </Link>
            <Link to="/dashboard/profile">
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
