import * as React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Bell,
} from 'lucide-react';
import { useAdminAuth } from '@org/internal-sdk';
import { ProfilePopover } from '../components/profile-popover';

interface NavItem {
  label: string;
  headerTitle?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupName: 'Overview',
    items: [
      {
        label: 'Dashboard',
        headerTitle: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupName: 'Manage',
    items: [
      {
        label: 'Users',
        headerTitle: 'Users',
        path: '/users',
        icon: Users,
      },
      {
        label: 'Settings',
        headerTitle: 'Settings',
        path: '/settings',
        icon: Settings,
      },
    ],
  },
];

export function DashboardLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Determine current active item title for top bar (matching most specific route)
  const allItems = navGroups.flatMap((g) => g.items);
  const sortedItems = [...allItems].sort(
    (a, b) => b.path.length - a.path.length,
  );
  const matchedItem =
    sortedItems.find((item) => location.pathname === item.path) ||
    sortedItems.find((item) => location.pathname.startsWith(item.path));

  const pageTitle =
    location.pathname === '/settings'
      ? 'Settings'
      : matchedItem?.headerTitle || matchedItem?.label || 'Admin Console';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col md:flex-row font-sans antialiased text-[13px]">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-[#fafafa] border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* Small aesthetic logo mark */}
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center text-white text-[9px] font-bold">
            TB
          </div>
          <span className="text-[13px] font-semibold text-zinc-900 tracking-tight">
            TechBlogs Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProfilePopover user={user} onLogout={handleLogout} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-200/50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Slender Classic Sidebar - Clean navigation without footer settings */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#fafafa] border-r border-zinc-200/80 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* Very Small Aesthetic Logo Header */}
          <div className="h-12 px-4 flex items-center gap-2 border-b border-zinc-200/60">
            <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              TB
            </div>
            <span className="text-[13px] font-semibold text-zinc-900 tracking-tight">
              TechBlogs Admin
            </span>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.groupName} className="space-y-0.5">
                <div className="px-2.5 pt-1 pb-1 text-[11px] font-normal text-zinc-400 select-none">
                  {group.groupName}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isExact = item.path === '/dashboard';
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={isExact}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors ${
                          isActive
                            ? 'bg-zinc-200/70 text-zinc-950 font-medium'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40 font-normal'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[1.6] shrink-0 text-zinc-500" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area - Solid White Fill */}
      <div className="flex-1 flex flex-col min-w-0 bg-white min-h-screen">
        {/* Top Header Bar */}
        <header className="hidden md:flex h-12 border-b border-zinc-200/80 bg-white px-6 items-center justify-between sticky top-0 z-20">
          <div className="text-[13px] font-medium text-zinc-900">
            {pageTitle}
          </div>

          <div className="flex items-center gap-3">
            {/* ⌘K Search Pill */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-[11px] text-zinc-400 select-none">
              <Search className="w-3 h-3 text-zinc-400" />
              <span>K</span>
            </div>

            {/* Notification Bell */}
            <button
              className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* Profile Popover with Settings & Actions */}
            <ProfilePopover user={user} onLogout={handleLogout} />
          </div>
        </header>

        {/* Viewport Outlet - Pure White Content Fill */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto bg-white">
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/20 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
