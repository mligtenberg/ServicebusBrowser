import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { MenuItem } from 'primeng/api';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Store } from '@ngrx/store';

@Component({
  imports: [RouterModule, MainUiComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly store = inject(Store);
  protected title = 'servicebus-browser-web-frontend';

  menuItems: MenuItem[] = [
    {
      label: 'Messages',
      items: [
        {
          label: 'Send',
          icon: 'pi pi-send',
          routerLink: '/messages/send',
        },
        {
          label: 'Import',
          icon: 'pi pi-upload',
          command: () => {
            this.importMessages();
          },
        },
      ],
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: '/about',
    }
  ];

  importMessages(): void {
    this.store.dispatch(MessagesActions.importMessages());
  }
}
