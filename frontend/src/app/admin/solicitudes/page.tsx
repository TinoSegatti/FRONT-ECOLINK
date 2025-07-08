"use client";

import { useEffect, useRef } from "react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import SolicitudesAdmin from "../../../components/auth/SolicitudesAdmin";
import { RolUsuario } from "../../../types";
import { useAuthContext } from "../../../contexts/AuthContext";
import DebugAuth from "../../../components/auth/DebugAuth";

export default function SolicitudesPage() {
  const { loadSolicitudes, usuario } = useAuthContext();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) {
      console.log("Evitando carga duplicada en SolicitudesPage");
      return;
    }
    hasLoaded.current = true;
    console.log("SolicitudesPage montada, usuario:", usuario);
    if (usuario?.rol === RolUsuario.ADMIN) {
      console.log("Usuario es ADMIN, cargando solicitudes...");
      loadSolicitudes();
    }
  }, [loadSolicitudes, usuario]);

  return (
    <ProtectedRoute requiredRoles={[RolUsuario.ADMIN]}>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="mb-4">
              <h1>Gestión de Solicitudes de Registro</h1>
              <p className="text-muted">Administra las solicitudes pendientes de nuevos usuarios</p>
            </div>
            <DebugAuth />
            <SolicitudesAdmin />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}