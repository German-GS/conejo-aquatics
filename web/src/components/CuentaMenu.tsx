"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { LogOut, User, X } from "lucide-react";
import { useClienteAuth } from "@/lib/auth-cliente";

export function CuentaMenu({ variant = "icon" }: { variant?: "icon" | "block" }) {
  const { cliente, cargando, logout } = useClienteAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuAbierto]);

  if (cliente) {
    if (variant === "block") {
      return (
        <div className="rounded-xl bg-mist-100/60 p-3">
          <p className="truncate text-sm font-semibold text-abyss-900">
            {cliente.nombre}
          </p>
          <p className="truncate text-xs text-abyss-900/55">{cliente.email}</p>
          {cliente.tipoCliente === "mayorista" && (
            <span className="mt-1.5 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocean-700">
              Cliente mayorista
            </span>
          )}
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-2 rounded-lg px-1 py-1 text-left text-sm font-medium text-abyss-900/75 hover:text-ocean-700"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      );
    }

    return (
      <div className="relative" ref={menuRef}>
        <button
          aria-label="Mi cuenta"
          onClick={() => setMenuAbierto((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ocean-700 to-turquoise-500 text-xs font-bold text-white transition-transform hover:scale-105"
        >
          {cliente.nombre.charAt(0).toUpperCase()}
        </button>
        {menuAbierto && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-abyss-900/5 bg-white p-2 shadow-xl shadow-abyss-950/10">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-abyss-900">
                {cliente.nombre}
              </p>
              <p className="truncate text-xs text-abyss-900/55">{cliente.email}</p>
              {cliente.tipoCliente === "mayorista" && (
                <span className="mt-1.5 inline-block rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocean-700">
                  Cliente mayorista
                </span>
              )}
            </div>
            <button
              onClick={() => {
                logout();
                setMenuAbierto(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-abyss-900/75 hover:bg-mist-100 hover:text-ocean-700"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === "block") {
    return (
      <>
        <button
          disabled={cargando}
          onClick={() => setModalAbierto(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-abyss-900 hover:bg-mist-100 disabled:opacity-50"
        >
          <User className="h-4 w-4" />
          Iniciar sesión
        </button>
        {modalAbierto && <ModalCuenta onClose={() => setModalAbierto(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        aria-label="Iniciar sesión"
        disabled={cargando}
        onClick={() => setModalAbierto(true)}
        className="rounded-full p-2.5 text-abyss-900/70 transition-colors hover:bg-mist-100 hover:text-ocean-700 disabled:opacity-50"
      >
        <User className="h-5 w-5" />
      </button>
      {modalAbierto && <ModalCuenta onClose={() => setModalAbierto(false)} />}
    </>
  );
}

function ModalCuenta({ onClose }: { onClose: () => void }) {
  const { login, registrar } = useClienteAuth();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        await registrar(nombre, email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-abyss-950/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-lg font-bold text-abyss-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-full p-1.5 text-abyss-900/50 hover:bg-mist-100 hover:text-abyss-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex rounded-full bg-mist-100 p-1">
          <button
            type="button"
            onClick={() => setModo("login")}
            className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors ${
              modo === "login" ? "bg-white text-ocean-700 shadow-sm" : "text-abyss-900/55"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setModo("registro")}
            className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors ${
              modo === "registro" ? "bg-white text-ocean-700 shadow-sm" : "text-abyss-900/55"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {modo === "registro" && (
            <input
              required
              minLength={2}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              className="rounded-xl border border-abyss-900/10 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="rounded-xl border border-abyss-900/10 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500"
          />
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="rounded-xl border border-abyss-900/10 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="mt-1 rounded-full bg-gradient-to-r from-ocean-700 to-turquoise-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/30 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? "Un momento..." : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>

          {modo === "registro" && (
            <p className="text-center text-xs text-abyss-900/50">
              ¿Sos cliente al mayoreo? Creá tu cuenta y luego coordinamos la validación.
            </p>
          )}
        </form>
      </div>
    </div>,
    document.body,
  );
}
