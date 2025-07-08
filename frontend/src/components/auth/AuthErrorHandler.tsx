"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "../../contexts/AuthContext"

export default function AuthErrorHandler() {
  const { error, logout } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (error && error.includes("Sesión expirada")) {
      logout()
      router.push("/login")
    }
  }, [error, logout, router])

  return null
}
