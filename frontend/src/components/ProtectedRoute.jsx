import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
