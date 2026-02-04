import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectActivePage, selectPages } from '../ngrx/route.selectors';
import { pagesActions } from '../ngrx/route.actions';
import { UUID } from '@service-bus-browser/shared-contracts';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-page-navigator',
  templateUrl: './page-navigator.html',
  styleUrl: './page-navigator.scss',
  imports: [NgClass, RouterLink],
})
export class PageNavigator {
  store = inject(Store);

  pages = this.store.selectSignal(selectPages);
  currentPage = this.store.selectSignal(selectActivePage);

  closePage(pageId: UUID, event: Event) {
    this.store.dispatch(pagesActions.closePage({ id: pageId }));
    event.stopPropagation();
  }
}
