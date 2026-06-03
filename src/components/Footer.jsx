const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'Careers'

export default function Footer() {
  return (
    <footer className="py-4 mt-5" style={{ background: 'var(--text)', color: '#94a3b8' }}>
      <div className="container text-center">
        <p className="mb-1 fw-semibold" style={{ color: '#fff' }}>{ORG_NAME}</p>
        <p className="mb-0 small">© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  )
}
