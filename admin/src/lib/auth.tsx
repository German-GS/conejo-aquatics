import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, clearToken, getToken, setToken } from "./api";
import type { Permiso, RolUsuario } from "./permisos";

type Session = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  permisos: Permiso[];
};

type AuthContextValue = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  establecerSesionDesdeToken: (token: string) => Promise<void>;
  logout: () => void;
  tienePermiso: (permiso: Permiso) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = "conejo-aquatics-admin-session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    if (!getToken()) return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  });

  // Todas envueltas en useCallback a propósito: sin esto, cada función
  // es una referencia nueva en cada render, y un efecto que dependa de
  // alguna (ej. IngresoDesdeTokenPage) se vuelve a disparar justo cuando
  // setSession causa un re-render — en esa segunda pasada el hash con el
  // token ya no está (se limpió en la primera), así que manda al login
  // aunque la sesión ya haya quedado bien guardada. Bug real, no teórico.
  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; usuario: Session }>(
      "/auth/login",
      { email, password },
    );
    setToken(data.accessToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.usuario));
    setSession(data.usuario);
  }, []);

  // Usado cuando el login ocurrió en la tienda en línea (formulario único
  // para clientes y personal): ya tenemos el token, solo falta hidratar
  // la sesión local con /auth/me.
  const establecerSesionDesdeToken = useCallback(async (token: string) => {
    setToken(token);
    try {
      const usuario = await api.get<Session>("/auth/me");
      localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
      setSession(usuario);
    } catch (err) {
      clearToken();
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const tienePermiso = useCallback(
    (permiso: Permiso) => session?.permisos.includes(permiso) ?? false,
    [session],
  );

  return (
    <AuthContext.Provider
      value={{ session, login, establecerSesionDesdeToken, logout, tienePermiso }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Para rutas exclusivas de administrador (ej. Personal). No reemplaza la
// verificación real del backend — es solo para que la UI no muestre ni
// deje entrar por URL directa a algo que el servidor igual va a rechazar.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  if (session?.rol !== "administrador") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Para rutas que dependen de un permiso delegable (ej. Configuración,
// que necesita catalogo.gestionar) — a diferencia de RequireAdmin, esto
// sí lo puede tener alguien que no sea administrador si se le otorgó.
export function RequirePermiso({
  permiso,
  children,
}: {
  permiso: Permiso;
  children: ReactNode;
}) {
  const { tienePermiso } = useAuth();

  if (!tienePermiso(permiso)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
