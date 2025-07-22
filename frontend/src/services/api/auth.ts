// C:\ECOLINK\crud-clientes - v2.1\frontend\src\services\api\auth.ts
import { z } from "zod"
import { RolUsuario, type Usuario, type SolicitudRegistro } from "../../types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const API_URL = `${BASE_URL}/api`

// Esquemas Zod para validación
const UsuarioSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  nombre: z.string(),
  rol: z.nativeEnum(RolUsuario),
  activo: z.boolean(),
  verificado: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const LoginResponseSchema = z.object({
  usuario: UsuarioSchema,
  token: z.string(),
})

const SolicitudRegistroSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  nombre: z.string(),
  rol: z.nativeEnum(RolUsuario),
  tokenVerificacion: z.string(),
  aprobada: z.boolean(),
  rechazada: z.boolean(),
  motivoRechazo: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  adminId: z.number().nullable(),
})

const SolicitudesRegistroSchema = z.array(SolicitudRegistroSchema)

const RegistroResponseSchema = z.object({
  message: z.string(),
  solicitudId: z.number(),
})

const AprobarSolicitudResponseSchema = z.object({
  message: z.string(),
  usuario: UsuarioSchema,
})

const RechazarSolicitudResponseSchema = z.object({
  message: z.string(),
})

const ActualizarPerfilResponseSchema = z.object({
  message: z.string(),
  usuario: UsuarioSchema,
})

const VerificarEmailResponseSchema = z.object({
  usuario: UsuarioSchema,
  message: z.string(),
  token: z.string(),
})

const ReenviarVerificacionResponseSchema = z.object({
  message: z.string(),
})

// NUEVO ESQUEMA PARA RESTABLECIMIENTO DE CONTRASEÑA
const ResetPasswordResponseSchema = z.object({
  message: z.string(),
})

// Interfaces para las respuestas
export interface ApiResponse<T> {
  success: boolean
  data?: T
  errors?: { field: string; message: string }[]
}

// Función para manejar errores en las peticiones
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit,
  schema: z.ZodType<T>,
  errorMessage: string,
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("token")

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>
      Object.assign(headers, existingHeaders)
    }

    console.log(`🚀 Haciendo petición a: ${url}`)
    console.log(`📋 Método: ${options.method}`)
    console.log(`🔑 Headers:`, headers)
    console.log(`📦 Body:`, options.body)

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000),
    })

    console.log(`📡 Respuesta recibida:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      let errorData: { error?: string; errors?: { field: string; message: string }[] } = {}
      let responseText = ""

      try {
        responseText = await response.text()
        console.log(`📄 Texto de respuesta:`, responseText)

        if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
          errorData = JSON.parse(responseText)
        } else {
          console.error(`❌ Respuesta no es JSON válido:`, responseText)
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: `Error del servidor: ${response.status} - ${response.statusText}`,
              },
            ],
          }
        }
      } catch (e) {
        console.error(`❌ Error al parsear respuesta:`, e)
        console.error(`📄 Respuesta cruda:`, responseText)
        return {
          success: false,
          errors: [
            {
              field: "general",
              message: `Error del servidor: ${response.status} - Respuesta inválida`,
            },
          ],
        }
      }

      console.log(`❌ Error response from ${url}:`, { status: response.status, errorData })

      switch (response.status) {
        case 400:
        case 409:
          return {
            success: false,
            errors: errorData.errors || [
              {
                field: "general",
                message: errorData.error || "Solicitud inválida. Verifica los datos enviados.",
              },
            ],
          }
        case 401:
          return {
            success: false,
            errors: [
              {
                field: "auth",
                message: errorData.error || "No autorizado. Inicia sesión nuevamente.",
              },
            ],
          }
        case 403:
          return {
            success: false,
            errors: [
              {
                field: "auth",
                message: errorData.error || "No tienes permisos para realizar esta acción.",
              },
            ],
          }
        case 404:
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: errorData.error || `${errorMessage} no encontrado.`,
              },
            ],
          }
        case 500:
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: errorData.error || "Error interno del servidor. Intenta de nuevo más tarde.",
              },
            ],
          }
        default:
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: errorData.error || `Error ${response.status}: ${response.statusText}`,
              },
            ],
          }
      }
    }

    const responseText = await response.text()
    console.log(`✅ Respuesta exitosa de ${url}:`, responseText)

    let data: T
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error(`❌ Error al parsear JSON exitoso:`, e)
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: "Error de formato en la respuesta del servidor",
          },
        ],
      }
    }

    try {
      return {
        success: true,
        data: schema.parse(data),
      }
    } catch (error) {
      console.error(`❌ Zod validation error for ${url}:`, error, "Response data:", data)
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: "Error de validación de datos",
          },
        ],
      }
    }
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error)
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Error de conexión o tiempo de espera agotado",
        },
      ],
    }
  }
}

// Funciones de autenticación existentes
export const login = async (
  email: string,
  password: string,
): Promise<ApiResponse<{ usuario: Usuario; token: string }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    LoginResponseSchema,
    "Usuario",
  )
}

export const registro = async (
  email: string,
  nombre: string,
  rol: RolUsuario,
): Promise<ApiResponse<{ message: string; solicitudId: number }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/registro`,
    {
      method: "POST",
      body: JSON.stringify({ email, nombre, rol }),
    },
    RegistroResponseSchema,
    "Solicitud",
  )
}

