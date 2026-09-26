// Plain JS + Clerk's hosted script, since this is a static page with no
// build step (unlike webapp-client, which uses @clerk/react). Login,
// registration, and password reset are all handled by Clerk's own modal
// UI (openSignIn/openSignUp) — no custom forms needed here.

// Clerk's frontend API host is recoverable from the publishable key itself
// (base64("<frontend-api-host>$")) — this is how Clerk's own SDKs derive it.
function frontendApiFromPublishableKey(publishableKey) {
  const encoded = publishableKey.replace(/^pk_(test|live)_/, '')
  return atob(encoded).replace(/\$$/, '')
}

async function loadClerk() {
  const res = await fetch('/config.json')
  const { clerkPublishableKey } = await res.json()
  const frontendApi = frontendApiFromPublishableKey(clerkPublishableKey)

  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.clerkPublishableKey = clerkPublishableKey
    // Must be served from the Clerk Frontend API domain, not a generic CDN —
    // loading clerk.browser.js from e.g. jsdelivr fails to register Clerk's
    // UI components bundle ("Clerk was not loaded with Ui components").
    script.src = `https://${frontendApi}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`
    script.addEventListener('load', resolve)
    script.addEventListener('error', () => reject(new Error('Failed to load Clerk script')))
    document.head.appendChild(script)
  })

  await window.Clerk.load()
  return window.Clerk
}

function renderAuthState(clerk) {
  const authButtons = document.getElementById('auth-buttons')
  const userButtonEl = document.getElementById('user-button')

  if (clerk.user) {
    authButtons.hidden = true
    userButtonEl.hidden = false
    clerk.mountUserButton(userButtonEl)
  } else {
    clerk.unmountUserButton(userButtonEl)
    authButtons.hidden = false
    userButtonEl.hidden = true
  }
}

loadClerk().then((clerk) => {
  renderAuthState(clerk)
  clerk.addListener(() => renderAuthState(clerk))

  document.getElementById('login').addEventListener('click', () => clerk.openSignIn())
  document.getElementById('register').addEventListener('click', () => clerk.openSignUp())
})
