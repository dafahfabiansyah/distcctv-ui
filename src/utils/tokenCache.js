// Token caching utility to avoid repeated verification calls
// This helps reduce server load and improve user experience

const TOKEN_CACHE_KEY = 'token_last_verified'
const TOKEN_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Check if token was recently verified (within cache duration)
 * @returns {boolean} True if token was recently verified
 */
export const isTokenRecentlyVerified = () => {
  const lastVerified = localStorage.getItem(TOKEN_CACHE_KEY)
  if (!lastVerified) return false
  
  const timeDiff = Date.now() - parseInt(lastVerified)
  return timeDiff < TOKEN_CACHE_DURATION
}

/**
 * Mark token as recently verified
 */
export const setTokenVerified = () => {
  localStorage.setItem(TOKEN_CACHE_KEY, Date.now().toString())
}

/**
 * Clear token verification cache
 */
export const clearTokenCache = () => {
  localStorage.removeItem(TOKEN_CACHE_KEY)
}

/**
 * Get time remaining until token needs re-verification
 * @returns {number} Milliseconds remaining, or 0 if needs verification
 */
export const getTokenCacheTimeRemaining = () => {
  const lastVerified = localStorage.getItem(TOKEN_CACHE_KEY)
  if (!lastVerified) return 0
  
  const timeDiff = Date.now() - parseInt(lastVerified)
  const remaining = TOKEN_CACHE_DURATION - timeDiff
  return Math.max(0, remaining)
}

/**
 * Check if token cache is expired
 * @returns {boolean} True if cache is expired
 */
export const isTokenCacheExpired = () => {
  return !isTokenRecentlyVerified()
}