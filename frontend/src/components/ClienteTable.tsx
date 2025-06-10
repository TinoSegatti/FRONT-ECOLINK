"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Form } from "react-bootstrap"
import { type Cliente, type ColumnasFiltrables, columnasFiltrables, type ClienteTableProps } from "../types"
import { fetchCategorias } from "../services/api/clientes"

// Funciones de conversión de fechas
const formatDateToBackend = (date: string): string => {
    if (!date) return ""
    const [year, month, day] = date.split("-")
    return `${day}/${month}/${year}`
}

const formatDateFromBackend = (date: string): string => {
    if (!date) return ""
    const [day, month, year] = date.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

interface ExtendedClienteTableProps extends ClienteTableProps {
    onEditarCliente: (cliente: Cliente) => void
    handleFiltroFechaChange: (
        columna: "fechaDeuda" | "ultimaRecoleccion" | "contratacion",
        valor: { desde: string; hasta: string },
        checked: boolean,
    ) => void
}

// Mover esta línea ANTES de la función del componente
const columnasDeFecha: (keyof Cliente)[] = ["fechaDeuda", "ultimaRecoleccion", "contratacion"]

export default function ClienteTable({
    clientes,
    onEditarCliente,
    filtros,
    handleFiltroChange,
    handleFiltroFechaChange,
    getUniqueValues,
}: ExtendedClienteTableProps) {
    console.log("Clientes recibidos:", {
        clientesLength: clientes.length,
        filtros,
        hasHandleFiltroFechaChange: !!handleFiltroFechaChange,
    })

    const columnas: (keyof Cliente)[] = [
        "nombre",
        "zona",
        "barrio",
        "direccion",
        "detalleDireccion",
        "telefono",
        "semana",
        "observaciones",
        "tipoCliente",
        "debe",
        "fechaDeuda",
        "precio",
        "ultimaRecoleccion",
        "contratacion",
        "nuevo",
        "estadoTurno",
        "prioridad",
        "estado",
        "gestionComercial",
        "CUIT",
        "condicion",
        "factura",
        "pago",
        "origenFacturacion",
        "nombreEmpresa",
        "emailAdministracion",
        "emailComercial",
    ]

    const [filtroAbierto, setFiltroAbierto] = useState<keyof Cliente | null>(null)
    const [filtrosTemporales, setFiltrosTemporales] = useState<Record<ColumnasFiltrables, Set<string>>>(() =>
        columnasFiltrables.reduce(
        (acc: Record<ColumnasFiltrables, Set<string>>, col: ColumnasFiltrables) => {
            acc[col] = new Set((filtros[col] as Set<string>) || [])
            return acc
        },
        {} as Record<ColumnasFiltrables, Set<string>>,
        ),
    )

    // Estado separado para filtros de fecha aplicados
    const [filtrosFechaAplicados, setFiltrosFechaAplicados] = useState<
        Record<keyof Cliente, { desde: string; hasta: string }>
    >(() =>
        columnasDeFecha.reduce(
        (acc, col) => {
            const filtroActual = filtros[col] as { desde: string; hasta: string } | undefined
            acc[col] = filtroActual || { desde: "", hasta: "" }
            return acc
        },
        {} as Record<keyof Cliente, { desde: string; hasta: string }>,
        ),
    )

    const [filtrosTemporalesFechas, setFiltrosTemporalesFechas] = useState<
        Record<keyof Cliente, { desde: string; hasta: string }>
    >(() =>
        columnasDeFecha.reduce(
        (acc, col) => {
            acc[col] = { desde: "", hasta: "" }
            return acc
        },
        {} as Record<keyof Cliente, { desde: string; hasta: string }>,
        ),
    )

    const [showEmpresaColumns, setShowEmpresaColumns] = useState(false)
    const [categoriaColores, setCategoriaColores] = useState<Record<ColumnasFiltrables, Record<string, string | null>>>(
        () =>
        columnasFiltrables.reduce(
            (acc, col) => {
            acc[col] = {}
            return acc
            },
            {} as Record<ColumnasFiltrables, Record<string, string | null>>,
        ),
    )
    const filtroRef = useRef<HTMLDivElement | null>(null)

    // Calcular altura mínima para la tabla
    const calcularAlturaMinima = () => {
        const alturaHeader = 60 // Altura aproximada del header
        const alturaFila = 45 // Altura aproximada de cada fila
        const alturaFiltro = 400 // Altura máxima del dropdown de filtros + margen
        const filasMinimas = Math.max(8, Math.ceil(alturaFiltro / alturaFila)) // Mínimo 8 filas o las necesarias para los filtros

        return alturaHeader + filasMinimas * alturaFila
    }

    // Efecto para sincronizar filtros aplicados con los filtros del padre
    useEffect(() => {
        setFiltrosFechaAplicados((prev) => {
        const newState = { ...prev }
        columnasDeFecha.forEach((col) => {
            const filtroActual = filtros[col] as { desde: string; hasta: string } | undefined
            newState[col] = filtroActual || { desde: "", hasta: "" }
        })
        return newState
        })
    }, [filtros])

    useEffect(() => {
        const loadCategorias = async () => {
        try {
            const promises = columnasFiltrables.map(async (campo) => {
            const categorias = await fetchCategorias(campo)
            const colorMap = categorias.reduce(
                (acc, cat) => {
                acc[cat.valor] = cat.color
                return acc
                },
                {} as Record<string, string | null>,
            )
            return { campo, colorMap }
            })
            const resultados = await Promise.all(promises)
            setCategoriaColores((prev) => {
            const newColores = { ...prev }
            resultados.forEach(({ campo, colorMap }) => {
                newColores[campo] = colorMap
            })
            return newColores
            })
        } catch (error) {
            console.error("Error al cargar colores de categorías:", error)
        }
        }
        loadCategorias()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (filtroRef.current && !filtroRef.current.contains(event.target as Node)) {
            setFiltroAbierto(null)
        }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

   const sortedClientes = [...clientes].sort((a, b) => {
    // Convertir a mayúsculas para comparación case-insensitive
    const estadoA = a.estado?.toUpperCase()
    const estadoB = b.estado?.toUpperCase()
    
    if (estadoA === "INACTIVO" && estadoB !== "INACTIVO") return 1
    if (estadoA !== "INACTIVO" && estadoB === "INACTIVO") return -1
    if (estadoA === "BAJA" && estadoB !== "BAJA") return 1
    if (estadoA !== "BAJA" && estadoB === "BAJA") return -1
    return 0
})

    const toggleFiltro = (columna: keyof Cliente) => {
        setFiltroAbierto(filtroAbierto === columna ? null : columna)
        if (filtroAbierto !== columna && columnasFiltrables.includes(columna as ColumnasFiltrables)) {
        setFiltrosTemporales((prev) => ({
            ...prev,
            [columna]: new Set((filtros[columna as ColumnasFiltrables] as Set<string>) || []),
        }))
        }
        if (filtroAbierto !== columna && columnasDeFecha.includes(columna)) {
        // Al abrir el filtro, mostrar los valores actualmente aplicados
        const filtroAplicado = filtrosFechaAplicados[columna]
        setFiltrosTemporalesFechas((prev) => ({
            ...prev,
            [columna]: {
            desde: filtroAplicado.desde ? formatDateFromBackend(filtroAplicado.desde) : "",
            hasta: filtroAplicado.hasta ? formatDateFromBackend(filtroAplicado.hasta) : "",
            },
        }))
        }
    }

    const handleFiltroTemporalChange = (
        columna: keyof Cliente,
        valor: string,
        checked: boolean,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        e.stopPropagation()
        if (columnasFiltrables.includes(columna as ColumnasFiltrables)) {
        setFiltrosTemporales((prev) => {
            const newSet = new Set(prev[columna as ColumnasFiltrables])
            if (checked) {
            newSet.add(valor)
            } else {
            newSet.delete(valor)
            }
            return { ...prev, [columna]: newSet }
        })
        }
    }

    const handleFiltroFechaChangeLocal = (columna: keyof Cliente, campo: "desde" | "hasta", valor: string) => {
        setFiltrosTemporalesFechas((prev) => ({
        ...prev,
        [columna]: { ...prev[columna], [campo]: valor },
        }))
    }

    const aplicarFiltros = (columna: keyof Cliente) => {
        if (columnasFiltrables.includes(columna as ColumnasFiltrables)) {
        filtrosTemporales[columna as ColumnasFiltrables].forEach((valor) => {
            if (!(filtros[columna as ColumnasFiltrables] as Set<string> | undefined)?.has(valor)) {
            handleFiltroChange(columna, valor, true)
            }
        })
        ;(filtros[columna as ColumnasFiltrables] as Set<string> | undefined)?.forEach((valor) => {
            if (!filtrosTemporales[columna as ColumnasFiltrables].has(valor)) {
            handleFiltroChange(columna, valor, false)
            }
        })
        setFiltroAbierto(null)
        }
    }

    const aplicarFiltrosFecha = (columna: keyof Cliente) => {
        if (columnasDeFecha.includes(columna)) {
        const { desde, hasta } = filtrosTemporalesFechas[columna]
        const formattedFilter = {
            desde: desde ? formatDateToBackend(desde).trim() : "",
            hasta: hasta ? formatDateToBackend(hasta).trim() : "",
        }
        console.log(`Aplicando filtro de fecha para ${columna}:`, {
            input: { desde, hasta },
            formatted: formattedFilter,
        })
        console.log("Invocando handleFiltroFechaChange:", { columna, formattedFilter })

        // Actualizar el estado de filtros aplicados
        setFiltrosFechaAplicados((prev) => ({
            ...prev,
            [columna]: formattedFilter,
        }))

        handleFiltroFechaChange(
            columna as "fechaDeuda" | "ultimaRecoleccion" | "contratacion",
            formattedFilter,
            !!(desde || hasta), // Solo aplicar si hay al menos una fecha
        )

        // No resetear los valores temporales aquí, se resetearán al cerrar el filtro
        setFiltroAbierto(null)
        }
    }

    const limpiarYFiltros = (columna: keyof Cliente) => {
        if (columnasFiltrables.includes(columna as ColumnasFiltrables)) {
        setFiltrosTemporales((prev) => ({
            ...prev,
            [columna]: new Set(),
        }))
        ;(filtros[columna as ColumnasFiltrables] as Set<string> | undefined)?.forEach((valor) => {
            handleFiltroChange(columna, valor, false)
        })
        setFiltroAbierto(null)
        }
    }

    const limpiarFiltrosFecha = (columna: keyof Cliente) => {
        if (columnasDeFecha.includes(columna)) {
        console.log(`Limpiando filtro de ${columna}`)

        // Limpiar tanto los valores temporales como los aplicados
        setFiltrosTemporalesFechas((prev) => ({
            ...prev,
            [columna]: { desde: "", hasta: "" },
        }))

        setFiltrosFechaAplicados((prev) => ({
            ...prev,
            [columna]: { desde: "", hasta: "" },
        }))

        handleFiltroFechaChange(
            columna as "fechaDeuda" | "ultimaRecoleccion" | "contratacion",
            { desde: "", hasta: "" },
            false,
        )
        setFiltroAbierto(null)
        }
    }

    const displayedColumns = showEmpresaColumns ? columnas : columnas.slice(0, 19)

    return (
        <div style={{ maxWidth: "2000px", overflowX: "auto" }}>
        <style jsx>{`
                .sticky-column {
                position: sticky;
                left: 0;
                background: var(--card-background);
                z-index: 1;
                border-right: 1px solid var(--border-color);
                }
                .sticky-column-header {
                position: sticky;
                left: 0;
                background: var(--primary-green);
                color: white;
                z-index: 2;
                border-right: 1px solid var(--border-color);
                }
                .switch-container {
                position: sticky;
                left: 0;
                display: flex;
                justify-content: flex-start;
                margin-bottom: 10px;
                margin-left: 10px;
                z-index: 3;
                background: var(--card-background);
                width: 250px;
                padding: 10px;
                border-radius: var(--radius);
                border: 1px solid var(--border-color);
                }
                .table-container {
                min-height: ${calcularAlturaMinima()}px;
                position: relative;
                }
                .table-custom {
                background-color: var(--card-background);
                border: 1px solid var(--border-color);
                }
                .table-custom thead th {
                background-color: var(--primary-green);
                color: white;
                border-color: var(--border-color);
                font-weight: 600;
                }
                .table-custom tbody tr:hover {
                background-color: var(--muted);
                }
                .table-custom tbody td {
                border-color: var(--border-color);
                color: var(--foreground);
                }
                .dropdown-menu-custom {
                background-color: var(--card-background);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                }
                .form-control-custom {
                border: 1px solid var(--border-color);
                background-color: var(--card-background);
                color: var(--foreground);
                }
                .form-control-custom:focus {
                border-color: var(--primary-green);
                box-shadow: 0 0 0 0.2rem rgba(122, 201, 67, 0.25);
                }
                .single-line-column {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 150px;
                }
                .switch-container label {
                white-space: nowrap;
                }
                .table-responsive-wrapper {
                min-height: ${calcularAlturaMinima()}px;
                position: relative;
                }
            `}</style>
        <div className="switch-container">
            <Form.Check
            type="switch"
            id="empresa-switch"
            label="Mostrar datos de empresa"
            checked={showEmpresaColumns}
            onChange={() => setShowEmpresaColumns(!showEmpresaColumns)}
            aria-label={showEmpresaColumns ? "Ocultar datos de empresa" : "Mostrar datos de empresa"}
            style={{ color: "var(--foreground)", whiteSpace: "nowrap" }}
            />
        </div>

        <div className="table-responsive-wrapper">
            <table className="table table-striped table-bordered mt-4 table-sm table-custom">
            <thead>
                <tr>
                {displayedColumns.map((columna) => (
                    <th key={columna} className={columna === "nombre" ? "sticky-column-header" : ""}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="small me-2">
                        {String(columna).charAt(0).toUpperCase() +
                            String(columna)
                            .slice(1)
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </span>
                        {(columnasFiltrables.includes(columna as ColumnasFiltrables) ||
                        columnasDeFecha.includes(columna)) && (
                        <span className="dropdown" onClick={() => toggleFiltro(columna)} style={{ cursor: "pointer" }}>
                            <i
                            className={
                                columnasDeFecha.includes(columna)
                                ? // Para filtros de fecha, verificar los filtros reales aplicados
                                    (filtros[columna] as { desde: string; hasta: string } | undefined)?.desde ||
                                    (filtros[columna] as { desde: string; hasta: string } | undefined)?.hasta
                                    ? "bi bi-funnel-fill"
                                    : "bi bi-funnel"
                                : // Para filtros categóricos, mantener la lógica actual
                                    (filtros[columna as ColumnasFiltrables] as Set<string> | undefined) &&
                                    (filtros[columna as ColumnasFiltrables] as Set<string>)!.size > 0
                                    ? "bi bi-funnel-fill"
                                    : "bi bi-funnel"
                            }
                            style={{
                                color:
                                (columnasDeFecha.includes(columna) &&
                                    ((filtros[columna] as { desde: string; hasta: string } | undefined)?.desde ||
                                    (filtros[columna] as { desde: string; hasta: string } | undefined)?.hasta)) ||
                                ((filtros[columna as ColumnasFiltrables] as Set<string> | undefined) &&
                                    (filtros[columna as ColumnasFiltrables] as Set<string>)!.size > 0)
                                    ? "var(--accent-magenta)"
                                    : "white",
                            }}
                            ></i>
                            {filtroAbierto === columna && (
                            <div
                                ref={filtroRef}
                                className="dropdown-menu show p-3 dropdown-menu-custom"
                                style={{ minWidth: "250px", maxHeight: "350px", overflowY: "auto" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {columnasDeFecha.includes(columna) ? (
                                <div>
                                    <div className="form-group mb-3">
                                    <label className="small fw-bold mb-2" style={{ color: "var(--foreground)" }}>
                                        Desde
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm form-control-custom"
                                        value={filtrosTemporalesFechas[columna].desde}
                                        onChange={(e) => handleFiltroFechaChangeLocal(columna, "desde", e.target.value)}
                                    />
                                    </div>
                                    <div className="form-group mb-3">
                                    <label className="small fw-bold mb-2" style={{ color: "var(--foreground)" }}>
                                        Hasta
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm form-control-custom"
                                        value={filtrosTemporalesFechas[columna].hasta}
                                        onChange={(e) => handleFiltroFechaChangeLocal(columna, "hasta", e.target.value)}
                                    />
                                    </div>
                                    <div className="d-flex gap-2 mt-3">
                                    <button
                                        className="btn btn-sm w-50"
                                        style={{
                                        backgroundColor: "var(--primary-green)",
                                        color: "white",
                                        border: "none",
                                        }}
                                        onClick={() => aplicarFiltrosFecha(columna)}
                                    >
                                        <i className="bi bi-check-circle me-1"></i>
                                        Aplicar
                                    </button>
                                    <button
                                        className="btn btn-sm w-50"
                                        style={{
                                        backgroundColor: "var(--secondary-text)",
                                        color: "white",
                                        border: "none",
                                        }}
                                        onClick={() => limpiarFiltrosFecha(columna)}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Limpiar
                                    </button>
                                    </div>
                                </div>
                                ) : (
                                <>
                                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                    {getUniqueValues(columna).map((valor) => (
                                        <div key={valor} className="form-check mb-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`${columna}-${valor}`}
                                            checked={filtrosTemporales[columna as ColumnasFiltrables]?.has(valor) || false}
                                            onChange={(e) =>
                                            handleFiltroTemporalChange(columna, valor, e.target.checked, e)
                                            }
                                            style={{ accentColor: "var(--primary-green)" }}
                                        />
                                        <label
                                            className="form-check-label small"
                                            htmlFor={`${columna}-${valor}`}
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {valor}
                                        </label>
                                        </div>
                                    ))}
                                    </div>
                                    <div
                                    className="d-flex gap-2 mt-3 pt-2 border-top"
                                    style={{ borderColor: "var(--border-color)" }}
                                    >
                                    <button
                                        className="btn btn-sm w-50"
                                        style={{
                                        backgroundColor: "var(--primary-green)",
                                        color: "white",
                                        border: "none",
                                        }}
                                        onClick={() => aplicarFiltros(columna)}
                                    >
                                        <i className="bi bi-check-circle me-1"></i>
                                        Aplicar
                                    </button>
                                    <button
                                        className="btn btn-sm w-50"
                                        style={{
                                        backgroundColor: "var(--secondary-text)",
                                        color: "white",
                                        border: "none",
                                        }}
                                        onClick={() => limpiarYFiltros(columna)}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Limpiar
                                    </button>
                                    </div>
                                </>
                                )}
                            </div>
                            )}
                        </span>
                        )}
                    </div>
                    </th>
                ))}
                <th className="small">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {(sortedClientes || []).map((cliente) => (
                <tr key={cliente.id}>
                    {displayedColumns.map((columna) => {
                    const esColumnaGestionable = columnasFiltrables.includes(columna as ColumnasFiltrables)
                    const valor = cliente[columna]
                    const color = esColumnaGestionable
                        ? categoriaColores[columna as ColumnasFiltrables]?.[String(valor)]
                        : null
                    return (
                        <td
                        key={columna}
                        className={
                            columna === "nombre"
                            ? "small sticky-column fw-bold"
                            : [
                                    "detalleDireccion",
                                    "tipoCliente",
                                    "fechaDeuda",
                                    "ultimaRecoleccion",
                                    "estadoTurno",
                                    "gestionComercial",
                                ].includes(columna)
                                ? "small single-line-column"
                                : "small"
                        }
                        style={color ? { backgroundColor: color } : undefined}
                        title={
                            [
                            "detalleDireccion",
                            "tipoCliente",
                            "fechaDeuda",
                            "ultimaRecoleccion",
                            "estadoTurno",
                            "gestionComercial",
                            ].includes(columna)
                            ? String(valor)
                            : undefined
                        }
                        >
                        {columna === "nuevo" ? (
                            valor ? (
                            <span style={{ color: "var(--primary-green)" }}>✓ Sí</span>
                            ) : (
                            <span style={{ color: "var(--secondary-text)" }}>✗ No</span>
                            )
                        ) : valor === null || valor === undefined ? (
                            <span style={{ color: "var(--secondary-text)" }}>-</span>
                        ) : (
                            valor
                        )}
                        </td>
                    )
                    })}
                    <td>
                    <button
                        className="btn btn-sm"
                        style={{
                        backgroundColor: "var(--accent-magenta)",
                        color: "white",
                        border: "none",
                        }}
                        onClick={() => onEditarCliente(cliente)}
                        aria-label={`Editar cliente ${cliente.nombre}`}
                    >
                        <i className="bi bi-pencil-square me-1"></i>
                        Editar
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    )
}
