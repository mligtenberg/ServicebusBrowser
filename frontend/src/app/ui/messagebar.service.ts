import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector, ValueProvider } from '@angular/core';
import { MessagebarComponent } from './messagebar/messagebar.component';
import { IMessagebarOptions } from './models/messagebarOptions';
import { MessagebarRef } from './models/messagebarRef';

@Injectable({
  providedIn: 'root'
})
export class MessagebarService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  showMessage(options: IMessagebarOptions) {
    const messagebarRef = new MessagebarRef(options.message);

    const injector = Injector.create({
      providers: [
        { provide: MessagebarRef, useValue: messagebarRef } as ValueProvider
      ],
      parent: this.injector
    });

    const messagebarComponent = this.componentFactoryResolver
    .resolveComponentFactory(MessagebarComponent)
    .create(injector);
    
    this.appRef.attachView(messagebarComponent.hostView);

    const htmlElement = (messagebarComponent.hostView as EmbeddedViewRef<any>)
    .rootNodes[0] as HTMLElement;

    document.body.appendChild(htmlElement);

    const closeTime = options.showForMiliseconds ?? 2000;

    setTimeout(() => {
      messagebarComponent.destroy();
      document.body.removeChild(htmlElement);
    }, closeTime);

    return messagebarRef;
  }
}
