import {
  afterNextRender,
  Component,
  ElementRef,
  HostListener,
  inject,
  Injector,
  signal,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectActivePage, selectPages } from '../ngrx/route.selectors';
import { pagesActions } from '../ngrx/route.actions';
import { UUID } from '@service-bus-browser/shared-contracts';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';
import { contentResize } from '@service-bus-browser/actions';
import { messagePagesActions } from '@service-bus-browser/messages-store';
import { FormsModule } from '@angular/forms';
import {
  SbbContextMenu,
  SbbMenuItem,
  SbbTabHeaderDef,
  SbbTabPanel,
  SbbTabs,
  SbbTabsReorderEvent,
} from '@service-bus-browser/shared-ui';

@Component({
  selector: 'lib-page-navigator',
  templateUrl: './page-navigator.html',
  styleUrl: './page-navigator.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, RouterLink, FormsModule, SbbContextMenu, SbbTabs, SbbTabPanel, SbbTabHeaderDef],
})
export class PageNavigator {
  store = inject(Store);
  actions = inject(Actions);
  private injector = inject(Injector);

  navigator = viewChild<ElementRef<HTMLDivElement>>('pageNavigator');
  scrollAtStart = signal(false);
  scrollAtEnd = signal(false);
  editingPageId = signal<UUID | undefined>(undefined);
  editingPageName = signal('');

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

    this.actions
      .pipe(
        ofType(contentResize),
        takeUntilDestroyed()
      )
      .subscribe(() => this.onElementChange());
  }

  protected pageMenu(pageId: UUID, pageName: string, index: number): SbbMenuItem<UUID>[] {
    const pageCount = this.pages().length;
    return [
      {
        label: 'Rename',
        icon: 'fa-solid fa-pencil',
        onSelect: () => this.startRename(pageId, pageName),
      },
      {
        label: 'Close',
        icon: 'fa-solid fa-xmark',
        onSelect: () => this.store.dispatch(pagesActions.closePage({ id: pageId, position: index })),
      },
      {
        separator: true,
      },
      {
        label: 'Close tabs to the left',
        icon: 'fa-solid fa-angles-left',
        disabled: index === 0,
        onSelect: () => this.closePagesInRange(0, index - 1),
      },
      {
        label: 'Close tabs to the right',
        icon: 'fa-solid fa-angles-right',
        disabled: index >= pageCount - 1,
        onSelect: () => this.closePagesInRange(index + 1, pageCount - 1),
      },
      {
        label: 'Close all tabs',
        icon: 'fa-solid fa-circle-xmark',
        disabled: pageCount === 0,
        onSelect: () => this.closePagesInRange(0, pageCount - 1),
      },
    ];
  }

  private closePagesInRange(fromIndex: number, toIndex: number) {
    const pages = this.pages();
    for (let i = toIndex; i >= fromIndex; i--) {
      const page = pages[i];
      if (!page) {
        continue;
      }
      this.store.dispatch(pagesActions.closePage({ id: page.id, position: i }));
    }
  }

  closePage(pageId: UUID, event: Event, index: number) {
    this.store.dispatch(
      pagesActions.closePage({ id: pageId, position: index }),
    );
    event.stopPropagation();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.onElementChange();
  }

  protected onReordered({ previousIndex, currentIndex }: SbbTabsReorderEvent) {
    const page = this.pages()[previousIndex];
    if (!page) {
      return;
    }

    this.store.dispatch(
      pagesActions.movePage({ id: page.id, fromPosition: previousIndex, newPosition: currentIndex }),
    );
  }

  protected startRename(pageId: UUID, pageName: string) {
    this.editingPageId.set(pageId);
    this.editingPageName.set(pageName);

    afterNextRender(
      () => {
        const input = this.navigator()
          ?.nativeElement.querySelector<HTMLInputElement>(
            `[data-page-rename-input="${pageId}"]`,
          );
        input?.focus();
        input?.select();
      },
      { injector: this.injector },
    );
  }

  protected updateEditingPageName(pageName: string) {
    this.editingPageName.set(pageName);
  }

  protected commitRename(pageId: UUID) {
    const pageName = this.editingPageName().trim();
    const page = this.pages().find((item) => item.id === pageId);
    this.cancelRename();

    if (!page || pageName.length === 0 || page.name === pageName) {
      return;
    }

    this.store.dispatch(
      messagePagesActions.renamePage({
        pageId,
        pageName,
      }),
    );
  }

  protected cancelRename() {
    this.editingPageId.set(undefined);
    this.editingPageName.set('');
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

    this.scrollAtStart.update(() => navigator.scrollLeft <= 10);
    this.scrollAtEnd.update(
      () =>
        navigator.scrollLeft >= navigator.scrollWidth - navigator.clientWidth - 5,
    );
  }
}
