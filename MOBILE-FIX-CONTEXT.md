# Mobile Fix Context — Carry Into Next Session

## Current State (2026-02-15)
Repo: `~/howIndiaeatsproject/` — deployed at howindiaeats.soumyosinha.com
Stack: React 19 + D3.js 7.9 + TypeScript + Vite, deployed on Vercel

---

## What Was Done (This Session)

### Architectural Change: Removed Sticky Scrollytelling on Mobile
The original desktop layout uses `position: sticky` so the visualization stays fixed while text cards scroll over it. On mobile, this caused text to completely cover/overlap all visualizations — the #1 user complaint.

**Fix applied:** In `src/styles/searching-for-food.css` mobile overrides (`@media (max-width: 768px)`):
- `.scrolly-sticky` changed from `position: sticky` → `position: relative`
- Layout changed from grid overlay → flex column (viz on top, text below)
- Removed z-index layering that caused overlap

### Other Changes Made
1. **Chatbot FAB hidden on mobile** — `.chatbot-fab { display: none }` (API key not configured)
2. **DivergingBarChart (Ch5)** — Shows both search AND consumption ranks simultaneously on mobile (no progressive reveal since no sticky)
3. **Photo strip** — First item hidden on mobile, grid changed to `1fr 1fr`
4. **Fullbleed images** — `max-height: 50vh; object-fit: cover; object-position: center top`
5. **Label overflow fixes** — Clamped rank labels in DivergingBarChart and festival annotations in SeasonalLineChart
6. **SVG initial dimensions** — Changed from 600x500 → 0x0 with zero-dimension guards in all 6 viz files
7. **`overflow-x: clip`** on `.food-guide` (instead of `hidden`, which breaks sticky on desktop)

### Files Modified
- `src/styles/searching-for-food.css` — Complete rewrite of mobile `@media (max-width: 768px)` section
- `src/components/searchingForFood/hooks/useScrollytelling.ts` — Simplified rootMargin to `-35% 0px -35% 0px`
- `src/components/searchingForFood/hooks/useResponsiveSvg.ts` — Initial dims 0x0, mobile height `width * 0.85, max 400`
- `src/components/searchingForFood/visualizations/DivergingBarChart.tsx` — `mobileShowAll` flag, label clamping

---

## WHAT IS STILL BROKEN — User Feedback (Latest)

### 1. Thali Plate Animation (Chapter 1) Does Not Work on Mobile
- The thali animation (katoris appearing in steps) does NOT trigger when scrolling down to it
- User has to scroll PAST it, then scroll BACK UP to see the animation
- **Root cause:** The scrollytelling step detection (IntersectionObserver in `useScrollytelling.ts`) is not triggering properly on mobile with the new non-sticky layout. Since viz is now at the top and text is below, by the time you scroll to the text steps that trigger animation changes, the viz is already scrolled off-screen above.
- **This is the fundamental problem with removing sticky:** On desktop, sticky keeps the viz visible while steps scroll by. On mobile with `position: relative`, the viz scrolls away before the steps are reached.
- **NEEDS A DIFFERENT APPROACH:** Perhaps on mobile, show the viz in a simplified static state (all data at once) OR use a different scroll trigger mechanism OR keep a smaller sticky viz.

### 2. All Animations Broken Except First Step
- Same root cause as above. The step-based animations (step 0, 1, 2, 3) in ALL chapters rely on the viz being visible while the user scrolls through text steps. With non-sticky, the viz is already off-screen when later steps trigger.
- Affects: ThaliChart (katori entrance), GeoStateMap (peel-back), RadialWeekChart (dish highlighting), SeasonalLineChart (festival highlighting), DivergingBarChart (progressive reveal), SmallMultiples (pandemic comparison)

### 3. Modal Popups Don't Close on Scroll
- When clicking a dish (e.g., a katori on the thali), a `DishPopupCard` modal opens
- On mobile, user expects the modal to auto-close when scrolling away
- Currently requires pressing the X button — bad UX on small screens
- **Fix needed:** Add scroll listener or IntersectionObserver to auto-dismiss the modal when the user scrolls away. File: `src/components/searchingForFood/DishPopupCard.tsx`

### 4. Chatbot FAB Hidden But API Key Still Not Configured
- FAB is hidden via CSS, but the chatbot feature itself needs a Gemini API key
- Not urgent — hidden on mobile, low priority

---

## KEY ARCHITECTURAL DECISION NEEDED

The core tension: **Sticky scrollytelling is the RIGHT pattern for progressive data reveal, but it causes text-over-viz overlap on mobile.**

### Options to Consider:

**Option A: Mobile-optimized sticky (RECOMMENDED)**
- Keep `position: sticky` on mobile BUT with a smaller viz height (40-45vh)
- Make text cards semi-transparent or minimal (just a colored bar with title)
- Viz stays visible in top half, text scrolls in bottom half
- This preserves all step-based animations

**Option B: Show all data at once on mobile**
- Keep current `position: relative` (no sticky)
- But modify ALL 6 visualizations to show their FINAL state on mobile (all steps revealed)
- No progressive animation — just the complete picture
- Simpler but loses the storytelling aspect

**Option C: Accordion/tab pattern on mobile**
- Each chapter becomes an expandable section
- Viz + all text steps visible at once within the expanded section
- Most different from desktop but potentially best mobile UX

**Option D: Hybrid — tiny sticky with scroll-snap**
- Small sticky viz (35vh) at top
- Text steps use scroll-snap for card-like feel
- Each card triggers the corresponding animation step

---

## FILE STRUCTURE (Key Files)

```
src/
  SearchingForFoodGuide.tsx          — Main page, all chapters, fullbleed images
  components/searchingForFood/
    ScrollySection.tsx               — Scrollytelling layout wrapper (grid on desktop, flex on mobile)
    DishPopupCard.tsx                — Modal for dish details (needs auto-close on scroll)
    RichTooltip.tsx                  — Hover tooltip with dish image + sparkline
    FoodChatbot.tsx                  — AI chatbot (hidden on mobile, needs API key)
    hooks/
      useScrollytelling.ts           — IntersectionObserver for step detection
      useResponsiveSvg.ts            — ResizeObserver for responsive SVG dimensions
    visualizations/
      ThaliChart.tsx                 — Ch1: Thali plate with katoris (step-based entrance)
      GeoStateMap.tsx                — Ch2: India map with state dish colors (peel-back)
      RadialWeekChart.tsx            — Ch3: Radial weekly search patterns
      SeasonalLineChart.tsx          — Ch4: Monthly seasonal trends
      DivergingBarChart.tsx          — Ch5: Search vs consumption rank comparison
      SmallMultiples.tsx             — Ch6: Pre/post pandemic comparison
  data/searchingForFood/
    dishes.ts                        — Dish metadata (name, color, image, hindi name, etc.)
    types.ts                         — TypeScript interfaces
    index.ts                         — Data exports
  styles/
    searching-for-food.css           — All styles including mobile overrides at bottom
```

## PREVIOUS PLAN (from plan mode)
There's a detailed upgrade plan at `~/.claude/plans/humming-mixing-pie.md` covering:
1. Thali visualization (done)
2. Map peel-back (done)
3. Rich tooltips (done)
4. AI chatbot (done but hidden)
5. Data enrichment (done)
6. Micro-interactions (partially done)

The current priority is NOT new features — it's fixing the mobile experience to be usable.
