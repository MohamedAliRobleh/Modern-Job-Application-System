import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders a contentinfo landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
