import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StudioShell from '../../../features/live-studio/studio/app/layout/StudioShell';
import './studio.css';

interface Component {
  id: string;
  name: string;
  description: string;
  category: string[];
  tags: string[];
  location: {
    primary: string;
    source: string;
  };
  quality?: {
    score: number;
  };
  usage?: {
    count: number;
  };
  thumbnail?: string;
  codeSnippet?: string;
  props?: {
    options?: Record<string, any>;
  };
}

// Use proxy path in development, fallback to direct URL if proxy not available
const REGISTRY_URL = import.meta.env.DEV 
  ? '/api/component-library/data/master-component-registry.json'
  : 'http://localhost:8080/data/master-component-registry.json';
const PREVIEW_SERVER = import.meta.env.DEV
  ? '/api/component-library'
  : 'http://localhost:8080';

export default function StudioComponentLibrary() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'basic' | 'fulltext'>('basic');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComponents();
  }, []);

  async function loadComponents() {
    try {
      setLoading(true);
      const response = await fetch(REGISTRY_URL);
      if (!response.ok) throw new Error('Failed to load registry');
      const data = await response.json();
      setComponents(data.components || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load components');
      console.error('Error loading components:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredComponents = useMemo(() => {
    let filtered = components;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp =>
        comp.category?.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (searchMode === 'basic') {
        filtered = filtered.filter(comp =>
          comp.name.toLowerCase().includes(query) ||
          comp.description?.toLowerCase().includes(query) ||
          comp.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      } else {
        // Full-text search includes code snippet
        filtered = filtered.filter(comp =>
          comp.name.toLowerCase().includes(query) ||
          comp.description?.toLowerCase().includes(query) ||
          comp.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          comp.codeSnippet?.toLowerCase().includes(query)
        );
      }
    }

    return filtered;
  }, [components, searchQuery, searchMode, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    components.forEach(comp => {
      comp.category?.forEach(cat => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [components]);

  function toggleSelection(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function getQualityClass(score?: number) {
    if (!score) return '';
    if (score >= 80) return 'quality-excellent';
    if (score >= 60) return 'quality-good';
    if (score >= 40) return 'quality-fair';
    return 'quality-poor';
  }

  function getPreviewUrl(component: Component) {
    const path = component.location.primary;
    if (path.startsWith('/Users/')) {
      return `${PREVIEW_SERVER}/preview/${path.substring(1)}`;
    }
    return `${PREVIEW_SERVER}/preview/${path}`;
  }

  function copyCode(component: Component) {
    // This would fetch the actual component code
    navigator.clipboard.writeText(`Component: ${component.name}\nPath: ${component.location.primary}`);
  }

  const breadcrumbs = [
    { label: 'Errl Hub', to: '/' },
    { label: 'Component Library' },
  ];

  if (loading) {
    return (
      <StudioShell
        title="Component Library"
        subtitle="Loading components..."
        breadcrumbs={breadcrumbs}
        navActiveKey="studio"
      >
        <div className="flex items-center justify-center p-20">
          <div className="text-zinc-400">Loading component registry...</div>
        </div>
      </StudioShell>
    );
  }

  if (error) {
    return (
      <StudioShell
        title="Component Library"
        subtitle="Error loading components"
        breadcrumbs={breadcrumbs}
        navActiveKey="studio"
      >
        <div className="flex items-center justify-center p-20">
          <div className="text-red-400">
            <p className="mb-4">Error: {error}</p>
            <p className="text-sm text-zinc-500">
              Make sure the Component Library preview server is running:
              <br />
              <code className="mt-2 block bg-black/40 p-2 rounded">
                cd _Resources/Component-Library/tools && node preview-server.js
              </code>
            </p>
          </div>
        </div>
      </StudioShell>
    );
  }

  return (
    <StudioShell
      title="Component Library"
      subtitle={`Browse ${components.length} visual components, effects, and UI elements`}
      breadcrumbs={breadcrumbs}
      navActiveKey="studio"
      actions={
        <Link
          to="/"
          className="inline-flex h-9 items-center justify-center rounded-md border border-white/20 px-3 text-sm text-zinc-200 transition-colors hover:bg-white/10"
        >
          Back to Hub
        </Link>
      }
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => setSearchMode(searchMode === 'basic' ? 'fulltext' : 'basic')}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/30"
            >
              {searchMode === 'basic' ? 'Basic' : 'Full-text'}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                : 'bg-black/40 border border-white/10 text-zinc-300 hover:bg-black/60'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                  : 'bg-black/40 border border-white/10 text-zinc-300 hover:bg-black/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-zinc-400">
          <span>Total: {components.length}</span>
          <span>Showing: {filteredComponents.length}</span>
          {selectedIds.size > 0 && <span className="text-cyan-400">Selected: {selectedIds.size}</span>}
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map(component => (
          <div
            key={component.id}
            className={`bg-black/40 border rounded-lg p-4 cursor-pointer transition-all hover:border-cyan-400/50 ${
              selectedIds.has(component.id) ? 'border-cyan-400' : 'border-white/10'
            }`}
            onClick={() => setSelectedComponent(component)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-cyan-400">{component.name}</h3>
              <input
                type="checkbox"
                checked={selectedIds.has(component.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelection(component.id);
                }}
                className="w-4 h-4"
              />
            </div>
            <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{component.description}</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {component.quality && (
                <span className={`px-2 py-1 rounded text-xs ${getQualityClass(component.quality.score)}`}>
                  Quality: {component.quality.score}
                </span>
              )}
              {component.usage && (
                <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                  Used {component.usage.count}x
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(getPreviewUrl(component), '_blank');
                }}
                className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/30"
              >
                Preview
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode(component);
                }}
                className="px-3 py-1 text-xs bg-black/60 border border-white/10 rounded text-zinc-300 hover:bg-black/80"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          <p>No components found matching your criteria.</p>
        </div>
      )}

      {/* Component Preview Modal */}
      {selectedComponent && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedComponent(null)}
        >
          <div
            className="bg-zinc-900 border border-white/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 mb-2">{selectedComponent.name}</h2>
                  <p className="text-zinc-400">{selectedComponent.description}</p>
                </div>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <iframe
                  src={getPreviewUrl(selectedComponent)}
                  className="w-full h-96 border border-white/10 rounded"
                  title="Component Preview"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyCode(selectedComponent)}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/30"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => window.open(getPreviewUrl(selectedComponent), '_blank')}
                  className="px-4 py-2 bg-black/60 border border-white/10 rounded text-zinc-300 hover:bg-black/80"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudioShell>
  );
}

