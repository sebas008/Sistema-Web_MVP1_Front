import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { UsuariosService, UsuarioActualizarRequest, UsuarioCrearRequest } from '../../core/services/usuarios';
import { RolesService, RolResponse } from '../../core/services/roles';
import { AuthService } from '../../core/services/auth';

type UsuarioRow = {
  idUsuario: number;
  username: string;
  nombres: string;
  apellidos: string;
  email?: string | null;
  activo: boolean;
  rol?: string | null;
};

@Component({
  standalone: true,
  selector: 'app-usuario-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-dialog.html',
})
export class UsuarioDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(UsuariosService);
  private rolesApi = inject(RolesService);
  private auth = inject(AuthService);
  private dialogRef = inject(MatDialogRef<UsuarioDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as UsuarioRow | null;

  loading = false;
  errorMsg = '';

  roles: RolResponse[] = [];

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: [''],
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    email: [''],
    rolNombre: [''],
    activo: [true],
  });

  constructor() {
    this.rolesApi.listar(true).subscribe({
      next: (r) => (this.roles = r ?? []),
      error: () => (this.roles = []),
    });

    if (this.data) {
      this.form.patchValue({
        username: this.data.username,
        nombres: this.data.nombres,
        apellidos: this.data.apellidos,
        email: this.data.email ?? '',
        activo: this.data.activo,
      });
      this.form.controls.username.disable();
      this.form.controls.rolNombre.disable();
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(4)]);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    const usuario = this.auth.getUsuario() ?? 'admin';
    const v = this.form.getRawValue();

    if (this.data) {
      const req: UsuarioActualizarRequest = {
        nombres: v.nombres!,
        apellidos: v.apellidos!,
        email: v.email || null,
        activo: !!v.activo,
        usuario,
      };

      this.api.actualizar(this.data.idUsuario, req).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.message ?? 'No se pudo guardar el usuario.';
        },
      });
    } else {
      const req: UsuarioCrearRequest = {
        username: v.username!,
        password: v.password!,
        nombres: v.nombres!,
        apellidos: v.apellidos!,
        email: v.email || null,
        rolNombre: v.rolNombre || null,
        activo: !!v.activo,
        usuario,
      };

      this.api.crear(req).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.message ?? 'No se pudo crear el usuario.';
        },
      });
    }
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}
