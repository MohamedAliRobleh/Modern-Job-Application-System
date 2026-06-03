import { Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

export default function AdminRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isSignedIn) return <Navigate to="/admin" replace />

  return children
}
