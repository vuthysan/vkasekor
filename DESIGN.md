---
name: VKasekor
description: Agricultural operations dashboard for farm batch management in Cambodia. Bilingual operator dashboard + Khmer-first farmer portal.
stack:
  framework: Next.js 16 (App Router, React 19)
  styling: Tailwind CSS v4 (@theme)
  motion: motion (Framer Motion)
  components: shadcn/ui (Radix primitives + cva + cn)
  table: TanStack Table v8
  icons: Lucide
fonts:
  display: "Playfair Display, Georgia, serif"
  body: "Inter, system-ui, sans-serif"
  khmer: "Kantumruy Pro, system-ui, sans-serif"
  fallback-stack:
    operator-display: "var(--font-playfair), var(--font-kantumruy)"
    operator-ui: "var(--font-inter), var(--font-kantumruy)"
    farmer-portal: "var(--font-kantumruy)"
colors:
  canopy-deep: "#0f3d1f"
  shadow-canopy: "#1a4a2a"
  field-green: "#16a34a"
  sprout: "#22c55e"
  sprout-light: "#86efac"
  rice-parchment: "#fafaf8"
  surface: "#f0f0ec"
  dried-grass: "#e8e5e0"
  field-stone: "#e5e5e0"
  sage-mist: "#a3b8aa"
  text-strong: "#111111"
  text-primary: "#333333"
  text-secondary: "#666666"
  text-dim: "#999999"
  text-placeholder: "#cccccc"
  row-hover: "#f7f6f3"
  status-healthy-bg: "#f0fdf4"
  status-healthy: "#16a34a"
  status-healthy-border: "#bbf7d0"
  status-risk-bg: "#fef2f2"
  status-risk: "#dc2626"
  status-risk-border: "#fecaca"
  status-harvest-bg: "#fffbeb"
  status-harvest: "#ca8a04"
  status-harvest-border: "#fde68a"
  farm-overdue-bg: "#fff5f5"
  farm-today-bg: "#fffdf7"
  farm-upcoming-bg: "#ede8df"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  page-title:
    fontFamily: "Playfair Display"
    fontSize: "1rem → 1.125rem (sm)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Playfair Display"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  stat-value:
    fontFamily: "Inter (tabular-nums)"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Inter"
    fontSize: "0.6875rem (11px)"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Inter"
    fontSize: "0.6875rem (11px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
    textTransform: uppercase
  badge:
    fontFamily: "Inter"
    fontSize: "0.6875rem (11px)"
    fontWeight: 600
  farmer-task-title:
    fontFamily: "Kantumruy Pro"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.75
  farmer-task-body:
    fontFamily: "Kantumruy Pro"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 2.05
radius:
  philosophy: "Single-knob system. The whole rounded-* scale derives from --radius (currently 22px). Change one variable to retune the entire system."
  knob: "--radius: 22px"
  scale:
    xs:  "calc(--radius - 10px) = 12px"
    sm:  "calc(--radius - 8px)  = 14px"
    md:  "calc(--radius - 6px)  = 16px   ← buttons, inputs, secondary controls"
    lg:  "calc(--radius - 4px)  = 18px"
    xl:  "var(--radius)         = 22px   ← cards, alerts, tables, sidebar nav items"
    "2xl": "calc(--radius + 6px) = 28px   ← farmer task cards, batch chips, mobile sheets"
    "3xl": "calc(--radius + 14px) = 36px"
    full: "9999px (status badges, avatars)"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
elevation:
  lift: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)"
  inset-ring: "0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)"
  side-panel-desktop: "-12px 0 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)"
  side-panel-mobile: "0 -8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
motion:
  micro: "100ms ease-out  ← nav icon/text colour shifts"
  control: "180ms ease-out ← button background hover"
  layout: "220ms cubic-bezier(0,0,0.2,1) ← task card mount, batch chip"
  panel: "240ms cubic-bezier(0,0,0.2,1) ← register side-panel, sheet"
  backdrop: "180ms ease ← modal/panel scrim fade"
  respect: "prefers-reduced-motion: reduce"
