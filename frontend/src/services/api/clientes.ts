import { z } from "zod";
import type { Cliente } from "../../types";

export interface Categoria {
  id: number;
  campo: string;
  valor: string;
  color: string | null;
  deleteAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: { field: string; message: string }[];
}

const ClienteSchema = z.object({
  id: z.number(),
  zona: z.string(),
  nombre: z.string(),
  barrio: z.string(),
  direccion: z.string(),
  localidad: z.string().nullable(),
  telefono: z.string(),
  tipoCliente: z.string(),
  detalleDireccion: z.string().nullable(),
  semana: z.string().nullable(),
  observaciones: z.string().nullable(),
  debe: z.number().nullable(),
  fechaDeuda: z.string().nullable(),
  precio: z.number().nullable(),
  ultimaRecoleccion: z.string().nullable(),
  contratacion: z.string().nullable(),
  nuevo: z.boolean().optional().default(true),
  estadoTurno: z.string().nullable(),
  prioridad: z.string().nullable(),
  estado: z.string().nullable(),
  gestionComercial: z.string().nullable(),
  CUIT: z.string().nullable(),
  condicion: z.string().nullable(),
  factura: z.string().nullable(),
  pago: z.string().nullable(),
  origenFacturacion: z.string().nullable(),
  nombreEmpresa: z.string().nullable(),
  emailAdministracion: z.string().nullable(),
  emailComercial: z.string().nullable(),
});

const ClientesSchema = z.array(ClienteSchema);
const CategoriasSchema = z.object({
  options: z.array(z.object({ valor: z.string(), color: z.string().nullable() })),
});
const CategoriaSchema = z.object({
  id: z.number(),
  campo: z.string(),
  valor: z.string(),
  color: z.string().nullable(),
  deleteAt: z.string().nullable(),
});
const CategoriaResponseSchema = z.union([CategoriaSchema, z.void()]);

// Usa la misma variable de entorno que en next.config.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://back-ecolink-3.onrender.com";
const API_URL = `${BASE_URL}/api/v1`; // Cambiado a /api/v1 para coincidir con el backend

async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit,
  schema: z.ZodType<T>,
  errorMessage: string,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      // Añade un timeout para manejar el tiempo de reposo de Render
      signal: AbortSignal.timeout(30000), // 30 segundos de timeout
    });

    if (!response.ok) {
      let errorData: { error?: string; errors?: { field: string; message: string }[] } = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error(`Failed to parse error response for ${url}:`, e);
      }

      console.log(`Error response from ${url}:`, { status: response.status, errorData });

      switch (response.status) {
        case 400:
        case 409:
          return {
            success: false,
            errors: errorData.errors || [
              {
                field: "general",
                message: errorData.error || "Solicitud inválida. Verifica los datos enviados.",
              },
            ],
          };
        case 404:
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: errorData.error || `${errorMessage} no encontrado.`,
              },
            ],
          };
        case 500:
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: errorData.error || "Error interno del servidor. Intenta de nuevo más tarde.",
              },
            ],
          };
        default:
          return {
            success: false,
            errors: [
              {
                field: "general",
                message: errorData.error || `Error ${response.status}: ${response.statusText}`,
              },
            ],
          };
      }
    }

    if (response.status === 204) {
      return {
        success: true,
        data: schema.parse(undefined) as T,
      };
    }

    const data = await response.json();
    console.log(`Response from ${url}:`, data);

    try {
      return {
        success: true,
        data: schema.parse(data),
      };
    } catch (error) {
      console.error(`Zod validation error for ${url}:`, error, "Response data:", data);
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: "Error de validación de datos",
          },
        ],
      };
    }
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Error de conexión o tiempo de espera agotado",
        },
      ],
    };
  }
}

export const fetchClientes = async (): Promise<Cliente[]> => {
  const response = await fetchWithErrorHandling(`${API_URL}/clientes`, { method: "GET" }, ClientesSchema, "Clientes");

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data!;
};

export const fetchClientePorId = async (id: number): Promise<Cliente> => {
  const response = await fetchWithErrorHandling(
    `${API_URL}/clientes/${id}`,
    { method: "GET" },
    ClienteSchema,
    "Cliente",
  );

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data!;
};

export const crearCliente = async (cliente: Omit<Cliente, "id">): Promise<ApiResponse<Cliente>> => {
  const data = {
    ...cliente,
    localidad: null,
  };

  return fetchWithErrorHandling(
    `${API_URL}/clientes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    ClienteSchema,
    "Cliente",
  );
};

export const actualizarCliente = async (id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> => {
  const data = {
    ...cliente,
    localidad: null,
  };

  return fetchWithErrorHandling(
    `${API_URL}/clientes/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    ClienteSchema,
    "Cliente",
  );
};

export const eliminarCliente = async (id: number): Promise<void> => {
  const response = await fetchWithErrorHandling(`${API_URL}/clientes/${id}`, { method: "DELETE" }, z.void(), "Cliente");

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }
};

export const fetchCategorias = async (campo: string): Promise<{ valor: string; color: string | null }[]> => {
  const response = await fetchWithErrorHandling(
    `${API_URL}/categorias?campo=${campo}`,
    { method: "GET" },
    CategoriasSchema,
    "Categorías",
  );

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data!.options;
};

export const crearCategoria = async (campo: string, valor: string, color?: string): Promise<Categoria | void> => {
  const response = await fetchWithErrorHandling(
    `${API_URL}/categorias`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campo, valor, color }),
    },
    CategoriaResponseSchema,
    "Categoría",
  );

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data!;
};

export const editarCategoria = async (
  campo: string,
  oldValor: string,
  newValor: string,
  color?: string,
): Promise<Categoria | void> => {
  const response = await fetchWithErrorHandling(
    `${API_URL}/categorias`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campo, oldValor, newValor, color }),
    },
    CategoriaResponseSchema,
    "Categoría",
  );

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data!;
};

export const eliminarCategoria = async (campo: string, valor: string, deleteAt: string): Promise<Categoria | void> => {
  const response = await fetchWithErrorHandling(
    `${API_URL}/categorias`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campo, valor, deleteAt }),
    },
    CategoriaResponseSchema,
    "Categoría",
  );

  if (!response.success) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data!;
};