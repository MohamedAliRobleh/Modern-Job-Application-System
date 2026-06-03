import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import JobsGrid from '../JobsGrid'

const jobs = [
  { id: '1', title: 'Software Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Build.', salary_range: '70k' },
  { id: '2', title: 'Product Manager', department: 'Product', location: 'Ottawa', type: 'Full-time', description: 'Manage.', salary_range: '90k' },
  { id: '3', title: 'UX Designer', department: 'Design', location: 'Remote', type: 'Contract', description: 'Design.', salary_range: '65k' },
]

describe('JobsGrid', () => {
  it('renders all jobs with no filters', () => {
    render(<MemoryRouter><JobsGrid jobs={jobs} loading={false} /></MemoryRouter>)
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Product Manager')).toBeInTheDocument()
    expect(screen.getByText('UX Designer')).toBeInTheDocument()
  })

  it('filters by search query', () => {
    render(<MemoryRouter><JobsGrid jobs={jobs} loading={false} /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'designer' } })
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
    expect(screen.getByText('UX Designer')).toBeInTheDocument()
  })

  it('filters by type pill', () => {
    render(<MemoryRouter><JobsGrid jobs={jobs} loading={false} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /^contract$/i }))
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
    expect(screen.getByText('UX Designer')).toBeInTheDocument()
  })

  it('shows no-results message with clear button', () => {
    render(<MemoryRouter><JobsGrid jobs={jobs} loading={false} /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'xyznotfound' } })
    expect(screen.getByText(/no positions found/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
  })

  it('renders 6 skeleton cards while loading', () => {
    render(<MemoryRouter><JobsGrid jobs={[]} loading={true} /></MemoryRouter>)
    expect(screen.getAllByRole('status')).toHaveLength(6)
  })
})
