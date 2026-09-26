import { useUser } from '@clerk/react'
import { useState } from 'react'

// Preferences are app-specific data Clerk doesn't model itself, so they're
// stored on the Clerk user's `unsafeMetadata` (client-writable, small
// key-value data). This avoids standing up a database just for this starter;
// revisit with a real per-user datastore in application-server if the app's
// preferences ever outgrow simple key-value settings (see auth-server/README.md).
interface Preferences {
  darkTheme: boolean
  emailNotifications: boolean
}

const defaultPreferences: Preferences = {
  darkTheme: false,
  emailNotifications: true,
}

function PreferencesPage() {
  const { user, isLoaded } = useUser()
  const [isSaving, setIsSaving] = useState(false)

  if (!isLoaded || !user) {
    return <p>Loading…</p>
  }

  const preferences: Preferences = {
    ...defaultPreferences,
    ...(user.unsafeMetadata as Partial<Preferences>),
  }

  async function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setIsSaving(true)
    try {
      await user!.update({ unsafeMetadata: { ...preferences, [key]: value } })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <h1>Preferences</h1>
      <label>
        <input
          type="checkbox"
          checked={preferences.darkTheme}
          disabled={isSaving}
          onChange={(e) => setPreference('darkTheme', e.target.checked)}
        />
        Dark theme
      </label>
      <label>
        <input
          type="checkbox"
          checked={preferences.emailNotifications}
          disabled={isSaving}
          onChange={(e) => setPreference('emailNotifications', e.target.checked)}
        />
        Email notifications
      </label>
      {isSaving && <p role="status">Saving…</p>}
    </section>
  )
}

export default PreferencesPage
