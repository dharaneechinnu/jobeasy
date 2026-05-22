import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { savedAPI } from '../api/savedAPI'
import SearchBar from '../components/SearchBar'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recentSaved, setRecentSaved] = useState([])

  useEffect(() => {
    savedAPI.list().then(res => setRecentSaved(res.data.slice(0, 3))).catch(() => {})
  }, [])

  const handleSearch = ({ query, location }) => {
    const params = new URLSearchParams({
      query,
      location,
      experience: user?.experience_level || 'fresher',
    })
    navigate(`/jobs?${params.toString()}`)
  }

  const searchBySkill = (skill) => {
    const params = new URLSearchParams({
      query: skill,
      location: user?.location || '',
      experience: user?.experience_level || 'fresher',
    })
    navigate(`/jobs?${params.toString()}`)
  }

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const skills = user?.skills?.split(',').map(s => s.trim()).filter(Boolean) || []

  const experienceLabels = {
    fresher: 'Fresher',
    junior: 'Junior',
    mid: 'Mid Level',
    senior: 'Senior',
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-xl text-white p-6 mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}! 👋</h1>
        <p className="text-blue-100 mt-1 text-sm">
          {user?.experience_level && (
            <span className="bg-white/20 rounded-full px-2 py-0.5 mr-2 text-xs font-medium">
              {experienceLabels[user.experience_level] || user.experience_level}
            </span>
          )}
          {user?.location && `📍 ${user.location} · `}
          Ready to find your next opportunity?
        </p>
      </div>

      {/* Quick Search */}
      <div className="card mb-8">
        <h2 className="font-semibold text-gray-800 mb-3">Quick Job Search</h2>
        <SearchBar
          onSearch={handleSearch}
          defaultLocation={user?.location || ''}
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/jobs"
          className="card hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-800">Search Jobs</h3>
          <p className="text-sm text-gray-500 mt-1">Browse jobs from multiple portals</p>
        </Link>
        <Link
          to="/agent"
          className="card hover:shadow-md transition-shadow text-center group border-primary-200 bg-primary-50"
        >
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-primary-800">AI Job Agent</h3>
          <p className="text-sm text-gray-500 mt-1">Describe what you want in plain English</p>
        </Link>
        <Link
          to="/saved"
          className="card hover:shadow-md transition-shadow text-center group"
        >
          <div className="text-3xl mb-2">🔖</div>
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-800">Saved Jobs</h3>
          <p className="text-sm text-gray-500 mt-1">
            {recentSaved.length > 0 ? `${recentSaved.length} bookmarked` : 'No saved jobs yet'}
          </p>
        </Link>
      </div>

      {/* Skills — clickable to search */}
      {skills.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-800">Search by Your Skills</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click any skill to find matching jobs</p>
            </div>
            <Link to="/profile" className="text-sm text-primary-700 hover:underline">
              Edit profile
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <button
                key={skill}
                onClick={() => searchBySkill(skill)}
                className="text-sm bg-primary-50 text-primary-800 px-3 py-1.5 rounded-full border border-primary-100 font-medium hover:bg-primary-100 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No skills prompt */}
      {skills.length === 0 && (
        <div className="card mb-8 border-dashed border-2 border-gray-200 text-center py-6">
          <p className="text-gray-500 text-sm">Add your skills to get personalised job suggestions.</p>
          <Link to="/profile" className="btn-primary mt-3 inline-block text-sm py-2 px-4">
            Complete Your Profile
          </Link>
        </div>
      )}

      {/* Recent Saved */}
      {recentSaved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Recently Saved</h2>
            <Link to="/saved" className="text-sm text-primary-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentSaved.map(job => (
              <div key={job.id} className="card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{job.job_title}</p>
                  <p className="text-xs text-gray-500">
                    {job.company_name}{job.location ? ` · ${job.location}` : ''}
                  </p>
                </div>
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-700 font-semibold hover:underline whitespace-nowrap flex-shrink-0"
                >
                  Apply →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
