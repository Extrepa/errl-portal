import React, { useState } from 'react';
import { X, Download, FileCode, Image, Package } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { exportFlashBundle } from '../../engine/exporters/FlashExporter';
import { exportComponent } from '../../engine/exporters/ComponentExporter';
import { exportStaticSVG, exportProjectJSON, exportStaticPNG } from '../../engine/exporters/StaticExporter';
import { exportBundleZip } from '../../engine/exporters/BundleExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useStore();
  const [exportFormat, setExportFormat] = useState<
    'flash' | 'component' | 'static' | 'png' | 'json' | 'bundle'
  >('json');
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [productionFilters, setProductionFilters] = useState(false);
  const [includeRuntime, setIncludeRuntime] = useState(true);

  if (!isOpen || !project) return null;

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    let filename = '';
    let blob: Blob | null = null;

    try {
      switch (exportFormat) {
        case 'flash': {
          const content = exportFlashBundle(project);
          filename = `${project.meta.name}_flash.json`;
          blob = new Blob([content], { type: 'application/json' });
          break;
        }
        case 'component': {
          if (!selectedComponent) {
            alert('Please select a component to export');
            setIsExporting(false);
            return;
          }
          try {
            const content = exportComponent(project, selectedComponent);
            const component = project.library.components.find(c => c.id === selectedComponent);
            filename = `${component?.name.replace(/[^a-zA-Z0-9]/g, '') || selectedComponent}.tsx`;
            blob = new Blob([content], { type: 'text/typescript' });
          } catch (error) {
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsExporting(false);
            return;
          }
          break;
        }
        case 'static': {
          const content = exportStaticSVG(project);
          filename = `${project.meta.name}_scene.svg`;
          blob = new Blob([content], { type: 'image/svg+xml' });
          break;
        }
        case 'png': {
          filename = `${project.meta.name}_scene.png`;
          blob = await exportStaticPNG(project);
          break;
        }
        case 'json': {
          const content = exportProjectJSON(project);
          filename = `${project.meta.name}.json`;
          blob = new Blob([content], { type: 'application/json' });
          break;
        }
        case 'bundle': {
          filename = `${project.meta.name}_bundle.zip`;
          blob = await exportBundleZip(project, {
            production: productionFilters,
            includeRuntime,
          });
          break;
        }
      }

      if (!blob) {
        throw new Error('No export output generated.');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#E0E0E0]">Export Project</h2>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#E0E0E0]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-xs text-[#888888] block mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'json', label: 'JSON', icon: <FileCode size={16} /> },
                { value: 'bundle', label: 'Bundle (ZIP)', icon: <Package size={16} /> },
                { value: 'flash', label: 'Flash Bundle', icon: <Package size={16} /> },
                { value: 'component', label: 'React Component', icon: <FileCode size={16} /> },
                { value: 'static', label: 'Static SVG', icon: <Image size={16} /> },
                { value: 'png', label: 'Static PNG', icon: <Image size={16} /> },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as any)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded border text-xs
                    ${exportFormat === format.value
                      ? 'bg-[#2D2D2D] border-[#00FF9D] text-[#00FF9D]'
                      : 'bg-[#121212] border-[#333333] text-[#E0E0E0] hover:border-[#555555]'
                    }
                  `}
                >
                  {format.icon}
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {/* Component Selection (for component export) */}
          {exportFormat === 'component' && (
            <div>
              <label className="text-xs text-[#888888] block mb-2">Select Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              >
                <option value="">Choose a component...</option>
                {project.library.components.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {exportFormat === 'bundle' && (
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-[#888888]">
                <input
                  type="checkbox"
                  checked={productionFilters}
                  onChange={(e) => setProductionFilters(e.target.checked)}
                />
                Strip preview-only filters
              </label>
              <label className="flex items-center gap-2 text-[#888888]">
                <input
                  type="checkbox"
                  checked={includeRuntime}
                  onChange={(e) => setIncludeRuntime(e.target.checked)}
                />
                Include runtime bridge
              </label>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#00FF9D] text-[#121212] rounded font-medium hover:bg-[#00E08A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
