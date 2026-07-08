import { useEffect, useState } from 'react'
import { getAccessToken } from './authService'

// Fetches the logged-in user's profile from /api/auth/me.
// Returns { user, isLoading, error } so components can branch on loading/role.
export const useCurrentUser = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = getAccessToken()

      if (!accessToken) {
        setError('No active session.')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load user.");
        }

        setUser({
          ...result.data.user,
          profile: result.data.profile,
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [])

  return { user, isLoading, error }
}