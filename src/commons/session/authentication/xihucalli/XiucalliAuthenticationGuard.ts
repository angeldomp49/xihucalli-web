import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {XihucalliAuthenticationService} from './XihucalliAuthenticationService';
import {take} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class XihucalliAuthenticationGuard implements CanActivate {
  constructor(
    private router: Router,
    private xihucalliAuthenticationService: XihucalliAuthenticationService
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {

    this.xihucalliAuthenticationService
      .setOnRedirectToLogin( () =>
        this.router.navigate([environment.loginEndpoint])
      );

    return this.xihucalliAuthenticationService
      .performAuthCheck()
      .pipe(
        take(1)
      );
  }


}
