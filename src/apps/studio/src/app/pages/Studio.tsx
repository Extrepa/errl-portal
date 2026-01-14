import { Link } from 'react-router-dom';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import PortalHeader from '../components/PortalHeader';
import './studio.css';

type ToolLink = {
  id: string;
  title: string;
  description: string;
  badge?: 'available' | 'legacy' | 'planned';
  to: string;
  external?: boolean;
};

const tools: ToolLink[] = [
  {
    id: 'projects',
    title: 'Projects',
    description: 'Interactive visual effects built as React components: drag-and-drop sticker physics (Gravity Sticker Field), ripple interactions (Ripple Face), sparkle animations, mouse trails, and holographic effects. All effects are framework-free, accessible, and performance-optimized.',
    badge: 'available',
    to: 'projects',
  },
  {
    id: 'code-lab',
    title: 'Code Lab',
    description: 'Full-featured live coding environment with split-pane HTML/CSS/JS editors, Monaco code editor with syntax highlighting, live preview pane with mirrored console, asset manager for drag-and-drop uploads, SVG tooling, and export/zip functionality. Includes presets for quick starts.',
    badge: 'available',
    to: 'code-lab',
  },
  {
    id: 'component-library',
    title: 'Component Library',
    description: 'Browse and search 182+ visual components, effects, and UI elements. Filter by category, preview components in real-time, view code snippets, and export individual components. All components are production-ready and documented.',
    badge: 'available',
    to: 'component-library',
  },
  {
    id: 'designer',
    title: 'Designer',
    description: 'Complete multi-tool design suite for creating vector graphics, scenes, and interactive components. Features include SVG path editing with node manipulation, vibe effects engine for animations, asset library management, scene composition tools, and export to multiple formats (SVG, PNG, Flash bundles). Perfect for creating Errl assets and visual effects.',
    badge: 'available',
    to: '/designer.html',
    external: true,
  },
];

const badgeCopy: Record<NonNullable<ToolLink['badge']>, { label: string }> = {
  available: { label: 'Ready' },
  legacy: { label: 'Legacy' },
  planned: { label: 'Planned' },
};

export default function StudioPage() {
  return (
    <div className="studio-page">
      <PortalHeader activeKey="studio" />
      <div className="studio-container">
        <header className="studio-header">
          <h1 className="studio-header__hello">Hello from React!</h1>
          <span className="studio-header__pill">Errl Studio Hub</span>
          <div className="studio-header__body">
            <div className="studio-header__copy">
              <h1 className="studio-header__title">Choose your Errl Lab</h1>
              <p className="studio-header__subtitle">
                Launch the live code playground, build interactive effects, browse components, or design vector graphics. Everything
                here shares the same project storage and asset pipeline.
              </p>
            </div>
            <aside className="studio-header__meta">
              <p className="studio-header__meta-title">Unified Experience</p>
              <p>
                All Studio tools share the same asset store and export pipeline. Projects, Code Lab, Component Library, and Designer
                work together seamlessly.
              </p>
            </aside>
          </div>
        </header>

        <section className="studio-card-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </section>

        <section className="studio-roadmap">
          <h2 className="studio-roadmap__title">What's Possible</h2>
          <ul>
            <li>Create interactive visual effects with drag-and-drop physics and real-time previews.</li>
            <li>Build HTML/CSS/JS experiments with live editing, asset management, and instant export.</li>
            <li>Browse 182+ production-ready components with search, filters, and code snippets.</li>
            <li>Design vector graphics with advanced SVG editing, animations, and multi-format export.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolLink }) {
  const badge = tool.badge ? badgeCopy[tool.badge] : null;
  const content = (
    <div className={`studio-card${tool.badge === 'planned' ? ' studio-card--disabled' : ''}`}>
      <div className="studio-card__header">
        <h3 className="studio-card__title">{tool.title}</h3>
        {badge ? (
          <span className={`studio-card__badge studio-card__badge--${tool.badge}`}>{badge.label}</span>
        ) : null}
      </div>
      <p className="studio-card__description">{tool.description}</p>
      <span className="studio-card__cta">{tool.badge === 'planned' ? 'Coming soon' : 'Launch'}</span>
    </div>
  );

  if (tool.badge === 'planned') {
    return <div className="studio-card__link">{content}</div>;
  }

  if (tool.external) {
    return (
      <a className="studio-card__link" href={tool.to} rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link className="studio-card__link" to={tool.to}>
      {content}
    </Link>
  );
}
