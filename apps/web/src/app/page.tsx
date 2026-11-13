'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth, useCurrentUser, useLogout } from '@org/internal-sdk';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@org/ui';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

const TOPICS = [
  'System Design',
  'Next.js 15',
  'TypeScript',
  'NestJS',
  'MongoDB',
  'Cloudflare R2',
  'Microservices',
  'Distributed Caching',
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Technical Blogging Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            Where Great Engineers Share{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Deep Technical Knowledge
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Read, write, and explore in-depth engineering articles, system architecture breakdowns,
            and developer tutorials powered by a high-performance Next.js and NestJS monorepo.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Topic Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {TOPICS.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-2xs hover:border-indigo-300 transition-colors"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Status & Monorepo Overview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-10">
        {/* User Session Card (if logged in) */}
        {isAuthenticated && user && (
          <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name[0]?.toUpperCase() : 'U'}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Welcome, {user.name}!
                    </CardTitle>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    Role: {user.role}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 text-xs text-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Account Status</span>
                  <span className="font-semibold text-slate-800">{user.status || 'Active Reader'}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Auth Provider</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {user.provider || 'Credentials'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Authentication</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Better Auth Verified
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Architecture Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Next.js 15 Frontend
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 leading-relaxed">
              Modern App Router architecture optimized for technical content rendering, SSR, ISR, and Core Web Vitals.
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                NestJS Fastify API
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 leading-relaxed">
              High-throughput backend server with MongoDB Mongoose repositories, WebSocket real-time events, and Cloudflare R2 storage.
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Unified Better Auth
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 leading-relaxed">
              Session authentication with multi-step OTP verification, Google OAuth, and secure HTTP-only cookies.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
