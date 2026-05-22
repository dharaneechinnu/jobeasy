import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-primary-600">App</Link>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">{user?.full_name || user?.email}</Link>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
