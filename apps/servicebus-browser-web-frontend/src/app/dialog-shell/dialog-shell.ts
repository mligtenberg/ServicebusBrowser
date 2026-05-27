import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  imports: [RouterOutlet],
  selector: 'app-dialog-shell',
  templateUrl: './dialog-shell.html',
  styleUrl: './dialog-shell.scss',
})
export class DialogShell {
  // Eagerly instantiate so the service's dark-mode effect attaches to <html>
  // for popup windows that don't go through MainApp.
  private themeService = inject(ColorThemeService);
}
