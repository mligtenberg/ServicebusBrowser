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

## Why one viewport still isn't enough (pagination)

Fixing both invariants makes every row *reachable*, but two limits are inherent
to putting a 700k-row list behind a single scrollbar:

- **The spacer is a real element** of `itemSize * length` px — 29.4M px at
  700k × 42. Chrome's layout ceiling is ~33.5M px and Firefox's is about half
  that, so a larger `rowHeight` or dataset silently truncates the list.
- **The scrollbar thumb degenerates.** With 29.4M px of extent over an ~800px
  track, one pixel of thumb travel moves ~875 rows. No position in the list can
  be reached deliberately; the scrollbar becomes a coarse jump control.

So above `maxMessagesPerPage` (default 100.000) rows, `MessagesViewer` hands the
grid **one chunk at a time** and shows an
[`SbbPaginator`](../libs/shared/ui/src/lib/paginator/paginator.ts) beneath it.
This restores the pagination that existed before the PrimeNG migration (commit
`801c1f68`, which used `p-paginator`), at the same threshold and page size.

At 100k the spacer is 4.2M px and a thumb pixel is ~125 rows — still coarse, but
inside a range where filtering is the intended tool for narrowing further.

### The index contract

Chunking splits the index space in two, and mixing them up silently loads or
selects the wrong messages:

| Index space   | Who speaks it                                                            |
| ------------- | ------------------------------------------------------------------------ |
| Chunk-relative | `SbbDataGrid` — its `data`, `rowClick.index`, and `lazyLoad.first/last`  |
| Absolute       | `messages`/`virtualMessages`, `lazyLoadTriggered`, range selection, and `MessagesPageComponent.loadRows()` |

`MessagesViewer.pageOffset()` is the only bridge. Everything arriving from the
grid gets it added (`onGridLazyLoad`, `onGridRowClick`); everything indexing into
`messages()` stays absolute. Selection is keyed by message key rather than by
index, so it survives a chunk change untouched.

Changing chunk resets the grid's lazy bookkeeping and scroll position — that
state belongs to the chunk being left. `currentPageIndex` is a `linkedSignal`
that returns to the first chunk when the message page changes and otherwise
clamps into range, so a newly applied filter cannot leave the viewer parked past
the end of a shorter result set.
