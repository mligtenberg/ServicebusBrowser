import { Component, ChangeDetectionStrategy, Input, Output, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { faChevronDown, faChevronLeft, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ResizeEvent } from 'angular-resizable-element';
@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsoleComponent implements OnChanges, AfterViewInit {
  @Input()
  @Output()
  public open: boolean = true;

  @Input()
  public logLines: string[] = [];

  @ViewChild('logPlane', {static: true})
  public logPlane: ElementRef | undefined;

  public height = 300;

  public get icon(): IconDefinition { 
    return this.open ? faChevronDown : faChevronLeft;
  }

  ngOnChanges(): void {
    this.scrollToBottom();
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.logPlane != undefined) {
      this.logPlane.nativeElement.scrollTop = this.logPlane.nativeElement.scrollHeight;
    }
  }

  public toggleOpen(): void {
    this.open = !this.open;
  }

  public onResizeEnd($event: ResizeEvent): void {
    this.height = $event.rectangle.height;
  }
}
