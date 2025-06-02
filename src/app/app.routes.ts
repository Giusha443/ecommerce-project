import { Routes } from '@angular/router';
import { NotFoundComponent } from '../pages/not-found/not-found.component';

import { authGuard, loginGuard, profileGuard,productGuard } from '../guards/auth.guard';
import { APP_TITLE } from '../constants/app.title';
import { LogOutComponent } from '../components/log-out/log-out.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login.component').then(l => l.LoginComponent),
    canActivate: [loginGuard],
    title: `Login - ${APP_TITLE}`,
  },
  {
    path: 'signup',
    loadComponent: () => import('../pages/register/register.component').then(r => r.RegisterComponent),
    canActivate: [loginGuard],
    title: `Register - ${APP_TITLE}`,
  },
  {
    path: 'profile',
    loadComponent: () => import('../pages/profile/profile.component').then(r => r.ProfileComponent),
    canActivate: [profileGuard],
    title: `Profile - ${APP_TITLE}`,
  },
  {
    path: 'main',
    loadComponent: () => import('../pages/main/main.component').then(m => m.MainComponent),
  },
  {
    path: 'logout',
    component: LogOutComponent,
    canActivate: [authGuard],
  },
  {
    path: 'catalog',
    loadComponent: () => import('../pages/catalog/catalog.component').then(c => c.CatalogComponent),
    title: `Catalog - ${APP_TITLE}`,
  },
  {
    path: 'product/:id',
    loadComponent: () => import('../pages/product/product.component').then(p => p.ProductComponent),
    canActivate: [productGuard],
  },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'notfound',
    component: NotFoundComponent,
    title: `not found - ${APP_TITLE}`,
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: `404 not found - ${APP_TITLE}`,
  },
];
