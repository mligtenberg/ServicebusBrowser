import {
  ApplicationRef,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  Injectable,
  Injector,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ClickService } from './click.service';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';

@Injectable({
  providedIn: 'root',
})
export class ContextmenuService implements OnDestroy {
  private openElement: HTMLElement | null = null;
  private subs = new Subscription();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    clickService: ClickService
  ) {
    this.subs.add(
      clickService.onClick$.subscribe(() => {
        this.closeContextmenu();
      })
    );
  }

  public openContextmenu(options: {
    templateRef: TemplateRef<any>;
    mousePosition: {
      x: number;
      y: number;
    };
    width: number;
  }) {
    this.closeContextmenu();

    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ContextmenuComponent)
      .create(this.injector);

    componentRef.instance.templateRef = options.templateRef;

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    domElem.style.top = options.mousePosition.y.toString() + 'px';
    domElem.style.left = options.mousePosition.x.toString() + 'px';
    domElem.style.width = options.width + 'px';

    document.body.appendChild(domElem);
    this.openElement = domElem;
  }

  closeContextmenu() {
    if (this.openElement != null) {
      document.body.removeChild(this.openElement);
      this.openElement = null;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
