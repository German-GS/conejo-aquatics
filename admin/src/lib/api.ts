export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "conejo-aquatics-admin-token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearToken();
    // BASE_URL ya trae "/ac/" en producción — no hardcodear "/login" a
    // secas, o manda a la raíz del hosting de Conejo Motors en vez de acá.
    window.location.assign(`${import.meta.env.BASE_URL}login`);
    throw new ApiError("Sesión expirada.", 401);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? `Error ${res.status}`);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return manejarRespuesta<T>(res);
}

async function upload<T>(path: string, archivo: File, campo: string): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append(campo, archivo);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  return manejarRespuesta<T>(res);
}

// Para archivos que requieren sesión (ej. PDF de una factura) — un
// <a href> normal no manda el Authorization header, así que hay que
// traer el archivo primero y armar un blob URL con el resultado.
async function getBlob(path: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      window.location.assign(`${import.meta.env.BASE_URL}login`);
    }
    throw new ApiError(`No se pudo descargar el archivo (error ${res.status}).`, res.status);
  }
  return res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, archivo: File, campo = "archivo") => upload<T>(path, archivo, campo),
  getBlob,
};
