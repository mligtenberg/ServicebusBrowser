import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainUiComponent } from '@service-bus-browser/main-ui';

@Component({
  imports: [RouterModule, MainUiComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'servicebus-browser-web-frontend';
}
