import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import NewListingPage from './pages/NewListingPage'
import NegotiationPage from './pages/NegotiationPage'
import './App.css'

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  if (!token) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/new-listing" 
          element={
            <ProtectedRoute>
              <NewListingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/negotiation/:listing_id" 
          element={
            <ProtectedRoute>
              <NegotiationPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
