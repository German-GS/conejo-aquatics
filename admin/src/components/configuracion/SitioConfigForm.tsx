import { useEffect, useState, type FormEvent } from "react";
import { Check, Loader2, Megaphone, PanelTop, Phone } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { SitioConfig } from "@/lib/sitio";

const inputClase =
  "w-full rounded-xl border border-abyss-900/10 bg-mist-50 px-3.5 py-2.5 text-sm outline-none focus:border-turquoise-500 focus:bg-white focus:ring-2 focus:ring-turquoise-500/20";

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-abyss-900/80">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SitioConfigForm() {
  const [form, setForm] = useState<SitioConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    api
      .get<SitioConfig>("/configuracion/sitio")
      .then(setForm)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudo cargar la configuración."),
      );
  }, []);

  function actualizar<K extends keyof SitioConfig>(campo: K, valor: SitioConfig[K]) {
    setForm((f) => (f ? { ...f, [campo]: valor } : f));
    setGuardado(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setGuardando(true);
    try {
      // Armado explícito a propósito: el GET trae más campos de la
      // entidad (ej. actualizadoEn) que el DTO del backend rechaza si se
      // los reenviamos tal cual (forbidNonWhitelisted).
      const actualizado = await api.patch<SitioConfig>("/configuracion/sitio", {
        heroInsignia: form.heroInsignia,
        heroTitulo: form.heroTitulo,
        heroTituloDestacado: form.heroTituloDestacado,
        heroSubtitulo: form.heroSubtitulo,
        heroCta1Label: form.heroCta1Label,
        heroCta2Label: form.heroCta2Label,
        bannerMayoreoTitulo: form.bannerMayoreoTitulo,
        bannerMayoreoSubtitulo: form.bannerMayoreoSubtitulo,
        bannerMayoreoCtaLabel: form.bannerMayoreoCtaLabel,
        footerDescripcion: form.footerDescripcion,
        direccion: form.direccion,
        telefono: form.telefono,
        email: form.email,
        instagramUrl: form.instagramUrl?.trim() || null,
        facebookUrl: form.facebookUrl?.trim() || null,
      });
      setForm(actualizado);
      setGuardado(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  }

  if (!form) {
    return (
      <div>
        <h3 className="font-display text-base font-bold text-abyss-900">
          Contenido de la página
        </h3>
        <p className="mt-4 text-sm text-abyss-900/40">Cargando…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <h3 className="font-display text-base font-bold text-abyss-900">
          Contenido de la página
        </h3>
        <p className="text-sm text-abyss-900/55">
          Los textos que ve cualquiera al entrar a la tienda en línea:
          portada, banner de mayoreo y datos de contacto del pie de página.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-8 rounded-2xl border border-abyss-900/5 bg-white p-5">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-abyss-900">
            <PanelTop className="h-4 w-4 text-ocean-700" />
            Portada
          </div>

          <Campo label="Insignia (arriba del título)">
            <input
              value={form.heroInsignia}
              onChange={(e) => actualizar("heroInsignia", e.target.value)}
              className={inputClase}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Título">
              <input
                value={form.heroTitulo}
                onChange={(e) => actualizar("heroTitulo", e.target.value)}
                className={inputClase}
              />
            </Campo>
            <Campo label="Título destacado (color degradado)">
              <input
                value={form.heroTituloDestacado}
                onChange={(e) => actualizar("heroTituloDestacado", e.target.value)}
                className={inputClase}
              />
            </Campo>
          </div>

          <Campo label="Subtítulo">
            <textarea
              rows={3}
              value={form.heroSubtitulo}
              onChange={(e) => actualizar("heroSubtitulo", e.target.value)}
              className={inputClase}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Botón principal (va al catálogo)">
              <input
                value={form.heroCta1Label}
                onChange={(e) => actualizar("heroCta1Label", e.target.value)}
                className={inputClase}
              />
            </Campo>
            <Campo label="Botón secundario (va a mayoreo)">
              <input
                value={form.heroCta2Label}
                onChange={(e) => actualizar("heroCta2Label", e.target.value)}
                className={inputClase}
              />
            </Campo>
          </div>
        </section>

        <section className="space-y-4 border-t border-abyss-900/5 pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-abyss-900">
            <Megaphone className="h-4 w-4 text-ocean-700" />
            Banner de mayoreo
          </div>

          <Campo label="Título">
            <input
              value={form.bannerMayoreoTitulo}
              onChange={(e) => actualizar("bannerMayoreoTitulo", e.target.value)}
              className={inputClase}
            />
          </Campo>

          <Campo label="Subtítulo">
            <textarea
              rows={2}
              value={form.bannerMayoreoSubtitulo}
              onChange={(e) => actualizar("bannerMayoreoSubtitulo", e.target.value)}
              className={inputClase}
            />
          </Campo>

          <Campo label="Texto del botón">
            <input
              value={form.bannerMayoreoCtaLabel}
              onChange={(e) => actualizar("bannerMayoreoCtaLabel", e.target.value)}
              className={inputClase}
            />
          </Campo>
        </section>

        <section className="space-y-4 border-t border-abyss-900/5 pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-abyss-900">
            <Phone className="h-4 w-4 text-ocean-700" />
            Pie de página y contacto
          </div>

          <Campo label="Descripción de la tienda">
            <textarea
              rows={2}
              value={form.footerDescripcion}
              onChange={(e) => actualizar("footerDescripcion", e.target.value)}
              className={inputClase}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Dirección">
              <input
                value={form.direccion}
                onChange={(e) => actualizar("direccion", e.target.value)}
                className={inputClase}
              />
            </Campo>
            <Campo label="Teléfono">
              <input
                value={form.telefono}
                onChange={(e) => actualizar("telefono", e.target.value)}
                className={inputClase}
              />
            </Campo>
            <Campo label="Correo de contacto">
              <input
                type="email"
                value={form.email}
                onChange={(e) => actualizar("email", e.target.value)}
                className={inputClase}
              />
            </Campo>
            <Campo label="Instagram (enlace completo)">
              <input
                placeholder="https://instagram.com/tu_tienda"
                value={form.instagramUrl ?? ""}
                onChange={(e) => actualizar("instagramUrl", e.target.value)}
                className={inputClase}
              />
            </Campo>
            <Campo label="Facebook (enlace completo)">
              <input
                placeholder="https://facebook.com/tu_tienda"
                value={form.facebookUrl ?? ""}
                onChange={(e) => actualizar("facebookUrl", e.target.value)}
                className={inputClase}
              />
            </Campo>
          </div>
        </section>

        <div className="flex items-center gap-3 border-t border-abyss-900/5 pt-6">
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-700 to-turquoise-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-turquoise-500/20 disabled:opacity-70"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </button>
          {guardado && !guardando && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-seafoam-600">
              <Check className="h-4 w-4" />
              Guardado — ya se ve así en la tienda
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
