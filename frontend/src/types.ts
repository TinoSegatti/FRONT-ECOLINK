export interface Cliente {
  id: number
  zona: string
  nombre: string
  barrio: string
  direccion: string
  localidad: string | null
  telefono: string
  tipoCliente: string
  detalleDireccion: string | null
  semana: string | null
  observaciones: string | null
  debe: number | null
  fechaDeuda: string | null
  precio: number | null
  ultimaRecoleccion: string | null
  contratacion: string | null
  nuevo?: boolean
  estadoTurno: string | null
  prioridad: string | null
  estado: string | null
  gestionComercial: string | null
  CUIT: string | null
  condicion: string | null
  factura: string | null
  pago: string | null
  origenFacturacion: string | null
  nombreEmpresa: string | null
  emailAdministracion: string | null
  emailComercial: string | null
}

export const defaultCliente: Omit<Cliente, "id"> = {
  zona: "",
  nombre: "",
  barrio: "",
  direccion: "",
  localidad: null,
  detalleDireccion: null,
  telefono: "",
  semana: null,
  observaciones: null,
  tipoCliente: "",
  debe: null,
  fechaDeuda: null,
  precio: null,
  ultimaRecoleccion: null,
  contratacion: null,
  estadoTurno: null,
  prioridad: null,
  estado: null,
  gestionComercial: null,
  CUIT: null,
  condicion: null,
  factura: null,
  pago: null,
  origenFacturacion: null,
  nombreEmpresa: null,
  emailAdministracion: null,
  emailComercial: null,
}

export type GestionableFieldKey =
  | "zona"
  | "semana"
  | "tipoCliente"
  | "estadoTurno"
  | "prioridad"
  | "estado"
  | "gestionComercial"

export interface GestionableField {
  options: { valor: string; color: string | null }[]
}

export const columnasFiltrables = [
  "zona",
  "semana",
  "tipoCliente",
  "estadoTurno",
  "prioridad",
  "estado",
  "gestionComercial",
] as const
export type ColumnasFiltrables = (typeof columnasFiltrables)[number]

export type FiltroValor = Set<string> | { desde: string; hasta: string }

export interface ClienteFormProps {
  show: boolean
  onHide: () => void
  nuevoCliente: Omit<Cliente, "id">
  setNuevoCliente: (cliente: Omit<Cliente, "id">) => void
  onCreateCliente: () => void
  gestionFields: Record<GestionableFieldKey, GestionableField>
  handleCrearCategoria: (field: GestionableFieldKey, valor: string, color?: string) => Promise<void>
  handleEditarCategoria: (
    field: GestionableFieldKey,
    oldValor: string,
    newValor: string,
    color?: string,
  ) => Promise<void>
  handleEliminarCategoria: (field: GestionableFieldKey, valor: string) => Promise<void>
}

export interface ClienteTableProps {
  clientes: Cliente[]
  onEliminarCliente: (id: number) => Promise<void>
  onEditarCliente: (cliente: Cliente) => void
  filtros: Partial<Record<keyof Cliente, FiltroValor>>
  handleFiltroChange: (
    columna: keyof Cliente,
    valor: string | { desde: string; hasta: string },
    checked: boolean,
  ) => void
  getUniqueValues: (columna: keyof Cliente) => string[]
}

// Tipos para autenticación
export enum RolUsuario {
  ADMIN = "ADMIN",
  OPERADOR = "OPERADOR",
  LECTOR = "LECTOR",
}

export interface Usuario {
  id: number
  email: string
  nombre: string
  rol: RolUsuario
  activo: boolean
  verificado: boolean
  createdAt: string
  updatedAt: string
}

export interface SolicitudRegistro {
  id: number
  email: string
  nombre: string
  rol: RolUsuario
  tokenVerificacion: string
  aprobada: boolean
  rechazada: boolean
  motivoRechazo: string | null
  createdAt: string
  updatedAt: string
  adminId: number | null
}

export interface AuthState {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
