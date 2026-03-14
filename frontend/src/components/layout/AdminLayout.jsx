import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { BarChart2, Users, Package, FileText, BookOpen, Mail, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const adminNav = [
  { icon: BarChart2, label: 'Dashboard',  to: '/admin' },
  { icon: Users,     label: 'Users',      to: '/admin/users' },
  { icon: Package,   label: 'Shipments',  to: '/admin/shipments' },
  { icon: FileText,  label: 'Quotes',     to: '/admin/quotes' },
  { icon: BookOpen,  label: 'Blog',       to: '/admin/blog' },
  { icon: Mail,      label: 'Contacts',   to: '/admin/contacts' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-navy-900 bg-[#050e1f] flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-gold rounded flex items-center justify-center font-display font-black text-navy text-xs">FL</div>
            <span className="font-display font-bold text-white text-sm">Flash<span className="text-gold">Link</span></span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield size={12} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map(({ icon: Icon, label, to }) => (
            <NavLink key={to} to={to} end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                  isActive ? 'bg-gold text-navy' : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`
              }>
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/40 hover:text-white transition-colors mb-1">
            ← Back to Dashboard
          </Link>
          <button onClick={async () => { await logout(); navigate('/') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 ml-56">
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="font-display font-bold text-navy text-sm">Admin Panel</h1>
          <span className="text-xs text-gray-400">{user?.firstName} {user?.lastName}</span>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  )
}
