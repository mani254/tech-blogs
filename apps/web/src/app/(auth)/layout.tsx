import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@org/ui';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Header Branding */}
      <div className="mb-6">
        <Link href="/" className="hover:opacity-95 transition-opacity">
          <Logo size="lg" subtitle="Technical Blogging Platform" />
        </Link>
      </div>

      {/* Main Form Content */}
      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}

