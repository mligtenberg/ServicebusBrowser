import { Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { fromEventPattern, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClickService implements OnDestroy {

  private destroy$ = new Subject<void>();

  public onClick$: Observable<Event>;

  constructor(private rendererFactory2: RendererFactory2) {
    const renderer = this.rendererFactory2.createRenderer(null, null);
    this.createOnClickObservable(renderer);
  }

  private createOnClickObservable(renderer: Renderer2): void {
    let removeClickEventListener: () => void;
    const createClickEventListener = (
      handler: (e: Event) => boolean | void
    ) => {
      removeClickEventListener = renderer.listen("document", "click", handler);
    };

    this.onClick$ = fromEventPattern<Event>(createClickEventListener, () =>
      removeClickEventListener()
    ).pipe(takeUntil(this.destroy$));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
