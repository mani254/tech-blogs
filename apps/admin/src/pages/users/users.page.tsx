import * as React from 'react';
import { Plus, Users } from 'lucide-react';
import {
  Button,
  SearchInput,
  TableContainer,
  TableEmptyState,
  TablePagination,
} from '@org/ui';

export function UsersPage() {
  const [search, setSearch] = React.useState('');

  return (
    <div className="space-y-4">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Users</h1>
          <p className="text-xs text-zinc-500">
            Manage user accounts, administrator permissions, and storage quotas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Invite user</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar with SearchInput from @org/ui */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/90 shadow-2xs">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search users by name or email..."
          />
        </div>

        <div className="text-xs text-zinc-500 font-mono">0 users</div>
      </div>

      {/* Reusable Table Container from @org/ui */}
      <TableContainer>
        <div className="grid grid-cols-6 px-4 py-2.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-500 bg-white">
          <div className="col-span-2">User</div>
          <div>Role</div>
          <div>Storage quota</div>
          <div>Status</div>
          <div className="text-right">Created</div>
        </div>

        <TableEmptyState
          icon={Users}
          title="Users module is under development"
          description="Manage user accounts, administrator role assignments, and storage quotas."
        />

        <TablePagination totalResults={0} pageSize={10} currentPage={1} />
      </TableContainer>
    </div>
  );
}
