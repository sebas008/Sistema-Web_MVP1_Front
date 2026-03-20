import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const moduleKey = (route.data?.['module'] as string | undefined) ?? '';
  if (!moduleKey || auth.canAccess(moduleKey)) {
    return true;
  }

  router.navigateByUrl(auth.getHomeRoute());
  return false;
};
