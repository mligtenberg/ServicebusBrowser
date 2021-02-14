import { ComponentRef, EmbeddedViewRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogComponent } from '../dialog/dialog.component';

export class DialogRef<T> {
  private closed = false;
  private readonly _afterClosed = new Subject<T | undefined>();
  private htmlElement: HTMLElement;

  constructor(private componentRef: ComponentRef<DialogComponent>) {
    this.htmlElement = (componentRef.hostView as EmbeddedViewRef<any>)
    .rootNodes[0] as HTMLElement;
    document.body.appendChild(this.htmlElement);
  }

  isClosed(): boolean {
    return this.closed;
  }

  afterClosed(): Observable<T> {
      return this._afterClosed.asObservable();
  }

  cancel(): void {
    if (!this.closed) {
      document.body.removeChild(this.htmlElement);
      this.componentRef.destroy();
      this.closed = true;
      this._afterClosed.error("canceled");
      this._afterClosed.complete();
    }
  }

  respond(result: T): void {
    if (!this.closed) {
      document.body.removeChild(this.htmlElement);
      this.componentRef.destroy();
      this.closed = true;
      this._afterClosed.next(result);
      this._afterClosed.complete();
    }
  }
}
