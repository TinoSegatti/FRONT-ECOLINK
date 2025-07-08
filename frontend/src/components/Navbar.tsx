"use client"

import Link from "next/link"
import { useAuthContext } from "../contexts/AuthContext"
import { RolUsuario } from "../types"

export default function Navbar() {
  const { isAuthenticated, usuario, logout } = useAuthContext()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary-green">
      <div className="container-fluid">
        <Link href="/clientes" className="navbar-brand fw-bold">
          <i className="bi bi-recycle me-2"></i>
          ECOLINK
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link href="/clientes" className="nav-link">
                    <i className="bi bi-people me-1"></i>
                    Clientes
                  </Link>
                </li>
                {usuario?.rol === RolUsuario.ADMIN && (
                  <li className="nav-item">
                    <Link href="/admin/solicitudes" className="nav-link">
                      <i className="bi bi-person-check me-1"></i>
                      Solicitudes
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
          <div className="d-flex">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {usuario?.nombre || "Usuario"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <div className="dropdown-item-text">
                      <small className="text-muted">Rol: {usuario?.rol}</small>
                    </div>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link href="/perfil" className="dropdown-item">
                      <i className="bi bi-person me-2"></i>
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-outline-light">
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
