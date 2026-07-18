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
        path: 'page/:pageId',
        loadComponent: () => import('./lib/messages-page/messages-page.component').then(m => m.MessagesPageComponent),
        // No static title: the display name only exists in the messages
        // store (MessagePage.name), not the route. RecentPagesEffects
        // recognizes this flag and looks the name up itself.
        data: { titleFromMessagePage: true },
      },
      {
        path: 'send',
        loadComponent: () => import('./lib/send-message/send-message.component').then(m => m.SendMessageComponent),
        data: { title: 'Send Message' },
      },
      {
        path: 'resend/:pageId/:messageId',
        loadComponent: () => import('./lib/send-message/send-message.component').then(m => m.SendMessageComponent),
        data: { title: 'Resend Message' },
      },
      {
        path: 'batch-resend/:pageId',
        loadComponent: () => import('./lib/messages-batch-resend/messages-batch-resend.component').then(m => m.MessagesBatchResendComponent),
        data: { title: 'Batch Resend' },
      }
    ]
  }
];

export const popups: Routes = [
  {
    path: 'body-viewer/:pageId/:messageKey',
    loadComponent: () =>
      import('./lib/body-viewer/body-viewer').then((m) => m.BodyViewer),
    data: { popup: true },
  },
];
