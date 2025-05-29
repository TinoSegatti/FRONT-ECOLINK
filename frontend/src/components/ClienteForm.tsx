// C:\ECOLINK\crud-clientes\frontend\src\components\ClienteForm.tsx

"use client"

import React, { useState, useEffect } from "react"
import { Modal, Button, Form, Col, Row } from "react-bootstrap"
import type { Cliente, ClienteFormProps } from "../types"
import CategoriasGestionables from "./CategoriasGestionables"
import debounce from "lodash.debounce"

// Función para convertir aaaa-MM-dd a dd/MM/aaaa
const formatDateToBackend = (date: string): string => {
  if (!date) return ""
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

// Función para convertir dd/MM/aaaa a aaaa-MM-dd
const formatDateToInput = (date: string | null): string => {
  if (!date || !/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return ""
  const [day, month, year] = date.split("/")
  return `${year}-${month}-${day}`
}

export default function ClienteForm({
  show,
  onHide,
  nuevoCliente,
  setNuevoCliente,
  onCreateCliente,
  gestionFields,
  handleCrearCategoria,
  handleEditarCategoria,
  handleEliminarCategoria,
  isLoading,
}: ClienteFormProps & { isLoading?: boolean }) {
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Cliente, "id"> | "general", string>>>({})
  const [showEmpresaFields, setShowEmpresaFields] = useState(false)
  const [lastErrorUpdate, setLastErrorUpdate] = useState<number | null>(null)

  // Limpiar errores y estados al abrir el modal
  useEffect(() => {
    if (show) {
      setErrors({})
      setLastErrorUpdate(null)
      setShowEmpresaFields(false)
    }
  }, [show])

  // Función para cerrar el modal y limpiar estados
  const handleClose = () => {
    setErrors({})
    setLastErrorUpdate(null)
    setShowEmpresaFields(false)
    onHide()
  }

  const validateTelefono = (telefono: string): string | undefined => {
    if (!telefono) {
      return "Teléfono es obligatorio"
    }
    if (!/^\+\d{2,15}$/.test(telefono)) {
      return 'El teléfono debe comenzar con "+" y contener entre 2 y 15 dígitos numéricos'
    }
    return undefined
  }

  // Debounce para la validación del teléfono, aumentado a 1000 ms
  const debouncedSetTelefonoError = React.useMemo(
    () =>
      debounce((value: string) => {
        const error = validateTelefono(value)
        setErrors((prev) => ({
          ...prev,
          telefono: error,
        }))
      }, 1000),
    [],
  )

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedSetTelefonoError.cancel()
    }
  }, [debouncedSetTelefonoError])

  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    setNuevoCliente({
      ...nuevoCliente,
      [name]: value || null,
    })

    // Validar el teléfono con debounce
    if (name === "telefono") {
      debouncedSetTelefonoError(value)
    } else if (["contratacion", "fechaDeuda", "ultimaRecoleccion"].includes(name)) {
      const formattedValue = value ? formatDateToBackend(value) : null
      setNuevoCliente({
        ...nuevoCliente,
        [name]: formattedValue,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setErrors({}) // Limpiar errores antes de la validación

    const newErrors: Partial<Record<keyof Omit<Cliente, "id"> | "general", string>> = {}
    if (!nuevoCliente.zona) newErrors.zona = "Zona es obligatoria"
    if (!nuevoCliente.nombre) newErrors.nombre = "Nombre es obligatorio"
    if (!nuevoCliente.barrio) newErrors.barrio = "Barrio es obligatorio"
    if (!nuevoCliente.direccion) newErrors.direccion = "Dirección es obligatoria"
    if (!nuevoCliente.tipoCliente) newErrors.tipoCliente = "Tipo de Cliente es obligatorio"
    const telefonoError = validateTelefono(nuevoCliente.telefono)
    if (telefonoError) newErrors.telefono = telefonoError

    if (Object.keys(newErrors).length > 0) {
      console.log("Setting local validation errors:", newErrors)
      setErrors(newErrors)
      setLastErrorUpdate(Date.now())
      return
    }

    try {
      console.log("Attempting to create cliente:", nuevoCliente)
      await onCreateCliente()
      console.log("Create successful, closing modal")
      handleClose()
    } catch (error: unknown) {
      console.log("Error caught in ClienteForm handleSubmit:", error)
      let errorMessage = ""
      if (error instanceof Error) {
        errorMessage = error.message
        console.log("Error message:", errorMessage)
      } else if (typeof error === "string") {
        errorMessage = error
      } else {
        errorMessage = JSON.stringify(error)
      }
      try {
        console.log("Attempting to parse error message:", errorMessage)
        const validationErrors = JSON.parse(errorMessage) as { field: string; message: string }[]
        console.log("Parsed validation errors:", validationErrors)
        const newErrors: Partial<Record<keyof Omit<Cliente, "id"> | "general", string>> = {}
        validationErrors.forEach(({ field, message }) => {
          newErrors[field as keyof Omit<Cliente, "id"> | "general"] = message
        })
        console.log("Setting backend validation errors:", newErrors)
        setErrors(newErrors)
        setLastErrorUpdate(Date.now())
      } catch (parseError) {
        console.error("Failed to parse error message:", parseError, "Original error:", errorMessage)
        setErrors({ general: "Error inesperado al crear el cliente" })
        setLastErrorUpdate(Date.now())
      }
    }
  }

  // Modificar useEffect para no limpiar el error de telefono mientras se edita
  useEffect(() => {
    console.log("Current errors state:", errors)
    if (show && Object.keys(errors).length > 0 && lastErrorUpdate) {
      const timer = setTimeout(() => {
        const now = Date.now()
        if (now - lastErrorUpdate >= 5000) {
          setErrors((prev) => {
            const newErrors = { ...prev }
            // Mantener el error de telefono si está presente
            if (newErrors.telefono) {
              return { telefono: newErrors.telefono }
            }
            return {}
          })
          setLastErrorUpdate(null)
        }
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errors, lastErrorUpdate, show])

  const toggleEmpresaFields = () => {
    setShowEmpresaFields(!showEmpresaFields)
  }

  console.log("Rendering with errors:", errors)
  return (
    <>
      <style jsx>{`
        .modal-custom .modal-content {
          background-color: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
        }
        .modal-custom .modal-header {
          background-color: var(--primary-green);
          color: white;
          border-bottom: 1px solid var(--border-color);
          border-radius: var(--radius) var(--radius) 0 0;
        }
        .modal-custom .modal-header .btn-close {
          filter: brightness(0) invert(1);
        }
        .modal-custom .modal-title {
          color: white;
          font-weight: 600;
        }
        .modal-custom .modal-body {
          background-color: var(--card-background);
          color: var(--foreground);
        }
        .modal-custom .modal-footer {
          background-color: var(--card-background);
          border-top: 1px solid var(--border-color);
          border-radius: 0 0 var(--radius) var(--radius);
        }
        .form-control-custom {
          border: 1px solid var(--border-color);
          background-color: var(--card-background);
          color: var(--foreground);
          border-radius: var(--radius);
        }
        .form-control-custom:focus {
          border-color: var(--primary-green);
          box-shadow: 0 0 0 0.2rem rgba(122, 201, 67, 0.25);
          background-color: var(--card-background);
          color: var(--foreground);
        }
        .form-label-custom {
          color: var(--foreground);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .form-text-custom {
          color: var(--secondary-text);
          font-size: 0.875rem;
        }
        .section-title {
          color: var(--foreground);
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary-green);
          display: flex;
          align-items: center;
        }
        .btn-empresa-toggle {
          background-color: var(--accent-cyan);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .btn-empresa-toggle:hover {
          background-color: var(--accent-blue-gray);
          color: white;
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          color: white;
          font-size: 1.2rem;
        }
      `}</style>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        aria-labelledby="registrar-cliente-modal"
        className="modal-custom"
      >
        <Modal.Header closeButton>
          <Modal.Title id="registrar-cliente-modal">
            <i className="bi bi-person-plus-fill me-2"></i>
            Registrar Nuevo Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ position: "relative" }}>
          {isLoading && (
            <div className="overlay">
              <div className="text-center">
                <div className="spinner-border mb-2" role="status" style={{ color: "var(--primary-green)" }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <div>Creando cliente...</div>
              </div>
            </div>
          )}
          <Form noValidate onSubmit={handleSubmit} id="cliente-form">
            <h5 className="section-title">
              <i className="bi bi-info-circle-fill me-2" style={{ color: "var(--primary-green)" }}></i>
              Información Básica
            </h5>
            <Row className="g-3">
              <Col md={4}>
                <CategoriasGestionables
                  field="zona"
                  label="Zona"
                  required={true}
                  nuevoCliente={nuevoCliente}
                  setNuevoCliente={setNuevoCliente}
                  options={gestionFields.zona.options}
                  handleCrearCategoria={handleCrearCategoria}
                  handleEditarCategoria={handleEditarCategoria}
                  handleEliminarCategoria={handleEliminarCategoria}
                  error={errors.zona}
                  aria-describedby={errors.zona ? "zona-error" : "zona-desc"}
                />
              </Col>
              <Col md={4}>
                <Form.Group controlId="nombre">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-person me-1" style={{ color: "var(--primary-green)" }}></i>
                    Nombre *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.nombre || ""}
                    onChange={handleChange}
                    name="nombre"
                    required
                    isInvalid={!!errors.nombre}
                    aria-describedby={errors.nombre ? "nombre-error" : "nombre-desc"}
                    className="form-control-custom"
                  />
                  {errors.nombre && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.nombre}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="barrio">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-geo-alt me-1" style={{ color: "var(--primary-green)" }}></i>
                    Barrio *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.barrio || ""}
                    onChange={handleChange}
                    name="barrio"
                    required
                    isInvalid={!!errors.barrio}
                    aria-describedby={errors.barrio ? "barrio-error" : "barrio-desc"}
                    className="form-control-custom"
                  />
                  {errors.barrio && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.barrio}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="direccion">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-house me-1" style={{ color: "var(--primary-green)" }}></i>
                    Dirección *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.direccion || ""}
                    onChange={handleChange}
                    name="direccion"
                    required
                    isInvalid={!!errors.direccion}
                    aria-describedby={errors.direccion ? "direccion-error" : "direccion-desc"}
                    className="form-control-custom"
                  />
                  {errors.direccion && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.direccion}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="telefono">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-telephone me-1" style={{ color: "var(--primary-green)" }}></i>
                    Teléfono *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.telefono || ""}
                    onChange={handleChange}
                    name="telefono"
                    required
                    isInvalid={!!errors.telefono}
                    aria-describedby={errors.telefono ? "telefono-error" : "telefono-desc"}
                    className="form-control-custom"
                  />
                  <Form.Text id="telefono-desc" className="form-text-custom">
                    Debe comenzar con &quot;+&quot; seguido de 2 a 15 dígitos numéricos (ej. +123456789).
                  </Form.Text>
                  {errors.telefono && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.telefono}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <CategoriasGestionables
                  field="tipoCliente"
                  label="Tipo de Cliente"
                  required={true}
                  nuevoCliente={nuevoCliente}
                  setNuevoCliente={setNuevoCliente}
                  options={gestionFields.tipoCliente.options}
                  handleCrearCategoria={handleCrearCategoria}
                  handleEditarCategoria={handleEditarCategoria}
                  handleEliminarCategoria={handleEliminarCategoria}
                  error={errors.tipoCliente}
                  aria-describedby={errors.tipoCliente ? "tipoCliente-error" : "tipoCliente-desc"}
                />
              </Col>
            </Row>

            <h5 className="section-title mt-4">
              <i className="bi bi-list-ul me-2" style={{ color: "var(--accent-cyan)" }}></i>
              Detalles Adicionales
            </h5>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="detalleDireccion">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-map me-1" style={{ color: "var(--accent-cyan)" }}></i>
                    Detalle Dirección
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.detalleDireccion ?? ""}
                    onChange={handleChange}
                    name="detalleDireccion"
                    aria-describedby="detalleDireccion-desc"
                    className="form-control-custom"
                  />
                  <Form.Text id="detalleDireccion-desc" className="form-text-custom">
                    Opcional: detalles adicionales de la dirección.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <CategoriasGestionables
                  field="semana"
                  label="Semana"
                  nuevoCliente={nuevoCliente}
                  setNuevoCliente={setNuevoCliente}
                  options={gestionFields.semana.options}
                  handleCrearCategoria={handleCrearCategoria}
                  handleEditarCategoria={handleEditarCategoria}
                  handleEliminarCategoria={handleEliminarCategoria}
                  error={errors.semana}
                  aria-describedby={errors.semana ? "semana-error" : "semana-desc"}
                />
              </Col>
              <Col md={4}>
                <Form.Group controlId="observaciones">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-chat-text me-1" style={{ color: "var(--accent-cyan)" }}></i>
                    Observaciones
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCliente.observaciones ?? ""}
                    onChange={handleChange}
                    name="observaciones"
                    aria-describedby="observaciones-desc"
                    className="form-control-custom"
                  />
                  <Form.Text id="observaciones-desc" className="form-text-custom">
                    Opcional: notas sobre el cliente.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="contratacion">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-calendar-check me-1" style={{ color: "var(--accent-cyan)" }}></i>
                    Contratación
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formatDateToInput(nuevoCliente.contratacion)}
                    onChange={handleChange}
                    name="contratacion"
                    isInvalid={!!errors.contratacion}
                    aria-describedby={errors.contratacion ? "contratacion-error" : "contratacion-desc"}
                    className="form-control-custom"
                  />
                  <Form.Text id="contratacion-desc" className="form-text-custom">
                    Opcional: seleccione la fecha de contratación.
                  </Form.Text>
                  {errors.contratacion && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.contratacion}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="fechaDeuda">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-calendar-x me-1" style={{ color: "var(--accent-cyan)" }}></i>
                    Fecha Deuda
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formatDateToInput(nuevoCliente.fechaDeuda)}
                    onChange={handleChange}
                    name="fechaDeuda"
                    isInvalid={!!errors.fechaDeuda}
                    aria-describedby={errors.fechaDeuda ? "fechaDeuda-error" : "fechaDeuda-desc"}
                    className="form-control-custom"
                  />
                  <Form.Text id="fechaDeuda-desc" className="form-text-custom">
                    Opcional: fecha de la deuda.
                  </Form.Text>
                  {errors.fechaDeuda && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.fechaDeuda}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="ultimaRecoleccion">
                  <Form.Label className="form-label-custom">
                    <i className="bi bi-calendar-event me-1" style={{ color: "var(--accent-cyan)" }}></i>
                    Última Recolección
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formatDateToInput(nuevoCliente.ultimaRecoleccion)}
                    onChange={handleChange}
                    name="ultimaRecoleccion"
                    isInvalid={!!errors.ultimaRecoleccion}
                    aria-describedby={errors.ultimaRecoleccion ? "ultimaRecoleccion-error" : "ultimaRecoleccion-desc"}
                    className="form-control-custom"
                  />
                  <Form.Text id="ultimaRecoleccion-desc" className="form-text-custom">
                    Opcional: fecha de la última recolección.
                  </Form.Text>
                  {errors.ultimaRecoleccion && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.ultimaRecoleccion}
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <CategoriasGestionables
                  field="gestionComercial"
                  label="Gestión Comercial"
                  nuevoCliente={nuevoCliente}
                  setNuevoCliente={setNuevoCliente}
                  options={gestionFields.gestionComercial.options}
                  handleCrearCategoria={handleCrearCategoria}
                  handleEditarCategoria={handleEditarCategoria}
                  handleEliminarCategoria={handleEliminarCategoria}
                  error={errors.gestionComercial}
                  aria-describedby={errors.gestionComercial ? "gestionComercial-error" : "gestionComercial-desc"}
                />
              </Col>
            </Row>

            <h5 className="section-title mt-4">
              <i className="bi bi-building me-2" style={{ color: "var(--accent-magenta)" }}></i>
              Datos de Empresa
            </h5>
            <Button
              className="btn-empresa-toggle mb-3"
              onClick={toggleEmpresaFields}
              aria-label={showEmpresaFields ? "Ocultar datos de empresa" : "Mostrar datos de empresa"}
            >
              <i className={`bi ${showEmpresaFields ? "bi-eye-slash" : "bi-eye"} me-2`}></i>
              {showEmpresaFields ? "OCULTAR EMPRESA" : "MOSTRAR EMPRESA"}
            </Button>
            {showEmpresaFields && (
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="nombreEmpresa">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-building me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Nombre
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevoCliente.nombreEmpresa ?? ""}
                      onChange={handleChange}
                      name="nombreEmpresa"
                      isInvalid={!!errors.nombreEmpresa}
                      aria-describedby="nombreEmpresa-desc"
                      className="form-control-custom"
                    />
                    <Form.Text id="nombreEmpresa-desc" className="form-text-custom">
                      Opcional: razón social de la empresa.
                    </Form.Text>
                    {errors.nombreEmpresa && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.nombreEmpresa}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="CUIT">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-card-text me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      CUIT
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevoCliente.CUIT ?? ""}
                      onChange={handleChange}
                      name="CUIT"
                      isInvalid={!!errors.CUIT}
                      aria-describedby={errors.CUIT ? "CUIT-error" : "CUIT-desc"}
                      className="form-control-custom"
                    />
                    <Form.Text id="CUIT-desc" className="form-text-custom">
                      Opcional: formato 12-12345678-1.
                    </Form.Text>
                    {errors.CUIT && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.CUIT}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="condicion">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-file-text me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Condición
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevoCliente.condicion ?? ""}
                      onChange={handleChange}
                      name="condicion"
                      isInvalid={!!errors.condicion}
                      aria-describedby="condicion-desc"
                      className="form-control-custom"
                    />
                    <Form.Text id="condicion-desc" className="form-text-custom">
                      Opcional: ej. Responsable Inscripto, Monotributista.
                    </Form.Text>
                    {errors.condicion && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.condicion}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="factura">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-receipt me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Factura
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevoCliente.factura ?? ""}
                      onChange={handleChange}
                      name="factura"
                      isInvalid={!!errors.factura}
                      aria-describedby="factura-desc"
                      className="form-control-custom"
                    />
                    <Form.Text id="factura-desc" className="form-text-custom">
                      Opcional: ej. A, B, C.
                    </Form.Text>
                    {errors.factura && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.factura}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="pago">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-credit-card me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Pago
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevoCliente.pago ?? ""}
                      onChange={handleChange}
                      name="pago"
                      isInvalid={!!errors.pago}
                      aria-describedby="pago-desc"
                      className="form-control-custom"
                    />
                    <Form.Text id="pago-desc" className="form-text-custom">
                      Opcional: ej. Transferencia, Efectivo.
                    </Form.Text>
                    {errors.pago && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.pago}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="origenFacturacion">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-gear me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Origen de fact.
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={nuevoCliente.origenFacturacion ?? ""}
                      onChange={handleChange}
                      name="origenFacturacion"
                      isInvalid={!!errors.origenFacturacion}
                      aria-describedby="origenFacturacion-desc"
                      className="form-control-custom"
                    />
                    <Form.Text id="origenFacturacion-desc" className="form-text-custom">
                      Opcional: sistema o fuente de facturación.
                    </Form.Text>
                    {errors.origenFacturacion && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.origenFacturacion}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="emailAdministracion">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-envelope me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Email Administración
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={nuevoCliente.emailAdministracion ?? ""}
                      onChange={handleChange}
                      name="emailAdministracion"
                      isInvalid={!!errors.emailAdministracion}
                      aria-describedby={
                        errors.emailAdministracion ? "emailAdministracion-error" : "emailAdministracion-desc"
                      }
                      className="form-control-custom"
                    />
                    <Form.Text id="emailAdministracion-desc" className="form-text-custom">
                      Opcional: correo para temas administrativos.
                    </Form.Text>
                    {errors.emailAdministracion && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.emailAdministracion}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="emailComercial">
                    <Form.Label className="form-label-custom">
                      <i className="bi bi-envelope-at me-1" style={{ color: "var(--accent-magenta)" }}></i>
                      Email Comercial
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={nuevoCliente.emailComercial ?? ""}
                      onChange={handleChange}
                      name="emailComercial"
                      isInvalid={!!errors.emailComercial}
                      aria-describedby={errors.emailComercial ? "emailComercial-error" : "emailComercial-desc"}
                      className="form-control-custom"
                    />
                    <Form.Text id="emailComercial-desc" className="form-text-custom">
                      Opcional: correo para temas comerciales.
                    </Form.Text>
                    {errors.emailComercial && (
                      <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.emailComercial}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            )}
            {errors.general && (
              <div
                className="alert mt-3 d-flex align-items-center"
                style={{
                  backgroundColor: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid #dc3545",
                  borderRadius: "var(--radius)",
                  color: "#dc3545",
                }}
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errors.general}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            aria-label="Cancelar registro"
            style={{
              backgroundColor: "var(--secondary-text)",
              border: "none",
              color: "white",
            }}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="cliente-form"
            aria-label="Crear nuevo cliente"
            disabled={isLoading}
            style={{
              backgroundColor: "var(--primary-green)",
              border: "none",
              color: "white",
            }}
          >
            <i className="bi bi-check-circle me-2"></i>
            Crear Cliente
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
