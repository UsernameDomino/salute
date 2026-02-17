# S.A.L.U.T.E. Reporter

Offline-first mobile web application for reporting sightings using the S.A.L.U.T.E. method.

View at https://salutereport.github.io

Shareable QR code:

<img src="./assets/qrcode.png" alt="QR code" width="200">

## Features

- **Offline-first**: Works without internet after initial load
- **Mobile-optimized**: Large touch targets, fits above the fold
- **Quick entry**: Preset buttons for common options + free text
- **Copy/Share**: Generate report text for messaging or phone calls
- **PWA**: Install as an app on your device

## S.A.L.U.T.E. Fields

- **S**ize - Number of personnel/vehicles
- **A**ctivity - What they are doing
- **L**ocation - Address, landmark, or description
- **U**nit/Uniform - Identifying features
- **T**ime - When observed (with relative presets)
- **E**quipment - Weapons, vehicles, gear

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Run tests once
pnpm test:run

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- **Svelte 5** - Component framework
- **Vite** - Build tool (ES2015 target for broad browser support)
- **Vitest** - Test runner
- **@testing-library/svelte** - Component testing

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Samsung Internet 8+

## Report Output Format

```
═══ SIGHTING REPORT ═══
Report generated: 2026-02-04 14:30

SIZE: 6-10 personnel
ACTIVITY: Checkpoint
    Stopping vehicles on main road
LOCATION: Near central market, main intersection
UNIFORMS: Camouflage uniforms
TIME OBSERVED: 14:25 (5 min ago)
EQUIPMENT: Long guns, Vehicles

═══════════════════════
```

## Security

- No data persistence (nothing stored locally)
- No network requests after initial load
- No analytics or tracking
- Location only captured when explicitly requested
