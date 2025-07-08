"use client"

import type React from "react"
import { useState } from "react"
import { useAuthContext } from "../../contexts/AuthContext"
import { RolUsuario } from "../../types"
import Link from "next/link"

export default function RegistroForm() {
  const { registro } = useAuthContext()
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [rol, setRol] = useState<RolUsuario>(RolUsuario.LECTOR)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    if (!email || !nombre) {
      setError("Por favor completa todos los campos")
      setIsLoading(false)
      return
    }

    try {
      const result = await registro(email, nombre, rol)
      if (result.success) {
        setSuccess(result.message)
        // Limpiar formulario
        setEmail("")
        setNombre("")
        setRol(RolUsuario.LECTOR)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Error al procesar la solicitud")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-4 shadow">
      <h2 className="text-center mb-4">Solicitar Registro</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
          <div className="mt-2">
            <Link
              href="/login"
              className="btn btn-sm"
              style={{ backgroundColor: "#7ac943", borderColor: "#7ac943", color: "white" }}
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
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
            disabled={isLoading || !!success}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre Completo
          </label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isLoading || !!success}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="rol" className="form-label">
            Tipo de Usuario
          </label>
          <select
            className="form-select"
            id="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as RolUsuario)}
            disabled={isLoading || !!success}
          >
            <option value={RolUsuario.LECTOR}>Lector</option>
            <option value={RolUsuario.OPERADOR}>Operador</option>
          </select>
          <div className="form-text">
            <ul className="mt-2 ps-3">
              <li>
                <strong>Lector:</strong> Solo puede ver información
              </li>
              <li>
                <strong>Operador:</strong> Puede crear y editar clientes
              </li>
            </ul>
          </div>
        </div>
        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: "#7ac943", borderColor: "#7ac943", color: "white" }}
            disabled={isLoading || !!success}
          >
            {isLoading ? "Enviando solicitud..." : "Solicitar Registro"}
          </button>
        </div>
      </form>
      <div className="mt-3 text-center">
        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" style={{ color: "#7ac943" }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
