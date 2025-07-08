// C:\ECOLINK\crud-clientes - v2.1\frontend\src\app\reset-password\page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthContext } from "../../contexts/AuthContext"

interface ResetPasswordFormProps {
  token: string
  onSuccess: () => void
}

export default function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const { confirmPasswordReset } = useAuthContext()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    try {
      const response = await confirmPasswordReset(token, password)
      if (!response.success) {
        setError(response.message || "Error al restablecer la contraseña")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => onSuccess(), 3000)
    } catch {
      setError("Error inesperado. Verifica tu conexión e intenta de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-4 shadow">
      <h2 className="text-center mb-4">Restablecer Contraseña</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Contraseña restablecida con éxito. Redirigiendo al login...
        </div>
      )}
      {!success && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Nueva Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
              style={{ backgroundColor: "#7ac943", borderColor: "#7ac943" }}
            >
              {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
            </button>
          </div>
        </form>
      )}
      <div className="mt-3 text-center">
        <Link href="/login" className="btn btn-link">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}