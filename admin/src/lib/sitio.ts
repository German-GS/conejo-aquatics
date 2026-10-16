export type SitioConfig = {
  id: string;
  heroInsignia: string;
  heroTitulo: string;
  heroTituloDestacado: string;
  heroSubtitulo: string;
  heroCta1Label: string;
  heroCta2Label: string;
  bannerMayoreoTitulo: string;
  bannerMayoreoSubtitulo: string;
  bannerMayoreoCtaLabel: string;
  footerDescripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  actualizadoEn: string;
};

export type ActualizarSitioConfigInput = Partial<Omit<SitioConfig, "id">>;
