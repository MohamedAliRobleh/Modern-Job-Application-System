import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const { mockUseAuth, mockSignOut } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(() => ({ isSignedIn: false })),
  mockSignOut: vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: mockUseAuth,
  useClerk: vi.fn(() => ({ signOut: mockSignOut })),
}))

import Navbar from '../Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isSignedIn: false })
    mockSignOut.mockReset()
  })

  it('renders a navigation element', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('hides Admin Login when not signed in', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.queryByText(/admin login/i)).not.toBeInTheDocument()
  })

  it('renders Dashboard and Sign Out when signed in', () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
})
