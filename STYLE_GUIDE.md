# Style Guide - Cloth Billing Application

## Design System Overview

This document provides comprehensive specifications for the Cloth Billing Application's design system, including color palette, typography, spacing, components, and interaction patterns.

## Color Palette

### Primary Colors
```css
--color-primary: #6B4E71;      /* Deep purple - fabric dye */
--color-primary-light: #8B6E91;
--color-primary-dark: #4A2E4F;
```

### Secondary Colors
```css
--color-secondary: #D4A574;    /* Warm beige - natural fabric */
--color-accent: #E8B4A0;       /* Soft coral - textile accent */
```

### Semantic Colors
```css
--color-success: #7FB069;      /* Green - growth */
--color-warning: #F4A261;      /* Amber - attention */
--color-error: #E76F51;        /* Coral red - error */
```

### Neutral Scale
```css
--color-neutral-50: #FAFAFA;   /* Lightest */
--color-neutral-100: #F5F5F5;
--color-neutral-200: #E5E5E5;
--color-neutral-300: #D4D4D4;
--color-neutral-400: #A3A3A3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;  /* Darkest */
```

### Usage Guidelines
- **Primary**: Main actions, headers, links
- **Secondary**: Supporting elements, backgrounds
- **Accent**: Highlights, decorative elements
- **Success**: Positive actions, confirmations
- **Warning**: Cautionary messages
- **Error**: Errors, destructive actions
- **Neutrals**: Text, borders, backgrounds

## Typography

### Font Families
```css
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
| Size | Value | Usage |
|------|-------|-------|
| xs | 0.75rem (12px) | Small labels, captions |
| sm | 0.875rem (14px) | Body text, form labels |
| base | 1rem (16px) | Default body text |
| lg | 1.125rem (18px) | Large body, subheadings |
| xl | 1.25rem (20px) | Section headings |
| 2xl | 1.5rem (24px) | Card titles |
| 3xl | 1.875rem (30px) | Page subheadings |
| 4xl | 2.25rem (36px) | Page headings |
| 5xl | 3rem (48px) | Hero text |

### Font Weights
- **400 (Normal)**: Body text
- **500 (Medium)**: Labels, emphasis
- **600 (Semibold)**: Headings, buttons
- **700 (Bold)**: Strong emphasis, totals

### Line Heights
- **Tight (1.25)**: Headings
- **Normal (1.5)**: Body text
- **Relaxed (1.75)**: Long-form content

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| spacing-1 | 4px | Tight spacing |
| spacing-2 | 8px | Small gaps |
| spacing-3 | 12px | Default gaps |
| spacing-4 | 16px | Standard spacing |
| spacing-5 | 20px | Medium spacing |
| spacing-6 | 24px | Section spacing |
| spacing-8 | 32px | Large spacing |
| spacing-10 | 40px | Extra large |
| spacing-12 | 48px | Section margins |
| spacing-16 | 64px | Page margins |
| spacing-20 | 80px | Hero spacing |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Small elements |
| radius-md | 8px | Buttons, inputs |
| radius-lg | 12px | Cards |
| radius-xl | 16px | Large cards |
| radius-full | 9999px | Pills, badges |

## Shadows

| Token | Effect | Usage |
|-------|--------|-------|
| shadow-sm | Subtle elevation | Inputs, small cards |
| shadow-md | Medium elevation | Cards, modals |
| shadow-lg | High elevation | Dropdowns, popovers |
| shadow-xl | Maximum elevation | Modals, overlays |

## Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Save Invoice</button>
```
- Background: `--color-primary`
- Text: White
- Hover: Darker primary, slight elevation

#### Secondary Button
```html
<button class="btn btn-secondary">Cancel</button>
```
- Background: `--color-secondary`
- Text: Dark text
- Hover: Accent color

#### Outline Button
```html
<button class="btn btn-outline">View Details</button>
```
- Background: Transparent
- Border: Primary color
- Hover: Fill with primary

#### Sizes
- Default: `padding: 12px 24px`
- Small: `btn-sm` - `padding: 8px 16px`
- Large: `btn-lg` - `padding: 16px 32px`

### Form Inputs

#### Text Input
```html
<div class="form-group">
    <label for="name" class="form-label required">Name</label>
    <input type="text" id="name" class="form-input" required>
</div>
```

#### Select
```html
<select class="form-select">
    <option>Option 1</option>
</select>
```

#### Textarea
```html
<textarea class="form-textarea" rows="4"></textarea>
```

#### States
- **Default**: Border `--color-neutral-300`
- **Focus**: Border `--color-primary`, shadow ring
- **Error**: Border `--color-error`
- **Disabled**: Background `--color-neutral-100`, opacity 0.5

### Cards

```html
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Title</h2>
    </div>
    <div class="card-body">
        Content
    </div>
    <div class="card-footer">
        Actions
    </div>
</div>
```

