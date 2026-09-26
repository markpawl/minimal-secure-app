import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

// Stand in for Clerk's components so tests don't hit the network. `Show`
// renders both branches unconditionally — real sign-in/sign-out gating is
// Clerk's responsibility, not something this app needs to re-test.
vi.mock('@clerk/react', () => ({
  Show: ({ children }: { children: ReactNode }) => children,
  SignIn: () => <div>Sign in mock</div>,
  UserButton: () => <div>User button mock</div>,
}))

describe('App', () => {
  it('renders the sign-in UI', () => {
    render(<App />)
    expect(screen.getByText('Sign in mock')).toBeInTheDocument()
  })

  it('renders the authenticated app shell', () => {
    render(<App />)
    expect(screen.getByText('User button mock')).toBeInTheDocument()
  })

  it('increments the counter on click', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is 0/i })
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 1')
  })
})
