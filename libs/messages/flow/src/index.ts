import { Routes } from '@angular/router';
import { BASE_ROUTE } from './lib/const';

export const routes = (options: { baseRoute: string }): Routes => [
  {
    path: '',
    providers: [
      {
        provide: BASE_ROUTE,
        useValue: options.baseRoute
      }
    ],
    children: [
      {
        path: 'page.ts/:pageId',
        loadComponent: () => import('./lib/messages-page/messages-page.component').then(m => m.MessagesPageComponent),
      },
      {
        path: 'send',
        loadComponent: () => import('./lib/send-message/send-message.component').then(m => m.SendMessageComponent),
      },
      {
        path: 'resend/:pageId/:messageId',
        loadComponent: () => import('./lib/send-message/send-message.component').then(m => m.SendMessageComponent),
      },
      {
        path: 'batch-resend',
        loadComponent: () => import('./lib/messages-batch-resend/messages-batch-resend.component').then(m => m.MessagesBatchResendComponent),
      }
    ]
  }
];
