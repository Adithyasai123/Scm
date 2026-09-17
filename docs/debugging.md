# SCM Portal — AI-Assisted Debugging Log

This log records real AI-assisted diagnostic investigations, root cause analyses, code edits, and verification steps performed during development.

---

## Challenge 1: React Hook Order Mismatch in `DataTable.tsx`

### Symptom & Stack Trace
```text
React Error: Rendered more hooks than during the previous render.
src/components/tables/DataTable.tsx (111:12) @ DataTable
  109 | const currentItems = data.slice(startIndex, startIndex + pageSize);
  110 |
> 111 | useEffect(() => {
  112 |   if (currentPage > totalPages && totalPages > 0) {
```

### AI Diagnostic Analysis
The `useEffect` hook on line 111 was placed **below** conditional early returns (`if (isLoading) return <LoadingState />;` and `if (!data) return null;`). When network data state toggled between loading and success, React evaluated a different number of hooks, violating the Rules of Hooks.

### Resolution & Code Fix
Moved all `useState` and `useEffect` calls to the top level of the component, above any conditional return statements.

---

## Challenge 2: Duplicate React Key Warning in `DataTable.tsx`

### Symptom & Stack Trace
```text
Console Error: Encountered two children with the same key, `COM-0025`.
Keys should be unique so that components maintain their identity across updates.
src/components/tables/DataTable.tsx (128:15)
```

### AI Diagnostic Analysis
The `keyExtractor` function derived row keys from item identifiers. Duplicate record entries in mock response datasets returned identical key strings (`COM-0025`), breaking React's list reconciliation algorithm.

### Resolution & Code Fix
Updated `keyExtractor` to append item index: `key={`${keyExtractor(item)}-${idx}`}`.

---

## Challenge 3: Table Height Layout Shift During Pagination

### Symptom
When navigating to the last page of a dataset containing fewer items (e.g. 2 items instead of 5 items per page), the table height collapsed, causing the pagination controls to jump upwards jarringly.

### AI Diagnostic Analysis
The `<table>` container relied on dynamic intrinsic content height. Variable row counts caused vertical layout shifts.

### Resolution & Code Fix
Enforced fixed row height (`62px`), header height (`44px`), outer card height (`402px`), and rendered column-mapped skeleton/blank placeholder rows when `currentItems.length < pageSize`.

---

## Challenge 4: Dark Mode Text Contrast & Unrecognized Class Artifacts

### Symptom
In Dark Mode, card backgrounds for Number Series Allocation (`94400XXXX`) rendered as bright white boxes, and text appeared unreadable.

### AI Diagnostic Analysis
The element used an invalid Tailwind utility class `dark:bg-slate-850`. Standard Tailwind CSS palette stops at `800`, `900`, `950`. Tailwind ignored `slate-850`, causing the browser to fall back to the light mode background `bg-slate-50/80`.

### Resolution & Code Fix
Replaced hardcoded `slate-850` and `slate-50` classes with semantic theme design tokens: `bg-surface-alt` (`#16202C` in dark mode), `border-border` (`#1E2A38` in dark mode), and `text-foreground`.
