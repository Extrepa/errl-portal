# Getting Started with Errl Portal

This guide will help you get started developing the Errl Portal.

## Prerequisites

- Node.js 18+ and npm
- Git
- A modern code editor (VS Code recommended)

## Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd errl-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Portal: http://localhost:5173/
   - Studio: http://localhost:5173/studio

## Project Structure

- `src/` - All source code
  - `index.html` - Main landing page
  - `apps/` - Application code (landing, static pages, studio)
  - `shared/` - Shared assets, styles, and utilities
  - `components/` - Reusable React components
- `docs/` - Documentation
- `archive/` - Historical artifacts and backups
- `dist/` - Build output (generated)

## Common Tasks

### Adding a New Portal Page

1. Create directory: `src/apps/static/pages/your-page/`
2. Create `index.html` with standard header structure
3. Add entry to `vite.config.ts` rollupOptions.input
4. Add navigation link to other pages

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Development Tips

- Use `data-portal-link` attributes for portal page links
- Follow the standard header structure for consistency
- Check `docs/ARCHITECTURE.md` for detailed structure information
- See `docs/guides/development.md` for development workflow details

## Getting Help

- Check `docs/STATUS.md` for current project status
- Review `docs/ARCHITECTURE.md` for architecture details
- See `docs/team/` for team-specific guides

