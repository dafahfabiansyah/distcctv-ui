import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/sidebar'
import LoginPage from './components/LoginPage'
import DashboardPage from './dashboard/DashboardPage'
import PipelinePage from './pipeline/PipelinePage'
import OmnichannelPage from './omnichannel/OmnichannelPage'
import './App.css'
import Topbar from './components/topbar'

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <Topbar/>
          <Routes>
             <Route path="/" element={<Navigate to="/dashboard" replace />} />
             <Route path="/dashboard" element={<DashboardPage />} />
             <Route path="/pipeline" element={<PipelinePage />} />
             <Route path="/pipeline/:pipelineId" element={<PipelinePage />} />
             <Route path="/omnichannel" element={<OmnichannelPage />} />
           </Routes>
        </main>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
