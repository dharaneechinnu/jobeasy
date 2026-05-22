import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jobsAPI } from '../api/jobsAPI'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function JobSearchPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQuery = searchParams.get('query') || ''
  const initialLocation = searchParams.get('location') || ''
  const initialExperience = searchParams.get('experience') || user?.experience_level || 'fresher'

  const [jobs, setJobs] = useState([])
  const [filters, setFilters] = useState(null)
  const [activeFilters, setActiveFilters] = useState({
    employment_type: '',
    date_posted: 'month',
    experience: initialExperience,
  })
  const [currentSearch, setCurrentSearch] = useState({ query: initialQuery, location: initialLocation })
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    jobsAPI.getFilters().then(res => setFilters(res.data)).catch(() => {})
    if (initialQuery) {
      runSearch({ query: initialQuery, location: initialLocation }, activeFilters, 1, false)
    }
  }, [])

  const runSearch = async ({ query, location }, filters, pg, append) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    setSearched(true)

    setSearchParams({
      query,
      location,
      experience: filters.experience,
    })

    try {
      const { data } = await jobsAPI.search({
        query,
        location,
        employment_type: filters.employment_type,
        date_posted: filters.date_posted,
        experience: filters.experience,
        page: pg,
      })
      const results = data.results || []
      setJobs(prev => append ? [...prev, ...results] : results)
      setHasNextPage(data.has_next_page || false)
      setPage(pg)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs. Please try again.')
      if (!append) setJobs([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const doSearch = ({ query, location }) => {
    setCurrentSearch({ query, location })
    setPage(1)
    runSearch({ query, location }, activeFilters, 1, false)
  }

  const applyFilters = (newFilters) => {
    setActiveFilters(newFilters)
    if (searched && currentSearch.query) {
      setPage(1)
      runSearch(currentSearch, newFilters, 1, false)
    }
  }

  const loadMore = () => {
    runSearch(currentSearch, activeFilters, page + 1, true)
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Jobs</h1>

      <div className="mb-6">
        <SearchBar
          onSearch={doSearch}
          loading={loading}
          defaultQuery={initialQuery}
          defaultLocation={initialLocation}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <FilterSidebar
          filters={filters}
          activeFilters={activeFilters}
          onChange={applyFilters}
          hasSearched={searched}
        />

        <div className="flex-1">
          {loading && <LoadingSpinner text="Searching jobs across portals..." />}

          {!loading && error && (
            <div className="card text-center text-red-600 py-8">
              <p className="text-2xl mb-2">⚠️</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && searched && jobs.length === 0 && (
            <div className="card text-center text-gray-500 py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No jobs found.</p>
              <p className="text-sm mt-1">Try different keywords, location, or adjust filters.</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="card text-center text-gray-400 py-12">
              <p className="text-4xl mb-3">💼</p>
              <p>Search for jobs above to get started.</p>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{jobs.length} job(s) found</p>
              {jobs.map(job => <JobCard key={job.job_id} job={job} />)}

              {loadingMore && <LoadingSpinner size="sm" text="Loading more jobs..." />}

              {!loadingMore && hasNextPage && (
                <div className="text-center pt-2">
                  <button onClick={loadMore} className="btn-secondary">
                    Load More Jobs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
