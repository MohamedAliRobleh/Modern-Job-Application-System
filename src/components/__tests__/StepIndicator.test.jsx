import { render, screen } from '@testing-library/react'
import StepIndicator from '../StepIndicator'

const STEPS = ['Infos personnelles', 'CV & Motivation', 'Finaliser']

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />)
    expect(screen.getByText('Infos personnelles')).toBeInTheDocument()
    expect(screen.getByText('CV & Motivation')).toBeInTheDocument()
    expect(screen.getByText('Finaliser')).toBeInTheDocument()
  })

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />)
    const checks = screen.getAllByText('✓')
    expect(checks.length).toBe(2)
  })

  it('shows step number for current and future steps', () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
