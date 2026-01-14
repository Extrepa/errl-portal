# Development Guide

This guide covers the development workflow, conventions, and best practices for the Errl Portal.

## Development Workflow

### Starting Development

```bash
npm run dev
```

This starts the Vite dev server with:
- Hot module replacement (HMR)
- TypeScript compilation
- Automatic page reloading

### File Structure Conventions

- **Portal Pages**: `src/apps/static/pages/<page-name>/index.html`
- **React Components**: `src/apps/studio/src/app/`
- **Shared Styles**: `src/shared/styles/`
- **Assets**: `src/shared/assets/`
- **Effects**: `src/apps/landing/fx/`

### Navigation Standards

All portal pages should:
1. Use `errl-header-content` wrapper in header
2. Include complete navigation menu
3. Use `data-portal-link` for portal pages
4. Use `/studio.html` for Studio link
5. Use `/studio/pin-designer` for Design link

Example header structure:
```html
<header class="errl-header">
  <div class="errl-header-content">
    <a class="errl-home-btn" href="/">← Back to Portal</a>
    <nav class="errl-nav">
      <a class="errl-bubble-btn" href="/portal/pages/about/index.html" data-portal-link="pages/about/index.html">About Errl</a>
      <!-- ... more links ... -->
    </nav>
  </div>
</header>
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer interfaces over types for object shapes
- Use meaningful type names

### CSS

- Use CSS variables from `errlDesignSystem.css`
- Follow BEM-like naming for component styles
- Keep styles co-located with components when possible

### HTML

- Use semantic HTML5 elements
- Include proper accessibility attributes
- Use `data-portal-link` for portal navigation

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:ui       # Run UI tests only
```

### Writing Tests

- Use Playwright for E2E tests
- Test critical user flows
- Include accessibility checks
- Test in multiple browsers

## Building

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Studio-Specific Build

```bash
npm run studio:build
```

## Debugging

### Dev Tools

- Use browser DevTools for runtime debugging
- Check console for errors
- Use React DevTools for React components
- Use Vite's error overlay for build issues

### Common Issues

1. **Port conflicts**: Change port in `vite.config.ts`
2. **Path issues**: Check `data-portal-link` attributes
3. **Build errors**: Check TypeScript errors first
4. **Asset loading**: Verify paths in `vite.config.ts`

## Git Workflow

1. Create feature branch from `main`
2. Make small, focused commits
3. Write descriptive commit messages
4. Test before pushing
5. Create PR with clear description

## Best Practices

1. **Keep pages consistent** - Use standard header/navigation
2. **Test navigation** - Verify all links work in dev and prod
3. **Optimize assets** - Compress images, use appropriate formats
4. **Document changes** - Update relevant docs when making changes
5. **Follow conventions** - Stick to established patterns

## Resources

- `docs/ARCHITECTURE.md` - Architecture overview
- `docs/STATUS.md` - Current project status
- `docs/team/DEV-SYSTEM-GUIDE.md` - Detailed system guide

