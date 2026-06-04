// src/components/MultiStepForm.jsx
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import StepIndicator from './StepIndicator'
import SuccessModal from './SuccessModal'
import { uploadResume, submitApplication } from '../lib/api'

const STEPS = ['Infos personnelles', 'CV & Motivation', 'Finaliser']
const YEARS_OPTIONS = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years']
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Flexible']
const HEARD_OPTIONS = ['LinkedIn', 'Company Website', 'Job Board', 'Referral', 'Social Media', 'Other']
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: dir => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function MultiStepForm({ job }) {
  const { register, trigger, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [trackingToken, setTrackingToken] = useState(null)
  const coverLetter = watch('cover_letter', '')

  const go = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const handleNext = async () => {
    const fields = [
      ['full_name', 'email', 'phone'],
      ['resume', 'years_experience', 'availability'],
    ][step]
    const valid = await trigger(fields)
    if (valid) go(step + 1)
  }

  const onSubmit = async (data) => {
    try {
      const { url: resume_url } = await uploadResume(data.resume[0])
      const result = await submitApplication({
        ...data, job_id: job.id, job_title: job.title,
        resume_url, resume: undefined,
      })
      setSubmittedName(data.full_name)
      setTrackingToken(result.tracking_token || null)
      setShowSuccess(true)
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  const vals = getValues()

  return (
    <>
      <StepIndicator steps={STEPS} currentStep={step} />

      <div style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Step 1 — Infos personnelles */}
              {step === 0 && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="full_name" className="form-label fw-semibold">Full Name *</label>
                    <input id="full_name" className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                      {...register('full_name', { required: 'Full name is required' })} />
                    {errors.full_name && <div className="invalid-feedback">{errors.full_name.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold">Email *</label>
                    <input id="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="phone" className="form-label fw-semibold">Phone *</label>
                    <input id="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      {...register('phone', { required: 'Phone number is required' })} />
                    {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="linkedin_url" className="form-label fw-semibold">LinkedIn URL</label>
                    <input id="linkedin_url" type="url" className="form-control"
                      placeholder="https://linkedin.com/in/..." {...register('linkedin_url')} />
                  </div>
                </div>
              )}

              {/* Step 2 — CV & Motivation */}
              {step === 1 && (
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="resume" className="form-label fw-semibold">Resume * (PDF, DOC, DOCX — max 5MB)</label>
                    <input id="resume" type="file" accept=".pdf,.doc,.docx"
                      className={`form-control ${errors.resume ? 'is-invalid' : ''}`}
                      {...register('resume', {
                        required: 'Resume is required',
                        validate: {
                          size: f => !f[0] || f[0].size <= 5 * 1024 * 1024 || 'File must be 5MB or smaller',
                          type: f => !f[0] || ALLOWED_TYPES.includes(f[0].type) || 'Only PDF, DOC, DOCX allowed',
                        },
                      })} />
                    {errors.resume && <div className="invalid-feedback">{errors.resume.message}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="cover_letter" className="form-label fw-semibold">Cover Letter</label>
                    <textarea id="cover_letter" className="form-control" rows={5} maxLength={2000}
                      placeholder="Tell us why you'd be a great fit..." {...register('cover_letter')} />
                    <div className="form-text text-end">{coverLetter.length} / 2000</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="years_experience" className="form-label fw-semibold">Years of Experience *</label>
                    <select id="years_experience" className={`form-select ${errors.years_experience ? 'is-invalid' : ''}`}
                      {...register('years_experience', { required: 'Please select your experience level' })}>
                      <option value="">Select...</option>
                      {YEARS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    {errors.years_experience && <div className="invalid-feedback">{errors.years_experience.message}</div>}
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="availability" className="form-label fw-semibold">Availability *</label>
                    <select id="availability" className={`form-select ${errors.availability ? 'is-invalid' : ''}`}
                      {...register('availability', { required: 'Please select your availability' })}>
                      <option value="">Select...</option>
                      {AVAILABILITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    {errors.availability && <div className="invalid-feedback">{errors.availability.message}</div>}
                  </div>
                </div>
              )}

              {/* Step 3 — Finaliser */}
              {step === 2 && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="card p-3 mb-2" style={{ background: 'var(--primary-light)', border: 'none', borderRadius: 'var(--radius)' }}>
                      <div className="small fw-semibold mb-2" style={{ color: 'var(--primary)' }}>📋 Summary</div>
                      <div className="row g-1 small text-muted">
                        <div className="col-6"><strong>Name:</strong> {vals.full_name}</div>
                        <div className="col-6"><strong>Email:</strong> {vals.email}</div>
                        <div className="col-6"><strong>Phone:</strong> {vals.phone}</div>
                        <div className="col-6"><strong>Position:</strong> {job.title}</div>
                        {vals.years_experience && <div className="col-6"><strong>Experience:</strong> {vals.years_experience}</div>}
                        {vals.availability && <div className="col-6"><strong>Availability:</strong> {vals.availability}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="expected_salary" className="form-label fw-semibold">Expected Salary</label>
                    <input id="expected_salary" className="form-control" placeholder="e.g. 80,000 CAD"
                      {...register('expected_salary')} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="start_date" className="form-label fw-semibold">Earliest Start Date</label>
                    <input id="start_date" type="date" className="form-control" {...register('start_date')} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="heard_from" className="form-label fw-semibold">How did you hear about us?</label>
                    <select id="heard_from" className="form-select" {...register('heard_from')}>
                      <option value="">Select...</option>
                      {HEARD_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Visa sponsorship required?</label>
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
              )}

              {/* Navigation */}
              <div className={`d-flex mt-4 ${step > 0 ? 'justify-content-between' : 'justify-content-end'}`}>
                {step > 0 && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => go(step - 1)}>
                    ← Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button type="button" className="btn btn-primary px-4" onClick={handleNext}>
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-lg px-5" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>

            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      <SuccessModal show={showSuccess} name={submittedName} jobTitle={job.title}
        onClose={() => setShowSuccess(false)} trackingToken={trackingToken} />
    </>
  )
}