components:
  button-primary:
    backgroundColor: "{colors.canopy-deep}"
    textColor: "{colors.rice-parchment}"
    hoverBackground: "#165a2d"
    radius: "{radius.scale.md}"
    padding: "10px 16px"
    typography: "{typography.title}"
  nav-item-active:
    backgroundColor: "{colors.field-green}"
    textColor: "#ffffff"
    radius: "{radius.scale.xl}"
    padding: "10px 16px"
  nav-item-default:
    backgroundColor: "transparent"
    textColor: "{colors.sage-mist}"
    iconColor: "#7f9988"
    radius: "{radius.scale.xl}"
  nav-item-hover:
    backgroundColor: "{colors.shadow-canopy}"
    textColor: "#ffffff"
    iconColor: "#ffffff"
  input-default:
    backgroundColor: "#ffffff"
    border: "1.5px solid {colors.field-stone}"
    textColor: "{colors.text-primary}"
    placeholderColor: "{colors.text-placeholder}"
    radius: "{radius.scale.md}"
    padding: "10px 12px"
    hoverBorder: "rgba(22,163,74,0.55)"
    focusBorder: "{colors.field-green}"
  status-healthy:
    backgroundColor: "{colors.status-healthy-bg}"
    textColor: "{colors.status-healthy}"
    border: "1px solid {colors.status-healthy-border}"
    radius: "{radius.scale.full}"
    padding: "2px 10px"
  status-at-risk:
    backgroundColor: "{colors.status-risk-bg}"
    textColor: "{colors.status-risk}"
    border: "1px solid {colors.status-risk-border}"
    radius: "{radius.scale.full}"
    padding: "2px 10px"
  status-harvesting:
    backgroundColor: "{colors.status-harvest-bg}"
    textColor: "{colors.status-harvest}"
    border: "1px solid {colors.status-harvest-border}"
    radius: "{radius.scale.full}"
    padding: "2px 10px"
  stat-card:
    backgroundColor: "#ffffff"
    radius: "{radius.scale.xl}"
    padding: "16px 20px"
    elevation: "{elevation.inset-ring}"
    iconBackground: "{colors.status-healthy-bg}"
    iconColor: "{colors.field-green}"
  data-table:
    wrapperRadius: "{radius.scale.xl}"
    wrapperElevation: "{elevation.inset-ring}"
    headerBackground: "{colors.rice-parchment}"
    rowBackground: "#ffffff"
    rowHover: "{colors.row-hover}"
    rowDivider: "1px solid {colors.field-stone}"
---

# Design System: VKasekor

## 1. Overview

**Creative North Star: "The Agronomist's Notebook"**

VKasekor's visual language is the agronomist's field notebook: dense, legible, trusted. The interface is a working document, not a showpiece. Every element earns its space the way a measured entry earns its row — no decoration that isn't load-bearing, no whitespace that doesn't serve hierarchy. The operator using this tool knows what they're looking at; the design affirms that competence rather than teaching them.

The color strategy is committed: a deep forest-green sidebar occupies the navigation surface at all times, anchoring the space with unmistakable brand weight. The content surface is warm parchment — not white, not a cool gray, but the specific off-white of sun-dried field paper. Text is structured by weight contrast, not color. Status signals (Healthy / At Risk / Harvesting) are the only place where color carries semantic load; everywhere else it recedes.

Two surfaces, one system. The **operator dashboard** (`/overview`, `/assets`, `/schedules`) is dense and information-first, in the spirit above. The **farmer portal** (`/farm`) is a Khmer-first dialect of the same system: warmer surfaces, larger type for outdoor mobile use, emoji as batch identity tokens, tactile press feedback. Both share the palette, the radius system, and the One Signal Rule — they diverge only where the audience's working conditions demand it.

This system explicitly rejects consumer agri-app aesthetics: cartoon farm illustrations, gamified progress bars, kawaii mascots. It also rejects generic SaaS dashboard templates with blue/purple palettes, gradient-text stats, and hero-metric layouts.

**Key Characteristics:**
- Deep canopy green anchors navigation; warm parchment grounds the content area.
- Playfair Display for display and page titles; Inter for all UI text and numerics; Kantumruy Pro for Khmer.
- Status indicators are the only semantic color signal; all other color is structural.
- A single `--radius` knob drives the entire roundness scale — change one variable to retune the system.
- Inset Ring is the dashboard's only ambient depth. Lift is reserved for surfaces literally above the application (modals, login card).

