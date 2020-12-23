import { Component, OnInit, ChangeDetectionStrategy, Input, Output } from '@angular/core';
import { IconDefinition, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toggle-box',
  templateUrl: './toggle-box.component.html',
  styleUrls: ['./toggle-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleBoxComponent {

  constructor() { }

  @Input() @Output()
  open: boolean;

  get stateIcon(): IconDefinition { 
    return this.open ? faChevronDown : faChevronRight;
  }

  click($event: Event) {
    this.open = !this.open;
    $event.stopPropagation();
  }

}
