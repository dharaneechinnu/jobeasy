import { useState } from 'react'
import { savedAPI } from '../api/savedAPI'

export default function JobCard({ job, onSave, isSaved = false }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved)

  const handleSave = async () => {
    if (saved) return
    setSaving(true)
    try {
      await savedAPI.save({
        job_id: job.job_id,
        job_title: job.job_title,
        company_name: job.employer_name,
        location: [job.job_city, job.job_country].filter(Boolean).join(', '),
        job_url: job.job_apply_link,
        source_portal: job.source_portal || 'JSearch',
        job_type: job.job_employment_type || '',
        salary: job.job_min_salary
          ? `${job.job_salary_currency || ''} ${job.job_min_salary}${job.job_max_salary ? ` - ${job.job_max_salary}` : ''}`.trim()
          : '',
      })
      setSaved(true)
      if (onSave) onSave(job)
    } catch (err) {
      if (err.response?.status === 400) setSaved(true) // already saved
    } finally {
      setSaving(false)
    }
  }

  const location = [job.job_city, job.job_country].filter(Boolean).join(', ')
  const salary = job.job_min_salary
    ? `${job.job_salary_currency || ''} ${job.job_min_salary}${job.job_max_salary ? ` – ${job.job_max_salary}` : ''}`.trim()
    : null

  const postedDate = job.job_posted_at
    ? new Date(job.job_posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {job.employer_logo ? (
            <img src={job.employer_logo} alt={job.employer_name} className="w-10 h-10 rounded object-contain flex-shrink-0 bg-gray-50 border border-gray-100 p-1" />
          ) : (
            <div className="w-10 h-10 rounded bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-800 font-bold text-sm">{(job.employer_name || 'J')[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{job.job_title}</h3>
            <p className="text-sm text-gray-600">{job.employer_name}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          title={saved ? 'Saved' : 'Save job'}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${saved ? 'text-primary-800' : 'text-gray-400 hover:text-primary-700'}`}
        >
          <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {location && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {location}
          </span>
        )}
        {job.job_employment_type && (
          <span className="text-xs bg-blue-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{job.job_employment_type}</span>
        )}
        {salary && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{salary}</span>
        )}
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{job.source_portal}</span>
      </div>

      {job.job_description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.job_description}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        {postedDate && <span className="text-xs text-gray-400">Posted {postedDate}</span>}
        <a
          href={job.job_apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm py-2 px-4 ml-auto"
        >
          View Job →
        </a>
      </div>
    </div>
  )
}
