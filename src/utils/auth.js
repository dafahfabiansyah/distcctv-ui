// utils/auth.js

const TOKEN_KEY = 'crm_access_token'
const USER_KEY = 'crm_user_data'

/**
 * Menyimpan token ke localStorage
 * @param {string} token - API token yang akan disimpan
 */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Mengambil token dari localStorage
 * @returns {string|null} Token yang tersimpan atau null jika tidak ada
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Menyimpan data user ke localStorage
 * @param {object} userData - Data user yang akan disimpan
 */
export const saveUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData))
}

/**
 * Mengambil data user dari localStorage
 * @returns {object|null} Data user atau null jika tidak ada
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY)
  return userData ? JSON.parse(userData) : null
}

/**
 * Mengecek apakah user sudah terautentikasi
 * @returns {boolean} True jika ada token, false jika tidak
 */
export const isAuthenticated = () => {
  const token = getToken()
  return token !== null && token !== undefined && token !== ''
}

/**
 * Menghapus token dan data user dari localStorage (logout)
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Mendapatkan header Authorization untuk API request
 * @returns {object} Header object dengan Authorization bearer token
 */
export const getAuthHeaders = () => {
  const token = getToken()
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  }
}