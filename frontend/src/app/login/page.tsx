"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "../../components/auth/LoginForm"
import { useAuthContext } from "../../contexts/AuthContext"

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/clientes")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary-green" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
