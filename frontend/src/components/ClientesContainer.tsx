"use client"

import { useState } from "react"
import ClienteTable from "./ClienteTable"
import ClienteForm from "./ClienteForm"
import ClienteEditForm from "./ClienteEditForm"
import type { Cliente, GestionableFieldKey, GestionableField, ColumnasFiltrables } from "../types"

interface ClientesContainerProps {
  clientes: Cliente[]
  gestionFields: Record<GestionableFieldKey, GestionableField>
  nuevoCliente: Omit<Cliente, "id">
  setNuevoCliente: (cliente: Omit<Cliente, "id">) => void
  isLoading: boolean
  showModal: boolean
  setShowModal: (show: boolean) => void
  onCreateCliente: () => Promise<void>
  onEliminarCliente: (id: number) => Promise<void>
  onCrearCategoria: (field: GestionableFieldKey, valor: string) => Promise<void>
  onEditarCategoria: (field: GestionableFieldKey, oldValor: string, newValor: string) => Promise<void>
  onEliminarCategoria: (field: GestionableFieldKey, valor: string) => Promise<void>
  filtros: Record<ColumnasFiltrables, Set<string>>
  onFiltroChange: (columna: keyof Cliente, valor: string | { desde: string; hasta: string }, checked: boolean) => void
  onLimpiarFiltros: () => void
  getUniqueValues: (columna: keyof Cliente) => string[]
  iniciarEdicion: (cliente: Cliente) => void
  handleActualizarCliente: (data: Omit<Cliente, "id">) => Promise<void>
  cancelarEdicion: () => void
  clienteEditando: Cliente | null
  handleOpenModal: () => void
}

export default function ClientesContainer({
  clientes,
  gestionFields,
  nuevoCliente,
  setNuevoCliente,
  isLoading,
  showModal,
  setShowModal,
  onCreateCliente,
  onEliminarCliente,
  onCrearCategoria,
  onEditarCategoria,
  onEliminarCategoria,
  filtros,
  onFiltroChange,
  onLimpiarFiltros,
  getUniqueValues,
  iniciarEdicion,
  handleActualizarCliente,
  cancelarEdicion,
  clienteEditando,
  handleOpenModal,
}: ClientesContainerProps) {
  const [showEditarModal, setShowEditarModal] = useState(false)

  const handleEditarCliente = (cliente: Cliente) => {
    iniciarEdicion(cliente)
    setShowEditarModal(true)
  }

  const handleCloseEditarModal = () => {
    setShowEditarModal(false)
    cancelarEdicion()
  }

  return (
    <div>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status" style={{ color: "var(--primary-green)" }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p style={{ color: "var(--secondary-text)" }}>Cargando datos de clientes...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card-custom p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn d-flex align-items-center"
                  style={{
                    backgroundColor: "var(--primary-green)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius)",
                  }}
                  onClick={handleOpenModal}
                  aria-label="Agregar Cliente"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Agregar Cliente
                </button>
                <button
                  className="btn d-flex align-items-center"
                  style={{
                    backgroundColor: "var(--accent-cyan)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius)",
                  }}
                  onClick={onLimpiarFiltros}
                  aria-label="Limpiar Filtros"
                >
                  <i className="bi bi-funnel me-2"></i>
                  Limpiar Filtros
                </button>
              </div>

              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn d-flex align-items-center"
                  style={{
                    backgroundColor: "var(--accent-magenta)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius)",
                  }}
                  onClick={() => {
                    // Funcionalidad de Excel pendiente
                    console.log("Exportar a Excel")
                  }}
                  aria-label="Exportar a Excel"
                >
                  <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                  Excel
                </button>
                <button
                  className="btn d-flex align-items-center"
                  style={{
                    backgroundColor: "var(--accent-blue-gray)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius)",
                  }}
                  onClick={() => {
                    // Funcionalidad de Nueva Ruta pendiente
                    console.log("Nueva Ruta")
                  }}
                  aria-label="Nueva Ruta"
                >
                  <i className="bi bi-geo-alt me-2"></i>
                  Nueva Ruta
                </button>
                <button
                  className="btn d-flex align-items-center"
                  style={{
                    backgroundColor: "var(--secondary-text)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius)",
                  }}
                  onClick={() => {
                    // Funcionalidad de Historial pendiente
                    console.log("Historial")
                  }}
                  aria-label="Historial de Rutas"
                >
                  <i className="bi bi-clock-history me-2"></i>
                  Historial
                </button>
              </div>
            </div>
          </div>

          <ClienteForm
            show={showModal}
            onHide={() => setShowModal(false)}
            nuevoCliente={nuevoCliente}
            setNuevoCliente={setNuevoCliente}
            onCreateCliente={onCreateCliente}
            gestionFields={gestionFields}
            handleCrearCategoria={onCrearCategoria}
            handleEditarCategoria={onEditarCategoria}
            handleEliminarCategoria={onEliminarCategoria}
          />
          {clienteEditando && (
            <ClienteEditForm
              show={showEditarModal}
              onHide={handleCloseEditarModal}
              cliente={clienteEditando}
              onActualizarCliente={handleActualizarCliente}
              gestionFields={gestionFields}
              handleCrearCategoria={onCrearCategoria}
              handleEditarCategoria={onEditarCategoria}
              handleEliminarCategoria={onEliminarCategoria}
            />
          )}
          <ClienteTable
            clientes={clientes}
            onEliminarCliente={onEliminarCliente}
            onEditarCliente={handleEditarCliente}
            filtros={filtros}
            handleFiltroChange={onFiltroChange}
            handleFiltroFechaChange={(
              columna: "fechaDeuda" | "ultimaRecoleccion" | "contratacion",
              valor: { desde: string; hasta: string },
              checked: boolean,
            ) => {
              console.log("ClientesContainer - Llamando onFiltroChange:", { columna, valor, checked })
              onFiltroChange(columna, valor, checked)
            }}
            getUniqueValues={getUniqueValues}
          />
        </>
      )}
    </div>
  )
}
