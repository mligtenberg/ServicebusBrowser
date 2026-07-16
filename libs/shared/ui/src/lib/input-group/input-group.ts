import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Layout wrapper that visually groups a text input with leading/trailing
 * addons (icon buttons, checkboxes, etc.) into a single bordered control.
 *
 * Pure structural component — projects content, holds no state, and is NOT a
 * form control itself (the projected `<input>` remains the actual control).
 *
 * @example
 * ```html
 * <sbb-input-group>
 *   <sbb-input-group-addon>
 *     <sbb-checkbox ... />
 *   </sbb-input-group-addon>
 *   <input sbbInput ... />
 *   <sbb-input-group-addon>
 *     <button sbb-button icon="times" (click)="clear()"></button>
 *   </sbb-input-group-addon>
 * </sbb-input-group>
 * ```
 */
@Component({
  selector: 'sbb-input-group',
  template: '<ng-content></ng-content>',
  styleUrl: './input-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sbb-input-group',
  },
})
export class SbbInputGroup {}
