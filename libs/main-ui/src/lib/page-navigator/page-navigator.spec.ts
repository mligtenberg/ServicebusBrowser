import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, EMPTY } from 'rxjs';
import { Action } from '@ngrx/store';
import { PageNavigator } from './page-navigator';
import { pagesActions } from '../ngrx/route.actions';
import { selectPages, selectActivePage } from '../ngrx/route.selectors';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PageNavigator', () => {
  let component: PageNavigator;
  let fixture: ComponentFixture<PageNavigator>;
  let store: MockStore;
  let actions$: Observable<Action>;
  let dispatchSpy: jest.SpyInstance;

  const mockPages = [
    { id: 'page-1', name: 'Page 1', route: '/messages/page/page-1', type: 'messages' },
    { id: 'page-2', name: 'Page 2', route: '/messages/page/page-2', type: 'messages' },
    { id: 'page-3', name: 'Page 3', route: '/messages/page/page-3', type: 'messages' },
    { id: 'page-4', name: 'Page 4', route: '/messages/page/page-4', type: 'messages' },
    { id: 'page-5', name: 'Page 5', route: '/messages/page/page-5', type: 'messages' },
  ] as any[];

  beforeEach(async () => {
    actions$ = EMPTY;

    await TestBed.configureTestingModule({
      imports: [PageNavigator, NoopAnimationsModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectPages, value: mockPages },
            { selector: selectActivePage, value: mockPages[0] },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PageNavigator);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dispatchSpy = jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    store.resetSelectors();
    jest.clearAllMocks();
  });

  describe('openContextMenu', () => {
    let mockEvent: MouseEvent;

    beforeEach(() => {
      mockEvent = new MouseEvent('contextmenu');
      jest.spyOn(mockEvent, 'preventDefault');
    });

    it('should prevent default event behavior', () => {
      component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should set contextMenuPageId signal', () => {
      component.openContextMenu(mockEvent, 'page-2', 'Page 2', 1);
      expect(component.contextMenuPageId()).toBe('page-2');
    });

    it('should set contextMenuPageIndex signal', () => {
      component.openContextMenu(mockEvent, 'page-3', 'Page 3', 2);
      expect(component.contextMenuPageIndex()).toBe(2);
    });

    it('should create menu items with Rename, Close, separator, and close-multiple items', () => {
      component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
      const items = component.contextMenuItems();

      expect(items).toHaveLength(6);
      expect(items[0].label).toBe('Rename');
      expect(items[1].label).toBe('Close');
      expect(items[2].separator).toBe(true);
      expect(items[3].label).toBe('Close tabs to the left');
      expect(items[4].label).toBe('Close tabs to the right');
      expect(items[5].label).toBe('Close all tabs');
    });

    describe('"Close tabs to the left" item', () => {
      it('should be disabled when index is 0 (first tab)', () => {
        component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
        expect(component.contextMenuItems()[3].disabled).toBe(true);
      });

      it('should be enabled when index is 1', () => {
        component.openContextMenu(mockEvent, 'page-2', 'Page 2', 1);
        expect(component.contextMenuItems()[3].disabled).toBe(false);
      });

      it('should be enabled when index is in the middle', () => {
        component.openContextMenu(mockEvent, 'page-3', 'Page 3', 2);
        expect(component.contextMenuItems()[3].disabled).toBe(false);
      });

      it('should be enabled for the last tab', () => {
        component.openContextMenu(mockEvent, 'page-5', 'Page 5', 4);
        expect(component.contextMenuItems()[3].disabled).toBe(false);
      });
    });

    describe('"Close tabs to the right" item', () => {
      it('should be disabled when index equals pageCount - 1 (last tab)', () => {
        // mockPages has 5 items, last index is 4
        component.openContextMenu(mockEvent, 'page-5', 'Page 5', 4);
        expect(component.contextMenuItems()[4].disabled).toBe(true);
      });

      it('should be enabled when index is less than pageCount - 1', () => {
        component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
        expect(component.contextMenuItems()[4].disabled).toBe(false);
      });

      it('should be enabled when index is in the middle', () => {
        component.openContextMenu(mockEvent, 'page-3', 'Page 3', 2);
        expect(component.contextMenuItems()[4].disabled).toBe(false);
      });

      it('should be disabled when index >= pageCount - 1', () => {
        store.overrideSelector(selectPages, [
          { id: 'only-page', name: 'Only', route: '/messages/page/only-page', type: 'messages' },
        ] as any[]);
        store.refreshState();
        fixture.detectChanges();

        component.openContextMenu(mockEvent, 'only-page', 'Only', 0);
        expect(component.contextMenuItems()[4].disabled).toBe(true);
      });
    });

    describe('"Close all tabs" item', () => {
      it('should be enabled when there are pages', () => {
        component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
        expect(component.contextMenuItems()[5].disabled).toBe(false);
      });

      it('should be disabled when pageCount is 0', () => {
        store.overrideSelector(selectPages, [] as any[]);
        store.refreshState();
        fixture.detectChanges();

        // Can't right-click a tab when there are none, but we verify the logic
        component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
        expect(component.contextMenuItems()[5].disabled).toBe(true);
      });
    });
  });

  describe('closePagesInRange (via context menu commands)', () => {
    let mockEvent: MouseEvent;

    beforeEach(() => {
      mockEvent = new MouseEvent('contextmenu');
      jest.spyOn(mockEvent, 'preventDefault');
    });

    it('should dispatch closePage for each page in range from right to left (reverse order)', () => {
      // Open context menu at index 2 (page-3), then invoke "Close tabs to the left"
      // which calls closePagesInRange(0, 1) -> should close page-2 (index 1), then page-1 (index 0)
      component.openContextMenu(mockEvent, 'page-3', 'Page 3', 2);
      const closeLeftCommand = component.contextMenuItems()[3].command!;
      closeLeftCommand({} as any);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      // Reverse order: closes index 1 first, then index 0
      expect(dispatchSpy).toHaveBeenNthCalledWith(1,
        pagesActions.closePage({ id: 'page-2', position: 1 })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(2,
        pagesActions.closePage({ id: 'page-1', position: 0 })
      );
    });

    it('should dispatch closePage in reverse order for "Close tabs to the right"', () => {
      // Open context menu at index 2 (page-3), invoke "Close tabs to the right"
      // which calls closePagesInRange(3, 4) -> should close page-5 (index 4), then page-4 (index 3)
      component.openContextMenu(mockEvent, 'page-3', 'Page 3', 2);
      const closeRightCommand = component.contextMenuItems()[4].command!;
      closeRightCommand({} as any);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(dispatchSpy).toHaveBeenNthCalledWith(1,
        pagesActions.closePage({ id: 'page-5', position: 4 })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(2,
        pagesActions.closePage({ id: 'page-4', position: 3 })
      );
    });

    it('should dispatch closePage for all pages in reverse order for "Close all tabs"', () => {
      component.openContextMenu(mockEvent, 'page-3', 'Page 3', 2);
      const closeAllCommand = component.contextMenuItems()[5].command!;
      closeAllCommand({} as any);

      expect(dispatchSpy).toHaveBeenCalledTimes(5);
      // Reverse order: page-5, page-4, page-3, page-2, page-1
      expect(dispatchSpy).toHaveBeenNthCalledWith(1,
        pagesActions.closePage({ id: 'page-5', position: 4 })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(2,
        pagesActions.closePage({ id: 'page-4', position: 3 })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(3,
        pagesActions.closePage({ id: 'page-3', position: 2 })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(4,
        pagesActions.closePage({ id: 'page-2', position: 1 })
      );
      expect(dispatchSpy).toHaveBeenNthCalledWith(5,
        pagesActions.closePage({ id: 'page-1', position: 0 })
      );
    });

    it('should dispatch a single closePage when closing only one tab to the left', () => {
      // index 1: close tabs to the left -> closePagesInRange(0, 0)
      component.openContextMenu(mockEvent, 'page-2', 'Page 2', 1);
      const closeLeftCommand = component.contextMenuItems()[3].command!;
      closeLeftCommand({} as any);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        pagesActions.closePage({ id: 'page-1', position: 0 })
      );
    });

    it('should dispatch a single closePage when closing only one tab to the right', () => {
      // index 3 (page-4): close tabs to the right -> closePagesInRange(4, 4)
      component.openContextMenu(mockEvent, 'page-4', 'Page 4', 3);
      const closeRightCommand = component.contextMenuItems()[4].command!;
      closeRightCommand({} as any);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        pagesActions.closePage({ id: 'page-5', position: 4 })
      );
    });

    it('should not dispatch anything when "Close tabs to the left" is called at index 0 via command', () => {
      // The menu item is disabled, but we test that the command (closePagesInRange(0, -1)) does nothing
      component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
      const closeLeftCommand = component.contextMenuItems()[3].command!;
      closeLeftCommand({} as any);

      // fromIndex=0, toIndex=-1: loop condition i >= 0 is false immediately for i=-1
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should handle "Close tabs to the right" with only one page on the right', () => {
      // Boundary test: index 4 (last) - should be disabled, but for index 3 with 5 pages
      store.overrideSelector(selectPages, [
        { id: 'page-a', name: 'Page A', route: '/messages/page/page-a', type: 'messages' },
        { id: 'page-b', name: 'Page B', route: '/messages/page/page-b', type: 'messages' },
      ] as any[]);
      store.refreshState();
      fixture.detectChanges();

      component.openContextMenu(mockEvent, 'page-a', 'Page A', 0);
      const closeRightCommand = component.contextMenuItems()[4].command!;
      closeRightCommand({} as any);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        pagesActions.closePage({ id: 'page-b', position: 1 })
      );
    });
  });

  describe('context menu icons', () => {
    it('should set correct icons for new menu items', () => {
      const mockEvent = new MouseEvent('contextmenu');
      jest.spyOn(mockEvent, 'preventDefault');

      component.openContextMenu(mockEvent, 'page-1', 'Page 1', 0);
      const items = component.contextMenuItems();

      expect(items[3].icon).toBe('pi pi-angle-double-left');
      expect(items[4].icon).toBe('pi pi-angle-double-right');
      expect(items[5].icon).toBe('pi pi-times-circle');
    });
  });
});