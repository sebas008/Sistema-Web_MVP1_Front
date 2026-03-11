import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RolesService, RolResponse } from '../../core/services/seguridad/roles';
import { UsuariosService } from '../../core/services/usuarios';
import { AuthService } from '../../core/services/auth';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

type UsuarioRow = {
  idUsuario: number;
  username: string;
  nombres: string;
  apellidos: string;
  email?: string | null;
  activo: boolean;
  rolNombre?: string | null;
};

@Component({
  standalone: true,
  selector: 'app-usuario-roles-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-roles-dialog.html',
})
export class UsuarioRolesDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolesApi = inject(RolesService);
  private usuariosApi = inject(UsuariosService);
  private auth = inject(AuthService);
  private dialogRef = inject(MatDialogRef<UsuarioRolesDialogComponent>);
  private cdr = inject(ChangeDetectorRef);

  data = inject(MAT_DIALOG_DATA) as UsuarioRow;

  loading = true;
  saving = false;
  errorMsg = '';
  roles: RolResponse[] = [];

  form = this.fb.group({
    roles: [[], [Validators.required]],
  });

  ngOnInit(): void {
    // 1) Cargar catálogo de roles -> habilita UI (NO depender de obtener usuario)
    this.rolesApi
      .listar(true)
      .pipe(
        catchError((err) => {
          this.errorMsg = err?.error?.message ?? 'No se pudo cargar roles.';
          return of([] as RolResponse[]);
        }),
        finalize(() => {
          // Evita NG0100 (cambio de binding en mismo ciclo)
          setTimeout(() => {
            this.loading = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe((r) => {
        this.roles = r ?? [];

        // 2) Cargar roles actuales del usuario en segundo plano (no bloquear UI)
        this.usuariosApi.obtener(this.data.idUsuario).subscribe({
          next: (u: any) => {
            const rolesAny = u?.roles;
            const actuales = Array.isArray(rolesAny)
              ? rolesAny
                  .map((x: any) => x?.idRol ?? x?.idrol ?? x?.rolId ?? x)
                  .filter((n: any) => typeof n === 'number')
              : [];
            this.form.patchValue({ roles: actuales as any });
            this.cdr.markForCheck();
          },
          error: () => {
            // si falla, igual se puede asignar manualmente
          },
        });
      });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const usuario = this.auth.getUsuario() ?? 'admin';
    const ids = (this.form.getRawValue().roles ?? []) as number[];
    const csv = ids.join(',');

    this.saving = true;
    this.errorMsg = '';

    this.usuariosApi.asignarRol(this.data.idUsuario, { csvRoles: csv, usuario }).subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo asignar roles.';
      },
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}
