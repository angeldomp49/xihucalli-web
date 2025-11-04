import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionManagementService } from '../../management/SessionManagementService';
import { environment } from '../../../../environments/environment';

export const openIDAuthGuard: CanActivateFn = () => {
  const sessionService = inject(SessionManagementService);
  const router = inject(Router);

  if (!environment.isAuthenticationEnabled) {
    return true;
  }

  if (sessionService.isAuthenticated()) {
    return true;
  }

  router.navigate([environment.loginEndpoint]);
  return false;
};

