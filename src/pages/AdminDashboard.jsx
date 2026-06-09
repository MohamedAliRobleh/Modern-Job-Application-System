import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StatusBadge from '../components/StatusBadge'
import { getAdminStats, getAdminApplications, updateApplication, deleteApplication, getATSReview } from '../lib/api'

const REC_COLOR = { 'STRONG HIRE': '#22c55e', 'HIRE': '#3b82f6', 'MAYBE': '#f59e0b', 'NO HIRE': '#ef4444' }
const REC_BADGE = { 'STRONG HIRE': 'success', 'HIRE': 'primary', 'MAYBE': 'warning', 'NO HIRE': 'danger' }

function ScoreRing({ score }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const r = 38, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, color }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>/100</span>
      </div>
    </div>
  )
}

function ATSReport({ data }) {
  return (
    <div>
      <div className="d-flex align-items-start gap-3 mb-4">
        <ScoreRing score={data.score} />
        <div>
          <span className={`badge bg-${REC_BADGE[data.recommendation] || 'secondary'} mb-2`}
            style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            {data.recommendation}
          </span>
          <p className="text-muted small mb-0">{data.summary}</p>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <p className="fw-semibold small mb-2">✅ Matched Keywords</p>
          <div className="d-flex flex-wrap gap-1">
            {data.matched_keywords.map(k => (
              <span key={k} className="badge rounded-pill"
                style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem' }}>{k}</span>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <p className="fw-semibold small mb-2">❌ Missing Keywords</p>
          <div className="d-flex flex-wrap gap-1">
            {data.missing_keywords.map(k => (
              <span key={k} className="badge rounded-pill"
                style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem' }}>{k}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <p className="fw-semibold small mb-2">💪 Strengths</p>
          <ul className="small ps-3 mb-0" style={{ lineHeight: 1.7 }}>
            {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        {data.concerns.length > 0 && (
          <div className="col-md-6">
            <p className="fw-semibold small mb-2">⚠️ Concerns</p>
            <ul className="small ps-3 mb-0" style={{ lineHeight: 1.7 }}>
              {data.concerns.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div>
        <p className="fw-semibold small mb-2">🎯 Suggested Interview Questions</p>
        <ol className="small ps-3 mb-0" style={{ lineHeight: 1.9 }}>
          {data.interview_questions.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </div>
    </div>
  )
}

const STATUSES = ['New', 'Reviewing', 'Interview', 'Offer', 'Rejected']

function exportCsv(data) {
  const headers = ['Date', 'Name', 'Email', 'Position', 'Experience', 'Availability', 'Salary', 'Status']
  const rows = data.map(a => [
    new Date(a.created_at).toLocaleDateString(),
    a.full_name, a.email, a.job_title,
    a.years_experience || '', a.availability || '',
    a.expected_salary || '', a.status,
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [noteModal, setNoteModal] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [atsModal, setAtsModal] = useState(null)
  const [atsResult, setAtsResult] = useState(null)
  const atsCache = useRef(new Map())

  const fetchStats = useCallback(async () => {
    try {
      const token = await getToken()
      const data = await getAdminStats(token)
      setStats(data)
    } catch { toast.error('Failed to load stats') }
  }, [getToken])

  const fetchApplications = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const token = await getToken()
      const result = await getAdminApplications(
        { search, status: statusFilter, from: fromDate, to: toDate, page: pg, limit: 20 },
        token
      )
      setApplications(result.data)
      setTotal(result.total)
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [getToken, search, statusFilter, fromDate, toDate])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchApplications(1) }, [fetchApplications])

  const handleStatusChange = async (id, status) => {
    try {
      const token = await getToken()
      await updateApplication(id, { status }, token)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      toast.success('Status updated')
    } catch { toast.error('Failed to update status') }
  }

  const handleSaveNote = async () => {
    try {
      const token = await getToken()
      await updateApplication(noteModal, { notes: noteText }, token)
      toast.success('Note saved')
      setNoteModal(null)
      setNoteText('')
    } catch { toast.error('Failed to save note') }
  }

  const handleDelete = async () => {
    try {
      const token = await getToken()
      await deleteApplication(deleteModal, token)
      setApplications(prev => prev.filter(a => a.id !== deleteModal))
      setDeleteModal(null)
      toast.success('Application deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleATSReview = async (app) => {
    setAtsModal(app)
    if (atsCache.current.has(app.id)) {
      setAtsResult({ loading: false, data: atsCache.current.get(app.id) })
      return
    }
    setAtsResult({ loading: true })
    try {
      const token = await getToken()
      const data = await getATSReview(app.id, token)
      atsCache.current.set(app.id, data)
      setAtsResult({ loading: false, data })
    } catch (err) {
      setAtsResult({ loading: false, error: err.message })
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 className="fw-bold mb-0" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Applications</h2>
          <button className="btn btn-outline-primary btn-sm" onClick={() => exportCsv(applications)}>Export CSV</button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Total', value: stats.total, color: 'var(--primary)' },
              { label: 'New', value: stats.new_count, color: 'var(--primary)' },
              { label: 'Interview', value: stats.interview_count, color: 'var(--warning)' },
              { label: 'This Week', value: stats.this_week, color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card p-3 text-center">
                  <div className="fw-bold fs-3" style={{ color: s.color }}>{s.value}</div>
                  <div className="small text-muted">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="card p-3 mb-4">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <input className="form-control form-control-sm" placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th><th>Applicant</th><th>Position</th>
                    <th>Experience</th><th>Availability</th><th>Salary</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <Fragment key={app.id}>
                      <tr style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                        <td className="small">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="fw-semibold small">{app.full_name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{app.email}</div>
                        </td>
                        <td className="small">{app.job_title}</td>
                        <td className="small">{app.years_experience || '—'}</td>
                        <td className="small">{app.availability || '—'}</td>
                        <td className="small">{app.expected_salary || '—'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <select className="form-select form-select-sm" value={app.status}
                            onChange={e => handleStatusChange(app.id, e.target.value)} style={{ minWidth: 110 }}>
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="d-flex gap-1 flex-wrap">
                            {app.resume_url && (
                              <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm">Resume</a>
                            )}
                            <button className="btn btn-sm fw-semibold"
                              onClick={() => handleATSReview(app)}
                              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', fontSize: '0.75rem' }}>
                              🤖 AI Review
                            </button>
                            <button className="btn btn-outline-secondary btn-sm"
                              onClick={() => { setNoteModal(app.id); setNoteText(app.notes || '') }}>Note</button>
                            <button className="btn btn-outline-danger btn-sm"
                              onClick={() => setDeleteModal(app.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>

                      {expandedId === app.id && (
                        <tr style={{ background: 'var(--primary-light)' }}>
                          <td colSpan={8} className="p-4">
                            <div className="row g-3">
                              {app.cover_letter && (
                                <div className="col-12">
                                  <strong>Cover Letter:</strong>
                                  <p className="small mt-1 mb-0">{app.cover_letter}</p>
                                </div>
                              )}
                              <div className="col-6 col-md-3">
                                <strong className="small d-block">LinkedIn</strong>
                                {app.linkedin_url ? <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="small">View</a> : <span className="small text-muted">—</span>}
                              </div>
                              <div className="col-6 col-md-3">
                                <strong className="small d-block">How they heard</strong>
                                <span className="small">{app.heard_from || '—'}</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <strong className="small d-block">Visa Required</strong>
                                <span className="small">{app.visa_sponsorship || '—'}</span>
                              </div>
                              <div className="col-6 col-md-3">
                                <strong className="small d-block">Start Date</strong>
                                <span className="small">{app.start_date || '—'}</span>
                              </div>
                              {app.notes && (
                                <div className="col-12">
                                  <strong className="small d-block">Notes</strong>
                                  <span className="small">{app.notes}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 p-3">
                <button className="btn btn-outline-secondary btn-sm" disabled={page === 1}
                  onClick={() => fetchApplications(page - 1)}>← Previous</button>
                <span className="small align-self-center text-muted">Page {page} of {totalPages} ({total} total)</span>
                <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages}
                  onClick={() => fetchApplications(page + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* Note Modal */}
        {noteModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setNoteModal(null)}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-content p-4">
                <h5 className="fw-bold mb-3">Add Note</h5>
                <textarea className="form-control mb-3" rows={4} value={noteText}
                  onChange={e => setNoteText(e.target.value)} placeholder="Internal notes about this applicant..." />
                <div className="d-flex gap-2 justify-content-end">
                  <button className="btn btn-outline-secondary" onClick={() => setNoteModal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveNote}>Save Note</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteModal(null)}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="modal-content p-4">
                <h5 className="fw-bold mb-3">Delete Application?</h5>
                <p className="text-muted">This action cannot be undone.</p>
                <div className="d-flex gap-2 justify-content-end">
                  <button className="btn btn-outline-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATS AI Review Modal */}
        {atsModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => { setAtsModal(null); setAtsResult(null) }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <div>
                    <h5 className="fw-bold mb-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      🤖 AI ATS Review
                    </h5>
                    <p className="text-muted small mb-0">{atsModal.full_name} — {atsModal.job_title}</p>
                  </div>
                  <button className="btn-close" onClick={() => { setAtsModal(null); setAtsResult(null) }} />
                </div>
                <div className="modal-body pt-3">
                  {!atsResult || atsResult.loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border mb-3"
                        style={{ color: '#8b5cf6', width: '2.5rem', height: '2.5rem' }} />
                      <p className="text-muted small">Claude is analyzing the application…</p>
                    </div>
                  ) : atsResult.error ? (
                    <div className="alert alert-danger">{atsResult.error}</div>
                  ) : (
                    <ATSReport data={atsResult.data} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
