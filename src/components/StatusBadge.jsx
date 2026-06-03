const STATUS_STYLES = {
  New:       { bg: 'var(--primary-light)', color: 'var(--primary)' },
  Reviewing: { bg: '#f0fdf4',             color: '#166534' },
  Interview: { bg: '#fffbeb',             color: '#92400e' },
  Offer:     { bg: '#f0fdf4',             color: 'var(--success)' },
  Rejected:  { bg: '#fef2f2',             color: 'var(--danger)' },
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: '#f1f5f9', color: 'var(--text-muted)' }
  return (
    <span
      className="badge rounded-pill px-3 py-2 fw-semibold"
      style={{ background: style.bg, color: style.color, fontSize: '0.78rem' }}
    >
      {status}
    </span>
  )
}
