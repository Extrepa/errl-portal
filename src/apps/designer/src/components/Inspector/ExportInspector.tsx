import React, { useState } from 'react';
import { ExportModal } from '../Export/ExportModal';
import { ProjectHealthModal } from '../Diagnostics/ProjectHealthModal';
import { CloudPublishModal } from '../Export/CloudPublishModal';
import { Activity, Cloud } from 'lucide-react';

export const ExportInspector: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);

  return (
    <>
      <div className="p-4">
        <h3 className="text-sm font-medium text-[#E0E0E0] mb-4">Export</h3>
        <p className="text-xs text-[#888888] mb-4">
          Export your project in various formats for different platforms.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-2 bg-[#00FF9D] text-[#121212] rounded font-medium hover:bg-[#00E08A] transition-colors mb-3"
        >
          Open Export Dialog
        </button>
        <button
          onClick={() => setShowHealthModal(true)}
          className="w-full px-4 py-2 bg-[#121212] border border-[#333333] text-[#E0E0E0] rounded font-medium hover:bg-[#2D2D2D] transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <Activity size={16} />
          Project Health
        </button>
        <button
          onClick={() => setShowCloudModal(true)}
          className="w-full px-4 py-2 bg-[#121212] border border-[#00FF9D] text-[#00FF9D] rounded font-medium hover:bg-[#2D2D2D] transition-colors flex items-center justify-center gap-2"
        >
          <Cloud size={16} />
          Publish to Cloud
        </button>
      </div>
      <ExportModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <ProjectHealthModal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} />
      <CloudPublishModal isOpen={showCloudModal} onClose={() => setShowCloudModal(false)} />
    </>
  );
};

