import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, timeout } from 'rxjs/operators';

import { GuiasService, GuiaResponse } from '../../../core/services/contabilidad/guias';

@Component({
  standalone: true,
  selector: 'app-guia-detalle-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './guia-detalle-dialog.html',
  styleUrls: ['./guia-detalle-dialog.scss'],
})
export class GuiaDetalleDialogComponent {
  private api = inject(GuiasService);
  data = inject(MAT_DIALOG_DATA) as { idGuia: number };

  loading = true;
  errorMsg = '';
  guia: GuiaResponse | null = null;

  constructor() {
    this.api.obtener(this.data.idGuia)
      .pipe(
        timeout(8000),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (g) => {
          this.guia = g;
        },
        error: (err) => {
          this.errorMsg = err?.name === 'TimeoutError'
            ? 'La consulta tardó demasiado. Intenta nuevamente.'
            : (err?.error?.detail ?? err?.error?.message ?? 'No se pudo cargar la guía.');
        }
      });
  }
}
