# Editorial Intelligence Design System

## Overview

Editorial Intelligence is a Premium Editorial Design System built for Personal Knowledge Management applications.

The system combines:

* Modern Minimalism
* Editorial Typography
* Human-Centered Interfaces
* Deep Focus Environments

The visual language aims to replicate the feeling of premium stationery and high-end notebooks rather than traditional SaaS dashboards.

---

# Design Principles

## 1. Paper-Like Experience

Interfaces should feel warm and tactile.

Use off-white backgrounds and avoid sterile pure-gray SaaS aesthetics.

---

## 2. Precision Typography

Typography is a primary design element.

Serif fonts are used across the interface to reinforce reading, writing, and knowledge management workflows.

---

## 3. Intentional Negative Space

Large margins and breathing room should be preferred over dense layouts.

---

## 4. Tonal Depth

Hierarchy is created through tonal contrast and ambient shadows rather than heavy borders.

---

# Color System

## Brand Colors

| Token            | Value   |
| ---------------- | ------- |
| Brand Main 1     | #E87F81 |
| Brand Main 2     | #E8465E |
| Brand Dark       | #320809 |
| Brand Background | #F6ECE2 |

---

## Background Colors

| Token              | Value   |
| ------------------ | ------- |
| Background Default | #F6ECE2 |
| Surface            | #FFFFFF |

---

## Primary Scale

| Token       | Value   |
| ----------- | ------- |
| Primary 50  | #FFE5E8 |
| Primary 100 | #FFC7CD |
| Primary 200 | #FFA1AB |
| Primary 300 | #FF7788 |
| Primary 400 | #FD5168 |
| Primary 500 | #E8465E |
| Primary 600 | #BD3D51 |
| Primary 700 | #8D2E3E |
| Primary 800 | #5F202B |
| Primary 900 | #321218 |

---

## Gray Scale

| Token    | Value   |
| -------- | ------- |
| Gray 50  | #FAFAFA |
| Gray 100 | #F4F4F5 |
| Gray 200 | #E4E4E7 |
| Gray 300 | #D4D4D8 |
| Gray 400 | #A1A1AA |
| Gray 500 | #71717A |
| Gray 600 | #52525B |
| Gray 700 | #3F3F46 |
| Gray 800 | #27272A |
| Gray 900 | #18181B |
| Gray 950 | #0E0E11 |

---

## Semantic Colors

### Success

* 100 → #C9ECCD
* 200 → #A6DEAF
* 800 → #124D2A

### Warning

* 100 → #FFE3B1
* 200 → #FFD182
* 800 → #5A3A11

### Error

* 100 → #F7C2C2
* 200 → #F09494
* 800 → #4C1014

### Info

* 100 → #C9E1FF
* 200 → #A7CCFF
* 800 → #113566

---

# Typography

## Font Families

### Heading Font

Arsenica Variable

### Body Font

Arsenica Variable

### Numeric Font

Kapakana

---

## Display Large

* Font Size: 60px
* Weight: 700
* Line Height: 1.1
* Letter Spacing: -0.02em

---

## Headline XL

* Font Size: 36px
* Weight: 700
* Line Height: 1.2
* Letter Spacing: -0.01em

---

## Headline XL Mobile

* Font Size: 28px
* Weight: 700
* Line Height: 1.2

---

## Headline Medium

* Font Size: 24px
* Weight: 600
* Line Height: 1.3

---

## Body Large

* Font Size: 18px
* Weight: 400
* Line Height: 1.75

---

## Body Medium

* Font Size: 16px
* Weight: 400
* Line Height: 1.5

---

## Label Medium

* Font Size: 14px
* Weight: 500
* Line Height: 1
* Letter Spacing: 0.08em

---

## Numeric Display

* Font Size: 24px
* Weight: 400
* Line Height: 1

---

# Border Radius

| Token          | Value  |
| -------------- | ------ |
| Radius SM      | 4px    |
| Radius Default | 8px    |
| Radius MD      | 12px   |
| Radius LG      | 16px   |
| Radius XL      | 24px   |
| Radius Full    | 9999px |

---

# Spacing

| Token               | Value  |
| ------------------- | ------ |
| Base Unit           | 4px    |
| Container Max Width | 1200px |
| Gutter              | 24px   |
| Mobile Margin       | 16px   |
| Desktop Margin      | 32px   |
| Section Gap         | 64px   |

---

# Layout System

## Container

Max Width: 1200px

---

## Grid

12 Columns

---

## Sidebar

Width: 280px

Fixed Position

---

## Mobile Breakpoint

768px

Behavior:

* Sidebar becomes Drawer
* Grid becomes 4 columns
* Margin becomes 16px

---

# Elevation System

## Level 0

Canvas Background

---

## Level 1

Cards & Sidebar

Shadow: --shadow-sm

---

## Level 2

Focused Elements

Shadow: --shadow-md

Border: 1px

---

## Level 3

Modals & Dropdowns

Shadow: --shadow-xl

Backdrop Blur: 25%

---

# Component Specifications

## Sidebar

### Default

* Surface Background
* Right Border 1px

### Active

* Brand Background Tint
* Left Accent Border 2px

---

## Stats Card

### Structure

* Number → Kapakana
* Label → Arsenica Label Medium

### Style

* No Border
* Shadow Medium
* Padding 24px

---

## Data Table

### Rows

Minimum Height: 56px

### Dividers

Horizontal Only

### Hover

Muted Background

Transition: 180ms Ease

---

## Badge

### Status Badge

* Pill Shape
* 10% Semantic Background
* Full Opacity Text

### Priority Badge

High → Brand Main 1

Low → Muted Text

---

## Button

### Primary

* Brand Main 2 Background
* White Text

### Secondary

* Transparent Background
* 1px Border
* Brand Main 2 Text

### Hover

Primary → Darken 5%

Secondary → 5% Brand Fill

---

## Inputs

### Default

* Background Surface
* Border 1px
* Padding 12px

### Focus

* Border 2px Brand Main 2
* Soft Glow 3px

### Labels

Always positioned above the field using Label Medium typography.
