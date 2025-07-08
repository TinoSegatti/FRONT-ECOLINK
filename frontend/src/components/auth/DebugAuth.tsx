"use client"

import { useAuthContext } from "../../contexts/AuthContext"

export default function DebugAuth() {
  const { usuario, solicitudes, solicitudesLoading, loadSolicitudes } = useAuthContext()

  return (
    <div className="card p-3 mb-4" style={{ backgroundColor: "#f8f9fa" }}>
      <h5>🔍 Debug de Autenticación</h5>
      <div className="row">
        <div className="col-md-6">
          <h6>Usuario Actual:</h6>
          <pre style={{ fontSize: "12px" }}>{JSON.stringify(usuario, null, 2)}</pre>
        </div>
        <div className="col-md-6">
          <h6>Solicitudes:</h6>
          <p>Loading: {solicitudesLoading ? "Sí" : "No"}</p>
          <p>Cantidad: {solicitudes.length}</p>
          <pre style={{ fontSize: "12px" }}>{JSON.stringify(solicitudes, null, 2)}</pre>
          <button className="btn btn-sm btn-primary mt-2" onClick={loadSolicitudes}>
            Recargar Solicitudes
          </button>
        </div>
      </div>
    </div>
  )
}
