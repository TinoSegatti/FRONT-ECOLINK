"use client"

import { useState, useEffect, useCallback } from "react"
import type { Cliente, GestionableFieldKey, GestionableField, ColumnasFiltrables } from "../types"
import { defaultCliente } from "../types"
import {
  fetchClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  fetchCategorias,
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
} from "../services/api/clientes"

export default function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nuevoCliente, setNuevoCliente] = useState<Omit<Cliente, "id">>(defaultCliente)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [gestionFields, setGestionFields] = useState<Record<GestionableFieldKey, GestionableField>>({
    zona: { options: [] },
    semana: { options: [] },
    tipoCliente: { options: [] },
    estadoTurno: { options: [] },
    prioridad: { options: [] },
    estado: { options: [] },
    gestionComercial: { options: [] },
  })

  // Estados para filtros
  const [filtros, setFiltros] = useState<Record<ColumnasFiltrables, Set<string>>>({
    zona: new Set(),
    semana: new Set(),
    tipoCliente: new Set(),
    estadoTurno: new Set(),
    prioridad: new Set(),
    estado: new Set(),
    gestionComercial: new Set(),
  })

  const [filtrosFecha, setFiltrosFecha] = useState<
    Record<"fechaDeuda" | "ultimaRecoleccion" | "contratacion", { desde: string; hasta: string }>
  >({
    fechaDeuda: { desde: "", hasta: "" },
    ultimaRecoleccion: { desde: "", hasta: "" },
    contratacion: { desde: "", hasta: "" },
  })

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Cargar clientes
        const clientesData = await fetchClientes()
        setClientes(clientesData)
        setClientesFiltrados(clientesData)

        // Cargar categorías para cada campo gestionable
        const fieldsToLoad: GestionableFieldKey[] = [
          "zona",
          "semana",
          "tipoCliente",
          "estadoTurno",
          "prioridad",
          "estado",
          "gestionComercial",
        ]

        const gestionFieldsData: Record<GestionableFieldKey, GestionableField> = {
          zona: { options: [] },
          semana: { options: [] },
          tipoCliente: { options: [] },
          estadoTurno: { options: [] },
          prioridad: { options: [] },
          estado: { options: [] },
          gestionComercial: { options: [] },
        }

        for (const field of fieldsToLoad) {
          try {
            const options = await fetchCategorias(field)
            gestionFieldsData[field] = { options }
          } catch (error) {
            console.error(`Error loading categories for ${field}:`, error)
            gestionFieldsData[field] = { options: [] }
          }
        }

        setGestionFields(gestionFieldsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...clientes]

    // Aplicar filtros categóricos
    Object.entries(filtros).forEach(([campo, valores]) => {
      if (valores.size > 0) {
        filtered = filtered.filter((cliente) => {
          const valorCliente = cliente[campo as keyof Cliente]
          return valores.has(String(valorCliente || ""))
        })
      }
    })

    // Aplicar filtros de fecha
    Object.entries(filtrosFecha).forEach(([campo, rango]) => {
      if (rango.desde || rango.hasta) {
        filtered = filtered.filter((cliente) => {
          const fechaCliente = cliente[campo as keyof Cliente] as string
          if (!fechaCliente) return false

          const [dia, mes, año] = fechaCliente.split("/")
          const fechaClienteObj = new Date(Number.parseInt(año), Number.parseInt(mes) - 1, Number.parseInt(dia))

          let cumpleFiltro = true

          if (rango.desde) {
            const [diaDesde, mesDesde, añoDesde] = rango.desde.split("/")
            const fechaDesde = new Date(
              Number.parseInt(añoDesde),
              Number.parseInt(mesDesde) - 1,
              Number.parseInt(diaDesde),
            )
            cumpleFiltro = cumpleFiltro && fechaClienteObj >= fechaDesde
          }

          if (rango.hasta) {
            const [diaHasta, mesHasta, añoHasta] = rango.hasta.split("/")
            const fechaHasta = new Date(
              Number.parseInt(añoHasta),
              Number.parseInt(mesHasta) - 1,
              Number.parseInt(diaHasta),
            )
            cumpleFiltro = cumpleFiltro && fechaClienteObj <= fechaHasta
          }

          return cumpleFiltro
        })
      }
    })

    setClientesFiltrados(filtered)
  }, [clientes, filtros, filtrosFecha])

  // Funciones de gestión de clientes
  const handleCrearCliente = async () => {
    try {
      const response = await crearCliente(nuevoCliente)
      if (response.success && response.data) {
        setClientes((prev) => [...prev, response.data!])
        setNuevoCliente(defaultCliente)
        return { success: true }
      } else {
        return { success: false, errors: response.errors }
      }
    } catch (error) {
      console.error("Error creating client:", error)
      return { success: false, errors: [{ field: "general", message: "Error al crear cliente" }] }
    }
  }

  const handleActualizarCliente = async (id: number, data: Partial<Cliente>) => {
    try {
      const response = await actualizarCliente(id, data)
      if (response.success && response.data) {
        setClientes((prev) => prev.map((cliente) => (cliente.id === id ? response.data! : cliente)))
        setClienteEditando(null)
        return { success: true }
      } else {
        return { success: false, errors: response.errors }
      }
    } catch (error) {
      console.error("Error updating client:", error)
      return { success: false, errors: [{ field: "general", message: "Error al actualizar cliente" }] }
    }
  }

  const handleEliminarCliente = async (id: number) => {
    try {
      await eliminarCliente(id)
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
    } catch (error) {
      console.error("Error deleting client:", error)
      throw error
    }
  }

  // Funciones de gestión de categorías
  const handleCrearCategoria = async (field: GestionableFieldKey, valor: string, color?: string) => {
    try {
      await crearCategoria(field, valor, color)
      const options = await fetchCategorias(field)
      setGestionFields((prev) => ({
        ...prev,
        [field]: { options },
      }))
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
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
      const options = await fetchCategorias(field)
      setGestionFields((prev) => ({
        ...prev,
        [field]: { options },
      }))
    } catch (error) {
      console.error("Error editing category:", error)
      throw error
    }
  }

  const handleEliminarCategoria = async (field: GestionableFieldKey, valor: string) => {
    try {
      const today = new Date();
      const deleteAt = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${today.getFullYear()}`;
      await eliminarCategoria(field, valor, deleteAt);
      const options = await fetchCategorias(field);
      setGestionFields((prev) => ({
        ...prev,
        [field]: { options },
      }));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  // Funciones de filtrado
  const handleFiltroCategoricalChange = useCallback((columna: ColumnasFiltrables, valor: string, checked: boolean) => {
    setFiltros((prev) => {
      const newFiltros = { ...prev }
      if (checked) {
        newFiltros[columna].add(valor)
      } else {
        newFiltros[columna].delete(valor)
      }
      return newFiltros
    })
  }, [])

  const handleFiltroFechaChange = useCallback(
    (
      columna: "fechaDeuda" | "ultimaRecoleccion" | "contratacion",
      valor: { desde: string; hasta: string },
      checked: boolean,
    ) => {
      setFiltrosFecha((prev) => ({
        ...prev,
        [columna]: checked ? valor : { desde: "", hasta: "" },
      }))
    },
    [],
  )

  const limpiarTodosLosFiltros = useCallback(() => {
    setFiltros({
      zona: new Set(),
      semana: new Set(),
      tipoCliente: new Set(),
      estadoTurno: new Set(),
      prioridad: new Set(),
      estado: new Set(),
      gestionComercial: new Set(),
    })
    setFiltrosFecha({
      fechaDeuda: { desde: "", hasta: "" },
      ultimaRecoleccion: { desde: "", hasta: "" },
      contratacion: { desde: "", hasta: "" },
    })
  }, [])

  const getUniqueValues = useCallback(
    (columna: keyof Cliente): string[] => {
      const valores = clientes.map((cliente) => String(cliente[columna] || "")).filter((valor) => valor !== "")
      return [...new Set(valores)].sort()
    },
    [clientes],
  )

  // Funciones de edición
  const iniciarCreacion = useCallback(() => {
    setNuevoCliente(defaultCliente)
  }, [])

  const iniciarEdicion = useCallback((cliente: Cliente) => {
    setClienteEditando(cliente)
  }, [])

  const cancelarEdicion = useCallback(() => {
    setClienteEditando(null)
  }, [])

  return {
    clientes: clientesFiltrados, // Devolver clientes filtrados
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
    filtros: {
      ...filtros,
      ...filtrosFecha,
    },
    handleFiltroCategoricalChange,
    handleFiltroFechaChange,
    limpiarTodosLosFiltros,
    getUniqueValues,
  }
}
