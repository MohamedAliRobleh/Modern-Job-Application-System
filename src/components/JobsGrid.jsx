import { useState, useMemo } from 'react'
import JobCard from './JobCard'

const TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship']

export default function JobsGrid({ jobs, loading }) {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [department, setDepartment] = useState('')

  const departments = useMemo(() => {
    const deps = [...new Set(jobs.map(j => j.department))].sort()
    return ['All Departments', ...deps]
  }, [jobs])

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
      const matchType = activeType === 'All' ||
        job.type === activeType ||
        (activeType === 'Remote' && job.location.toLowerCase().includes('remote'))
      const matchDep = !department || department === 'All Departments' || job.department === department
      return matchSearch && matchType && matchDep
    })
  }, [jobs, search, activeType, department])

  const clearFilters = () => { setSearch(''); setActiveType('All'); setDepartment('') }

  if (loading) {
    return (
      <div className="row g-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="col-12 col-md-6 col-lg-4">
            <div className="card p-4 h-100">
              <div className="placeholder-glow">
                <span className="placeholder col-4 mb-2" role="status" />
                <span className="placeholder col-8 mb-1" />
                <span className="placeholder col-6 mb-3" />
                <span className="placeholder col-12 mb-1" />
                <span className="placeholder col-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-12 col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Search positions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {TYPES.map(type => (
          <button
            key={type}
            className={`btn btn-sm rounded-pill px-3 ${activeType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <p className="text-muted small mb-3">Showing {filtered.length} position{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No positions found matching your criteria.</p>
          <button className="btn btn-outline-primary btn-sm" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((job, i) => (
            <div key={job.id} className="col-12 col-md-6 col-lg-4">
              <JobCard job={job} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
