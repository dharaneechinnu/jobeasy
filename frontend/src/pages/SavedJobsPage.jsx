import { useEffect, useState } from 'react'
import { savedAPI } from '../api/savedAPI'
import LoadingSpinner from '../components/LoadingSpinner'

function SavedJobItem({ job, onRemove, onUpdateNotes }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(job.notes || '')
  const [saving, setSaving] = useState(false)

  const saveNotes = async () => {
    setSaving(true)
    try {
      await savedAPI.updateNotes(job.id, notes)
      onUpdateNotes(job.id, notes)
      setEditingNotes(false)
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{job.job_title}</h3>
          <p className="text-sm text-gray-600">{job.company_name}</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {job.location && <span className="text-xs text-gray-400">{job.location}</span>}
            {job.job_type && <span className="text-xs bg-blue-50 text-primary-700 px-2 py-0.5 rounded-full">{job.job_type}</span>}
            {job.source_portal && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{job.source_portal}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-1.5 px-3">Apply →</a>
          <button onClick={() => onRemove(job.id)} className="text-red-400 hover:text-red-600 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              className="input-field text-sm resize-none h-20"
              placeholder="Add notes about this job..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={saveNotes} disabled={saving} className="btn-primary text-xs py-1.5 px-3">{saving ? 'Saving...' : 'Save Notes'}</button>
              <button onClick={() => setEditingNotes(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {notes ? (
              <p className="text-xs text-gray-500 flex-1">{notes}</p>
            ) : (
              <p className="text-xs text-gray-400 flex-1">No notes added</p>
            )}
            <button onClick={() => setEditingNotes(true)} className="text-xs text-primary-700 hover:underline">
              {notes ? 'Edit' : '+ Add note'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-300 mt-2">Saved {new Date(job.saved_at).toLocaleDateString()}</p>
    </div>
  )
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    savedAPI.list()
      .then(res => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id) => {
    try {
      await savedAPI.remove(id)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch {}
  }

  const handleUpdateNotes = (id, notes) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, notes } : j))
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {loading && <LoadingSpinner text="Loading saved jobs..." />}

      {!loading && jobs.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔖</p>
          <p className="font-medium">No saved jobs yet.</p>
          <p className="text-sm mt-1">Search for jobs and click the bookmark icon to save them.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map(job => (
            <SavedJobItem key={job.id} job={job} onRemove={handleRemove} onUpdateNotes={handleUpdateNotes} />
          ))}
        </div>
      )}
    </div>
  )
}
