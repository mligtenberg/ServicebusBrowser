import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Marks a custom item template for `SbbAutocomplete`. The template's implicit
 * context is the suggestion item:
 *
 * ```html
 * <ng-template sbbAutocompleteItem let-item>{{ item.name }}</ng-template>
 * ```
 */
@Directive({ selector: '[sbbAutocompleteItem]', standalone: true })
export class SbbAutocompleteItemDef {
  readonly template = inject(TemplateRef);
}

/**
 * Marks a custom group-header template for `SbbAutocomplete`. The implicit
 * context is the `SbbAutocompleteGroup`:
 *
 * ```html
 * <ng-template sbbAutocompleteGroupLabel let-group>{{ group.label }}</ng-template>
 * ```
 */
@Directive({ selector: '[sbbAutocompleteGroupLabel]', standalone: true })
export class SbbAutocompleteGroupLabelDef {
  readonly template = inject(TemplateRef);
}
