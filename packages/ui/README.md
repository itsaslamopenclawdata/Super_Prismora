# @super-prismora/ui

A comprehensive React component library for the PhotoIdentifier platform, built with TailwindCSS and Storybook.

## Installation

This package is part of a monorepo and should be installed via workspace:

```bash
npm install
```

## Components

### Core Components

- **Button** - Versatile button with variants (primary, secondary, outline, ghost, danger)
- **Input** - Text input with label, error, helper text, and icon support
- **FormLabel** - Accessible form label with required indicator
- **FormField** - Wrapper for form fields with error handling

### Display Components

- **Card** - Card with header, title, description, content, and footer
- **Badge** - Status badges with variants and dot indicators
- **Alert** - Alert messages with variants (info, success, warning, error)

### Photo Components

- **PhotoCapture** - Universal photo upload with drag & drop support
- **ConfidenceCard** - Visual confidence indicator with progress bar
- **IdentificationResult** - Display AI identification results with bounding boxes

### Navigation & Layout

- **Navbar** - Responsive navigation bar with variants
- **Sidebar** - Collapsible sidebar with variants
- **Container** - Responsive container with size options
- **Grid** - Responsive grid layout system

### Data Visualization

- **ProgressBar** - Progress bars with variants and animations
- **DonutChart** - Circular charts with custom data
- **StatCard** - Metric cards with change indicators

### Map & Location

- **LocationBadge** - Display location with map link
- **MapPlaceholder** - Placeholder for interactive maps

### Modal & Overlay

- **Modal** - Modal dialog with size options
- **Dialog** - Composable dialog components
- **Overlay** - Backdrop overlay with variants

### State Components

- **Loading** - Loading indicators with multiple variants
- **EmptyState** - Empty state displays
- **ErrorState** - Error state displays

## Usage

```tsx
import { Button, Card, PhotoCapture } from '@super-prismora/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Identification</CardTitle>
      </CardHeader>
      <CardContent>
        <PhotoCapture onCapture={(file, preview) => {
          console.log('Captured:', file.name);
        }} />
      </CardContent>
      <CardFooter>
        <Button>Identify</Button>
      </CardFooter>
    </Card>
  );
}
```

## Development

### Storybook

To run Storybook:

```bash
cd packages/ui
npm run storybook
```

### Build

To build the package:

```bash
npm run build
```

## Features

- **TypeScript** - Full type safety
- **TailwindCSS** - Utility-first styling
- **Accessible** - WCAG compliant components
- **Responsive** - Mobile-first design
- **Theming** - CSS custom properties for easy customization
- **Comprehensive** - All common UI patterns covered

## Customization

The component library uses CSS custom properties for theming. You can customize colors, spacing, typography, and more by overriding these variables in your application:

```css
:root {
  --color-primary-500: #3b82f6;
  --color-secondary-500: #a855f7;
  --space-4: 1rem;
  /* ... more variables */
}
```

## License

Private - Part of Super_Prismora monorepo
