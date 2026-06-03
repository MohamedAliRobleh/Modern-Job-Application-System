// src/pages/JobDetail.jsx
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getJob } from '../lib/api'

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getJob(id).then(setJob).catch(() => setError('Job not found.')).finally(() => setLoading(false))
  }, [id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: '800px' }}>
        <Link to="/" className="btn btn-outline-secondary btn-sm mb-4">← Back to Positions</Link>

        {loading && (
          <div className="placeholder-glow">
            <span className="placeholder col-6 mb-3" style={{ height: 32 }} />
            <span className="placeholder col-4 mb-2" />
            <span className="placeholder col-12 mb-1" />
            <span className="placeholder col-12" />
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {job && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge rounded-pill px-3 py-2" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{job.department}</span>
              <span className="badge rounded-pill px-3 py-2 bg-light text-muted">{job.type}</span>
            </div>

            <h1 className="fw-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{job.title}</h1>

            <div className="d-flex flex-wrap gap-3 mb-4 text-muted small">
              <span>📍 {job.location}</span>
              {job.salary_range && <span className="text-success fw-semibold">💰 {job.salary_range}</span>}
            </div>

            <div className="d-flex gap-3 mb-5 flex-wrap">
              <Link to={`/apply/${job.id}`} className="btn btn-primary btn-lg px-5">Apply Now</Link>
              <button className="btn btn-outline-secondary btn-lg" onClick={handleShare}>Share</button>
            </div>

            <hr />

            {job.description && (
              <>
                <h4 className="fw-bold mt-4 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>About the Role</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.description}</p>
              </>
            )}

            {job.requirements && (
              <>
                <h4 className="fw-bold mt-4 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Requirements</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.requirements}</p>
              </>
            )}

            <div className="mt-5 p-4 rounded" style={{ background: 'var(--primary-light)' }}>
              <h5 className="fw-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>Ready to Apply?</h5>
              <p className="mb-3 small" style={{ color: 'var(--primary)' }}>Join our team and make an impact.</p>
              <Link to={`/apply/${job.id}`} className="btn btn-primary">Apply for this Position →</Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  )
}
