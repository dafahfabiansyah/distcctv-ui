import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Sidebar from './components/sidebar'
import Topbar from './components/topbar'
import DashboardPage from './dashboard/DashboardPage'
import PipelinePage from './pipeline/PipelinePage'
import OmnichannelPage from './omnichannel/OmnichannelPage'

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar/>
        <div className="flex-1 flex flex-col">
          <Topbar/>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/omnichannel" element={<OmnichannelPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
