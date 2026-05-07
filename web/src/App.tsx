import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import IOSInstallPrompt from './components/IOSInstallPrompt'
import Home from './pages/Home'
import Adkar from './pages/Adkar'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DeleteAccount from './pages/DeleteAccount'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/morning" element={<Adkar type="morning" />} />
        <Route path="/evening" element={<Adkar type="evening" />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
      </Routes>
      <IOSInstallPrompt />
    </Layout>
  )
}

export default App
