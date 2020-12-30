import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshButtonComponent {
  @Input()
  loading: boolean = false;

  refreshIcon = faSyncAlt;
}
