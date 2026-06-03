import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: false }),
  useClerk: () => ({ signOut: vi.fn() }),
}))

vi.mock('../../lib/api', () => ({
  getJobs: vi.fn().mockResolvedValue([
    { id: '1', title: 'Software Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Build.', salary_range: '70k' },
  ]),
}))

import Home from '../Home'

describe('Home', () => {
  it('renders the hero "WE\'RE HIRING" pill', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    expect(screen.getByText(/we're hiring/i)).toBeInTheDocument()
  })

  it('renders job listing after fetch resolves', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Software Engineer')).toBeInTheDocument())
  })

  it('renders Navbar and Footer', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
