import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DeleteAccount from './pages/DeleteAccount'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
      </Routes>
    </Layout>
  )
}

export default App

