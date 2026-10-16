import { Fish, Mail, MapPin, Phone } from "lucide-react";
import type { SitioConfig } from "@/lib/api";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M15 8h-2a2 2 0 0 0-2 2v10M9 13h6M6 8h3" strokeLinecap="round" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Tienda",
    links: ["Peces", "Plantas acuáticas", "Equipo y filtros", "Alimento y salud"],
  },
  {
    title: "Ayuda",
    links: ["Cómo comprar", "Envíos y retiro", "Cuenta mayorista", "Preguntas frecuentes"],
  },
];

export function Footer({ config }: { config: SitioConfig }) {
  return (
    <footer className="mt-10 bg-abyss-950 text-mist-100/80">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-turquoise-500 to-seafoam-400 text-white">
                <Fish className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span
                className="text-base font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Conejo Aquatics
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-100/60">
              {config.footerDescripcion}
            </p>
            {(config.instagramUrl || config.facebookUrl) && (
              <div className="mt-5 flex gap-3">
                {config.instagramUrl && (
                  <a
                    href={config.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                )}
                {config.facebookUrl && (
                  <a
                    href={config.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-mist-100/60 transition-colors hover:text-turquoise-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-white">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-mist-100/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-turquoise-300" />
                {config.direccion}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-turquoise-300" />
                {config.telefono}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-turquoise-300" />
                {config.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-mist-100/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Conejo Aquatics. Todos los derechos reservados.</p>
          <p>Precios en colones costarricenses (₡)</p>
        </div>
      </div>
    </footer>
  );
}
