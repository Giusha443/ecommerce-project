import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
// import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login.component').then(l => l.LoginComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: 'registration',
    loadComponent: () => import('../pages/register/register.component').then(r => r.RegisterComponent),
  },
  {
    path: 'main',
    loadComponent: () => import('../pages/main/main.component').then(main => main.MainComponent),
  },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
