"use client"

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import ClientesClient from "../../components/ClientesClient"
import ProtectedRoute from "../../components/auth/ProtectedRoute"

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <div className="min-vh-100" style={{ backgroundColor: "var(--background)" }}>
        <div className="container-fluid clientes-page-container">
          <div className="card-custom p-4">
            <ClientesClient />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
