import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import IOSInstallPrompt from './components/IOSInstallPrompt'
import Home from './pages/Home'
import PwaHome from './pages/PwaHome'
import Adkar from './pages/Adkar'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DeleteAccount from './pages/DeleteAccount'
import { isPWA } from './lib/pwa'

function App() {
  const pwa = isPWA()

  return (
    <Layout pwa={pwa}>
      <Routes>
        <Route path="/" element={pwa ? <PwaHome /> : <Home />} />
        <Route path="/morning" element={<Adkar type="morning" />} />
        <Route path="/evening" element={<Adkar type="evening" />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
      </Routes>
      {!pwa && <IOSInstallPrompt />}
    </Layout>
  )
}

export default App
