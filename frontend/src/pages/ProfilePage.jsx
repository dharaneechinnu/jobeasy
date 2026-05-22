import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/authAPI'

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher (0 years)' },
  { value: 'junior', label: 'Junior (1-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    skills: user?.skills || '',
    experience_level: user?.experience_level || 'fresher',
    location: user?.location || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const { data } = await authAPI.updateProfile(form)
      updateUser(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-gray-500 text-sm mb-8">
        Keep your profile updated for better job recommendations.
      </p>

      {/* Account info (read-only) */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-800 font-bold text-lg">
              {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.full_name || '—'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Profile Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Rahul Sharma"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="input-field"
            placeholder="Bangalore, India"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
          <select
            name="experience_level"
            value={form.experience_level}
            onChange={handleChange}
            className="input-field"
          >
            {EXPERIENCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills
            <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
          </label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="input-field"
            placeholder="React, Python, Django, Node.js..."
          />
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="text-xs bg-primary-50 text-primary-800 px-2.5 py-1 rounded-full border border-primary-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            ✓ Profile updated successfully!
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
