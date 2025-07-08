// C:\ECOLINK\crud-clientes - v2.1\frontend\src\hooks\useAuth.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { type Usuario, RolUsuario, type SolicitudRegistro, type AuthState } from "../types"
import {
  login,
  registro,
  obtenerSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  actualizarPerfil,
  verificarEmail,
  reenviarVerificacion,
  requestPasswordReset,
  confirmPasswordReset, // Importación correcta
} from "../services/api/auth"
import { useRouter } from "next/navigation"

export default function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    usuario: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })
  const [solicitudes, setSolicitudes] = useState<SolicitudRegistro[]>([])
  const [solicitudesLoading, setSolicitudesLoading] = useState(false)

  // --- CONSTANTES DE TIMEOUT ---
  const SESSION_TIMEOUT_MINUTES = 20;
  const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
  const LAST_ACCESS_KEY = "last_access";

  // --- FUNCIONES DE TIMEOUT ---
  const updateLastAccess = () => {
    localStorage.setItem(LAST_ACCESS_KEY, Date.now().toString());
  };

  const isSessionExpired = () => {
    const lastAccess = localStorage.getItem(LAST_ACCESS_KEY);
    if (!lastAccess) return false;
    return Date.now() - parseInt(lastAccess, 10) > SESSION_TIMEOUT_MS;
  };

  // --- Cerrar sesión y redirigir si expira ---
  const handleSessionTimeout = useCallback(() => {
    if (isSessionExpired()) {
      handleLogout();
      router.replace("/login");
    }
  }, [router]);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      if (isSessionExpired()) {
        handleLogout();
        router.replace("/login");
        return;
      }
      try {
        const token = localStorage.getItem("token")
        const usuarioStr = localStorage.getItem("usuario")

        if (token && usuarioStr) {
          try {
            const usuario = JSON.parse(usuarioStr) as Usuario
            setAuthState({
              usuario,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } catch (error) {
            console.error("Error al parsear usuario:", error)
            localStorage.removeItem("token")
            localStorage.removeItem("usuario")
            setAuthState({
              usuario: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: "Sesión inválida",
            })
          }
        } else {
          setAuthState({
            usuario: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error)
        setAuthState({
          usuario: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Error al cargar sesión",
        })
      }
      updateLastAccess();
    }

    loadUser()
    // Comprobar timeout cada minuto mientras la app está abierta
    const interval = setInterval(() => {
      handleSessionTimeout();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [router, handleSessionTimeout])

  // Iniciar sesión
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await login(email, password)

      if (!response.success) {
        const errorMsg = response.errors?.[0]?.message || "Error al iniciar sesión"
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }))
        return false
      }

      const { usuario, token } = response.data!

      // Guardar en localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("usuario", JSON.stringify(usuario))

      setAuthState({
        usuario,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      updateLastAccess();

      return true
    } catch (error) {
      console.error("Error en login:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error al conectar con el servidor",
      }))
      return false
    }
  }

  // Cerrar sesión
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    localStorage.removeItem(LAST_ACCESS_KEY)
    setAuthState({
      usuario: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }, [])

  // Registrar nuevo usuario
  const handleRegistro = async (
    email: string,
    nombre: string,
    rol: RolUsuario,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await registro(email, nombre, rol)

      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al registrar usuario",
        }
      }

      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error en registro:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  // Verificar email
  const handleVerificarEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await verificarEmail(token)

      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al verificar email",
        }
      }

      const { usuario, token: jwtToken, message } = response.data!
      // Guardar en localStorage
      localStorage.setItem("token", jwtToken)
      localStorage.setItem("usuario", JSON.stringify(usuario))
      // Actualizar estado de autenticación
      setAuthState({
        usuario,
        token: jwtToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      updateLastAccess();

      return {
        success: true,
        message,
      }
    } catch (error) {
      console.error("Error al verificar email:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  // Reenviar verificación
  const handleReenviarVerificacion = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await reenviarVerificacion(email)

      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al reenviar verificación",
        }
      }

      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error al reenviar verificación:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  // Cargar solicitudes pendientes (solo para ADMIN)
  const loadSolicitudes = useCallback(async (): Promise<void> => {
    console.log("loadSolicitudes llamado, usuario actual:", authState.usuario?.rol)

    if (!authState.usuario || authState.usuario.rol !== RolUsuario.ADMIN) {
      console.log("Usuario no es ADMIN, no cargando solicitudes")
      return
    }

    setSolicitudesLoading(true)
    try {
      console.log("Haciendo petición a la API para obtener solicitudes...")
      const response = await obtenerSolicitudes()
      console.log("Respuesta de solicitudes:", response)

      if (response.success) {
        console.log("Solicitudes obtenidas exitosamente:", response.data)
        setSolicitudes(response.data!)
      } else {
        console.error("Error al cargar solicitudes:", response.errors)
      }
    } catch (error) {
      console.error("Error al cargar solicitudes:", error)
    } finally {
      setSolicitudesLoading(false)
    }
  }, [authState.usuario])

  // Aprobar solicitud (solo para ADMIN)
  const handleAprobarSolicitud = async (
    solicitudId: number,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await aprobarSolicitud(solicitudId, password)

      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al aprobar solicitud",
        }
      }

      // Actualizar lista de solicitudes
      await loadSolicitudes()

      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error al aprobar solicitud:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  // Rechazar solicitud (solo para ADMIN)
  const handleRechazarSolicitud = async (
    solicitudId: number,
    motivo?: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await rechazarSolicitud(solicitudId, motivo)

      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al rechazar solicitud",
        }
      }

      // Actualizar lista de solicitudes
      await loadSolicitudes()

      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error al rechazar solicitud:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  // Actualizar perfil
  const handleActualizarPerfil = async (nombre: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await actualizarPerfil(nombre)

      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al actualizar perfil",
        }
      }

      // Actualizar el usuario en el estado y localStorage
      const usuarioActualizado = response.data!.usuario
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado))
      setAuthState((prev) => ({
        ...prev,
        usuario: usuarioActualizado,
      }))

      updateLastAccess();

      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  // Verificar si el usuario tiene permisos para una acción
  const hasPermission = useCallback(
    (requiredRoles: RolUsuario[]): boolean => {
      if (!authState.isAuthenticated || !authState.usuario) return false
      return requiredRoles.includes(authState.usuario.rol)
    },
    [authState.isAuthenticated, authState.usuario],
  )

  const handleRequestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await requestPasswordReset(email)
      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al solicitar restablecimiento",
        }
      }
      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  const handleConfirmPasswordReset = async (
    token: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await confirmPasswordReset(token, password)
      if (!response.success) {
        return {
          success: false,
          message: response.errors?.[0]?.message || "Error al restablecer la contraseña",
        }
      }
      return {
        success: true,
        message: response.data!.message,
      }
    } catch (error) {
      console.error("Error al confirmar restablecimiento:", error)
      return {
        success: false,
        message: "Error al conectar con el servidor",
      }
    }
  }

  return {
    ...authState,
    solicitudes,
    solicitudesLoading,
    login: handleLogin,
    logout: handleLogout,
    registro: handleRegistro,
    verificarEmail: handleVerificarEmail,
    reenviarVerificacion: handleReenviarVerificacion,
    confirmPasswordReset: handleConfirmPasswordReset, // CORRECCIÓN: Usar handleConfirmPasswordReset
    requestPasswordReset: handleRequestPasswordReset,
    loadSolicitudes,
    aprobarSolicitud: handleAprobarSolicitud,
    rechazarSolicitud: handleRechazarSolicitud,
    actualizarPerfil: handleActualizarPerfil,
    hasPermission,
  }
}