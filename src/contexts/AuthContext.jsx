import { useState, useEffect, createContext, useContext } from 'react'
import { getBridgeToken, exchangeBridgeToken } from '../api/auth'
import { getBridgeTokenDirect, verifyToken } from '../services/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // Cek bridge token dari URL parameter (redirect dari Laravel)
      const urlParams = new URLSearchParams(window.location.search)
      const bridgeToken = urlParams.get('bridgeToken')
      
      if (bridgeToken) {
        try {
          console.log('Bridge token found in URL, exchanging...')
          // Exchange bridge token ke API token
          const exchangeResult = await exchangeBridgeToken(bridgeToken)
          if (exchangeResult.success) {
            const apiToken = exchangeResult.token
            const userData = exchangeResult.user
            
            // Simpan token dan user data
            localStorage.setItem('access_token', apiToken)
            localStorage.setItem('user', JSON.stringify(userData))
            setToken(apiToken)
            setUser(userData)
            
            // Hapus bridge token dari URL
            window.history.replaceState({}, document.title, window.location.pathname)
            console.log('Bridge token exchanged successfully')
            setLoading(false)
            return
          } else {
            console.error('Failed to exchange bridge token:', exchangeResult.error)
          }
        } catch (error) {
          console.error('Bridge token exchange error:', error)
        }
      }
      
      // Cek token tersimpan di localStorage
      const savedToken = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        
        // Verify token masih valid
        try {
          const result = await verifyToken(savedToken)
          if (result.success) {
            setUser(result.data.user)
            console.log('Token verified successfully')
          } else {
            // Token invalid, hapus dari localStorage
            console.log('Token invalid, clearing storage')
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          // Token verification failed, hapus dari localStorage
          console.log('Token verification failed:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      // Gunakan getBridgeToken untuk mendapatkan bridge token langsung
      const bridgeResult = await getBridgeToken(email, password)
      if (bridgeResult.success) {
        // Exchange bridge token ke API token
        const exchangeResult = await exchangeBridgeToken(bridgeResult.data.token)
        if (exchangeResult.success) {
          const apiToken = exchangeResult.token
          const userData = exchangeResult.user
          
          // Simpan token dan user data
          localStorage.setItem('access_token', apiToken)
          localStorage.setItem('user', JSON.stringify(userData))
          setToken(apiToken)
          setUser(userData)
          
          return {
            success: true,
            data: {
              access_token: apiToken,
              user: userData
            }
          }
        } else {
          throw new Error(exchangeResult.message || 'Failed to exchange bridge token')
        }
      } else {
        throw new Error(bridgeResult.message || 'Login failed')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call logout API if needed
      // await logoutAPI()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext