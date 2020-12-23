import {
  ApplicationRef,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  HostListener,
  Injectable,
  Injector,
  OnDestroy,
  Renderer2,
  RendererFactory2,
  TemplateRef,
} from '@angular/core';
import { fromEventPattern, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';

@Injectable({
  providedIn: 'root',
})
export class ContextmenuService implements OnDestroy {
  private openElement: HTMLElement | null = null;
  private destroy$ = new Subject();
  private subSink = new SubSink();

  private onClick$: Observable<Event>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private rendererFactory2: RendererFactory2) {
      const renderer = this.rendererFactory2.createRenderer(null, null);
  
      this.createOnClickObservable(renderer);
      this.subSink.add(this.onClick$.subscribe(() => {
        this.closeContextmenu();
      }));
    }

  public openContextmenu(options: {
    templateRef: TemplateRef<any>,
    target: HTMLElement,
    width: number,

  }) {
    this.closeContextmenu();

    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ContextmenuComponent)
      .create(this.injector);

    componentRef.instance.templateRef = options.templateRef;

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    const targetPosition = options.target.getBoundingClientRect();
    domElem.style.top =
      (targetPosition.top + targetPosition.height - 2).toString() + 'px';
    domElem.style.left = (targetPosition.left + 5).toString() + 'px';
    domElem.style.width = options.width + "px";

    document.body.appendChild(domElem);
    this.openElement = domElem;
  }

  private closeContextmenu() {
    if (this.openElement != null) {
      document.body.removeChild(this.openElement);
      this.openElement = null;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subSink.unsubscribe();
  }

  private createOnClickObservable(renderer: Renderer2) {
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
}
