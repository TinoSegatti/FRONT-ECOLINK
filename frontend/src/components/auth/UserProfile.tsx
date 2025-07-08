"use client"
import { useAuthContext } from "../../contexts/AuthContext"
import { RolUsuario } from "../../types"

export default function UserProfile() {
  const { usuario, logout } = useAuthContext()

  if (!usuario) {
    return null
  }

  const getRolePermissions = (rol: RolUsuario): string[] => {
    switch (rol) {
      case RolUsuario.ADMIN:
        return [
          "Ver todos los clientes",
          "Crear y editar clientes",
          "Gestionar categorías",
          "Aprobar solicitudes de registro",
          "Gestionar usuarios",
          "Acceso completo al sistema",
        ]
      case RolUsuario.OPERADOR:
        return ["Ver todos los clientes", "Crear y editar clientes", "Acceso a funciones operativas"]
      case RolUsuario.LECTOR:
        return ["Ver todos los clientes", "Filtrar y buscar información", "Solo lectura del sistema"]
      default:
        return []
    }
  }

  const getRoleBadgeColor = (rol: RolUsuario): string => {
    switch (rol) {
      case RolUsuario.ADMIN:
        return "var(--primary-green)"
      case RolUsuario.OPERADOR:
        return "var(--accent-magenta)"
      case RolUsuario.LECTOR:
        return "var(--accent-cyan)"
      default:
        return "var(--secondary-text)"
    }
  }

  return (
    <div className="card-custom p-4 shadow">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">
          <i className="bi bi-person-circle me-2" style={{ color: "var(--primary-green)" }}></i>
          Mi Perfil
        </h2>
        <span
          className="badge fs-6 px-3 py-2"
          style={{
            backgroundColor: getRoleBadgeColor(usuario.rol),
            color: "white",
          }}
        >
          <i className="bi bi-shield-check me-1"></i>
          {usuario.rol}
        </span>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card border-0" style={{ backgroundColor: "var(--muted)" }}>
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-info-circle me-2" style={{ color: "var(--accent-cyan)" }}></i>
                Información Personal
              </h5>

              <div className="list-group list-group-flush">
                {/* Email */}
                <div className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                  <div>
                    <strong>
                      <i className="bi bi-envelope me-2" style={{ color: "var(--accent-blue-gray)" }}></i>
                      Email:
                    </strong>
                  </div>
                  <span className="text-muted">{usuario.email}</span>
                </div>

                {/* Nombre */}
                <div className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                  <div>
                    <strong>
                      <i className="bi bi-person me-2" style={{ color: "var(--accent-magenta)" }}></i>
                      Nombre:
                    </strong>
                  </div>
                  <span className="text-muted">{usuario.nombre}</span>
                </div>

                {/* Rol */}
                <div className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                  <div>
                    <strong>
                      <i className="bi bi-shield-check me-2" style={{ color: "var(--primary-green)" }}></i>
                      Rol:
                    </strong>
                  </div>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: getRoleBadgeColor(usuario.rol),
                      color: "white",
                    }}
                  >
                    {usuario.rol}
                  </span>
                </div>

                {/* Estado */}
                <div className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                  <div>
                    <strong>
                      <i className="bi bi-check-circle me-2" style={{ color: "var(--accent-cyan)" }}></i>
                      Estado:
                    </strong>
                  </div>
                  <div>
                    <span className="badge bg-success me-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Activo
                    </span>
                    {usuario.verificado && (
                      <span className="badge" style={{ backgroundColor: "var(--primary-green)", color: "white" }}>
                        <i className="bi bi-patch-check me-1"></i>
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0" style={{ backgroundColor: "var(--muted)" }}>
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-key me-2" style={{ color: "var(--accent-magenta)" }}></i>
                Permisos del Rol
              </h5>

              <div className="list-group list-group-flush">
                {getRolePermissions(usuario.rol).map((permiso, index) => (
                  <div key={index} className="list-group-item bg-transparent border-0 px-0 py-1">
                    <small>
                      <i className="bi bi-check2 me-2" style={{ color: "var(--primary-green)" }}></i>
                      {permiso}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          <i className="bi bi-calendar me-1"></i>
          Miembro desde:{" "}
          {new Date(usuario.createdAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <button className="btn btn-danger" onClick={logout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
