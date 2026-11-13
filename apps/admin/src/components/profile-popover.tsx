import { useNavigate } from 'react-router-dom';
import { Settings, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, Badge } from '@org/ui';

interface ProfilePopoverProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onLogout: () => void;
}

export function ProfilePopover({ user, onLogout }: ProfilePopoverProps) {
  const navigate = useNavigate();

  const displayName = user?.name || 'Administrator';
  const displayEmail = user?.email || 'admin@techblogs.dev';
  const initial = (displayName.charAt(0) || 'A').toUpperCase();

  return (
    <Popover>
      {/* Profile Avatar Trigger Button */}
      <PopoverTrigger
        className="w-6 h-6 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[10px] font-semibold flex items-center justify-center transition-colors border border-zinc-300/80 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 select-none cursor-pointer"
        aria-label="Admin profile and settings"
      >
        {initial}
      </PopoverTrigger>

      {/* Popover Card Content */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-60 p-1.5 text-[12px] font-sans"
      >
        {/* Header with User Info */}
        <div className="px-2.5 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-zinc-900 truncate">
              {displayName}
            </span>
            <Badge variant="secondary" className="gap-1 text-[9px] py-0">
              <ShieldCheck className="w-2.5 h-2.5 text-zinc-500" />
              Admin
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-400 truncate font-mono">
            {displayEmail}
          </p>
        </div>

        <div className="border-t border-zinc-100 my-1" />

        {/* Settings & External Links Section */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 text-left transition-colors cursor-pointer focus:outline-none"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Settings</span>
          </button>

          <a
            href="http://localhost:1234"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>User App</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">:1234</span>
          </a>
        </div>

        <div className="border-t border-zinc-100 my-1" />

        {/* Sign Out */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-zinc-700 hover:text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer focus:outline-none"
        >
          <LogOut className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
          <span>Sign Out</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
