// utils/tokenHandler.js

/**
 * Mengambil token dari URL parameter
 * @returns {string|null} Token dari URL parameter atau null jika tidak ada
 */
export const getTokenFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('token')
}

/**
 * Menghapus token dari URL tanpa reload halaman
 */
export const removeTokenFromURL = () => {
  const url = new URL(window.location)
  url.searchParams.delete('token')
  window.history.replaceState({}, document.title, url.pathname)
}