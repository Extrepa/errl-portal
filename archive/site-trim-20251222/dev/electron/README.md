# Electron Preview Setup

This directory contains the Electron configuration for previewing the Errl Portal landing page. Electron is now the default preview method, replacing Vite preview.

## Setup

Install Electron as a dev dependency (already added to package.json):

```bash
npm install
```

## Usage

### Development Mode (with Vite dev server)

1. Start the Vite dev server in one terminal:
   ```bash
   npm run portal:dev
   ```

2. In another terminal, start Electron in dev mode:
   ```bash
   npm run portal:preview:dev
   ```

Or simply use:
```bash
npm run preview
```

### Production Mode (using built dist)

1. Build the project:
   ```bash
   npm run build
   ```

2. Start Electron preview:
   ```bash
   npm run portal:preview
   ```

Or:
```bash
npm run preview
```

## Configuration

- **Development mode**: Electron connects to the Vite dev server running on port 5173 (or VITE_PORT env var). Set `NODE_ENV=development` to use this mode.
- **Production mode**: Electron starts a local HTTP server (port 5174) to serve the `dist/` folder, handling the `/errl-portal/` base path from Vite builds.
- DevTools are automatically opened in development mode

## Scripts

- `npm run preview` - Preview using Electron (uses built dist by default)
- `npm run portal:preview` - Preview production build with Electron
- `npm run portal:preview:dev` - Preview with Electron in dev mode (connects to Vite dev server)

## Notes

- The Electron window opens with dimensions 1400x900
- Background color matches the portal theme (#0b0f18)
- Window shows only after content is ready to prevent visual flash
- Electron will retry connecting to Vite dev server for up to 30 seconds if server isn't ready
- Production mode serves files via a local HTTP server to handle base paths correctly

