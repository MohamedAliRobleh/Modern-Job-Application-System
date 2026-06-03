// src/components/__tests__/AdminRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(() => ({ isLoaded: false, isSignedIn: false })),
}))

vi.mock('@clerk/clerk-react', () => ({ useAuth: mockUseAuth }))

import AdminRoute from '../AdminRoute'

describe('AdminRoute', () => {
  beforeEach(() => mockUseAuth.mockReset())

  it('shows spinner while Clerk is loading', () => {
    mockUseAuth.mockReturnValue({ isLoaded: false, isSignedIn: false })
    render(<MemoryRouter><AdminRoute><div>Protected</div></AdminRoute></MemoryRouter>)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('redirects when not signed in', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false })
    render(<MemoryRouter><AdminRoute><div>Protected</div></AdminRoute></MemoryRouter>)
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when signed in', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true })
    render(<MemoryRouter><AdminRoute><div>Protected</div></AdminRoute></MemoryRouter>)
    expect(screen.getByText('Protected')).toBeInTheDocument()
  })
})
