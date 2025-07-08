"use client"

import ProtectedRoute from "../../components/auth/ProtectedRoute"
import UserProfile from "../../components/auth/UserProfile"

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <UserProfile />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
