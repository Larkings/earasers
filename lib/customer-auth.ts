const CLIENT_ID   = 'b252c426-83c4-4469-8094-d30d22b8ac99'
const AUTH_URL    = 'https://shopify.com/authentication/25467387989/oauth/authorize'
const TOKEN_URL   = 'https://shopify.com/authentication/25467387989/oauth/token'
const LOGOUT_URL  = 'https://shopify.com/authentication/25467387989/logout'
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/account/callback`

// PKCE code verifier genereren (base64url, 32 random bytes)
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// SHA-256 challenge van de verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data   = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Genereer de Shopify OAuth login URL en sla PKCE state op in sessionStorage
export async function getLoginUrl(): Promise<string> {
  const verifier  = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state     = generateCodeVerifier() // random CSRF token

  sessionStorage.setItem('pkce_verifier', verifier)
  sessionStorage.setItem('oauth_state', state)

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    response_type:         'code',
    redirect_uri:          REDIRECT_URI,
    scope:                 'openid email customer-account-api:full',
    state,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
  })

  return `${AUTH_URL}?${params}`
}

// Wissel de auth code in voor tokens na de OAuth callback
export async function exchangeCodeForToken(code: string, state: string) {
  const savedState   = sessionStorage.getItem('oauth_state')
  const codeVerifier = sessionStorage.getItem('pkce_verifier')

  if (state !== savedState) throw new Error('Invalid state — possible CSRF attack')
  if (!codeVerifier)         throw new Error('Missing PKCE verifier')

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     CLIENT_ID,
      redirect_uri:  REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  })

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  const tokens = await res.json()

  // Sla token op als httpOnly cookie via server-side API route
  await fetch('/api/auth/set-token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens),
  })

  sessionStorage.removeItem('pkce_verifier')
  sessionStorage.removeItem('oauth_state')

  return tokens
}

// Uitloggen: verwijder cookie server-side, redirect naar Shopify logout
export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href =
    LOGOUT_URL + '?post_logout_redirect_uri=' + encodeURIComponent(window.location.origin)
}