## 2. Colors: The Field Palette

A committed primary paired with restrained neutrals. The sidebar IS the brand; the content area is the field record.

### Primary
- **Deep Canopy** (`#0f3d1f`): Sidebar background and primary button fill. Dense, shaded, like old-growth canopy. Used at full saturation only in structural contexts — navigation shell, action buttons. Never used decoratively in the content area.
- **Field Green** (`#16a34a`): The active state color across navigation, form focus rings, primary positive trends, and Healthy status text. Reads clearly against both the canopy background and the parchment surface.
- **Shadow Canopy** (`#1a4a2a`): Hover state for navigation items inside the sidebar. One lightness step above Deep Canopy. Never used as a standalone fill outside the sidebar.

### Secondary
- **Sprout** (`#22c55e`): Brand-mark fill (the 36×36px logo square) and the dashboard avatar/profile chip. The brand's loudest green, used only where identity must read at small scale.
- **Sprout Light** (`#86efac`): Badge text on dark backgrounds. Only readable against Deep Canopy or Shadow Canopy; never on parchment.

### Neutrals
- **Rice Parchment** (`#fafaf8`): Page background and table-header surface. Warm-shifted near-white — the working surface.
- **Surface** (`#f0f0ec`): Reserved for elevated content panels that need separation from the page without a shadow.
- **Dried Grass** (`#e8e5e0`): Auth/modal contrast surfaces, and the upcoming-task chip in the farmer portal.
- **Field Stone** (`#e5e5e0`): Default border for inputs, cards, table dividers, mobile drag indicators.
- **Sage Mist** (`#a3b8aa`): Inactive navigation text. Green-shifted neutral that harmonizes with the sidebar without competing with active items. (Inactive nav icons are slightly cooler at `#7f9988`.)

### Text
- **Text Strong** (`#111111`): Headings, stat values, primary high-emphasis numbers.
- **Text Primary** (`#333333`): Body text, table cells, input values.
- **Text Secondary** (`#666666`): Labels, secondary metadata, meta beneath stats.
- **Text Dim** (`#999999`): Timestamps, empty-state copy, breadcrumbs.
- **Text Placeholder** (`#cccccc`): Input placeholders.

### Status Palette

Status is the system's most critical signal. Three states, instantly readable.

| State | Background | Text (operator) | Text (farmer) | Border |
|---|---|---|---|---|
| **Healthy** | `#f0fdf4` | `#16a34a` | `#15803d` | `#bbf7d0` |
| **At Risk** | `#fef2f2` (operator) / `#fff5f5` (farmer) | `#dc2626` | `#dc2626` | `#fecaca` |
| **Harvesting** | `#fffbeb` | `#ca8a04` | `#b45309` | `#fde68a` |

The farmer portal uses slightly darker text variants for higher contrast against tinted backgrounds in bright outdoor conditions. The structure (background + text + border triplet) is identical.

### Farmer Portal Surfaces
- **Overdue Task** (`#fff5f5`): Soft red wash with `#fecaca` border.
- **Today's Task** (`#fffdf7`): Cream wash with `rgba(0,0,0,0.07)` border.
- **Upcoming Task** (`#ede8df`): Dried-grass surface for the "ខាងមុខ" (upcoming) state.

### The One Signal Rule

Color carries semantic meaning only in status indicators and the active navigation state. Using green as decoration elsewhere — hover glows, success banners that aren't status, tinted backgrounds in non-status elements — dilutes the signal. Two narrow exceptions:
1. The trend pill on stat cards uses the Healthy/At Risk pair to communicate direction (positive/negative).
2. The stat-card icon container sits on the Healthy background tint as a quiet brand-reinforcement gesture, not a status claim.

If something needs emphasis beyond status, use weight or size — not color.

## 3. Typography

**Display (Latin):** Playfair Display (Georgia, serif fallback)
**Body / UI (Latin):** Inter (system-ui, sans-serif fallback)
**Khmer (all weights):** Kantumruy Pro

### Bilingual Font Stack

