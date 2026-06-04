import { render, screen } from '@testing-library/react'
import CultureSection from '../CultureSection'

describe('CultureSection', () => {
  it('renders all perk titles', () => {
    render(<CultureSection />)
    expect(screen.getByText('Full Remote')).toBeInTheDocument()
    expect(screen.getByText('Health & Wellness')).toBeInTheDocument()
    expect(screen.getByText('Learning Budget')).toBeInTheDocument()
  })

  it('renders all testimonial names', () => {
    render(<CultureSection />)
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Marcus Diallo')).toBeInTheDocument()
    expect(screen.getByText('Amina Traoré')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<CultureSection />)
    expect(screen.getByText(/Life at/i)).toBeInTheDocument()
  })
})
