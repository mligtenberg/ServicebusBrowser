import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IconDefinition, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toggle-box',
  templateUrl: './toggle-box.component.html',
  styleUrls: ['./toggle-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleBoxComponent {

  constructor() { }

  @Input()
  ignoreTitle = false;

  @Input() @Output()
  open: boolean;

  @Output()
  bodyOpened = new EventEmitter();

  @Output()
  bodyClosed = new EventEmitter();

  get stateIcon(): IconDefinition {
    return this.open ? faChevronDown : faChevronRight;
  }

  click($event: Event): void {
    this.open = !this.open;
    if (this.open) {
      this.bodyOpened.emit('Body opened');
    } else {
      this.bodyClosed.emit('Body closed');
    }

    $event.stopPropagation();
  }

  clickTitle($event: Event): void {
    if (!this.ignoreTitle) {
      this.click($event);
    }
  }
}
