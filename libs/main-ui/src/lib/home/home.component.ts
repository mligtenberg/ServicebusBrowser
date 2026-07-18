import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { SbbCard, SbbButton } from '@service-bus-browser/shared-ui';
import { openAddConnectionPopup } from '@service-bus-browser/services';
import { selectRecentPages } from '../ngrx/recent-pages.selectors';
import { formatRelativeTime } from './format-relative-time';

@Component({
  selector: 'lib-home',
  imports: [SbbCard, SbbButton, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly store = inject(Store);

  readonly faPlus = faPlus;
  readonly faPaperPlane = faPaperPlane;

  recentPages = this.store.selectSignal(selectRecentPages);

  openAddConnection(): void {
    openAddConnectionPopup(this.router, this.location);
  }

  sendMessage(): void {
    this.router.navigateByUrl('/messages/send');
  }

  formatVisitedAt(visitedAt: number): string {
    return formatRelativeTime(visitedAt);
  }
}
