import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function JobCard({ job, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <div
        className="card h-100 p-4"
        style={{ transition: 'transform 200ms, box-shadow 200ms', cursor: 'pointer' }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'var(--shadow)'
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="badge rounded-pill px-3" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem' }}>
            {job.department}
          </span>
          <span className="badge rounded-pill px-3" style={{ background: '#f1f5f9', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {job.type}
          </span>
        </div>
        <h5 className="fw-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)' }}>
          {job.title}
        </h5>
        <p className="small mb-2" style={{ color: 'var(--text-muted)' }}>📍 {job.location}</p>
        {job.salary_range && (
          <p className="small mb-2 fw-semibold" style={{ color: 'var(--success)' }}>💰 {job.salary_range}</p>
        )}
        <p className="small mb-3" style={{
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {job.description}
        </p>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm mt-auto">
          View Details →
        </Link>
      </div>
    </motion.div>
  )
}
