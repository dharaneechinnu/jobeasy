export default function FilterSidebar({ filters, activeFilters, onChange, hasSearched }) {
  if (!filters) return null

  const handleChange = (key, value) => {
    onChange({ ...activeFilters, [key]: value })
  }

  const clearAll = () => {
    onChange({ employment_type: '', date_posted: 'month', experience: 'fresher' })
  }

  const hasActiveFilters =
    activeFilters.employment_type !== '' ||
    activeFilters.date_posted !== 'month' ||
    activeFilters.experience !== 'fresher'

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Filters</h3>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700">
              Clear all
            </button>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Experience Level
          </p>
          <div className="space-y-1.5">
            {filters.experience_levels?.map((lvl) => (
              <label key={lvl.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="experience"
                  value={lvl.value}
                  checked={activeFilters.experience === lvl.value}
                  onChange={() => handleChange('experience', lvl.value)}
                  className="text-primary-800 accent-primary-800"
                />
                <span className="text-sm text-gray-700">{lvl.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Employment Type */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Job Type
          </p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="employment_type"
                value=""
                checked={!activeFilters.employment_type}
                onChange={() => handleChange('employment_type', '')}
                className="accent-primary-800"
              />
              <span className="text-sm text-gray-700">Any</span>
            </label>
            {filters.employment_types?.map((type) => (
              <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="employment_type"
                  value={type.value}
                  checked={activeFilters.employment_type === type.value}
                  onChange={() => handleChange('employment_type', type.value)}
                  className="accent-primary-800"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Posted */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Date Posted
          </p>
          <div className="space-y-1.5">
            {filters.date_posted_options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="date_posted"
                  value={opt.value}
                  checked={activeFilters.date_posted === opt.value}
                  onChange={() => handleChange('date_posted', opt.value)}
                  className="accent-primary-800"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {hasSearched && (
          <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
            Filters apply automatically when you search.
          </p>
        )}
      </div>
    </aside>
  )
}
