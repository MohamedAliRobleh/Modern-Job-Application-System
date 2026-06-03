import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import JobCard from '../JobCard'

const job = {
  id: 'uuid-1',
  title: 'Software Engineer',
  department: 'Engineering',
  location: 'Remote',
  type: 'Full-time',
  description: 'Build amazing things.',
  salary_range: '70,000 – 95,000 CAD',
}

describe('JobCard', () => {
  it('renders job title', () => {
    render(<MemoryRouter><JobCard job={job} index={0} /></MemoryRouter>)
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  })

  it('renders department badge', () => {
    render(<MemoryRouter><JobCard job={job} index={0} /></MemoryRouter>)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('renders salary range', () => {
    render(<MemoryRouter><JobCard job={job} index={0} /></MemoryRouter>)
    expect(screen.getByText(/70,000/)).toBeInTheDocument()
  })

  it('links to job detail page', () => {
    render(<MemoryRouter><JobCard job={job} index={0} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/jobs/uuid-1')
  })
})
