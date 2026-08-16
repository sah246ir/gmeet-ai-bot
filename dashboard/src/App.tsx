import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { MeetingDetailPage } from './pages/MeetingDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/meeting/:meetingId" element={<MeetingDetailPage />} />
    </Routes>
  )
}

export default App
