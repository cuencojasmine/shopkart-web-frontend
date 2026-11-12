// Store Manager sign-in for the Product Management page (/products).
//
// Strapi (users-permissions, "refresh" mode) returns two tokens on sign-in:
// - jwt: short-lived access token, sent as "Authorization: Bearer <jwt>"
// - refreshToken: used to get a new jwt when the old one expires
// Both are kept in sessionStorage, so closing the tab signs the manager out.

interface ManagerSession {
  jwt: string
  refreshToken: string
  username: string
}

const SESSION_KEY = 'shopkart-manager-session'

export function useAuth() {
  const session = useState<ManagerSession | null>('manager-session', () => null)
  const { STRAPI_URL } = useStrapi()

  const isSignedIn = computed(() => !!session.value)
  const username = computed(() => session.value?.username || '')

  function saveSession(value: ManagerSession | null) {
    session.value = value
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value))
      else sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // Storage blocked (private mode): the session lasts until the page reloads.
    }
  }

  // Called once when /products opens.
  function restoreSession() {
    if (session.value) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
      if (saved?.jwt && saved?.refreshToken) session.value = saved
    } catch {
      session.value = null
    }
  }

  // POST /api/auth/local
  async function login(identifier: string, password: string) {
    const response = await $fetch<{ jwt: string, refreshToken: string, user: { username: string } }>(
      `${STRAPI_URL}/api/auth/local`,
      { method: 'POST', body: { identifier, password } },
    )
    saveSession({ jwt: response.jwt, refreshToken: response.refreshToken, username: response.user.username })
  }

  // POST /api/auth/refresh: trade the refresh token for a new jwt.
  async function refresh() {
    if (!session.value) return false
    try {
      const response = await $fetch<{ jwt: string, refreshToken: string }>(`${STRAPI_URL}/api/auth/refresh`, {
        method: 'POST',
        body: { refreshToken: session.value.refreshToken },
      })
      saveSession({ ...session.value, jwt: response.jwt, refreshToken: response.refreshToken })
      return true
    } catch {
      return false
    }
  }

  // $fetch with the manager's token. If the token expired (401), refresh it once
  // and retry; if that fails too, sign out so the page shows the sign-in form.
  async function authFetch<T = any>(path: string, options: Record<string, any> = {}): Promise<T> {
    const send = () =>
      $fetch<T>(`${STRAPI_URL}${path}`, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${session.value?.jwt}` },
      })

    try {
      return await send()
    } catch (error: any) {
      if (error?.statusCode !== 401) throw error
      if (await refresh()) return await send()
      saveSession(null)
      throw new Error('Your session has expired. Please sign in again.')
    }
  }

  // POST /api/auth/logout revokes the refresh token on the server too.
  async function logout() {
    const current = session.value
    saveSession(null)
    if (!current) return
    try {
      await $fetch(`${STRAPI_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${current.jwt}` },
        body: { refreshToken: current.refreshToken },
      })
    } catch {
      // Already signed out locally; an expired token on the server is fine.
    }
  }

  return { isSignedIn, username, restoreSession, login, logout, authFetch }
}
