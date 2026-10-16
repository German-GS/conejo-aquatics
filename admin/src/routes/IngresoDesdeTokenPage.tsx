import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Punto de entrada cuando alguien inicia sesión desde el formulario único
// de la tienda en línea y resulta ser una cuenta de personal: llega acá
// con el token en el fragmento de la URL (#token=...), nunca en la query,
// para que no quede en logs del servidor ni en el historial compartido.
export default function IngresoDesdeTokenPage() {
  const { establecerSesionDesdeToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // Procesar el token es algo que debe pasar una sola vez: si el efecto
  // se disparara de nuevo (ej. por un re-render de más arriba) el hash ya
  // no tendría el token, porque lo limpiamos apenas lo leemos.
  const yaProcesado = useRef(false);

  useEffect(() => {
    if (yaProcesado.current) return;
    yaProcesado.current = true;

    const match = window.location.hash.match(/token=([^&]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    // Limpiamos el fragmento de inmediato, exista o no el token.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    establecerSesionDesdeToken(token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => {
        setError("No se pudo validar la sesión. Iniciá sesión de nuevo.");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      });
  }, [establecerSesionDesdeToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 text-abyss-900/60">
        <Loader2 className="h-6 w-6 animate-spin text-turquoise-500" />
        <p className="text-sm">{error ?? "Ingresando…"}</p>
      </div>
    </div>
  );
}
