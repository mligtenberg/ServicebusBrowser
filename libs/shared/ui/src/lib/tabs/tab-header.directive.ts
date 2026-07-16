import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Marks custom tab-header content for `SbbTabPanel`, replacing the plain
 * `label` text with arbitrary projected markup — icons, a close button, an
 * inline-rename input, anything a call site needs in its tab strip.
 *
 * ```html
 * <sbb-tab-panel value="a">
 *   <ng-template sbbTabHeader>
 *     <span>Custom</span>
 *     <button (click)="close(); $event.stopPropagation()">x</button>
 *   </ng-template>
 * </sbb-tab-panel>
 * ```
 *
 * When present, `SbbTabs` renders this tab as a `role="tab"` `<div>` instead
 * of a `<button>` — native `<button>` elements can't legally contain other
 * interactive descendants (a link, a close button, an input), which a rich
 * header commonly needs.
 */
@Directive({ selector: '[sbbTabHeader]', standalone: true })
export class SbbTabHeaderDef {
  readonly template = inject(TemplateRef);
}
