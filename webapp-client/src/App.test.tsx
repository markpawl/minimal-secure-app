import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

const { mockUpdate, mockUser } = vi.hoisted(() => {
  const mockUpdate = vi.fn().mockResolvedValue(undefined)
  return {
    mockUpdate,
    mockUser: {
      firstName: 'Ada',
      unsafeMetadata: {} as Record<string, unknown>,
      update: mockUpdate,
    },
  }
})

// Stand in for Clerk's components so tests don't hit the network. `Show`
// renders both branches unconditionally — real sign-in/sign-out gating is
// Clerk's responsibility, not something this app needs to re-test.
vi.mock('@clerk/react', () => ({
  Show: ({ children }: { children: ReactNode }) => children,
  SignIn: () => <div>Sign in mock</div>,
  UserButton: () => <div>User button mock</div>,
  UserProfile: () => <div>User profile mock</div>,
  useUser: () => ({ isLoaded: true, isSignedIn: true, user: mockUser }),
}))

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders the sign-in UI', () => {
    renderApp()
    expect(screen.getByText('Sign in mock')).toBeInTheDocument()
  })

  it('renders the authenticated shell with nav and user button', () => {
    renderApp()
    expect(screen.getByText('User button mock')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Preferences' })).toBeInTheDocument()
  })

  it('renders the home page with the signed-in user name', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: /welcome, ada/i })).toBeInTheDocument()
  })

  it('renders the Clerk UserProfile on the account route', () => {
    renderApp('/account')
    expect(screen.getByText('User profile mock')).toBeInTheDocument()
  })

  it('saves preference changes via user.update', async () => {
    renderApp('/preferences')
    const darkThemeCheckbox = screen.getByRole('checkbox', { name: /dark theme/i })
    fireEvent.click(darkThemeCheckbox)
    expect(mockUpdate).toHaveBeenCalledWith({
      unsafeMetadata: { darkTheme: true, emailNotifications: true },
    })
  })
})
