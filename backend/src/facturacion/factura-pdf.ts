import PDFDocument from 'pdfkit';
import { Factura } from './factura.entity.js';

// currencyDisplay: 'code' a propósito — el glyph ₡ (U+20A1) no existe
// en la codificación WinAnsi que usan las 14 fuentes base de PDFKit, así
// que sale como "¡" en el PDF. "CRC" es ASCII puro, sale bien siempre.
const formatoColones = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
});

function colones(valor: string | number): string {
  return formatoColones.format(Number(valor));
}

function numeroFactura(n: number): string {
  return String(n).padStart(6, '0');
}

function fecha(valor: Date | string): string {
  return new Date(valor).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Genera el PDF de una factura ya emitida — NO es un comprobante
// electrónico ante Hacienda, es el documento interno de la venta
// (ver nota en factura.entity.ts). `factura` debe venir con `cliente`
// y `lineas` cargadas (FacturasService.buscar ya las trae).
export function generarFacturaPdf(factura: Factura): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'letter', margin: 50 });

  doc
    .fontSize(20)
    .fillColor('#0f4c5c')
    .text('Conejo Aquatics', { continued: false })
    .fontSize(9)
    .fillColor('#666')
    .text('Peces, plantas y equipo para acuario — San José, Costa Rica');

  doc.moveDown(1.2);
  doc
    .fontSize(14)
    .fillColor('#000')
    .text(`Factura N.° ${numeroFactura(factura.numeroConsecutivo)}`);

  doc
    .fontSize(9)
    .fillColor('#444')
    .text(`Emitida: ${fecha(factura.fechaEmision)}`)
    .text(
      factura.fechaVencimiento
        ? `Vence: ${fecha(factura.fechaVencimiento)}`
        : 'Sin fecha de vencimiento',
    );

  doc.moveDown(1);
  doc.fontSize(10).fillColor('#000').text('Cliente', { underline: true });
  doc
    .fontSize(10)
    .fillColor('#333')
    .text(factura.cliente.nombre)
    .text(factura.cliente.email)
    .text(factura.cliente.tipoCliente === 'mayorista' ? 'Cliente mayorista' : 'Cliente al detalle');

  doc.moveDown(1.2);

  // Columnas: el producto se lleva la mayor parte del ancho (los nombres
  // importados del catálogo son largos — "Conejo Aquatics SET PECERAS
  // CON AGARRADERA", etc.) y las tres columnas numéricas van alineadas
  // a la derecha, como en cualquier factura.
  const tablaX = 50;
  const tablaAncho = 512;
  // PAD_H deja aire a ambos lados de la tabla — antes "Subtotal" quedaba
  // pegado exactamente al borde derecho (0pt de margen), por eso se veía
  // cortado/apretado.
  const PAD_H = 10;
  const col = {
    desc: { x: tablaX + PAD_H, width: 220 },
    cant: { x: tablaX + 250, width: 50 },
    precio: { x: tablaX + 310, width: 85 },
    subtotal: { x: tablaX + 405, width: tablaAncho - PAD_H - 405 },
  };
  const PAD_V = 8;
  const FILA_MIN = 22;

  function encabezadoTabla(yInicio: number): number {
    doc
      .rect(tablaX, yInicio, tablaAncho, FILA_MIN)
      .fill('#0f4c5c')
      .fontSize(9)
      .fillColor('#fff')
      .text('Producto', col.desc.x, yInicio + PAD_V - 2, { width: col.desc.width })
      .text('Cant.', col.cant.x, yInicio + PAD_V - 2, { width: col.cant.width, align: 'right' })
      .text('Precio', col.precio.x, yInicio + PAD_V - 2, { width: col.precio.width, align: 'right' })
      .text('Subtotal', col.subtotal.x, yInicio + PAD_V - 2, {
        width: col.subtotal.width,
        align: 'right',
      });
    return yInicio + FILA_MIN;
  }

  let y = encabezadoTabla(doc.y);
  const limiteInferior = doc.page.height - doc.page.margins.bottom;

  factura.lineas.forEach((linea, indice) => {
    doc.fontSize(9);
    const alturaTexto = doc.heightOfString(linea.descripcion, { width: col.desc.width });
    const alturaFila = Math.max(FILA_MIN, alturaTexto + PAD_V * 2 - 4);

    // Si la fila no cabe antes del margen inferior, se abre página nueva
    // y se repite el encabezado — una factura con muchas líneas no debe
    // cortar una fila a la mitad.
    if (y + alturaFila > limiteInferior) {
      doc.addPage();
      y = encabezadoTabla(doc.page.margins.top);
    }

    if (indice % 2 === 1) {
      doc.rect(tablaX, y, tablaAncho, alturaFila).fill('#f7f9fa');
    }

    doc
      .fontSize(9)
      .fillColor('#222')
      .text(linea.descripcion, col.desc.x, y + PAD_V - 2, { width: col.desc.width })
      .text(String(linea.cantidad), col.cant.x, y + PAD_V - 2, {
        width: col.cant.width,
        align: 'right',
      })
      .text(colones(linea.precioUnitario), col.precio.x, y + PAD_V - 2, {
        width: col.precio.width,
        align: 'right',
      })
      .text(colones(linea.subtotal), col.subtotal.x, y + PAD_V - 2, {
        width: col.subtotal.width,
        align: 'right',
      });

    doc
      .moveTo(tablaX, y + alturaFila)
      .lineTo(tablaX + tablaAncho, y + alturaFila)
      .strokeColor('#e5e5e5')
      .stroke();
    y += alturaFila;
  });

  y += 16;
  if (y > limiteInferior - 30) {
    doc.addPage();
    y = doc.page.margins.top;
  }
  doc
    .fontSize(12)
    .fillColor('#0f4c5c')
    .text(`Total: ${colones(factura.total)}`, col.subtotal.x - 90, y, {
      width: 197,
      align: 'right',
    });

  doc
    .fontSize(8)
    .fillColor('#999')
    .text(
      'Documento interno de venta — no constituye comprobante electrónico ante el Ministerio de Hacienda.',
      50,
      700,
      { width: 512, align: 'center' },
    );

  doc.end();
  return doc;
}
