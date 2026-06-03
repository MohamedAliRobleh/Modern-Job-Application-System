// src/pages/__tests__/Apply.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: false }),
  useClerk: () => ({ signOut: vi.fn() }),
}))

vi.mock('../../lib/api', () => ({
  getJob: vi.fn().mockResolvedValue({ id: 'uuid-1', title: 'Software Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time' }),
  uploadResume: vi.fn(),
  submitApplication: vi.fn(),
}))

import Apply from '../Apply'

function renderApply() {
  return render(
    <MemoryRouter initialEntries={['/apply/uuid-1']}>
      <Routes><Route path="/apply/:id" element={<Apply />} /></Routes>
    </MemoryRouter>
  )
}

describe('Apply', () => {
  it('renders job title in heading after loading', async () => {
    renderApply()
    await waitFor(() => expect(screen.getByText(/Software Engineer/)).toBeInTheDocument())
  })

  it('renders the form with Full Name field', async () => {
    renderApply()
    await waitFor(() => expect(screen.getByLabelText(/full name/i)).toBeInTheDocument())
  })
})
