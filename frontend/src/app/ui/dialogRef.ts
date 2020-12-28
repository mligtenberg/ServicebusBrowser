import { Observable, Subject } from 'rxjs';

export class DialogRef<T> {
  private closed = false;
  private readonly _afterClosed = new Subject<T | undefined>();

  constructor(private htmlElement: HTMLElement) {
    document.body.appendChild(htmlElement);
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
      this.closed = true;
      this._afterClosed.error("canceled");
      this._afterClosed.complete();
    }
  }

  respond(result: T): void {
    if (!this.closed) {
      document.body.removeChild(this.htmlElement);
      this.closed = true;
      this._afterClosed.next(result);
      this._afterClosed.complete();
    }
  }
}
