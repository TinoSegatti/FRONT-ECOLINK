"use client"

import { useState, useEffect } from "react"
import {
  type Cliente,
  defaultCliente,
  type GestionableFieldKey,
  type GestionableField,
  type ColumnasFiltrables,
} from "../types"
import {
  fetchClientes,
  crearCliente,
  eliminarCliente,
  actualizarCliente,
  fetchCategorias,
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
} from "../services/api/clientes"

export default function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [gestionFields, setGestionFields] = useState<Record<GestionableFieldKey, GestionableField>>({
    zona: { options: [] },
    semana: { options: [] },
    tipoCliente: { options: [] },
    estadoTurno: { options: [] },
    prioridad: { options: [] },
    estado: { options: [] },
    gestionComercial: { options: [] },
  })
  const [nuevoCliente, setNuevoCliente] = useState<Omit<Cliente, "id">>({ ...defaultCliente, localidad: null })
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filtros, setFiltros] = useState<
    Record<ColumnasFiltrables, Set<string>> &
      Partial<Record<"fechaDeuda" | "ultimaRecoleccion" | "contratacion", { desde: string; hasta: string }>>
  >(() => ({
    zona: new Set<string>(),
    semana: new Set<string>(),
    tipoCliente: new Set<string>(),
    estadoTurno: new Set<string>(),
    prioridad: new Set<string>(),
    estado: new Set<string>(),
    gestionComercial: new Set<string>(),
    fechaDeuda: { desde: "", hasta: "" },
    ultimaRecoleccion: { desde: "", hasta: "" },
    contratacion: { desde: "", hasta: "" },
  }))
  const [categoriaError, setCategoriaError] = useState<string | null>(null)

  const loadClientes = async () => {
    setIsLoading(true)
    try {
      const data = await fetchClientes()
      console.log(
        "Datos crudos de clientes:",
        data.map((cliente) => ({
          id: cliente.id,
          nombre: cliente.nombre,
          fechaDeuda: cliente.fechaDeuda,
          ultimaRecoleccion: cliente.ultimaRecoleccion,
          contratacion: cliente.contratacion,
        })),
      )
      setClientes(data)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategorias = async (field: GestionableFieldKey) => {
    try {
      const options = await fetchCategorias(field)
      setGestionFields((prev) => ({ ...prev, [field]: { options } }))
    } catch (error) {
      console.error(`Error al cargar categorías para ${field}:`, error)
    }
  }

  const iniciarCreacion = () => {
    setNuevoCliente({ ...defaultCliente, localidad: null })
    setCategoriaError(null)
  }

  const handleCrearCliente = async (): Promise<{ success: boolean; errors?: { field: string; message: string }[] }> => {
    try {
      const response = await crearCliente(nuevoCliente)

      if (!response.success) {
        return {
          success: false,
          errors: response.errors,
        }
      }

      setNuevoCliente({ ...defaultCliente, localidad: null })
      await loadClientes()
      setCategoriaError(null)

      return { success: true }
    } catch (error: unknown) {
      console.error("Error al crear cliente:", error)
      return {
        success: false,
        errors: [{ field: "general", message: "Error inesperado al crear el cliente" }],
      }
    }
  }

  const handleActualizarCliente = async (id: number, data: Omit<Cliente, "id">): Promise<{ success: boolean; errors?: { field: string; message: string }[] }> => {
    try {
      const response = await actualizarCliente(id, data)
      if (!response.success) {
        return {
          success: false,
          errors: response.errors,
        }
      }
      setClienteEditando(null)
      await loadClientes()
      setCategoriaError(null)
      return { success: true }
    } catch (error: unknown) {
      console.error("Error al actualizar cliente:", error)
      return {
        success: false,
        errors: [{ field: "general", message: "Error inesperado al actualizar el cliente" }],
      }
    }
  }

  const handleEliminarCliente = async (id: number) => {
    try {
      await eliminarCliente(id)
      await loadClientes()
      setCategoriaError(null)
    } catch (error: unknown) {
      console.error("Error al eliminar cliente:", error)
      throw error instanceof Error ? error : new Error("Error al eliminar el cliente")
    }
  }

  const iniciarEdicion = (cliente: Cliente) => {
    setClienteEditando({ ...cliente, localidad: null })
    setCategoriaError(null)
  }

  const cancelarEdicion = () => {
    setClienteEditando(null)
    setCategoriaError(null)
  }

  const handleCrearCategoria = async (field: GestionableFieldKey, valor: string, color?: string) => {
    try {
      await crearCategoria(field, valor, color)
      await loadCategorias(field)
      setCategoriaError(null)
    } catch (error: unknown) {
      console.error("Error al crear categoría:", error)
      throw error instanceof Error ? error : new Error("Error al crear la categoría")
    }
  }

  const handleEditarCategoria = async (
    field: GestionableFieldKey,
    oldValor: string,
    newValor: string,
    color?: string,
  ) => {
    try {
      await editarCategoria(field, oldValor, newValor, color)
      await loadClientes()
      await loadCategorias(field)
      setCategoriaError(null)
    } catch (error: unknown) {
      console.error("Error al editar categoría:", error)
      throw error instanceof Error ? error : new Error("Error al editar la categoría")
    }
  }

  const handleEliminarCategoria = async (field: GestionableFieldKey, valor: string) => {
    try {
      const today = new Date()
      const deleteAt = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
      await eliminarCategoria(field, valor, deleteAt)
      await loadClientes()
      await loadCategorias(field)
      setCategoriaError(null)
    } catch (error: unknown) {
      console.error("Error al eliminar categoría:", error)
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message)
          const errorMessage = parsedError.errors?.[0]?.message || error.message
          setCategoriaError(errorMessage)
        } catch {
          setCategoriaError(error.message)
        }
      } else {
        setCategoriaError("Error al eliminar la categoría")
      }
      throw error
    }
  }

  const clearCategoriaError = () => {
    setCategoriaError(null)
  }

  const handleFiltroCategoricalChange = (columna: ColumnasFiltrables, valor: string, checked: boolean) => {
    setFiltros((prev) => {
      const newFiltros = { ...prev }
      const newSet = new Set(prev[columna] as Set<string>)
      if (checked) {
        newSet.add(valor)
      } else {
        newSet.delete(valor)
      }
      newFiltros[columna] = newSet
      return newFiltros
    })
  }

  const handleFiltroFechaChange = (
    columna: "fechaDeuda" | "ultimaRecoleccion" | "contratacion",
    valor: { desde: string; hasta: string },
    checked: boolean,
  ) => {
    console.log(`Llamada a handleFiltroFechaChange para ${columna}:`, { valor, checked })
    setFiltros((prev) => {
      const newFiltros = { ...prev }
      if (checked && (valor.desde || valor.hasta)) {
        newFiltros[columna] = { desde: valor.desde.trim(), hasta: valor.hasta.trim() }
      } else {
        newFiltros[columna] = { desde: "", hasta: "" }
      }
      console.log("Nuevo estado de filtros:", {
        fechaDeuda: newFiltros.fechaDeuda,
        ultimaRecoleccion: newFiltros.ultimaRecoleccion,
        contratacion: newFiltros.contratacion,
      })
      return newFiltros
    })
  }

  const limpiarTodosLosFiltros = () => {
    setFiltros({
      zona: new Set<string>(),
      semana: new Set<string>(),
      tipoCliente: new Set<string>(),
      estadoTurno: new Set<string>(),
      prioridad: new Set<string>(),
      estado: new Set<string>(),
      gestionComercial: new Set<string>(),
    })
  }

  const getUniqueValues = (columna: keyof Cliente): string[] => {
    return Array.from(new Set(clientes.map((c) => String(c[columna] ?? "")))).sort()
  }

  console.log("Estado de filtros antes de filtrar:", {
    fechaDeuda: filtros.fechaDeuda,
    ultimaRecoleccion: filtros.ultimaRecoleccion,
    contratacion: filtros.contratacion,
  })

  const clientesFiltrados = clientes.filter((cliente) => {
    console.log("Evaluando cliente:", {
      id: cliente.id,
      nombre: cliente.nombre,
      fechaDeuda: cliente.fechaDeuda,
      ultimaRecoleccion: cliente.ultimaRecoleccion,
      contratacion: cliente.contratacion,
    })
    return Object.entries(filtros).every(([col, filtro]) => {
      if (["fechaDeuda", "ultimaRecoleccion", "contratacion"].includes(col)) {
        const { desde, hasta } = filtro as { desde: string; hasta: string }
        console.log(`Filtrando ${col}:`, { desde, hasta, valorCliente: cliente[col as keyof Cliente] })
        if (!desde && !hasta) {
          console.log(`No hay filtro activo para ${col}`)
          return true
        }
        const fecha = cliente[col as keyof Cliente] as string | null
        if (!fecha) {
          console.log(`Cliente sin fecha para ${col}, excluyendo`)
          return false
        }
        const parseDate = (dateStr: string): Date | null => {
          const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
          if (!match) {
            console.warn(`Formato de fecha inválido: ${dateStr}`)
            return null
          }
          const [, day, month, year] = match
          const date = new Date(Number(year), Number(month) - 1, Number(day))
          if (isNaN(date.getTime())) {
            console.warn(`Fecha inválida: ${dateStr}`)
            return null
          }
          return date
        }
        const fechaDate = parseDate(fecha)
        if (!fechaDate) return false
        const desdeDate = desde ? parseDate(desde) : null
        const hastaDate = hasta ? parseDate(hasta) : null
        if (desde && !desdeDate) {
          console.warn(`Fecha 'desde' inválida para ${col}:`, desde)
          return false
        }
        if (hasta && !hastaDate) {
          console.warn(`Fecha 'hasta' inválida para ${col}:`, hasta)
          return false
        }
        const result = (!desdeDate || fechaDate >= desdeDate) && (!hastaDate || fechaDate <= hastaDate)
        console.log(`Resultado del filtro para ${col}:`, result, {
          fecha: fechaDate.toISOString(),
          desde: desdeDate?.toISOString() || "N/A",
          hasta: hastaDate?.toISOString() || "N/A",
        })
        return result
      } else {
        const valores = filtro as Set<string>
        if (valores.size === 0) return true
        const valor = cliente[col as keyof Cliente] ?? "N/A"
        return valores.has(String(valor))
      }
    })
  })

  console.log(
    "Clientes filtrados:",
    clientesFiltrados.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      fechaDeuda: c.fechaDeuda,
    })),
  )

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        await loadClientes()
        if (isMounted) {
          await Promise.all(Object.keys(gestionFields).map((field) => loadCategorias(field as GestionableFieldKey)))
        }
      } catch (error) {
        console.error("Error en la carga inicial:", error)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    clientes: clientesFiltrados,
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
    categoriaError,
    clearCategoriaError,
    filtros,
    handleFiltroCategoricalChange,
    handleFiltroFechaChange,
    limpiarTodosLosFiltros,
    getUniqueValues,
  }
}