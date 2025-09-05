import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Layout from './Layout'
import Connections from './pages/Connections'
import History from './pages/History'
import QueryEditor from './pages/QueryEditor'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/queryeditor" replace />} />
          <Route path="/queryeditor" element={<QueryEditor />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
