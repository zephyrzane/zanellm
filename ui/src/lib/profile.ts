const AVATAR_STORAGE_KEY = 'zanellm_avatar'
const PROFILE_SETUP_STORAGE_KEY = 'zanellm_profile_setup_complete'
const PROFILE_EVENT = 'zanellm-profile-change'

export function getStoredAvatar(): string | null {
  return localStorage.getItem(AVATAR_STORAGE_KEY)
}

export function saveAvatar(value: string | null) {
  if (value) {
    localStorage.setItem(AVATAR_STORAGE_KEY, value)
  } else {
    localStorage.removeItem(AVATAR_STORAGE_KEY)
  }
  window.dispatchEvent(new Event(PROFILE_EVENT))
}

export function isProfileSetupComplete(): boolean {
  return localStorage.getItem(PROFILE_SETUP_STORAGE_KEY) === 'true'
}

export function markProfileSetupComplete() {
  localStorage.setItem(PROFILE_SETUP_STORAGE_KEY, 'true')
  window.dispatchEvent(new Event(PROFILE_EVENT))
}

export function subscribeProfileChanges(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === AVATAR_STORAGE_KEY || event.key === PROFILE_SETUP_STORAGE_KEY) callback()
  }
  window.addEventListener(PROFILE_EVENT, callback)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(PROFILE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}
