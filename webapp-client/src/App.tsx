import { Show, SignIn, UserButton, UserProfile } from '@clerk/react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import PreferencesPage from './pages/PreferencesPage'

function App() {
  return (
    <>
      <Show when="signed-out">
        <SignIn />
      </Show>

      <Show when="signed-in">
        <header className="app-header">
          <nav>
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/account">Account</NavLink>
            <NavLink to="/preferences">Preferences</NavLink>
          </nav>
          <UserButton />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/account/*"
              element={<UserProfile routing="path" path="/account" />}
            />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Routes>
        </main>
      </Show>
    </>
  )
}

export default App
