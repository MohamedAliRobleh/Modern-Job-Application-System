// src/pages/__tests__/JobDetail.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: false }),
  useClerk: () => ({ signOut: vi.fn() }),
}))

vi.mock('../../lib/api', () => ({
  getJob: vi.fn().mockResolvedValue({
    id: 'uuid-1',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build scalable apps.',
    requirements: '3+ years React.',
    salary_range: '70,000 – 95,000 CAD',
  }),
}))

import JobDetail from '../JobDetail'

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/jobs/uuid-1']}>
      <Routes><Route path="/jobs/:id" element={<JobDetail />} /></Routes>
    </MemoryRouter>
  )
}

describe('JobDetail', () => {
  it('renders job title after loading', async () => {
    renderDetail()
    await waitFor(() => expect(screen.getByText('Software Engineer')).toBeInTheDocument())
  })

  it('has Apply Now link pointing to /apply/:id', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /apply now/i })).toHaveAttribute('href', '/apply/uuid-1')
    })
  })

  it('renders salary and location', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText(/Remote/)).toBeInTheDocument()
      expect(screen.getByText(/70,000/)).toBeInTheDocument()
    })
  })
})
