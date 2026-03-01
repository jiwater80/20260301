import { useState, useEffect } from 'react'
import {
  getStoredAppUser,
  setStoredAppUser,
  APP_USER_DISPLAY_NAMES,
  type AppUserId,
} from '@/stores/appUserStore'

export interface AppUser {
  id: AppUserId
  displayName: string
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => {
    const id = getStoredAppUser()
    return id ? { id, displayName: APP_USER_DISPLAY_NAMES[id] } : null
  })

  useEffect(() => {
    const id = getStoredAppUser()
    setUser(id ? { id, displayName: APP_USER_DISPLAY_NAMES[id] } : null)
  }, [])

  const signIn = (userId: AppUserId) => {
    setStoredAppUser(userId)
    setUser({ id: userId, displayName: APP_USER_DISPLAY_NAMES[userId] })
  }

  const signOut = () => {
    setStoredAppUser(null)
    setUser(null)
  }

  return {
    user,
    loading: false,
    signIn,
    signUp: async () => {},
    signOut,
  }
}
