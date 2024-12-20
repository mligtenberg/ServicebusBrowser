import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Splitter } from 'primeng/splitter';
import { PrimeTemplate } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ScrollPanel } from 'primeng/scrollpanel';

@Component({
  imports: [
    RouterModule,
    Button,
    Splitter,
    PrimeTemplate,
    Menubar,
    ScrollPanel,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'servicebus-browser-frontend';
  items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
    },
    {
      label: 'Projects',
      icon: 'pi pi-search',
      items: [
        {
          label: 'Core',
          icon: 'pi pi-bolt',
          shortcut: '⌘+S',
        },
        {
          label: 'Blocks',
          icon: 'pi pi-server',
          shortcut: '⌘+B',
        },
        {
          separator: true,
        },
        {
          label: 'UI Kit',
          icon: 'pi pi-pencil',
          shortcut: '⌘+U',
        },
      ],
    },
  ];
}
