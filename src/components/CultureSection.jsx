import { motion } from 'framer-motion'
import { PERKS, TESTIMONIALS } from '../lib/culture'

const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'Our Company'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CultureSection() {
  return (
    <section id="culture" className="py-5" style={{ background: 'var(--bg-light)' }}>
      <div className="container">

        {/* Heading */}
        <div className="text-center mb-5">
          <span className="badge mb-3 px-3 py-2" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
            OUR CULTURE
          </span>
          <h2 className="fw-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            Life at {ORG_NAME}
          </h2>
          <p className="text-muted mx-auto" style={{ maxWidth: 520 }}>
            We build software that matters, with people who care. Here's what working with us actually looks like.
          </p>
        </div>

        {/* Perks grid */}
        <motion.div className="row g-3 mb-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {PERKS.map(p => (
            <motion.div key={p.title} className="col-12 col-sm-6 col-lg-4" variants={fadeUp}>
              <div className="card h-100 p-4 border-0 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <h6 className="fw-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.title}</h6>
                <p className="text-muted small mb-0">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <h4 className="fw-bold text-center mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          From the team
        </h4>
        <motion.div className="row g-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {TESTIMONIALS.map(t => (
            <motion.div key={t.name} className="col-12 col-md-4" variants={fadeUp}>
              <div className="card h-100 p-4 border-0 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                <p className="text-muted mb-4" style={{ lineHeight: 1.7, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 40, height: 40, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.85rem', flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="fw-semibold small">{t.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
