import { asBlob } from 'html-docx-js-typescript';

/**
 * Word importa el HTML con su propio motor (no es un navegador), así que:
 *  - No soporta flexbox: los contenedores .fila-evaluacion / .row-cajas /
 *    .fila-consolidado / .fila-info se convierten a <table> antes de
 *    exportar (ver convertirFlexATabla), si no, sus columnas se apilan y el
 *    documento se duplica en alto.
 *  - Interpreta pt de forma mucho más predecible que px (que a veces se
 *    redondea hacia arriba), por eso todos los tamaños de esta hoja de
 *    estilos están en pt, calcados 1:1 de los que usa cada página en
 *    pantalla (13px≈9.5pt, 12px≈9pt, 11px≈8pt).
 */
const ESTILOS_EXPORTACION = `
  body{ margin:0; font-family:"Times New Roman", serif; font-size:10pt; line-height:1.4; color:#000; }
  p{ margin:0 0 9pt 0; }
  h4{ margin:8pt 0 5pt 0; font-size:10pt; font-weight:bold; background:#dcdcdc; padding:3pt 6pt; }
  ul, ol{ margin:5pt 0 9pt 18pt; padding:0; }
  li{ margin-bottom:3pt; }

  table{ border-collapse:collapse; width:100%; margin-bottom:5pt; }
  th, td{ border:1px solid #000; padding:3pt 5pt; font-size:9pt; vertical-align:middle; }
  th{ background:#efefef; text-align:center; font-weight:bold; }
  td.label, th.label, .label{ font-weight:bold; background:#f4f4f4; }

  .header-table{ font-size:8pt; margin-bottom:7pt; }
  .header-table td{ padding:2pt 5pt; }
  .header-table .logo-cell{ width:55pt; text-align:center; }
  .header-table .logo-cell img{ width:42pt; height:auto; }
  .header-table .title-cell{ text-align:center; font-size:9.5pt; font-weight:bold; }
  .header-table .code-cell{ width:48pt; text-align:center; font-weight:bold; }
  .header-table .document-cell{ text-align:center; font-weight:bold; background:#f5f5f5; }

  .student-table td{ font-size:10pt; padding:3pt 5pt; border:none; }
  .fecha{ font-size:10pt; margin-bottom:6pt; }

  .caja-objetivo, .caja-total, .caja, .tabla-consolidado th, .tabla-consolidado td{
    font-size:9pt;
  }
  .caja-objetivo, .caja{ border:1px solid #000; padding:4pt 6pt; }
  .caja-objetivo strong, .caja strong{ font-size:9pt; }
  .caja-total{ border:1px solid #000; padding:5pt 8pt; font-size:10pt; font-weight:bold; background:#f4f4f4; width:180pt; }

  .fila-resumen, .fila-autonomas, .celda-nivel.seleccionada{ font-weight:bold; background:#f4f4f4; }
  .celda-nivel{ text-align:center; width:34pt; }
  .celda-tema{ text-align:center; font-weight:bold; }
  .text-center{ text-align:center; }
  .solo-print{ display:table-cell; }

  .firma{ text-align:center; margin-top:22pt; font-size:10pt; }
  .linea{ border-top:1px solid #000; width:180pt; margin:0 auto 5pt; }

  .totales{ font-weight:bold; font-size:10pt; margin-top:6pt; }

  .campo, .campo-nota, .campo-mitad, .campo-textarea{ font-size:9pt; }

  /* columnas armadas a partir de los contenedores flex (ver convertirFlexATabla) */
  .col-flex{ border:none; vertical-align:top; padding:0 4pt; }
  .col-flex:first-child{ padding-left:0; }
  .col-flex:last-child{ padding-right:0; }
`;

const SELECTORES_FLEX = ['.fila-evaluacion', '.row-cajas', '.fila-consolidado', '.fila-info'];

/**
 * Exporta el elemento indicado a un .docx real (no HTML disfrazado), usando
 * la misma plantilla visual que ya se ve en pantalla. Los <input>/<textarea>
 * no se rellenan solos en el HTML exportado (el valor vive en la propiedad
 * JS, no en el atributo), así que se reemplazan por su texto actual antes
 * de convertir.
 */