### Tables

```html
<table class="table">
    <thead>
        <tr>
            <th>Column 1</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data</td>
        </tr>
    </tbody>
</table>
```

- Header: Primary background, white text
- Rows: Hover state with light background
- Borders: Neutral-200

### Modals

```html
<div class="modal-backdrop active">
    <div class="modal">
        <div class="modal-header">
            <h2 class="modal-title">Title</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">Content</div>
        <div class="modal-footer">Actions</div>
    </div>
</div>
```

### Toast Notifications

```javascript
Toast.success('Invoice saved successfully');
Toast.error('Please enter a valid GSTIN');
Toast.warning('Outstanding balance detected');
Toast.info('Payment recorded');
```

- Position: Top right
- Animation: Slide in from right
- Auto-dismiss: 3 seconds (configurable)

### Badges

```html
<span class="badge badge-primary">GST</span>
<span class="badge badge-success">Paid</span>
<span class="badge badge-warning">Partial</span>
<span class="badge badge-error">Unpaid</span>
```

## Responsive Breakpoints

### Mobile First Approach

```css
/* Mobile (default) */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Grid System

```css
/* 1 column on mobile */
.grid {
    display: grid;
    grid-template-columns: 1fr;
}

/* 2 columns on tablet */
@media (min-width: 640px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 4 columns on desktop */
@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

## Interaction Patterns

### Hover States
- Buttons: Slight elevation, color shift
- Cards: Elevation increase, border highlight
- Links: Color change, underline
- Table rows: Background highlight

### Focus States
- All interactive elements: 2px outline in primary color
- Offset: 2px from element
- Required for accessibility

### Transitions
- Fast: 150ms (hover effects)
- Base: 250ms (default)
- Slow: 350ms (complex animations)

### Loading States
```html
<div class="loading"></div>
```
- Spinning circle animation
- Primary color

### Empty States
```html
<div class="empty-state">
    <div class="empty-state-icon">...</div>
    <h3 class="empty-state-title">No items found</h3>
    <p class="empty-state-description">Add your first item to get started</p>
</div>
```

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- Interactive elements: Minimum 3:1

### Keyboard Navigation
- Tab order: Logical flow
- Focus indicators: Visible on all elements
- Skip links: Available for main content

### ARIA Labels
```html
<button aria-label="Close modal">×</button>
<nav aria-label="Main navigation">
<div role="alert">Error message</div>
```

### Screen Readers
- Semantic HTML5 elements
- ARIA roles and properties
- Alt text for images
- Form labels associated with inputs

## Print Styles

### Invoice Templates
- A4 size: 210mm × 297mm
- Print margins: Automatic
- Color/BW toggle available
- Page breaks: Avoid breaking tables

### Print CSS
```css
@media print {
    .no-print { display: none; }
    body { background: white; }
    .card { box-shadow: none; }
}
```

## Theme Modes

### Light Theme (Default)
- Fabric-inspired warm colors
- High contrast
- Textile-friendly palette

### Dark Theme
- Minimal, high contrast
- Inverted color scheme
- Reduced eye strain

Toggle via Settings or theme button.

## Microcopy Guidelines

### CTAs
- Action-oriented verbs
- Clear and concise
- Examples: "Save Invoice", "Create Customer", "Export Data"

### Error Messages
- Specific and helpful
- Suggest solutions
- Examples: "Please enter a valid GSTIN", "Phone number required"

### Success Messages
- Confirm action completed
- Brief and positive
- Examples: "Invoice saved successfully", "Customer added"

### Empty States
- Friendly and encouraging
- Suggest next action
- Examples: "No customers yet — add your first customer"

## Icon System

### SVG Icons
- Inline SVG for scalability
- Current color inheritance
- Accessible with aria-hidden or labels

### Common Icons
- Plus: Add/create
- Edit: Modify
- Delete: Remove
- Print: Print/export
- Share: Share via WhatsApp
- Search: Search/filter

## Animation Guidelines

### Principles
- Subtle and purposeful
- Respect reduced motion preference
- Fast transitions (150-350ms)
- Easing: ease-in-out

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Best Practices

1. **Consistency**: Use design tokens, not magic numbers
2. **Accessibility**: Always include ARIA labels and keyboard support
3. **Responsive**: Mobile-first approach
4. **Performance**: Minimize animations, optimize images
5. **Maintainability**: Use CSS variables, semantic HTML

## Component Specs

### Invoice Item Row
- Height: 48px minimum
- Padding: 12px vertical, 12px horizontal
- Hover: Light background highlight
- Focus: Primary border outline

### KPI Card
- Padding: 24px
- Border radius: 12px
- Shadow: Medium elevation
- Hover: Slight lift, shadow increase

### Navigation
- Height: 64px
- Sticky positioning
- Primary background
- White text and icons

---

**Last Updated**: 2024  
**Version**: 1.0.0



