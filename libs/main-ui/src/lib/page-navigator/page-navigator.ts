import {
  afterNextRender,
  Component,
  ElementRef,
  HostListener,
  inject,
  Injector,
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
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';
import { contentResize } from '@service-bus-browser/actions';
import { messagePagesActions } from '@service-bus-browser/messages-store';
import { FormsModule } from '@angular/forms';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'lib-page-navigator',
  templateUrl: './page-navigator.html',
  styleUrl: './page-navigator.scss',
  imports: [NgClass, RouterLink, CdkDropList, CdkDrag, FormsModule, ContextMenu],
})
export class PageNavigator {
  store = inject(Store);
  actions = inject(Actions);
  private injector = inject(Injector);

  navigator = viewChild<ElementRef<HTMLDivElement>>('pageNavigator');
  contextMenuRef = viewChild<ContextMenu>('contextMenu');
  scrollAtStart = signal(false);
  scrollAtEnd = signal(false);
  editingPageId = signal<UUID | undefined>(undefined);
  editingPageName = signal('');
  contextMenuPageId = signal<UUID | undefined>(undefined);
  contextMenuPageIndex = signal<number>(0);
  contextMenuItems = signal<MenuItem[]>([]);

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

  openContextMenu(event: MouseEvent, pageId: UUID, pageName: string, index: number) {
    event.preventDefault();
    this.contextMenuPageId.set(pageId);
    this.contextMenuPageIndex.set(index);
    this.contextMenuItems.set([
      {
        label: 'Rename',
        icon: 'pi pi-pencil',
        command: () => this.startRename(pageId, pageName),
      },
      {
        label: 'Close',
        icon: 'pi pi-times',
        command: () => this.store.dispatch(pagesActions.closePage({ id: pageId, position: index })),
      },
    ]);
    this.contextMenuRef()?.show(event);
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

  protected drop($event: CdkDragDrop<any, any>) {
    this.store.dispatch(
      pagesActions.movePage({
        id: $event.item.data,
        fromPosition: $event.previousIndex,
        newPosition: $event.currentIndex,
      }),
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