The interface is bilingual — Khmer is a first-class language, not an afterthought. Latin fonts are paired with Kantumruy Pro as a second fallback so that mixed-script strings (a Khmer label next to a Latin number) render coherently with no font-jump.

```css
/* Operator dashboard — display headings */
font-family: var(--font-playfair), var(--font-kantumruy);

/* Operator dashboard — UI text and labels */
font-family: var(--font-inter), var(--font-kantumruy);

/* Farmer portal — all text */
font-family: var(--font-kantumruy);
```

Playfair Display has no Khmer coverage. When a heading contains Khmer, Kantumruy Pro takes over for the Khmer glyphs while Playfair handles any Latin in the same string. This produces the characteristic editorial-Khmer pairing across the operator UI.

### Character

Playfair brings editorial authority to headings — the weight you'd find on a government agricultural publication from the 1970s, rendered at digital resolution. Inter is a neutral grotesque optimized for screen legibility, with precise letterforms that hold up well in dense data tables and small labels. Kantumruy Pro carries the same editorial register into Khmer, keeping the visual voice consistent across scripts.

### Hierarchy

| Level | Family | Weight | Size | Tracking | Use |
|---|---|---|---|---|---|
| Display | Playfair | 900 | clamp(2rem, 4vw, 3rem) | -0.02em | Login wordmark only |
| Page title | Playfair | 700 | 1rem → 1.125rem (sm) | -0.01em | Dashboard header `h1` |
| Headline | Playfair | 700 | 1.5rem | -0.01em | Section titles, modal headers |
| Stat value | Inter (tabular-nums) | 700 | 1.625rem | -0.01em | KPI numbers in stat cards |
| Title | Inter | 600 | 0.875rem | — | Component headings, table actions |
| Body | Inter | 400 | 0.875rem | — | Table rows, paragraph copy |
| Meta | Inter | 400 | 0.6875rem (11px) | — | Subtitles, helper text |
| Label | Inter | 600 | 0.6875rem (11px) | 0.08em UPPERCASE | Form labels, table headers |
| Badge | Inter | 600 | 0.6875rem (11px) | — | Status pills |
| Farmer task title | Kantumruy | 600 | 17px | — | Task cards in `/farm` |
| Farmer task body | Kantumruy | 400 | 13.5px | — | Task instructions |

### The Weight Contrast Rule

There is no middle ground between Playfair and Inter, and no middle ground between 400 and 600 within Inter. If something matters, it is page-title-level (Playfair 700) or it is body/title (Inter 600/400). Do not introduce a 500-weight "medium" title to avoid making a hierarchy decision.

**Stat values are the documented exception to "Playfair = significant."** They are rendered in Inter 700 with `tabular-nums` because the dashboard's job is to compare numbers across rows — Playfair's editorial proportions hurt scanning and align poorly in a 4-column grid.

## 4. Border Radius — The Single-Knob System

Roundness is a brand decision, and the system reflects that: every `rounded-*` utility derives from one CSS variable, `--radius`. Change `--radius` and the entire scale re-renders proportionally — useful for runtime theming, A/B tests, or audience-level dialects (the farmer portal could ship sharper or softer than the operator dashboard with a single token swap, no rebuild).

```css
:root {
  --radius: 22px; /* Try: 4 (sharp) · 8 (subtle) · 14 (current-feeling) · 22 (now) · 28 (pillowy) */
}

@theme {
  --radius-xs:  calc(var(--radius) - 10px);  /* 12px */
  --radius-sm:  calc(var(--radius) - 8px);   /* 14px */
  --radius-md:  calc(var(--radius) - 6px);   /* 16px  ← buttons, inputs */
  --radius-lg:  calc(var(--radius) - 4px);   /* 18px */
  --radius-xl:  var(--radius);               /* 22px  ← cards, sidebar nav, table wrapper */
  --radius-2xl: calc(var(--radius) + 6px);   /* 28px  ← farmer task cards, batch chips, mobile sheets */
  --radius-3xl: calc(var(--radius) + 14px);  /* 36px */
}
```

