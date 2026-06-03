// src/components/ApplicationForm.jsx
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { uploadResume, submitApplication } from '../lib/api'
import SuccessModal from './SuccessModal'

const YEARS_OPTIONS = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years']
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Flexible']
const HEARD_OPTIONS = ['LinkedIn', 'Company Website', 'Job Board', 'Referral', 'Social Media', 'Other']
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export default function ApplicationForm({ job }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const coverLetter = watch('cover_letter', '')

  const onSubmit = async (data) => {
    try {
      const { url: resume_url } = await uploadResume(data.resume[0])
      await submitApplication({ ...data, job_id: job.id, job_title: job.title, resume_url, resume: undefined })
      setSubmittedName(data.full_name)
      setShowSuccess(true)
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Personal Info */}
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h5 className="fw-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>Personal Information</h5>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="full_name" className="form-label fw-semibold">Full Name *</label>
              <input id="full_name" className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                {...register('full_name', { required: 'Full name is required' })} />
              {errors.full_name && <div className="invalid-feedback" role="alert">{errors.full_name.message}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="email" className="form-label fw-semibold">Email *</label>
              <input id="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } })} />
              {errors.email && <div className="invalid-feedback" role="alert">{errors.email.message}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="phone" className="form-label fw-semibold">Phone *</label>
              <input id="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                {...register('phone', { required: 'Phone number is required' })} />
              {errors.phone && <div className="invalid-feedback" role="alert">{errors.phone.message}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="linkedin_url" className="form-label fw-semibold">LinkedIn URL</label>
              <input id="linkedin_url" type="url" className="form-control" placeholder="https://linkedin.com/in/..."
                {...register('linkedin_url')} />
            </div>
          </div>
        </div>

        {/* Position Details */}
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h5 className="fw-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>Position Details</h5>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="position" className="form-label fw-semibold">Position</label>
              <input id="position" className="form-control bg-light" value={job.title} readOnly />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="years_experience" className="form-label fw-semibold">Years of Experience *</label>
              <select id="years_experience" className={`form-select ${errors.years_experience ? 'is-invalid' : ''}`}
                {...register('years_experience', { required: 'Please select your experience level' })}>
                <option value="">Select...</option>
                {YEARS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {errors.years_experience && <div className="invalid-feedback" role="alert">{errors.years_experience.message}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="availability" className="form-label fw-semibold">Availability *</label>
              <select id="availability" className={`form-select ${errors.availability ? 'is-invalid' : ''}`}
                {...register('availability', { required: 'Please select your availability' })}>
                <option value="">Select...</option>
                {AVAILABILITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {errors.availability && <div className="invalid-feedback" role="alert">{errors.availability.message}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="expected_salary" className="form-label fw-semibold">Expected Salary</label>
              <input id="expected_salary" className="form-control" placeholder="e.g. 80,000 CAD" {...register('expected_salary')} />
            </div>
          </div>
        </div>

        {/* Application Materials */}
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h5 className="fw-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>Application Materials</h5>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="cover_letter" className="form-label fw-semibold">Cover Letter</label>
              <textarea id="cover_letter" className="form-control" rows={5} maxLength={2000}
                placeholder="Tell us why you'd be a great fit..." {...register('cover_letter')} />
              <div className="form-text text-end">{coverLetter.length} / 2000</div>
            </div>
            <div className="col-12">
              <label htmlFor="resume" className="form-label fw-semibold">Resume * (PDF, DOC, DOCX — max 5MB)</label>
              <input id="resume" type="file" accept=".pdf,.doc,.docx"
                className={`form-control ${errors.resume ? 'is-invalid' : ''}`}
                {...register('resume', {
                  required: 'Resume is required',
                  validate: {
                    size: files => !files[0] || files[0].size <= 5 * 1024 * 1024 || 'File must be 5MB or smaller',
                    type: files => !files[0] || ALLOWED_TYPES.includes(files[0].type) || 'Only PDF, DOC, DOCX allowed',
                  },
                })} />
              {errors.resume && <div className="invalid-feedback" role="alert">{errors.resume.message}</div>}
            </div>
          </div>
        </div>

        {/* Additional */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>Additional Information</h5>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="heard_from" className="form-label fw-semibold">How did you hear about us?</label>
              <select id="heard_from" className="form-select" {...register('heard_from')}>
                <option value="">Select...</option>
                {HEARD_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="start_date" className="form-label fw-semibold">Earliest Start Date</label>
              <input id="start_date" type="date" className="form-control" {...register('start_date')} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Do you require visa sponsorship?</label>
              <div className="d-flex gap-4">
                {['Yes', 'No'].map(v => (
                  <div key={v} className="form-check">
                    <input className="form-check-input" type="radio" id={`visa-${v}`} value={v} {...register('visa_sponsorship')} />
                    <label className="form-check-label" htmlFor={`visa-${v}`}>{v}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Authorized to work in Canada?</label>
              <div className="d-flex gap-4">
                {['Yes', 'No'].map(v => (
                  <div key={v} className="form-check">
                    <input className="form-check-input" type="radio" id={`auth-${v}`} value={v} {...register('work_authorized')} />
                    <label className="form-check-label" htmlFor={`auth-${v}`}>{v}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>

      <SuccessModal show={showSuccess} name={submittedName} jobTitle={job.title} onClose={() => setShowSuccess(false)} />
    </>
  )
}
