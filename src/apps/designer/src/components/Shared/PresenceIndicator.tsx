import React from 'react';
import type { CollaborationUser } from '../../services/collaborationService';

interface PresenceIndicatorProps {
  users: CollaborationUser[];
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-1 px-2 py-1 bg-[#121212] border border-[#333333] rounded"
          title={user.name}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: user.color }}
          />
          <span className="text-xs text-[#888888]">{user.name}</span>
        </div>
      ))}
    </div>
  );
};

