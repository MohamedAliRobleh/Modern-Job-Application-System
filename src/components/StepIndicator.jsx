import { Fragment } from 'react'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="d-flex align-items-start mb-4 px-2">
      {steps.map((label, i) => (
        <Fragment key={label}>
          <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: i <= currentStep ? 'var(--primary)' : 'var(--border)',
              color: i <= currentStep ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem',
              boxShadow: i === currentStep ? '0 0 0 4px var(--primary-light)' : 'none',
              transition: 'all 0.3s',
            }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: '0.7rem', marginTop: 6, textAlign: 'center',
              color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: i === currentStep ? 700 : 400,
              lineHeight: 1.2,
            }}>
              {label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 2, height: 2, marginTop: 17,
              background: i < currentStep ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          )}
        </Fragment>
      ))}
    </div>
  )
}
