import { SignIn } from '@clerk/clerk-react'
export default function AdminLogin() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <SignIn routing="path" path="/admin" redirectUrl="/admin/dashboard" />
    </div>
  )
}
