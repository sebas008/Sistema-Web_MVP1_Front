APLICAR CAMBIOS (sin pisar tu archivo completo)

1) Cambiar encabezado "Acciones" -> "Detalles"
- Archivo: src/app/features/contabilidad/facturacion/facturacion.html
- Busca en el thead:
    <th>Acciones</th>
  y reemplaza por:
    <th>Detalles</th>

2) Hacer el modal de detalle más grande
- Archivo: src/app/features/contabilidad/facturacion/factura-detalle-dialog.scss
- Reemplaza el bloque .dlg por este:

.dlg{
  width: min(1100px, 95vw);
  max-height: min(88vh, 820px);
  display:flex;
  flex-direction:column;
}

(El resto del SCSS queda igual)

3) (Opcional) Si quieres evitar el scroll horizontal del modal:
- En .tbl cambia min-width de 680px a 900px SOLO si tu pantalla es grande,
  o déjalo como está para móviles.