import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'page/:pageId',
    loadComponent: () => import('./lib/messages-page/messages-page.component').then(m => m.MessagesPageComponent),
  },
  {
    path: 'send',
    loadComponent: () => import('./lib/send-message/send-message.component').then(m => m.SendMessageComponent),
  }
]
