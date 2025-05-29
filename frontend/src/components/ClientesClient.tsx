"use client"

import { useState } from "react"
import ClientesContainer from "./ClientesContainer"
import useClientes from "../hooks/useClientes"
import type { Cliente } from "../types"
import type { ColumnasFiltrables } from "../types"

export default function ClientesClient() {
  const {
    clientes,
    gestionFields,
    nuevoCliente,
    setNuevoCliente,
    clienteEditando,
    iniciarCreacion,
    iniciarEdicion,
    handleActualizarCliente,
    cancelarEdicion,
    isLoading,
    handleCrearCliente,
    handleEliminarCliente,
    handleCrearCategoria,
    handleEditarCategoria,
    handleEliminarCategoria,
    filtros,
    handleFiltroCategoricalChange,
    handleFiltroFechaChange,
    limpiarTodosLosFiltros,
    getUniqueValues,
  } = useClientes()

  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = () => {
    iniciarCreacion()
    setShowModal(true)
  }

  const onCreateCliente = async () => {
    console.log("Before handleCrearCliente, nuevoCliente:", nuevoCliente)
    const result = await handleCrearCliente()

    if (result.success) {
      console.log("Create successful, closing modal")
      setShowModal(false)
    } else {
      console.log("Create failed with errors:", result.errors)
      throw new Error(JSON.stringify(result.errors))
    }
  }

  const onActualizarCliente = async (id: number, data: Omit<Cliente, "id">) => {
    console.log("Before handleActualizarCliente, data:", data)
    const result = await handleActualizarCliente(id, data)
    if (result.success) {
      console.log("Update successful")
    } else {
      console.log("Update failed with errors:", result.errors)
      throw new Error(JSON.stringify(result.errors))
    }
  }

  const onFiltroChange = (
    columna: keyof Cliente,
    valor: string | { desde: string; hasta: string },
    checked: boolean,
  ) => {
    console.log("ClientesClient - onFiltroChange:", { columna, valor, checked })
    if (["zona", "semana", "tipoCliente", "estadoTurno", "prioridad", "estado", "gestionComercial"].includes(columna)) {
      if (typeof valor === "string") {
        console.log("Procesando filtro categórico:", { columna, valor })
        handleFiltroCategoricalChange(columna as ColumnasFiltrables, valor, checked)
      }
    } else if (["fechaDeuda", "ultimaRecoleccion", "contratacion"].includes(columna)) {
      if (typeof valor !== "string") {
        console.log("Procesando filtro de fecha:", { columna, valor })
        handleFiltroFechaChange(columna as "fechaDeuda" | "ultimaRecoleccion" | "contratacion", valor, checked)
      }
    }
  }

  return (
    <div
      className="container-fluid mt-4"
      style={{
        backgroundColor: "var(--background)",
        minHeight: "100vh",
        padding: "2rem 1rem",
      }}
    >
      <div className="card-custom p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="mb-2" style={{ color: "var(--foreground)" }}>
              <i className="bi bi-people-fill me-3" style={{ color: "var(--primary-green)" }}></i>
              Gestión de Clientes
            </h2>
            <p className="mb-0" style={{ color: "var(--secondary-text)" }}>
              Administra y gestiona tu cartera de clientes de manera eficiente
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div
              className="badge fs-6 px-3 py-2"
              style={{
                backgroundColor: "var(--accent-cyan)",
                color: "white",
              }}
            >
              <i className="bi bi-database me-2"></i>
              Sistema ECOLINK
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="row g-3">
          <div className="col-md-3">
            <div
              className="card h-100 border-0"
              style={{
                backgroundColor: "var(--primary-green)",
                color: "white",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="card-body text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                  <div className="text-start">
                    <h3 className="mb-0 fw-bold">{clientes.length}</h3>
                    <small className="opacity-90">Total</small>
                  </div>
                </div>
                <p className="mb-0 small opacity-90">Clientes registrados</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card h-100 border-0"
              style={{
                backgroundColor: "var(--accent-magenta)",
                color: "white",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="card-body text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <i className="bi bi-calendar-plus fs-4"></i>
                  </div>
                  <div className="text-start">
                    <h3 className="mb-0 fw-bold">{clientes.filter((c) => c.prioridad === "PIDIO TURNO").length}</h3>
                    <small className="opacity-90">Pidieron</small>
                  </div>
                </div>
                <p className="mb-0 small opacity-90">Turnos solicitados</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card h-100 border-0"
              style={{
                backgroundColor: "var(--accent-cyan)",
                color: "white",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="card-body text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <i className="bi bi-check-circle-fill fs-4"></i>
                  </div>
                  <div className="text-start">
                    <h3 className="mb-0 fw-bold">{clientes.filter((c) => c.estadoTurno === "CONFIRMADO").length}</h3>
                    <small className="opacity-90">Confirmados</small>
                  </div>
                </div>
                <p className="mb-0 small opacity-90">Turnos confirmados</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card h-100 border-0"
              style={{
                backgroundColor: "var(--accent-blue-gray)",
                color: "white",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="card-body text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <i className="bi bi-graph-up fs-4"></i>
                  </div>
                  <div className="text-start">
                    <h3 className="mb-0 fw-bold">{clientes.filter((c) => c.estado === "ACTIVO").length}</h3>
                    <small className="opacity-90">Activos</small>
                  </div>
                </div>
                <p className="mb-0 small opacity-90">Clientes activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="row mt-4">
          <div className="col-12">
            <div
              className="alert mb-0 d-flex align-items-center"
              style={{
                backgroundColor: "rgba(122, 201, 67, 0.1)",
                border: "1px solid var(--primary-green)",
                borderRadius: "var(--radius)",
                color: "var(--foreground)",
              }}
            >
              <i className="bi bi-info-circle-fill me-3" style={{ color: "var(--primary-green)" }}></i>
              <div className="flex-grow-1">
                <strong>Resumen de gestión:</strong>
                <span className="ms-2">
                  {clientes.filter((c) => c.prioridad === "PIDIO TURNO").length > 0 && (
                    <span className="me-3">
                      <i className="bi bi-calendar-event me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      {clientes.filter((c) => c.prioridad === "PIDIO TURNO").length} solicitudes pendientes
                    </span>
                  )}
                  {clientes.filter((c) => c.estadoTurno === "CONFIRMADO").length > 0 && (
                    <span className="me-3">
                      <i className="bi bi-check-circle me-1" style={{ color: "var(--accent-cyan)" }}></i>
                      {clientes.filter((c) => c.estadoTurno === "CONFIRMADO").length} turnos programados
                    </span>
                  )}
                  <span>
                    <i className="bi bi-percent me-1" style={{ color: "var(--accent-blue-gray)" }}></i>
                    {clientes.length > 0
                      ? Math.round((clientes.filter((c) => c.estado === "ACTIVO").length / clientes.length) * 100)
                      : 0}
                    % de clientes activos
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientesContainer
        clientes={clientes}
        gestionFields={gestionFields}
        nuevoCliente={nuevoCliente}
        setNuevoCliente={setNuevoCliente}
        isLoading={isLoading}
        showModal={showModal}
        setShowModal={setShowModal}
        onCreateCliente={onCreateCliente}
        onEliminarCliente={handleEliminarCliente}
        onCrearCategoria={handleCrearCategoria}
        onEditarCategoria={handleEditarCategoria}
        onEliminarCategoria={handleEliminarCategoria}
        filtros={filtros}
        onFiltroChange={onFiltroChange}
        onLimpiarFiltros={limpiarTodosLosFiltros}
        getUniqueValues={getUniqueValues}
        iniciarEdicion={iniciarEdicion}
        handleActualizarCliente={(data) => {
          if (!clienteEditando) {
            return Promise.reject(new Error("No hay cliente en edición"))
          }
          return onActualizarCliente(clienteEditando.id, data)
        }}
        cancelarEdicion={cancelarEdicion}
        clienteEditando={clienteEditando}
        handleOpenModal={handleOpenModal}
      />
    </div>
  )
}
