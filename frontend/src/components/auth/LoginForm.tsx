"use client"

import type React from "react"
import { useState } from "react"
import { useAuthContext } from "../../contexts/AuthContext"
import Link from "next/link"

export default function LoginForm() {
  const { login, isLoading, error, requestPasswordReset } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) {
      setFormError("Por favor completa todos los campos")
      return
    }

    const success = await login(email, password)
    if (!success) {
      // El error ya se maneja en el hook
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setResetMessage(null)

    if (!resetEmail) {
      setFormError("Por favor ingresa tu correo electrónico")
      return
    }

    const response = await requestPasswordReset(resetEmail)
    if (response.success) {
      setResetMessage(response.message)
    } else {
      setFormError(response.message)
    }
  }

  const isEmailNotVerified = error?.includes("verificar tu correo electrónico")

  return (
    <div className="card p-4 shadow">
      <h2 className="text-center mb-4">
        {showResetForm ? "Restablecer Contraseña" : "Iniciar Sesión"}
      </h2>

      {(error || formError) && (
        <div className="alert alert-danger" role="alert">
          {formError || error}
          {isEmailNotVerified && (
            <div className="mt-2">
              <Link href="/reenviar-verificacion" className="btn btn-sm btn-outline-primary">
                Reenviar email de verificación
              </Link>
            </div>
          )}
        </div>
      )}

      {resetMessage && (
        <div className="alert alert-success" role="alert">
          {resetMessage}
        </div>
      )}

      {!showResetForm ? (
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
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
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
              style={{ backgroundColor: "#7ac943", borderColor: "#7ac943" }}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
          <div className="mt-3 text-center">
            <p>
              <button
                type="button"
                className="btn btn-link text-muted small"
                onClick={() => setShowResetForm(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit}>
          <div className="mb-3">
            <label htmlFor="resetEmail" className="form-label">
              Ingresa tu correo electrónico
            </label>
            <input
              type="email"
              className="form-control"
              id="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar enlace de restablecimiento"}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setShowResetForm(false)}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      )}

      <div className="mt-3 text-center">
        {!showResetForm && (
          <>
            <p>
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" style={{ color: "#7ac943" }}>
                Solicitar registro
              </Link>
            </p>
            {/* <p>
              <Link href="/registro" className="text-muted small">
                ¿No recibiste el email de verificación?
              </Link>
            </p> */}
          </>
        )}
      </div>
    </div>
  )
}