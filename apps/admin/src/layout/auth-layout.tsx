import * as React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#fafafa] text-zinc-900 flex flex-col items-center justify-center p-4 sm:p-6 relative text-[13px] font-sans antialiased">
      {/* Small Aesthetic Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold">
            T
          </div>
          <span className="text-[14px] font-semibold text-zinc-900 tracking-tight">
            TechBlogs
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 font-normal">
          Administration Console
        </span>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex justify-center items-center z-10">
        {children}
      </div>

      {/* Minimal Footer */}
      <div className="mt-6 text-[11px] text-zinc-400 text-center font-normal">
        &copy; {new Date().getFullYear()} TechBlogs. Admin access only.
      </div>
    </div>
  );
}
