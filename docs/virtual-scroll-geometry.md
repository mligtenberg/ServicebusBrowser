# Virtual Scroll Geometry (CDK)

Both virtualized components in `libs/shared/ui` — `SbbDataGrid` and
`SbbVirtualScroller` — sit on top of `cdk-virtual-scroll-viewport` with the
fixed-size strategy. That strategy derives the rendered range purely from
arithmetic:

```
start = floor(scrollOffset / itemSize)
end   = ceil((scrollOffset + viewportSize) / itemSize)
```

Nothing in it measures the rows. So two numbers must stay true, or rows at the
end of the list become unreachable. Both were wrong at once, which is why a
700k-row message list dropped its last handful of rows.

## 1. `viewportSize` goes stale on element-level resizes

`CdkVirtualScrollViewport` measures itself once and then only re-measures when
`ViewportRuler` fires — i.e. on **window** resize or orientation change. It has
no `ResizeObserver`.

The messages grid lives inside an `sbb-splitter` panel. Dragging that splitter
(or collapsing the details pane) makes the viewport taller without any window
resize, so CDK keeps computing `end` from the old, smaller height. At the bottom
of the list `end` then lands short of the data length: the last
`(realSize - staleSize) / itemSize` rows are never rendered and cannot be
scrolled to at all. The taller you drag it, the more rows vanish.

Fix: `syncViewportSize()` in
[`viewport-size-sync.ts`](../libs/shared/ui/src/lib/virtual-scroller/viewport-size-sync.ts)
attaches a `ResizeObserver` to the viewport element and calls
`viewport.checkViewportSize()` on every size change. Both `SbbDataGrid` and
`SbbVirtualScroller` call it from their constructors. **Any new component that
hosts a `cdk-virtual-scroll-viewport` in a resizable container must call it
too.**

## 2. A row's outer height must equal `itemSize` exactly

`.sbb-grid__row` carries a 1px `border-bottom` and had no `box-sizing`, so an
inline `height: 42px` rendered a 43px box while the strategy placed rows on a
42px pitch. The rendered window is translated to `start * itemSize`, so the 1px
error accumulates row by row across the window and pushes the last row out
below the viewport's bottom edge — visible as one clipped row, worse in taller
viewports.

Fix: `box-sizing: border-box` on the row. When changing row padding, borders, or
`rowHeight`, keep `getBoundingClientRect().height === rowHeight`.

## Regression test

[`data-grid.stories.ts`](../libs/shared/ui/src/lib/data-grid/data-grid.stories.ts)
→ story `LastRowsReachableAfterResize`. It builds a 700k-row grid, resizes the
container from 400px to 1600px *without* a window resize, and asserts after each
step that the final row is both rendered and fully inside the viewport, plus
that row height matches `rowHeight`. It runs in real Chromium via
`nx run storybook-host:test` — layout-dependent, so it cannot live in the jsdom
Jest suite (which also has no `ResizeObserver`; `syncViewportSize` no-ops there).

## Related limits

The spacer that gives the scrollbar its extent is a real element of
`itemSize * length` px — 29.4M px for 700k × 42. That is still under Chrome's
~33.5M px layout ceiling, but a larger `rowHeight` or dataset would cross it and
truncate the list in a way no amount of re-measuring fixes. Firefox's ceiling is
about half that.
