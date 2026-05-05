---
name: Kasekor Helper
description: Agricultural operations dashboard for farm batch management in Cambodia
colors:
  canopy-deep: "#0f3d1f"
  field-green: "#16a34a"
  sprout: "#22c55e"
  shadow-canopy: "#1a4a2a"
  sprout-light: "#86efac"
  rice-parchment: "#fafaf8"
  dried-grass: "#e8e5e0"
  field-stone: "#e5e5e0"
  sage-mist: "#a3b8aa"
  text-strong: "#111111"
  text-primary: "#333333"
  text-secondary: "#666666"
  text-dim: "#999999"
  status-healthy-bg: "#f0fdf4"
  status-healthy: "#16a34a"
  status-risk-bg: "#fef2f2"
  status-risk: "#dc2626"
  status-harvest-bg: "#fffbeb"
  status-harvest: "#ca8a04"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.canopy-deep}"
    textColor: "{colors.rice-parchment}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "#165a2d"
    textColor: "{colors.rice-parchment}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  nav-item-active:
    backgroundColor: "{colors.field-green}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  nav-item-default:
    backgroundColor: "transparent"
    textColor: "{colors.sage-mist}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  nav-item-hover:
    backgroundColor: "{colors.shadow-canopy}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  input-default:
    backgroundColor: "#ffffff"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  status-healthy:
    backgroundColor: "{colors.status-healthy-bg}"
    textColor: "{colors.status-healthy}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-at-risk:
    backgroundColor: "{colors.status-risk-bg}"
    textColor: "{colors.status-risk}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-harvesting:
    backgroundColor: "{colors.status-harvest-bg}"
    textColor: "{colors.status-harvest}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: Kasekor Helper

## 1. Overview

**Creative North Star: "The Agronomist's Notebook"**

Kasekor Helper's visual language is the agronomist's field notebook: dense, legible, trusted. The interface is a working document, not a showpiece. Every element earns its space the way a measured entry earns its row — no decoration that isn't load-bearing, no whitespace that doesn't serve hierarchy. The operator using this tool knows what they're looking at; the design affirms that competence rather than teaching them.

The color strategy is committed: a deep forest-green sidebar occupies ~30% of the viewport at all times, anchoring the space with unmistakable brand weight. The content surface is warm parchment — not white, not a cool gray, but the specific off-white of sun-dried field paper. Text is structured by weight contrast, not color. Status signals (Healthy / At Risk / Harvesting) are the only place where color carries semantic load; everywhere else it recedes.

This system explicitly rejects consumer agri-app aesthetics: no cartoon farm illustrations, oversized emoji, playful color pops, or gamified progress bars. It also rejects generic SaaS dashboard templates with blue/purple palettes, gradient-text stats, and hero-metric layouts. The operator doesn't need to be delighted — they need to be informed.

**Key Characteristics:**
- Deep canopy green anchors the navigation; warm parchment grounds the content area
- Playfair Display for display and headings; Inter for all UI text
- Status indicators are the only semantic color signal; all other color is structural
- Flat content surface with structural depth reserved for modal/overlay contexts
- Transitions are precise and brief; nothing draws attention to itself

## 2. Colors: The Field Palette

A committed primary paired with restrained neutrals. The sidebar IS the brand; the content area is the field record.

### Primary
- **Deep Canopy** (`#0f3d1f`, oklch(22% 0.085 145)): The sidebar background and primary button fill. Dense, shaded, like old-growth canopy. Used at full saturation only in structural contexts — navigation shell, action buttons. Never used decoratively in the content area.
- **Field Green** (`#16a34a`, oklch(57% 0.19 152)): The active state color across all navigation items, form focus rings, and positive trend indicators. Reads clearly against both the canopy background and the parchment surface.
- **Shadow Canopy** (`#1a4a2a`): Hover state for navigation items within the sidebar. One lightness step above Deep Canopy. Never used as a standalone fill.

### Secondary
- **Sprout** (`#22c55e`, oklch(67% 0.22 152)): Brand icon background and hover accent on light surfaces. A full, bright green in very small amounts — the brand's loudest color, used only where identity must read at small scale (the 40×40px logo mark).
- **Sprout Light** (`#86efac`): Badge text on dark backgrounds. Only readable against Deep Canopy or Shadow Canopy.

