import {Routes} from '@angular/router';
import {LoginCheckPageComponent} from './pages/login-check-page/login-check-page.component';
import {KeyringIndexPageComponent} from './pages/keyring-index-page/keyring-index-page.component';
import {AfterLoginPageComponent} from './pages/after-login-page/after-login-page.component';
import {AuthCallbackPageComponent} from './pages/auth-callback-page/auth-callback-page.component';
import {XihucalliAuthenticationGuard} from '../commons/session/authentication/xihucalli/XiucalliAuthenticationGuard';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login-check",
    pathMatch: "full"
  },
  {
    path: "after-login",
    component: AfterLoginPageComponent
  },
  {
    path: "auth/callback",
    component: AuthCallbackPageComponent
  },
  {
    path: "login-check",
    component: LoginCheckPageComponent
  },
  {
    path: "keyring",
    component: KeyringIndexPageComponent,
    canActivate: [XihucalliAuthenticationGuard]
  }
];
