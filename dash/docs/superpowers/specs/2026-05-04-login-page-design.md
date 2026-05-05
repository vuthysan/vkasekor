# Login Page Design — Kasekor Helper

## Overview

A login page for Kasekor Helper, an internal team tool. Access is restricted to authorized team members only. The design uses a bold split-panel layout with a deep forest green brand panel on the left and a clean form panel on the right.

## Audience & Constraints

- **Users**: Internal team members only (no public access)
- **Stack**: Next.js (App Router), HeroUI v3, Tailwind CSS v4, TypeScript
- **Route**: `frontend/app/page.tsx`

## Layout

Two-column full-viewport split:

- **Left panel (45% width)**: Deep forest green (`#0f3d1f`) background with subtle radial glow effects. Contains the brand identity — icon, Playfair Display serif wordmark "Kasekor Helper", and a "TEAM PORTAL" badge tag. A small footer reads "Internal use only · © 2026".
- **Right panel (55% width)**: Warm off-white (`#fafaf8`) background. Contains the login form centered vertically.

## Visual Style

- **Typography**: Playfair Display (serif, 700/900) for headings and wordmark; DM Sans (400/500/600) for body, labels, inputs
- **Colors**: Forest green `#0f3d1f` (brand panel, CTA button), `#22c55e` (icon accent), `#86efac` (badge text), off-white `#fafaf8` (form panel), warm border `#e5e5e0`
- **Decoration**: Two radial gradient glows on the left panel (top-right and bottom-left) for depth
- **Border radius**: 16px on the outer card, 8px on inputs and button
- **Box shadow**: Layered deep shadow on the outer card for a floating effect

## Form

Fields (in order):
1. **Email** — text input, placeholder `you@kasekor.com`, label uppercase small caps
2. **Password** — password input, placeholder `••••••••`

CTA: **Sign In** button — full width, dark green, with a right-arrow icon, DM Sans semibold.

Footer note below button: *"Access restricted to authorized team members"* in muted small text.

No "Remember me", no "Forgot password" — intentionally minimal.

## Component Approach

Use HeroUI `Input` and `Button` components for the form fields and submit action to get built-in accessibility and focus management. Custom CSS for the split layout and brand panel. Motion library for a subtle fade-in entrance on page load (form panel slides up slightly).

## File

- `frontend/app/page.tsx` — the login page component (replaces the empty placeholder)
- `frontend/app/layout.tsx` — update metadata title to "Kasekor Helper"
- Fonts loaded via `next/font/google` in layout
