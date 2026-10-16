"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "./api";

const TOKEN_KEY = "aquatics_cliente_token";
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:5173";

export type ClienteSesion = {
  id: string;
  nombre: string;
  email: string;
  tipoCliente: "detalle" | "mayorista";
};

type AuthClienteContextValue = {
  cliente: ClienteSesion | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  registrar: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthClienteContext = createContext<AuthClienteContextValue | null>(null);

async function llamar<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mensaje =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : "Ocurrió un error. Intentá de nuevo.";
    throw new Error(mensaje);
  }
  return data as T;
}

export function AuthClienteProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<ClienteSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarSesion = useCallback(async (token: string) => {
    const res = await fetch(`${API_URL}/clientes/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      setCliente(null);
      return;
    }
    setCliente((await res.json()) as ClienteSesion);
  }, []);

  useEffect(() => {
    let ignorado = false;
    async function iniciar() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await cargarSesion(token);
      }
      if (!ignorado) setCargando(false);
    }
    void iniciar();
    return () => {
      ignorado = true;
    };
  }, [cargarSesion]);

  const login = useCallback(async (email: string, password: string) => {
    // Un solo formulario sirve para clientes y para personal: el backend
    // dice a qué tipo de cuenta pertenece. Si es personal, lo mandamos al
    // panel administrativo con el token en el fragmento de la URL (nunca
    // en la query ni en el body de ninguna petición posterior), para que
    // no quede en el historial del servidor ni en los logs.
    const data = await llamar<
      | { tipo: "cliente"; accessToken: string; cliente: ClienteSesion }
      | { tipo: "staff"; accessToken: string }
    >("/acceso/login", { email, password });

    if (data.tipo === "staff") {
      window.location.href = `${ADMIN_URL}/ingreso#token=${encodeURIComponent(data.accessToken)}`;
      return;
    }

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    setCliente(data.cliente);
  }, []);

  const registrar = useCallback(
    async (nombre: string, email: string, password: string) => {
      const data = await llamar<{ accessToken: string; cliente: ClienteSesion }>(
        "/clientes/registro",
        { nombre, email, password },
      );
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      setCliente(data.cliente);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setCliente(null);
  }, []);

  return (
    <AuthClienteContext.Provider
      value={{ cliente, cargando, login, registrar, logout }}
    >
      {children}
    </AuthClienteContext.Provider>
  );
}

export function useClienteAuth() {
  const ctx = useContext(AuthClienteContext);
  if (!ctx) {
    throw new Error("useClienteAuth debe usarse dentro de AuthClienteProvider");
  }
  return ctx;
}
