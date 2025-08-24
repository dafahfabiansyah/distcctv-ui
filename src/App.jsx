import './App.css'
import Sidebar from './components/sidebar'
import Topbar from './components/topbar'
import PipelinePage from './pipeline/PipelinePage'

function App() {

  return (
    <div className="flex h-screen">
      <Sidebar/>
      <div className="flex-1 flex flex-col">
        <Topbar/>
        <PipelinePage/>
      </div>
    </div>
  )
}

export default App
