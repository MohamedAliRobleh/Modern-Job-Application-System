// src/components/__tests__/ApplicationForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'

vi.mock('../../lib/api', () => ({
  uploadResume: vi.fn().mockResolvedValue({ url: 'https://blob.test/resume.pdf' }),
  submitApplication: vi.fn().mockResolvedValue({ id: 'app-uuid' }),
}))

import ApplicationForm from '../ApplicationForm'

const job = { id: 'uuid-1', title: 'Software Engineer' }

describe('ApplicationForm', () => {
  it('renders all required field labels', () => {
    render(<MemoryRouter><ApplicationForm job={job} /></MemoryRouter>)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<MemoryRouter><ApplicationForm job={job} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows live character count for cover letter', async () => {
    render(<MemoryRouter><ApplicationForm job={job} /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/cover letter/i), 'Hello there')
    expect(screen.getByText(/11 \/ 2000/)).toBeInTheDocument()
  })
})
