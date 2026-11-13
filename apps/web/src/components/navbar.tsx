'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth, useCurrentUser, useLogout } from '@org/internal-sdk';
import { Button, Logo } from '@org/ui';
import { LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <Logo size="sm" title="TechBlogs" subtitle="Engineering & Tech" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Articles
          </Link>
          <Link href="/topics" className="hover:text-indigo-600 transition-colors">
            Topics
          </Link>
          <Link href="/courses" className="hover:text-indigo-600 transition-colors">
            Courses
          </Link>
        </nav>

        {/* Right Side: Auth / CTA */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-20 h-8 bg-slate-100 rounded animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex text-xs font-medium text-slate-700 items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                {user.name || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
