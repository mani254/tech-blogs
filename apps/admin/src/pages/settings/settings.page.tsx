import { Settings } from 'lucide-react';
import { TableContainer, TableEmptyState } from '@org/ui';

export function SettingsPage() {
  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-zinc-500">
            Platform & Account Preferences
          </span>
        </div>
      </div>

      {/* Reusable Container from @org/ui */}
      <TableContainer>
        <div className="px-4 py-2.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-500 bg-white">
          System Configuration
        </div>

        <TableEmptyState
          icon={Settings}
          title="Settings module is under development"
          description="Platform configurations, security policies, and administrative preferences will be configurable here."
        />
      </TableContainer>
    </div>
  );
}
