import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
}))

import Navbar from '../Navbar'

describe('Navbar', () => {
  it('renders a navigation element', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders Admin Login link when not signed in', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText(/admin login/i)).toBeInTheDocument()
  })
})
