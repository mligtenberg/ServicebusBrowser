import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'page/:pageId',
    loadComponent: () => import('./lib/messages-page/messages-page.component').then(m => m.MessagesPageComponent),
  }
]
