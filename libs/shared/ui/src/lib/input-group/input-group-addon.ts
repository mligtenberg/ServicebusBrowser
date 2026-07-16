import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A single addon slot within an `<sbb-input-group>` (e.g. an icon button or
 * checkbox appended/prepended to an input). Purely structural — projects
 * content and applies addon chrome (border, background, sizing).
 *
 * Multiple addons may be used within one group (leading and/or trailing);
 * ordering in the DOM determines visual position.
 */
@Component({
  selector: 'sbb-input-group-addon',
  template: '<ng-content></ng-content>',
  styleUrl: './input-group-addon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sbb-input-group-addon',
  },
})
export class SbbInputGroupAddon {}