### Neutral
- **Rice Parchment** (`#fafaf8`): Page background and card surfaces. Warm-shifted near-white — the working surface.
- **Dried Grass** (`#e8e5e0`): Login/auth page outer background. Slightly darker and warmer than Rice Parchment, creating modal depth contrast.
- **Field Stone** (`#e5e5e0`): Input and card borders at rest.
- **Sage Mist** (`#a3b8aa`): Inactive navigation text. Green-shifted neutral that harmonizes with the sidebar without competing with active items.
- **Text Strong** (`#111111`): Primary headings and high-emphasis values.
- **Text Primary** (`#333333`): Body text, input values, table rows.
- **Text Secondary** (`#666666`): Labels, secondary metadata, form field captions.
- **Text Dim** (`#999999`): Timestamps, tertiary information.

### Status Palette

Status is the system's most critical signal. Three states, instantly readable.

- **Healthy:** `#f0fdf4` background / `#16a34a` text / `#bbf7d0` border
- **At Risk:** `#fef2f2` background / `#dc2626` text / `#fecaca` border
- **Harvesting:** `#fffbeb` background / `#ca8a04` text / `#fde68a` border

**The One Signal Rule.** Color carries semantic meaning only in status indicators. Using green as decoration elsewhere — hover glows, success banners that aren't status, tinted backgrounds in non-status elements — dilutes the signal. If something needs emphasis, use weight or size.

## 3. Typography

**Display Font:** Playfair Display (Georgia, serif fallback)
**Body Font:** Inter (system-ui, sans-serif fallback)

**Character:** Playfair brings editorial authority to headings — the weight you'd find on a government agricultural publication from the 1970s, rendered at digital resolution. Inter is a neutral grotesque optimized for screen legibility, with precise letterforms that hold up well in dense data tables and small labels. The pairing is calibrated contrast: Playfair for the significant, Inter for the functional.

### Hierarchy
- **Display** (900 weight, clamp(2rem, 4vw, 3rem), line-height 1.05, tracking -0.02em): Brand wordmark only. Never used for content headings.
- **Headline** (700 weight, 1.5rem, line-height 1.2, tracking -0.01em): Page section titles ("Farm Overview", "Recent Batches"). Used sparingly — one per viewport zone.
- **Title** (DM Sans 600, 1rem, line-height 1.4): Component headings, table headers, sidebar labels.
- **Body** (DM Sans 400, 0.875rem, line-height 1.6): All table content, form values, meta text. Max line length: 65-75ch in read contexts.
- **Label** (DM Sans 600, 0.6875rem, line-height 1, tracking 0.08em, uppercase): Form field labels, column headers, badge text.

**The Weight Contrast Rule.** There is no middle ground between Playfair and DM Sans, and no middle ground between 400 and 600 weight within DM Sans. If something matters, it is headline-level (Playfair 700) or it is body/title (DM Sans). Do not introduce a 500-weight "medium" title to avoid making a hierarchy decision.

## 4. Elevation

Structural depth, not decorative stacking. Flat at rest; lifted only when a surface is contextually above the dashboard.

The dashboard is the floor. Navigation is part of the floor — no shadow between sidebar and content. Content surfaces are inset into the floor (barely-there ring shadows). The login card is a sheet of paper placed on the floor — the only surface that uses a full shadow.

### Shadow Vocabulary
- **Lift** (`0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)`): Login card and any future modal. Signals "this surface is above the application." Reserved exclusively for focus-demand contexts.
- **Inset Ring** (`0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)`): Stat summary cells. Nearly just a 1px border — separates the cell from the parchment without lifting it.
- **None**: Everything else. Navigation, tables, forms — flat on the surface. Depth is conveyed through tonal contrast between the deep green sidebar and the warm content area.

**The Floor Rule.** Nothing in the content area floats above the surface except modals and the login card. If you're tempted to add a shadow to a component, ask whether it belongs in the floor (remove the shadow) or above the application (use Lift).

## 5. Components

### Buttons
Precise and minimal. A small background shift on hover, no scale transform, no glow.

- **Shape:** Gently rounded (8px radius). Not pill, not sharp.
- **Primary:** Deep Canopy background (`#0f3d1f`), Rice Parchment text. DM Sans 600, 0.875rem. Padding 10px 16px.
- **Primary Hover:** `#165a2d` background. Transition: `background 180ms ease-out`. Nothing else changes.
- **Focus:** 2px offset outline in Field Green (`#16a34a`).
- No ghost buttons in the content area. The primary action is always the deep green button. Outline variants belong only on dark backgrounds (inside the sidebar).