### Recommended use
- **`rounded-md`** — Buttons, inputs, secondary chips, dense controls.
- **`rounded-lg`** — Hamburger/icon-button hit targets, sidebar user-card.
- **`rounded-xl`** — Cards, alerts, sidebar nav items, data-table outer wrapper, modal sheets.
- **`rounded-2xl`** — Farmer task cards, batch status chips, mobile bottom-sheet.
- **`rounded-full`** — Status badges, avatars, notification dot, divider chips.

**The Knob Discipline.** Don't author one-off radii in component styles. If a component needs roundness that doesn't exist on the scale, the scale is wrong — adjust `--radius` or accept the nearest existing token. The system's coherence depends on the whole scale moving together.

## 5. Elevation

Structural depth, not decorative stacking. The dashboard is the floor. Inset Ring is ambient — barely-perceptible separation for content containers. Lift is reserved for surfaces that are literally above the application.

### Shadow Vocabulary

- **Lift** — `0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)`
  Login card and any future modal. Signals "this surface is above the application." Reserved exclusively for focus-demand contexts.

- **Inset Ring** — `0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)`
  Stat cards, data-table wrapper. Nearly just a 1px ring with a whisper of softness — separates the container from the parchment without lifting it. Used as ambient depth for any rectangular content vessel.

- **Side-panel desktop** — `-12px 0 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)`
  Right-anchored register/edit panels on desktop.

- **Side-panel mobile** — `0 -8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
  Bottom-sheet variant on mobile (≤767px).

- **None** — Navigation, header, form fields, table rows, badges. Flat on the surface.

### The Floor Rule

The content area has two depth tiers and only two: the parchment floor (no shadow) and content vessels (Inset Ring). Anything that needs to read as "above the application" — modals, login card, slide-in panels — uses Lift or a side-panel shadow. If you're tempted to invent a third tier (a soft glow, a brand-coloured drop shadow, a subtle blur), the answer is almost always to use weight, border, or background tint instead.

## 6. Motion

Transitions are precise and brief; nothing draws attention to itself. The system uses [`motion`](https://motion.dev/) (Framer Motion) for layout/presence animations and Tailwind utilities for property transitions.

| Tier | Duration | Easing | Used for |
|---|---|---|---|
| Micro | 100ms | ease-out | Sidebar nav text/icon colour shifts |
| Control | 180ms | ease-out | Button background hover, border colour, backdrop fade |
| Layout | 220ms | cubic-bezier(0,0,0.2,1) | Task card mount/exit, batch chip enter |
| Panel | 240ms | cubic-bezier(0,0,0.2,1) | Register side-panel slide, mobile sheet slide |

### Rules
- **No scale transforms on hover.** Hover changes background or border colour, never size or position.
- **One tactile exception:** primary action buttons in the farmer portal use `active:scale-[0.98]` for finger-press feedback on mobile.
- **No infinite animations** outside loading indicators.
- **Respect `prefers-reduced-motion`.** The Motion library honors this automatically; for CSS transitions, gate non-essential animations behind a media query.
- **Ease-out for entering, ease for exits/backdrops.** Linear easing is forbidden.

## 7. Components

### Buttons

Precise and minimal. Background or text colour shifts on hover; no scale, no glow.

- **Shape:** `rounded-md` (16px). Not pill, not sharp.
- **Primary:** Deep Canopy background, Rice Parchment text, Inter 600 0.875rem, padding 10px 16px. Hover: `#165a2d`. Focus: 2px Field Green outline at 2px offset.
- **Ghost (cancel):** No background, Text Secondary, Inter 500. Hover: Text Strong. Used only as the secondary action paired with a primary CTA — never standalone.
- **Outline variants** belong only on dark backgrounds (inside the sidebar). No outline buttons on parchment.

### Inputs

- **Shape:** `rounded-md` (16px), white background, **1.5px** Field Stone border. Inter 0.875rem, padding 10px 12px.
- **Label:** uppercase, 11px, 600 weight, 0.08em tracking, Text Secondary.
- **Hover:** border `rgba(22,163,74,0.55)` — Field Green at 60% opacity.
- **Focus:** border solid Field Green. No glow, no ring — one clean colour change.
- **Placeholder:** `#cccccc` (placeholder Text, lighter than Text Dim).
- **Error:** field-level message in `#dc2626` 0.75rem below the input. Border does not change colour on error; the message carries the signal.

