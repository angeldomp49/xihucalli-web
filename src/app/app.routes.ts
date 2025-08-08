import { Routes } from '@angular/router';
import {LoginCheckPageComponent} from './pages/login-check-page/login-check-page.component';
import {KeyringIndexPageComponent} from './pages/keyring-index-page/keyring-index-page.component';
import {AuthenticationGuard} from '../commons/session/authentication/AuthenticationGuard';
import {AfterLoginPageComponent} from './pages/after-login-page/after-login-page.component';

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
    path: "login-check",
    component: LoginCheckPageComponent
  },
  {
    path: "keyring",
    component: KeyringIndexPageComponent,
    canActivate: [AuthenticationGuard]
  }
];
