import { Routes } from '@angular/router';
import { provideConnectionsState } from '@service-bus-browser/connections-store';

export const routes: Routes = [
  {
    path: 'add',
    loadComponent: () => import('./lib/add-connection.component').then(m => m.AddConnectionComponent),
    providers: [
      provideConnectionsState()
    ]
  },
  {
    path: '',
    redirectTo: 'add',
    pathMatch: 'full'
  }
]