### Sidebar (Navigation)

The sidebar is a committed green surface — rules inside it invert the content-area defaults.

- **Shell:** `#0f3d1f` background, `w-64` (256px), full height, fixed on desktop, off-canvas with a 25%-opacity scrim on mobile.
- **Brand mark:** 36×36px Sprout square (`rounded-xl`) with white house-icon. Wordmark in Playfair black, two Khmer lines at 17px. Tag chip "ផតថល" in Sprout-tinted dark surface.
- **Nav item default:** transparent, Sage Mist text, `#7f9988` icon, `rounded-xl` (22px), Inter 500 0.875rem, padding 10px 16px, gap 12px.
- **Nav item hover:** Shadow Canopy (`#1a4a2a`) background, white text and icon, 100ms ease-out.
- **Nav item active:** Field Green (`#16a34a`) background, white text and icon. The filled background IS the indicator.
- **User footer:** white-tinted card with 4% white background, 6% border, Field Green avatar circle.

**The No-Stripe Rule.** Active navigation state is expressed through a filled background, never a left- or right-side border stripe. A side-stripe border on a nav item is prohibited.

### Header

- **Shell:** sticky, `h-14` (mobile) → `h-16` (sm+), Rice Parchment background, 1px Field Stone bottom border.
- **Title:** Playfair 700 1rem → 1.125rem(sm), Text Strong.
- **Subtitle:** Inter 11px, Text Dim. Hidden below `sm`.
- **Date pill:** Inter 500 12px, Text Dim, hidden below `md`.
- **Bell button:** 36×36 circle, 1px Field Stone border. Notification dot is a 16×16 `#dc2626` circle with a 2px Rice Parchment ring.
- **Avatar button:** 36×36 Field Green circle, white initials, Inter 700 13px. Hover: Deep Canopy hover variant `#165a2d`.

### Status Badges

The highest-information-density component. Must read at 11px in a table row.

- **Shape:** `rounded-full` (full pill). Distinguishes status from other labels.
- **Padding:** 2px 10px. Inter 600, 11px.
- **Three triplets** (background + text + 1px border) as defined in §2 — Healthy, At Risk, Harvesting. Introduce new states only with a new triplet.
- The 1px coloured border carries the signal at low background-opacity, where tinted fills can blur into the surface at small sizes.

### Stat Cards

Four-up KPI grid (2 columns mobile, 4 columns sm+). Compact cards on the parchment surface, separated by 16px gaps.

- **Shape:** white background, `rounded-xl` (22px), Inset Ring elevation.
- **Padding:** 16px 20px (`px-5 py-4`).
- **Icon container:** 32×32 `rounded-lg`, Healthy-bg fill (`#f0fdf4`), Field Green Lucide icon at `strokeWidth={1.75}`.
- **Trend pill** (top-right): Inter 600 10px, `rounded-full px-2 py-0.75`. Positive uses Healthy-bg/Field Green; negative uses At Risk-bg/`#dc2626`. Includes a TrendingUp/TrendingDown Lucide glyph at 10×10.
- **Value:** Inter 700 1.625rem, `tabular-nums`, Text Strong, `leading-none`.
- **Label:** Inter 11px, Text Secondary, mt-1.5.
- **Trend caption** (optional): Inter 10px, `#aaa`, mt-1.

The card-based stat grid is a deliberate revision from a "row of cells" treatment: in dense tables alongside the grid, the Inset Ring vessel reads more clearly as a distinct semantic block, and the icon establishes scanability for users who triage by glyph before reading.

### Data Table

The primary information surface in `/assets`.

- **Wrapper:** `rounded-xl` (22px), Inset Ring elevation, overflow hidden.
- **Header row:** Rice Parchment background, 1px Field Stone bottom border. Cells: 11px Inter 600 uppercase 0.08em tracking, Text Secondary. Sortable headers show a 12×12 Lucide `ArrowUpDown` at 50% opacity, hover Text Primary.
- **Body row:** white background, Inter 0.875rem, Text Primary. 24px horizontal padding, 16px vertical (`px-6 py-4`). 1px Field Stone divider.
- **Row hover:** `#f7f6f3` background, 100ms ease-out. No border change.
- **Status column:** Status Badge component, left-aligned.
- **Pagination footer:** white background, 1px Field Stone top border, 56px height. Counter in Text Dim 0.75rem ("1–10 នៃ 24"). Page-step buttons are 28×28 squares with Field Stone border, Text Secondary chevron, hover Sage Mist border.

