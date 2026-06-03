// src/components/__tests__/SuccessModal.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SuccessModal from '../SuccessModal'

const props = { show: true, name: 'Jane Doe', jobTitle: 'Software Engineer', onClose: vi.fn() }

describe('SuccessModal', () => {
  beforeEach(() => {
    props.onClose.mockClear()
  })

  it('renders name and job title when show=true', () => {
    render(<MemoryRouter><SuccessModal {...props} /></MemoryRouter>)
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Software Engineer/)).toBeInTheDocument()
  })

  it('calls onClose when Close button clicked', () => {
    render(<MemoryRouter><SuccessModal {...props} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(props.onClose).toHaveBeenCalled()
  })

  it('renders nothing when show=false', () => {
    render(<MemoryRouter><SuccessModal {...props} show={false} /></MemoryRouter>)
    expect(screen.queryByText(/Jane Doe/)).not.toBeInTheDocument()
  })
})
