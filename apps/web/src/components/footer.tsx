'use client';

import { Logo } from '@org/ui';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo size="sm" title="TechBlogs" />
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TechBlogs Platform. Built with Next.js, NestJS & MongoDB.
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-slate-900 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
