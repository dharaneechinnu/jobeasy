import { useMe } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { data: user, isLoading } = useMe()

  if (isLoading) return <div className="text-gray-500">Loading...</div>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
          <p className="font-medium">{user?.full_name || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Member since</p>
          <p className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
