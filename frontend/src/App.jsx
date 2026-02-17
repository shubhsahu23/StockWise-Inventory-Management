import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import StockHistory from './pages/StockHistory.jsx'
import Users from './pages/Users.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN', 'STAFF']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute roles={['ADMIN', 'STAFF']}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-history"
            element={
              <ProtectedRoute roles={['ADMIN', 'STAFF']}>
                <StockHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
