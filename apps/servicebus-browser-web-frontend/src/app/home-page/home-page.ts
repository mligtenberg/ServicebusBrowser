import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HomeComponent } from '@service-bus-browser/main-ui';

@Component({
  selector: 'app-home-page',
  imports: [HomeComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './home-page.html',
})
export class HomePage {}