### Side Panel (Register / Edit)

Right-anchored 400px panel on desktop; bottom sheet on mobile (≤767px). Animated with Motion.

- **Backdrop:** black 20%, 180ms fade.
- **Panel surface:** white, full-bleed on its axis, side-panel-desktop or side-panel-mobile shadow.
- **Mobile drag indicator:** 40×4 Field Stone pill at the top, centred.
- **Header:** Playfair 700 1rem title, Inter 12px Text Dim subtitle, X close button (8×8, hover surface tint).
- **Form fields:** spaced 20px apart (`gap-5`), use Input rules from above.
- **Footer:** primary submit button, ghost cancel button stacked. Submit shows `disabled:opacity-60` and Khmer pending text.

### Modal / Login Card

The only place Lift shadow is used in the application. White card, `rounded-xl`, 24-32px internal padding, centered with a Dried Grass page background for soft contrast.

## 8. Farmer Portal Dialect (`/farm`)

The farmer portal is a Khmer-first, mobile-first dialect of the system, built for Cambodian farmers operating outdoors. It shares the palette, the radius scale, and every rule above — except where outdoor-mobile use demands divergence.

### Audience constraints
- Mid-day sunlight; high ambient brightness.
- Variable literacy and English exposure.
- One-handed mobile use, often in a workflow already begun.

### Divergences from the operator dashboard
- **Type scale ramps up.** Body is 13.5px (vs 11–14 in operator) and titles are 17px Kantumruy 600 (vs 14 in operator). Line-heights are looser (1.75–2.05) for legibility under glare.
- **Surfaces warm up.** Task cards use cream washes — `#fff5f5` for overdue, `#fffdf7` for today, `#ede8df` (Dried Grass) for upcoming. Status communicates through surface tint, not just badges.
- **Radius enlarges** to `rounded-2xl` (28px) on task cards and batch chips. Larger fingers, friendlier silhouettes.
- **Emoji are batch identity, not decoration.** Each batch carries an emoji (🐔 mាន់, 🐖 ជ្រូក, 🥒 ត្រសក់) at 24px, used as a recognition token for low-literacy users. This is the documented exception to the "no emoji icons" rule. Emoji never replaces a Lucide icon for system actions (settings, navigation, alerts).
- **Tactile feedback.** The primary "បានធ្វើ" (Done) button uses `active:scale-[0.98]` on press — the only place scale transforms are permitted in the system.
- **Khmer-only font stack.** `font-family: var(--font-kantumruy)`. No Latin-first fallback.

### Components specific to the portal
- **BatchStatusBar** — wraps row of `rounded-2xl` chips, each with emoji, Khmer name, status label, and day count. Background is the status-tinted surface; border matches.
- **TaskCard** — `rounded-2xl`, surface tinted by `dueType`, mounts with a Motion layout transition (220ms ease-out, opacity 0→1, y 8→0). Three foot-of-card states: `Done` (Healthy chip), `Upcoming` (Dried Grass chip with "ខាងមុខ"), `Action` (Deep Canopy primary button with check icon).

## 9. Stack & Tokens

### Libraries
- **Next.js 16** App Router with React 19. (See `dash/AGENTS.md` — this is a breaking Next.js release; consult `node_modules/next/dist/docs/` before relying on conventions from training data.)
- **Tailwind CSS v4** via `@theme` directive. All design tokens are declared as CSS custom properties in `app/globals.css` and exposed as Tailwind utilities automatically.
- **motion** (Framer Motion) for layout/presence animations.
- **shadcn/ui** for the component layer. Components live in `components/ui/` (Button, Card, Badge, Input, Label, Skeleton, StatusBadge), built from Radix primitives (`@radix-ui/react-slot`, `@radix-ui/react-label`) with `class-variance-authority` for variants and a `cn(clsx, tailwind-merge)` helper in `lib/utils.ts`. Owned source — extend in place rather than wrapping a third-party API.
- **TanStack Table v8** for the operator data table.
- **Lucide** for all system icons. `strokeWidth={1.75}` in the dashboard chrome, `strokeWidth={2.5}` for emphatic glyphs (Done check). 18×18 default, 14×14 in dense rows.
- **Kantumruy Pro** for Khmer (Google Fonts), loaded via `next/font/google` with `subsets: ["khmer"]`.

