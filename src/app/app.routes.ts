import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'main',
  //   loadComponent: () => import('../pages/main/main.component').then(m => m.MainComponent),
  //   canActivate: [AuthGuard],
  // },
  {
    path: 'registration',
    loadComponent: () => import('../pages/registration/registration.component').then(m => m.RegisterComponent),
  },
  // {
  //   path: '',
  //   redirectTo: 'main',
  //   pathMatch: 'full',
  // },
  // {
  //   path: '**',
  //   redirectTo: 'main',
  // },
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule],
// })
// export class AppRoutingModule {}
