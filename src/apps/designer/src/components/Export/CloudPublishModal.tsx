import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { getPublishingService } from '../../services/publishingService';

interface CloudPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudPublishModal: React.FC<CloudPublishModalProps> = ({ isOpen, onClose }) => {
  const { project } = useStore();
  const [version, setVersion] = useState('1.0.0');
  const [environment, setEnvironment] = useState<'draft' | 'live'>('draft');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const publishingService = getPublishingService();
      const result = await publishingService.publish(project, {
        version,
        environment,
      });
      setPublishResult(result);
    } catch (error) {
      console.error('Publish failed:', error);
      alert('Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg w-[600px] max-h-[80vh] overflow-auto">
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#E0E0E0]">Cloud Publish</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#E0E0E0]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {!publishResult ? (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-[#888888] block mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888888] block mb-1">Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as 'draft' | 'live')}
                    className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
                  >
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full px-4 py-2 bg-[#00FF9D] text-[#121212] rounded font-medium hover:bg-[#00E08A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish to Cloud'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#121212] rounded border border-[#333333]">
                <div className="text-xs text-[#888888] mb-1">View URL</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-[#E0E0E0] break-all">
                    {publishResult.url}
                  </code>
                  <button
                    onClick={() => handleCopy(publishResult.url)}
                    className="p-1 text-[#888888] hover:text-[#E0E0E0]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#121212] rounded border border-[#333333]">
                <div className="text-xs text-[#888888] mb-1">Loader Script</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-[#E0E0E0] break-all">
                    {publishResult.loaderScript}
                  </code>
                  <button
                    onClick={() => handleCopy(publishResult.loaderScript)}
                    className="p-1 text-[#888888] hover:text-[#E0E0E0]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

