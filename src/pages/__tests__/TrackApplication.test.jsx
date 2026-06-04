import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  getApplicationStatus: vi.fn().mockResolvedValue({
    status: 'Interview',
    job_title: 'Senior Engineer',
    full_name: 'Jane Doe',
    created_at: '2026-06-04T10:00:00Z',
  }),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
}))

import TrackApplication from '../TrackApplication'

describe('TrackApplication', () => {
  it('renders applicant name and job title after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/track/test-token-123']}>
        <Routes>
          <Route path="/track/:token" element={<TrackApplication />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument())
    expect(screen.getByText(/Senior Engineer/i)).toBeInTheDocument()
  })

  it('renders the current status badge', async () => {
    render(
      <MemoryRouter initialEntries={['/track/test-token-123']}>
        <Routes>
          <Route path="/track/:token" element={<TrackApplication />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getAllByText(/Interview/i).length).toBeGreaterThan(0))
  })
})
