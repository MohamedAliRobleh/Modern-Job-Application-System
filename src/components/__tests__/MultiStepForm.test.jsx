// src/components/__tests__/MultiStepForm.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
}))
vi.mock('../../lib/api', () => ({
  uploadResume: vi.fn(),
  submitApplication: vi.fn(),
}))

import MultiStepForm from '../MultiStepForm'

const JOB = { id: 'job-1', title: 'Senior Engineer' }

describe('MultiStepForm', () => {
  it('renders step 1 fields initially', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
  })

  it('renders step indicator with 3 steps', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.getByText('Infos personnelles')).toBeInTheDocument()
    expect(screen.getByText('CV & Motivation')).toBeInTheDocument()
    expect(screen.getByText('Finaliser')).toBeInTheDocument()
  })

  it('shows Next button on step 1', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /next|suivant/i })).toBeInTheDocument()
  })

  it('does not show Back button on step 1', () => {
    render(<MemoryRouter><MultiStepForm job={JOB} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: /back|retour/i })).not.toBeInTheDocument()
  })
})
