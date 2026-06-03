import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }) => children,
  useAuth: vi.fn(() => ({ isSignedIn: false, isLoaded: true, getToken: vi.fn() })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
  SignIn: () => <div>Sign In</div>,
}))

vi.mock('../lib/api', () => ({
  getJobs: vi.fn().mockResolvedValue([]),
  getJob: vi.fn().mockResolvedValue(null),
}))

import App from '../App'

describe('App', () => {
  it('renders without crashing at /', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(document.body).toBeTruthy()
  })

  it('renders Clerk SignIn at /admin', () => {
    render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})
