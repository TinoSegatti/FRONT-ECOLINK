"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "../../contexts/AuthContext"
import type { RolUsuario } from "../../types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: RolUsuario[]
}

export default function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, usuario } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && isAuthenticated && requiredRoles.length > 0) {
      if (!usuario || !requiredRoles.includes(usuario.rol)) {
        router.push("/acceso-denegado")
      }
    }
  }, [isLoading, isAuthenticated, usuario, requiredRoles, router])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary-green" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles.length > 0 && (!usuario || !requiredRoles.includes(usuario.rol))) {
    return null
  }

  return <>{children}</>
}
