// src/pages/Apply.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ApplicationForm from '../components/ApplicationForm'
import { getJob } from '../lib/api'

export default function Apply() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getJob(id).then(setJob).catch(() => setError('Job not found.')).finally(() => setLoading(false))
  }, [id])

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: '720px' }}>
        <Link to={job ? `/jobs/${job.id}` : '/'} className="btn btn-outline-secondary btn-sm mb-4">← Back</Link>

        {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {job && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-4">
              <span className="badge rounded-pill px-3 py-2 mb-2 d-inline-block" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {job.department}
              </span>
              <h1 className="fw-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Apply: {job.title}</h1>
              <p className="text-muted small">📍 {job.location} · {job.type}</p>
            </div>
            <div className="card p-4 p-md-5">
              <ApplicationForm job={job} />
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  )
}
