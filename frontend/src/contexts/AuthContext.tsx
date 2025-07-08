// C:\ECOLINK\crud-clientes - v2.1\frontend\src\contexts\AuthContext.tsx
"use client"

import { createContext, useContext, type ReactNode } from "react"
import useAuth from "../hooks/useAuth"
import type { Usuario, RolUsuario, SolicitudRegistro } from "../types"

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  solicitudes: SolicitudRegistro[]
  solicitudesLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  registro: (email: string, nombre: string, rol: RolUsuario) => Promise<{ success: boolean; message: string }>
  verificarEmail: (token: string) => Promise<{ success: boolean; message: string }>
  reenviarVerificacion: (email: string) => Promise<{ success: boolean; message: string }>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }> // NUEVA FUNCIÓN
  confirmPasswordReset: (token: string, password: string) => Promise<{ success: boolean; message: string }>// NUEVA FUNCIÓN
  loadSolicitudes: () => Promise<void>
  aprobarSolicitud: (solicitudId: number, password: string) => Promise<{ success: boolean; message: string }>
  rechazarSolicitud: (solicitudId: number, motivo?: string) => Promise<{ success: boolean; message: string }>
  actualizarPerfil: (nombre: string) => Promise<{ success: boolean; message: string }>
  hasPermission: (requiredRoles: RolUsuario[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext debe ser usado dentro de un AuthProvider")
  }
  return context
}

// Exportación por defecto también
export default AuthContext