export async function exportarDocumentoWord(
  elementId: string,
  nombreArchivo: string,
  orientacion: 'portrait' | 'landscape' = 'portrait'
): Promise<void> {

  const original = document.getElementById(elementId);

  if (!original) return;

  const clon = original.cloneNode(true) as HTMLElement;

  sincronizarCampos(original, clon);

  clon.querySelectorAll('.no-print').forEach((el) => el.remove());

  convertirFlexATabla(clon);

  fijarTamanioImagenes(original, clon);

  fijarAnchoEncabezado(clon);

  quitarBordesTablaEstudiante(clon);

  await inlinearImagenes(clon);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${ESTILOS_EXPORTACION}</style>
      </head>
      <body>${clon.innerHTML}</body>
    </html>
  `;

  const blob = await asBlob(html, {
    orientation: orientacion,
    margins: { top: 720, right: 720, bottom: 720, left: 720 }
  }) as Blob;

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = `${nombreArchivo}.docx`;
  enlace.click();

  URL.revokeObjectURL(url);

}

/**
 * Word respeta el tipo de elemento nativo (inline vs. block) mucho mejor
 * que un "display" puesto por CSS. Por eso, si en pantalla el campo se ve
 * en su propia línea (por ejemplo debajo de un <strong> que la SCSS puso en
 * bloque), se reemplaza con un <div> (de bloque por naturaleza) en vez de
 * un <span>: un <span> quedaría pegado en la misma línea porque Word
 * ignora el "display:block" puesto por CSS sobre un elemento que por
 * defecto es "inline". Se decide comparando las posiciones reales en
 * pantalla del campo y el elemento anterior, no adivinando por clases.
 */
function sincronizarCampos(original: HTMLElement, clon: HTMLElement): void {

  const camposOriginales = Array.from(
    original.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
  );

  const camposClon = Array.from(
    clon.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
  );

  camposOriginales.forEach((campo, i) => {

    const campoClon = camposClon[i];

    if (!campoClon) return;

    const texto = document.createElement(vaEnLineaPropia(campo) ? 'div' : 'span');

    texto.textContent = campo.value ?? '';

    campoClon.replaceWith(texto);

  });

}

function vaEnLineaPropia(campo: HTMLElement): boolean {

  const anterior = campo.previousElementSibling as HTMLElement | null;

  if (!anterior) return false;

  const rectAnterior = anterior.getBoundingClientRect();
  const rectCampo = campo.getBoundingClientRect();

  return rectCampo.top >= rectAnterior.bottom - 2;

}

/**
 * Word ignora el "width" en CSS para <img> (usa el tamaño real del
 * archivo) y también suele ignorar "width" en CSS para <td>. Ambos se
 * fijan como atributo HTML, que sí respeta de forma confiable.
 */
function fijarTamanioImagenes(original: HTMLElement, clon: HTMLElement): void {

  const imagenesOriginales = Array.from(original.querySelectorAll('img'));
  const imagenesClon = Array.from(clon.querySelectorAll('img'));

  imagenesOriginales.forEach((img, i) => {

    const imgClon = imagenesClon[i];

    if (!imgClon) return;

    const rect = img.getBoundingClientRect();

    const ancho = Math.max(1, Math.round(rect.width));
    const alto = Math.max(1, Math.round(rect.height));

    imgClon.setAttribute('width', String(ancho));
    imgClon.setAttribute('height', String(alto));
    imgClon.setAttribute('style', `width:${ancho}px; height:${alto}px;`);

  });

}

/**
 * Igual que con las imágenes: el ancho de las celdas del encabezado
 * institucional (logo / código) se fija como atributo HTML porque el CSS
 * por clase no siempre se respeta, y sin esto el logo aplasta el resto de
 * la tabla.
 */
function fijarAnchoEncabezado(clon: HTMLElement): void {

  clon.querySelectorAll<HTMLElement>('.header-table .logo-cell').forEach((celda) => {
    celda.setAttribute('width', '70');
  });

  clon.querySelectorAll<HTMLElement>('.header-table .code-cell').forEach((celda) => {
    celda.setAttribute('width', '64');
  });

}

/**
 * En pantalla, la tabla "Yo, NOMBRE con C.C. ..." de la Carta Compromiso
 * (.student-table) no tiene bordes visibles, solo se usa para alinear el
 * texto en columnas. La regla genérica "th, td{border:1px solid #000}" de
 * ESTILOS_EXPORTACION la borra por CSS, pero por si Word no respeta esa
 * especificidad, se refuerza quitando el borde directo en cada celda.
 */
function quitarBordesTablaEstudiante(clon: HTMLElement): void {

  clon.querySelectorAll<HTMLElement>('.student-table td').forEach((celda) => {
    celda.style.border = 'none';
  });

}

/**
 * El importador HTML de Word no soporta flexbox: los contenedores que en
 * pantalla se ven en columnas (display:flex) se apilarían uno debajo del
 * otro, duplicando el alto del documento. Se reemplazan por una tabla de
 * una sola fila con una celda por cada hijo directo, que sí respeta el
 * layout en columnas.
 */
function convertirFlexATabla(clon: HTMLElement): void {

  clon.querySelectorAll<HTMLElement>(SELECTORES_FLEX.join(',')).forEach((contenedor) => {

    const hijos = Array.from(contenedor.children) as HTMLElement[];

    if (hijos.length < 2) return;

    const tabla = document.createElement('table');

    tabla.setAttribute('style', 'width:100%; border:none; margin-bottom:5pt;');

    const fila = document.createElement('tr');

    hijos.forEach((hijo) => {

      const celda = document.createElement('td');

      celda.className = 'col-flex';

      celda.appendChild(hijo);

      fila.appendChild(celda);

    });

    tabla.appendChild(fila);

    contenedor.replaceWith(tabla);

  });

}

async function inlinearImagenes(root: HTMLElement): Promise<void> {

  const imagenes = Array.from(root.querySelectorAll('img'));

  await Promise.all(imagenes.map(async (img) => {

    try {

      const respuesta = await fetch(img.src);
      const blob = await respuesta.blob();

      img.src = await blobABase64(blob);

    } catch {

      // si falla la conversión, se deja la imagen tal cual antes que romper la exportación

    }

  }));

}

function blobABase64(blob: Blob): Promise<string> {

  return new Promise((resolve, reject) => {

    const lector = new FileReader();

    lector.onloadend = () => resolve(lector.result as string);
    lector.onerror = reject;

    lector.readAsDataURL(blob);

  });

}
