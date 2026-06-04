import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobsGrid from '../components/JobsGrid'
import CultureSection from '../components/CultureSection'
import { getJobs } from '../lib/api'

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'Us'

export default function Home() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />

      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: '#fff', padding: '80px 0 60px' }}>
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge rounded-pill px-4 py-2 mb-4 d-inline-block" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              WE'RE HIRING
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Join Our Team at {ORG_NAME}
            </h1>
            <p className="lead mb-5" style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
              Explore exciting opportunities and be part of something great.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <a href="#positions" className="btn btn-light btn-lg px-4 fw-semibold" style={{ color: 'var(--primary)' }}>
                View Open Positions
              </a>
              <a href="#culture" className="btn btn-outline-light btn-lg px-4">Learn More</a>
            </div>
          </motion.div>

          <motion.div className="row g-4 mt-5 justify-content-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {[
              { value: loading ? '—' : jobs.length, label: 'Open Positions' },
              { value: loading ? '—' : [...new Set(jobs.map(j => j.department))].length, label: 'Departments' },
              { value: '100%', label: 'Remote Friendly' },
            ].map((stat, i) => (
              <div key={i} className="col-auto" style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none', paddingLeft: i > 0 ? '2rem' : 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <div className="fw-bold fs-4">{stat.value}</div>
                  <div className="small">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="positions" className="py-5">
        <div className="container">
          <h2 className="fw-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Open Positions</h2>
          <JobsGrid jobs={jobs} loading={loading} />
        </div>
      </section>

      <CultureSection />

      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Our Hiring Process</h2>
          <div className="row g-4 justify-content-center">
            {[
              { num: '1', title: 'Apply Online', text: 'Fill out our simple application form and upload your resume.' },
              { num: '2', title: 'We Review', text: 'Our team reviews applications within 5–10 business days.' },
              { num: '3', title: 'Interview', text: 'Selected candidates are invited for a conversation with our team.' },
            ].map(step => (
              <div key={step.num} className="col-12 col-md-4 text-center">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-4 mb-3"
                  style={{ width: 60, height: 60, background: 'var(--primary)', color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {step.num}
                </div>
                <h5 className="fw-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{step.title}</h5>
                <p className="text-muted small">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
