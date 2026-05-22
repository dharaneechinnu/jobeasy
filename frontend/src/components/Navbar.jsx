import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/authAPI'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await authAPI.logout(refresh)
    } catch {}
    logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/jobs', label: 'Search Jobs' },
    { to: '/agent', label: 'AI Agent' },
    { to: '/saved', label: 'Saved Jobs' },
    { to: '/profile', label: 'Profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-primary-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">
            Job<span className="text-blue-300">Easy</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(to) ? 'bg-primary-900 text-white' : 'text-blue-100 hover:bg-primary-700'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-blue-200 text-sm">{user?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="text-sm bg-white text-primary-800 font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-primary-700">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(to) ? 'bg-primary-900' : 'hover:bg-primary-700'}`}>
                {label}
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-300 hover:text-red-100">Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}
