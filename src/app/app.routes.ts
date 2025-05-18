import { Routes } from '@angular/router';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { authGuard, loginGuard } from '../guards/auth.guard';
import { LogOutComponent } from '../components/log-out/log-out.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login.component').then(l => l.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('../pages/register/register.component').then(r => r.RegisterComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'main',
    loadComponent: () => import('../pages/main/main.component').then(m => m.MainComponent),
  },
  {
    path: 'logout',
    title: `logged out`,
    component: LogOutComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
