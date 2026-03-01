/** 남편/아내만 사용 → user1 / user2, 패스워드 없음 */
export type AppUserId = 'user1' | 'user2'

const STORAGE_KEY = 'han_cn_app_user'

export const APP_USER_DISPLAY_NAMES: Record<AppUserId, string> = {
  user1: '남편',
  user2: '아내',
}

export function getStoredAppUser(): AppUserId | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'user1' || v === 'user2') return v
    return null
  } catch {
    return null
  }
}

export function setStoredAppUser(userId: AppUserId | null): void {
  try {
    if (userId) localStorage.setItem(STORAGE_KEY, userId)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
