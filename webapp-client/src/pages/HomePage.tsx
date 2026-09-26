import { useUser } from '@clerk/react'

function HomePage() {
  const { user } = useUser()

  return (
    <section>
      <h1>Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h1>
      <p>
        You're signed in. Use <strong>Account</strong> to manage your profile
        and security settings, or <strong>Preferences</strong> to change
        app-specific settings.
      </p>
    </section>
  )
}

export default HomePage
