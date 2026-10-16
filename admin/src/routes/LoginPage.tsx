import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Fish, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Bubbles } from "@/components/Bubbles";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-abyss-950 via-ocean-700 to-turquoise-500 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Bubbles count={14} />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-turquoise-300/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
            <Fish className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold text-white">
            Conejo Aquatics
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="font-display max-w-md text-3xl font-bold leading-tight text-white">
            Panel administrativo
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist-100/70">
            Inventario, lotes de animales, punto de venta e informes en un
            solo lugar — con trazabilidad completa desde que ingresa un lote
            hasta que se vende.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs font-medium text-turquoise-200">
            <ShieldCheck className="h-4 w-4" />
            Acceso solo para personal autorizado
          </div>
        </motion.div>

        <p className="relative text-xs text-mist-100/40">
          © {new Date().getFullYear()} Conejo Aquatics
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-700 via-turquoise-500 to-seafoam-400 text-white">
              <Fish className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="font-display text-lg font-bold text-abyss-900">
              Conejo Aquatics
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-abyss-900">
            Iniciar sesión
          </h2>
          <p className="mt-1.5 text-sm text-abyss-900/60">
            Ingresá con tu cuenta del panel administrativo.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-abyss-900/80"
              >
                Correo
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@conejoaquatics.cr"
                  className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 py-2.5 pl-10 pr-3.5 text-sm text-abyss-900 outline-none transition-colors placeholder:text-abyss-900/35 focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-abyss-900/80"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-abyss-900/35" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-abyss-900/10 bg-mist-50 py-2.5 pl-10 pr-10 text-sm text-abyss-900 outline-none transition-colors placeholder:text-abyss-900/35 focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-abyss-900/35 transition-colors hover:text-ocean-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex items-center gap-2 text-abyss-900/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-abyss-900/20 text-turquoise-500 focus:ring-turquoise-500/30"
                />
                Recordarme
              </label>
              <a href="#" className="font-medium text-ocean-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 py-3 text-sm font-semibold text-white shadow-lg shadow-turquoise-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-abyss-900/40">
            Panel interno — no requiere acceso desde internet a la tienda en
            línea.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
