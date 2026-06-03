import { render, screen } from '@testing-library/react'
import StatusBadge from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders "New"', () => {
    render(<StatusBadge status="New" />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders "Interview"', () => {
    render(<StatusBadge status="Interview" />)
    expect(screen.getByText('Interview')).toBeInTheDocument()
  })

  it('renders "Rejected"', () => {
    render(<StatusBadge status="Rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })
})