export const obtenerPerfil = async (): Promise<ApiResponse<Usuario>> => {
  return fetchWithErrorHandling(`${API_URL}/auth/perfil`, { method: "GET" }, UsuarioSchema, "Perfil")
}

export const obtenerSolicitudes = async (): Promise<ApiResponse<SolicitudRegistro[]>> => {
  console.log("obtenerSolicitudes: Iniciando petición...")
  const token = localStorage.getItem("token")
  console.log("Token disponible:", !!token)

  const result = await fetchWithErrorHandling(
    `${API_URL}/auth/solicitudes`,
    { method: "GET" },
    SolicitudesRegistroSchema,
    "Solicitudes",
  )

  console.log("obtenerSolicitudes: Resultado:", result)
  return result
}

export const aprobarSolicitud = async (
  solicitudId: number,
  password: string,
): Promise<ApiResponse<{ message: string; usuario: Usuario }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/aprobar-solicitud`,
    {
      method: "POST",
      body: JSON.stringify({ solicitudId, password }),
    },
    AprobarSolicitudResponseSchema,
    "Solicitud",
  )
}

export const rechazarSolicitud = async (
  solicitudId: number,
  motivo?: string,
): Promise<ApiResponse<{ message: string }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/rechazar-solicitud`,
    {
      method: "POST",
      body: JSON.stringify({ solicitudId, motivo }),
    },
    RechazarSolicitudResponseSchema,
    "Solicitud",
  )
}

export const actualizarPerfil = async (nombre: string): Promise<ApiResponse<{ message: string; usuario: Usuario }>> => {
  console.log("🔄 actualizarPerfil: Iniciando actualización con nombre:", nombre)

  return fetchWithErrorHandling(
    `${API_URL}/auth/perfil`,
    {
      method: "PUT",
      body: JSON.stringify({ nombre }),
    },
    ActualizarPerfilResponseSchema,
    "Perfil",
  )
}

export const verificarEmail = async (token: string): Promise<ApiResponse<{ usuario: Usuario; message: string; token: string }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/verificar-email?token=${encodeURIComponent(token)}`,
    { method: "GET" },
    VerificarEmailResponseSchema,
    "Verificación",
  )
}

export const reenviarVerificacion = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/reenviar-verificacion`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    ReenviarVerificacionResponseSchema,
    "Reenvío",
  )
}

// NUEVAS FUNCIONES PARA RESTABLECIMIENTO DE CONTRASEÑA
export const requestPasswordReset = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/reset-password`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    ResetPasswordResponseSchema,
    "Restablecimiento",
  )
}

export const confirmPasswordReset = async (
  token: string,
  password: string,
): Promise<ApiResponse<{ message: string }>> => {
  return fetchWithErrorHandling(
    `${API_URL}/auth/reset-password/confirm`, // http://localhost:3000/api/auth/reset-password/confirm
    {
      method: "POST",
      body: JSON.stringify({ token, password }),
    },
    ResetPasswordResponseSchema,
    "Confirmación",
  )
}