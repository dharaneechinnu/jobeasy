import { useState } from 'react'

export default function SearchBar({ onSearch, loading = false, defaultQuery = '', defaultLocation = '' }) {
  const [query, setQuery] = useState(defaultQuery)
  const [location, setLocation] = useState(defaultLocation)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch({ query: query.trim(), location: location.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        className="input-field flex-1"
        placeholder="Job title, skills, or keywords..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        className="input-field sm:w-48"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button type="submit" disabled={loading || !query.trim()} className="btn-primary whitespace-nowrap">
        {loading ? 'Searching...' : 'Search Jobs'}
      </button>
    </form>
  )
}
