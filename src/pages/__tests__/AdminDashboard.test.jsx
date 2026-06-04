// src/pages/__tests__/AdminDashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockGetToken = vi.fn().mockResolvedValue('test-token')

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: true, isLoaded: true, getToken: mockGetToken }),
  useClerk: () => ({ signOut: vi.fn() }),
}))

vi.mock('../../lib/api', () => ({
  getAdminStats: vi.fn().mockResolvedValue({ total: '10', new_count: '3', interview_count: '2', this_week: '4' }),
  getAdminApplications: vi.fn().mockResolvedValue({
    data: [{
      id: 'app-1', full_name: 'Jane Doe', email: 'jane@example.com',
      job_title: 'Software Engineer', years_experience: '3-5 years',
      availability: 'Immediately', expected_salary: '80k',
      status: 'New', created_at: '2026-06-01T10:00:00Z',
    }],
    total: 1, page: 1, totalPages: 1,
  }),
  updateApplication: vi.fn().mockResolvedValue({ id: 'app-1', status: 'Reviewing' }),
  deleteApplication: vi.fn().mockResolvedValue(undefined),
}))

import AdminDashboard from '../AdminDashboard'

describe('AdminDashboard', () => {
  it('renders total stat card', async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
  })

  it('renders applicant row in table', async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument())
  })

  it('renders search input in filter bar', async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>)
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument())
  })
})
