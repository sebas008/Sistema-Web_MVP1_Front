import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

/**
 * Requisito de presentación:
 * - La pantalla principal SIEMPRE es /login.
 * - No redirigimos automáticamente al dashboard aunque exista sesión.
 */
export const loginGuard: CanActivateFn = () => {
  return true;
};
