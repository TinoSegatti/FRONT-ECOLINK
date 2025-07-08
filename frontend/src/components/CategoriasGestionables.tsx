"use client"

import { useState, useEffect } from "react"
import { Modal, Button, Form, ListGroup, InputGroup } from "react-bootstrap"
import { ChromePicker, type ColorResult } from "react-color"
import type { GestionableFieldKey, Cliente } from "../types"
import type { Categoria } from "../services/api/clientes"
import { useAuthContext } from "../contexts/AuthContext"
import { RolUsuario } from "../types"

interface CategoriasGestionablesProps {
  field: GestionableFieldKey
  label: string
  required?: boolean
  nuevoCliente: Omit<Cliente, "id">
  setNuevoCliente: (cliente: Omit<Cliente, "id">) => void
  options: { valor: string; color: string | null }[]
  handleCrearCategoria: (field: GestionableFieldKey, valor: string, color?: string) => Promise<Categoria | void>
  handleEditarCategoria: (
    field: GestionableFieldKey,
    oldValor: string,
    newValor: string,
    color?: string,
  ) => Promise<Categoria | void>
  handleEliminarCategoria: (field: GestionableFieldKey, valor: string) => Promise<void>
  error?: string
  "aria-describedby"?: string
}

export default function CategoriasGestionables({
  field,
  label,
  required = false,
  nuevoCliente,
  setNuevoCliente,
  options,
  handleCrearCategoria,
  handleEditarCategoria,
  handleEliminarCategoria,
  error,
  "aria-describedby": ariaDescribedBy,
}: CategoriasGestionablesProps) {
  const { hasPermission } = useAuthContext()
  const canManageCategories = hasPermission([RolUsuario.ADMIN])

  const [show, setShow] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [nuevoColor, setNuevoColor] = useState<string>("#ffffff")
  const [editValor, setEditValor] = useState<string | null>(null)
  const [editColor, setEditColor] = useState<string>("#ffffff")
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  // Ocultar el error automáticamente después de 4 segundos
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => setDeleteError(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [deleteError])

  const handleClose = () => {
    setShow(false)
    setNuevaCategoria("")
    setNuevoColor("#ffffff")
    setEditValor(null)
    setEditColor("#ffffff")
    setShowColorPicker(false)
  }

  const handleSave = async () => {
    if (!canManageCategories) {
      alert("Solo los administradores pueden gestionar categorías")
      return
    }

    setCreateError(null)
    try {
      if (editValor !== null && nuevaCategoria) {
        await handleEditarCategoria(field, editValor, nuevaCategoria, editColor)
        setNuevaCategoria("")
        setEditValor(null)
        setEditColor("#ffffff")
      } else if (nuevaCategoria) {
        await handleCrearCategoria(field, nuevaCategoria, nuevoColor)
        setNuevaCategoria("")
        setNuevoColor("#ffffff")
      }
      setShowColorPicker(false)
      handleClose()
      // Actualizar el valor seleccionado si se crea/editó una categoría
      if (nuevaCategoria) {
        setNuevoCliente({ ...nuevoCliente, [field]: nuevaCategoria })
      }
    } catch (err) {
      let msg = "Error al crear o editar la categoría"
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            msg = parsed[0].message
          }
        } catch {
          msg = err.message
        }
      } else if (typeof err === "string") {
        try {
          const parsed = JSON.parse(err)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            msg = parsed[0].message
          } else {
            msg = err
          }
        } catch {
          msg = err
        }
      }
      setCreateError(msg)
    }
  }

  const handleDelete = async (valor: string) => {
    if (!canManageCategories) {
      alert("Solo los administradores pueden eliminar categorías")
      return
    }

    setDeleteError(null)
    try {
      await handleEliminarCategoria(field, valor)
      // Si el valor eliminado es el seleccionado, limpiar el campo
      if (nuevoCliente[field] === valor) {
        setNuevoCliente({ ...nuevoCliente, [field]: "" })
      }
    } catch (err: unknown) {
      let msg = "Error al eliminar la categoría"
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            if (parsed[0].message.toLowerCase().includes("en uso")) {
              msg = "No se puede eliminar la categoría porque está en uso dentro de la tabla de clientes."
            } else {
              msg = parsed[0].message
            }
          }
        } catch {
          msg = err.message
        }
      } else if (typeof err === "string") {
        try {
          const parsed = JSON.parse(err)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            if (parsed[0].message.toLowerCase().includes("en uso")) {
              msg = "No se puede eliminar la categoría porque está en uso dentro de la tabla de clientes."
            } else {
              msg = parsed[0].message
            }
          } else {
            msg = err
          }
        } catch {
          msg = err
        }
      }
      setDeleteError(msg)
    }
  }

  const handleEditar = (option: { valor: string; color: string | null }) => {
    if (!canManageCategories) {
      alert("Solo los administradores pueden editar categorías")
      return
    }

    setNuevaCategoria(option.valor)
    setEditValor(option.valor)
    setEditColor(option.color || "#ffffff")
    setShowColorPicker(false)
    setShow(true)
  }

  return (
    <>
      <Form.Group controlId={field}>
        <Form.Label>
          {label} {required ? "*" : ""}
        </Form.Label>
        {error && (
          <div className="alert alert-danger mt-2">
            {error}
          </div>
        )}
        <InputGroup>
          <Form.Select
            value={nuevoCliente[field] ?? ""}
            onChange={(e) => {
              console.log(`Selecting ${field}: ${e.target.value}`)
              setNuevoCliente({ ...nuevoCliente, [field]: e.target.value })
            }}
            required={required}
            isInvalid={!!error}
            aria-describedby={ariaDescribedBy}
          >
            <option value="">Seleccione...</option>
            {options.map((option) => (
              <option key={option.valor} value={option.valor}>
                {option.valor}
              </option>
            ))}
          </Form.Select>
          {canManageCategories && (
            <Button
              variant="outline-secondary"
              onClick={() => setShow(true)}
              aria-label={`Abrir gestión de categorías para ${label}`}
            >
              <i className="bi bi-gear" />
            </Button>
          )}
        </InputGroup>
      </Form.Group>

      {canManageCategories && (
        <Modal show={show} onHide={handleClose} centered aria-labelledby={`${field}-modal-title`}>
          <Modal.Header closeButton>
            <Modal.Title id={`${field}-modal-title`}>{label}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId={`nuevaCategoria-${field}`} className="mb-3">
              <Form.Label>{editValor !== null ? "Editar Categoría" : "Nueva Categoría"}</Form.Label>
              {createError && (
                <div className="alert alert-danger mt-2">{createError}</div>
              )}
              <InputGroup>
                <Form.Control
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Ingrese nueva categoría"
                  aria-describedby={`${field}-desc`}
                />
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!nuevaCategoria}
                  aria-label={editValor !== null ? "Guardar edición" : "Agregar categoría"}
                >
                  {editValor !== null ? "Guardar" : "Agregar"}
                </Button>
              </InputGroup>
              <div className="mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  aria-label="Seleccionar color"
                >
                  {showColorPicker ? "Cerrar paleta" : "Seleccionar color"}
                </Button>
                {showColorPicker && (
                  <div className="mt-2">
                    <ChromePicker
                      color={editValor !== null ? editColor : nuevoColor}
                      onChange={(color: ColorResult) =>
                        editValor !== null ? setEditColor(color.hex) : setNuevoColor(color.hex)
                      }
                    />
                  </div>
                )}
              </div>
            </Form.Group>
            {deleteError && (
              <div className="alert alert-danger mt-2">{deleteError}</div>
            )}
            <ListGroup>
              {options.map((option) => (
                <ListGroup.Item key={option.valor} className="d-flex justify-content-between align-items-center">
                  <div>
                    {option.valor}
                    {option.color && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: option.color,
                          border: "1px solid #ccc",
                          marginLeft: "10px",
                          verticalAlign: "middle",
                        }}
                      ></span>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditar(option)}
                      aria-label={`Editar ${option.valor}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(option.valor)}
                      aria-label={`Eliminar ${option.valor}`}
                    >
                      Eliminar
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} aria-label="Cerrar gestión de categorías">
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}