### CSS variable reference

Defined in `dash/app/globals.css`:

```css
@theme {
  /* Brand */
  --color-canopy-deep:    #0f3d1f;
  --color-shadow-canopy:  #1a4a2a;
  --color-field-green:    #16a34a;
  --color-sprout:         #22c55e;
  --color-sprout-light:   #86efac;

  /* Surface */
  --color-rice-parchment: #fafaf8;
  --color-dried-grass:    #e8e5e0;
  --color-field-stone:    #e5e5e0;
  --color-sage-mist:      #a3b8aa;

  /* Radius scale derived from --radius */
  --radius-xs:  calc(var(--radius) - 10px);
  --radius-sm:  calc(var(--radius) - 8px);
  --radius-md:  calc(var(--radius) - 6px);
  --radius-lg:  calc(var(--radius) - 4px);
  --radius-xl:  var(--radius);
  --radius-2xl: calc(var(--radius) + 6px);
  --radius-3xl: calc(var(--radius) + 14px);
}

:root {
  --radius:             22px;   /* the single knob */
  --background:         #fafaf8;
  --surface:            #f0f0ec;
  --foreground:         #111111;
  --muted:              #666666;
  --field-foreground:   #111111;
  --snow:               #fafaf8;
  --border:             #e5e5e0;
  --success:            #16a34a;
  --success-foreground: #ffffff;
  --danger:             #dc2626;
}
```

## 10. Do's and Don'ts

### Do
- **Do** use Playfair Display 700/900 for the login wordmark, page titles, and modal headlines only. Inter handles all UI text, labels, data, and stat values.
- **Do** chain Kantumruy Pro after the Latin font in mixed-script contexts (`var(--font-inter), var(--font-kantumruy)`). It must always be present where Khmer can appear.
- **Do** express active navigation state with a filled Field Green background across the full width of the nav item.
- **Do** use the three-part status triplet (background + text + 1px border) for Healthy, At Risk, and Harvesting. Introduce new states only with a new triplet.
- **Do** let the sidebar carry the brand weight. The content area should be calm in comparison — neutral, organized, undecorated.
- **Do** use Inset Ring for content vessels (stat cards, table wrapper). Lift only for modal-tier surfaces.
- **Do** drive radii from the `--radius` knob. If a component asks for a radius that doesn't exist on the scale, retune the knob — don't author a one-off.
- **Do** treat the farmer portal as a Khmer-first dialect of this system, not a separate brand. Same palette, same radius math, larger type and warmer surfaces.

### Don't
- **Don't** use emoji as system icons in the operator dashboard. Use Lucide. Emoji belongs only in the farmer portal as a batch-identity token.
- **Don't** reach for blue or purple. The brand is anchored in forest green and warm neutrals. Another hue competes without earning its place.
- **Don't** use gradient text. Headings, stat values, and status labels use a single solid colour.
- **Don't** apply scale transforms on hover. The single permitted use is `active:scale-[0.98]` on the farmer portal's primary touch button.
- **Don't** use a coloured `border-left`/`border-right` greater than 1px as an accent on cards, list items, or alerts. Use background tints, filled indicators, or nothing.
- **Don't** apply the Lift shadow to content-area components. Lift is reserved for modals and the login card.
- **Don't** introduce a "medium" weight (500) inside Inter to soften a hierarchy decision. The system has 400 and 600; choose one.
- **Don't** use Sprout (`#22c55e`) in the content area as decoration. It belongs in the brand mark and Sprout-tinted sidebar elements only.
- **Don't** write encouragement copy ("Welcome back!", "Let's get started!"). State facts. The operator knows what they're doing; the farmer needs the day's task, not a pep talk.
