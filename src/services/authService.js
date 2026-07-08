const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getAccessToken = () =>
  localStorage.getItem('access_token') || sessionStorage.getItem('access_token')

export const getRefreshToken = () =>
  localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
}

export const logout = async () => {
  const accessToken = getAccessToken()

  if (accessToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway:', error.message)
    }
  }

  clearTokens()
}
