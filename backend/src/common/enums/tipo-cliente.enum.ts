// Sección 4 del documento de diseño: determina qué lista de precio ve
// el cliente. Todo el mundo se registra como Detalle por autoservicio —
// pasar a Mayorista lo aprueba el personal con clientes.gestionar desde
// el panel (Clientes), no es autoservicio.
export enum TipoCliente {
  DETALLE = 'detalle',
  MAYORISTA = 'mayorista',
}
