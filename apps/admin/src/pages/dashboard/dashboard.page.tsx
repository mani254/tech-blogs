import { Plus, SlidersHorizontal } from 'lucide-react';
import {
  Button,
  TableContainer,
  TableEmptyState,
  TablePagination,
} from '@org/ui';

export function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-xs text-zinc-500">
            Platform performance metrics, storage statistics, and user
            activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New report</span>
          </Button>
        </div>
      </div>

      {/* Reusable Table Container from @org/ui */}
      <TableContainer>
        {/* Table Header Columns */}
        <div className="grid grid-cols-6 px-4 py-2.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-500 bg-white">
          <div className="col-span-2">Module</div>
          <div>Status</div>
          <div>Assigned to</div>
          <div>Last updated</div>
          <div className="text-right">Created</div>
        </div>

        {/* Empty / Under Development Placeholder */}
        <TableEmptyState
          icon={SlidersHorizontal}
          title="Dashboard is under development"
          description="Analytics metrics, charts, and activity summaries will be accessible here."
        />

        {/* Table Pagination Footer */}
        <TablePagination totalResults={0} pageSize={10} currentPage={1} />
      </TableContainer>
    </div>
  );
}
