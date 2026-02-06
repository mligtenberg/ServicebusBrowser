import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectActivePage, selectPages } from '../ngrx/route.selectors';
import { pagesActions } from '../ngrx/route.actions';
import { UUID } from '@service-bus-browser/shared-contracts';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Actions } from '@ngrx/effects';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';

@Component({
  selector: 'lib-page-navigator',
  templateUrl: './page-navigator.html',
  styleUrl: './page-navigator.scss',
  imports: [NgClass, RouterLink, CdkDropList, CdkDrag],
})
export class PageNavigator {
  store = inject(Store);
  actions = inject(Actions);

  navigator = viewChild<ElementRef<HTMLDivElement>>('pageNavigator');
  scrollAtStart = signal(false);
  scrollAtEnd = signal(false);

  pages = this.store.selectSignal(selectPages);
  pages$ = toObservable(this.pages);
  currentPage = this.store.selectSignal(selectActivePage);

  constructor() {
    this.pages$
      .pipe(
        takeUntilDestroyed(),
        delay(30)
      )
      .subscribe(() => this.onElementChange());
  }

  closePage(pageId: UUID, event: Event, index: number) {
    this.store.dispatch(
      pagesActions.closePage({ id: pageId, position: index }),
    );
    event.stopPropagation();
  }

  protected drop($event: CdkDragDrop<any, any>) {
    this.store.dispatch(
      pagesActions.movePage({
        id: $event.item.data,
        fromPosition: $event.previousIndex,
        newPosition: $event.currentIndex,
      }),
    );
  }

  protected scrollToStart(element: HTMLDivElement) {
    element.scrollTo({ left: 0, behavior: 'smooth' });
  }

  protected scrollToEnd(element: HTMLDivElement) {
    element.scrollTo({ left: element.scrollWidth, behavior: 'smooth' });
  }

  protected onElementChange() {
    const navigator = this.navigator()?.nativeElement;
    if (!navigator) {
      return;
    }

    this.scrollAtStart.update(() => navigator.scrollLeft === 0);
    this.scrollAtEnd.update(
      () =>
        navigator.scrollLeft >= navigator.scrollWidth - navigator.clientWidth,
    );
  }
}
