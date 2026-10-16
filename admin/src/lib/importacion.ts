export type FilaPrevisualizada = {
  fila: number;
  categoriaExcel: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  costoUnitario: number | null;
  precioMayoreo: number;
  conflicto: boolean;
};

export type PrevisualizacionImportacion = {
  filas: FilaPrevisualizada[];
  categorias: { nombre: string; cantidad: number }[];
  totalFilas: number;
  totalConflictos: number;
};

export type ResumenImportacion = {
  creados: number;
  categoriasCreadas: string[];
  omitidos: { codigo: string; motivo: string }[];
};
