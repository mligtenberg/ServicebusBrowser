import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  SbbButtonSeverity,
  SbbButtonSize,
  SbbButtonVariant,
} from './button.models';

/**
 * `SbbButton` — a styled native `<button>`.
 *
 * Opinionated-minimal API distilled from the current `p-button` /
 * `pButton` call sites across the app: severity (primary/secondary/danger),
 * variant (filled/outlined/text), size, icon (leading FontAwesome icon,
 * optionally icon-only), rounded, loading (spinner + implicit disable), and
 * disabled.
 *
 * This is NOT a form control — it renders a plain `<button>` element and
 * never implements `ControlValueAccessor`. The `type` input mirrors the
 * native `<button type>` attribute (defaults to `'button'` so it never
 * accidentally submits a surrounding `<form>`, matching current call sites
 * that explicitly set `type="button"`).
 *
 * Usage:
 * ```html
 * <sbb-button (click)="save()">Save</sbb-button>
 * <sbb-button severity="danger" variant="outlined" (click)="remove()">Delete</sbb-button>
 * <sbb-button [icon]="faTrash" [iconOnly]="true" [rounded]="true" (click)="remove()" />
 * <sbb-button [loading]="saving()" (click)="save()">Save</sbb-button>
 * ```
 */
@Component({
  selector: 'sbb-button',
  imports: [FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    class: 'sbb-button-host',
  },
})
export class SbbButton {
  /** Visual intent. Defaults to `'primary'`. */
  readonly severity = input<SbbButtonSeverity>('primary');

  /** Visual weight/fill. Defaults to `'filled'`. */
  readonly variant = input<SbbButtonVariant>('filled');

  /** Button size. Defaults to `'medium'`. */
  readonly size = input<SbbButtonSize>('medium');

  /** Native `<button type>`. Defaults to `'button'`. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** Leading FontAwesome icon, rendered before projected content. */
  readonly icon = input<IconDefinition | undefined>(undefined);

  /** Render as a square icon-only button (no label). Requires `icon`. */
  readonly iconOnly = input(false);

  /** Fully rounded (pill/circle) shape. */
  readonly rounded = input(false);

  /** Shows a spinner instead of the icon and implicitly disables the button. */
  readonly loading = input(false);

  /** Disables the button. */
  readonly disabled = input(false);

  /**
   * Accessible name for the native `<button>`. Aliased to the plain
   * `aria-label` attribute so existing `<sbb-button aria-label="...">` call
   * sites keep working unchanged — Angular treats a static attribute as the
   * input's initial value.
   */
  readonly ariaLabel = input<string | undefined>(undefined, {
    alias: 'aria-label',
  });

  /** Effective disabled state: `disabled` OR `loading`. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.loading(),
  );

  /** Spinner icon shown in place of `icon` while `loading` is true. */
  protected readonly spinnerIcon: IconDefinition = faSpinner;

  protected readonly buttonClasses = computed(() => ({
    'sbb-button': true,
    [`sbb-button--${this.severity()}`]: true,
    [`sbb-button--${this.variant()}`]: true,
    [`sbb-button--${this.size()}`]: true,
    'sbb-button--icon-only': this.iconOnly(),
    'sbb-button--rounded': this.rounded(),
    'sbb-button--loading': this.loading(),
  }));
}