### Inputs and Fields
- **Style:** White background, Field Stone border (1.5px), 8px radius. DM Sans 0.875rem. Padding 10px 12px.
- **Label:** Label type — uppercase, 0.6875rem, 600 weight, 0.08em tracking. Text Secondary (`#666666`).
- **Focus:** Border shifts to Field Green (`#16a34a`). No glow. One clean color change.
- **Hover:** Border shifts to Field Green at 60% opacity.
- **Placeholder:** Text Dim (`#999999`).

### Navigation (Sidebar)
The sidebar is a committed green surface — rules inside it invert the content area defaults.

- **Default:** Transparent background, Sage Mist text, 12px radius. DM Sans 600, 0.875rem.
- **Hover:** Shadow Canopy (`#1a4a2a`) background, white text. Transition: `background 120ms ease-out`.
- **Active:** Field Green (`#16a34a`) background, white text. The filled background IS the indicator.

**The No-Stripe Rule.** Active navigation state is expressed through a filled background, not a left- or right-side border stripe. A side-stripe border on a nav item is prohibited.

### Status Badges
The highest-information-density component. Must read at 12px.

- **Shape:** Full pill (9999px radius). Distinguishes status from other labels.
- **Healthy:** `#f0fdf4` bg / `#16a34a` text / 1px `#bbf7d0` border.
- **At Risk:** `#fef2f2` bg / `#dc2626` text / 1px `#fecaca` border.
- **Harvesting:** `#fffbeb` bg / `#ca8a04` text / 1px `#fde68a` border.
- Padding: 2px 10px. DM Sans 600, 0.75rem. The border carries the color at low opacities where tinted backgrounds might blur.

### Stat Summary Row
Not a card grid. Four metrics as a horizontal row of cells sharing the parchment surface, separated by spacing alone.

- **Metric value:** Playfair Display 700, 1.75rem, Text Strong.
- **Label:** Label type. Text Secondary.
- **Trend:** DM Sans 600, 0.75rem. Field Green for positive, `#dc2626` for negative.
- No icons alongside stat values. The number speaks for itself.

### Data Table
The primary information surface. Follows the Floor Rule — no card wrapping, no shadow. The table sits directly on the parchment.

- **Header row:** Label type. Text Secondary. Uppercase, tracked. Bottom border 1px Field Stone.
- **Row text:** Body type. Text Primary.
- **Row hover:** `#f5f4f1` background. No border change.
- **Row separator:** 1px Field Stone.
- **Status column:** Status Badge component, left-aligned.

## 6. Do's and Don'ts

### Do:
- **Do** use Playfair Display 700/900 for headings and brand elements only. DM Sans handles all UI text, labels, and data.
- **Do** express active navigation state with a filled Field Green background across the full width of the nav item.
- **Do** use the three-part status badge system (background + text + border) for Healthy, At Risk, and Harvesting. Introduce new states only with a new triplet.
- **Do** let the sidebar carry the brand weight. The content area should be calm in comparison — neutral, organized, undecorated.
- **Do** use Inset Ring shadow on stat cells only. All other content-area elements are flat.
- **Do** maintain at least a 1.25x size ratio between adjacent type hierarchy levels.

### Don't:
- **Don't** use cartoon farm illustrations, oversized emoji, or gamified progress indicators. This tool is operated by someone who knows what they're doing.
- **Don't** reach for blue or purple. The entire brand is anchored in forest green and warm neutrals. Another hue competes without earning its place.
- **Don't** use gradient text. Headings and status labels use a single solid color.
- **Don't** use a border-left or border-right greater than 1px as a colored accent on cards, list items, or alerts. Use background tints, filled indicators, or nothing.
- **Don't** apply the Lift shadow to content-area components. Lift is reserved for the login card and modals only.
- **Don't** build identical icon-heading-text card grids. Use a unified row or list treatment that expresses difference through the data, not the container shape.
- **Don't** use Sprout (`#22c55e`) in the content area as decoration. It belongs only in the brand icon and sidebar badge contexts. In the content area it reads as an alert.
- **Don't** write encouragement copy ("Welcome back!", "Let's get started!"). State facts. The operator knows what they're doing.
