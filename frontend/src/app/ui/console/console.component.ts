import { Component, ChangeDetectionStrategy, Input, Output, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { faChevronDown, faChevronLeft, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { ResizeEvent } from 'angular-resizable-element';
import { ILogItem, LogLevel } from 'src/app/logging/ngrx/logging.models';
import { getLogs } from 'src/app/logging/ngrx/logging.selectors';
import { State } from 'src/app/ngrx.module';
import { SubSink } from 'subsink';
@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  @Output()
  open: boolean = false;

  logLines: ILogItem[] = [];

  @ViewChild('logPlane', {static: true})
  public logPlane: ElementRef | undefined;

  minHeight = 60;
  height = 300;
  subSink = new SubSink();


  constructor(
    private store: Store<State>
  ) {}

  ngOnInit(): void {
    this.subSink.add(this.store.select(getLogs).subscribe(l => {
      this.logLines = l;
      this.scrollToBottom();
    }));
  }

  get icon(): IconDefinition { 
    return this.open ? faChevronDown : faChevronLeft;
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.logPlane != undefined) {
      this.logPlane.nativeElement.scrollTop = this.logPlane.nativeElement.scrollHeight;
    }
  }

  toggleOpen(): void {
    this.open = !this.open;
  }

  onResizeEnd($event: ResizeEvent): void {
    this.height = this.minHeight < $event.rectangle.height ? $event.rectangle.height : this.minHeight;
  }

  getLevelString(logLevel: LogLevel): string {
    switch (logLevel) {
      case LogLevel.verbose:
        return "Verbose";
      case LogLevel.info:
        return "Info";
      case LogLevel.warning:
        return "Warning";
      case LogLevel.error:
        return "Error";
    }
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }
}
