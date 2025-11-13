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

const PIN_DESIGNER_URL = resolvePortalPageUrl('pages/pin-designer/index.html');

const tools: ToolLink[] = [
  {
    id: 'projects',
    title: 'Projects',
    description: 'Standalone visual effects (HTML/CSS/JS) wrapped for Studio: Gravity, Ripple, Sparkle, Trails.',
    badge: 'available',
    to: 'projects',
  },
  {
    id: 'code-lab',
    title: 'Code Lab',
    description: 'Full Errl Live Studio editor with HTML/CSS/JS preview, Monaco, asset manager, and SVG tooling.',
    badge: 'available',
    to: 'code-lab',
  },
  {
    id: 'math-lab',
    title: 'Psychedelic Math Lab',
    description: '100+ interactive math toys and shaders. Legacy experience; opens inside the React shell.',
    badge: 'legacy',
    to: 'math-lab',
  },
  {
    id: 'shape-madness',
    title: 'Shape Madness',
    description: '38+ generative shape experiments. Legacy iframe, now routed through the React hub.',
    badge: 'legacy',
    to: 'shape-madness',
  },
  {
    id: 'pin-designer',
    title: 'Pin Designer',
    description: 'Design and export Errl pins. We’ll merge this into the shared asset pipeline next.',
    badge: 'legacy',
    to: 'pin-designer',
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
                Launch the live code playground, explore legacy experiments, or prep assets for the next show. Everything
                here shares the same project storage and asset pipeline as we finish the merge.
              </p>
            </div>
            <aside className="studio-header__meta">
              <p className="studio-header__meta-title">In Progress</p>
              <p>
                Code Lab already uses the shared asset store. We’re wiring Math Lab, Shape Madness, and the Pin Designer to
                the same backbone next.
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
          <h2 className="studio-roadmap__title">Roadmap</h2>
          <ul>
            <li>Unified asset browser so every tool can open, edit, and export the same files.</li>
            <li>Bridge Math Lab and Shape Madness into native React surfaces without losing legacy flair.</li>
            <li>One set of keyboard shortcuts, panels, and history across all Studio experiences.</li>
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
