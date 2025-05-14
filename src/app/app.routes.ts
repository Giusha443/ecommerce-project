// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { RegisterComponent } from '../pages/register/register.component';
import { authGuard, loginGuard } from '../guards/auth.guard';
import { MainComponent } from '../pages/main/main.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'signup', component: RegisterComponent },
  {
    //when u will write the main page adjust this route
    path: 'main',
    component: MainComponent,
    canActivate: [authGuard],
  },
];
