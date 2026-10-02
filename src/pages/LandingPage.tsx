import React from 'react';
import { useAuth } from '../lib/auth-context';
import { getClusters, getLocalities } from '../lib/db';
import { Shield, Users, Calendar, FileText, Lock, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, role } = useAuth();
  const clusters = getClusters('public');
  const primaryCluster = clusters[0];
  const localities = primaryCluster ? getLocalities(primaryCluster.id) : [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#043327] py-16 px-4 text-white sm:py-24 sm:px-6 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/60 px-3.5 py-1 text-xs font-semibold text-emerald-200 border border-emerald-500/30 backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Community Portal · {primaryCluster?.region || 'Kajiado South'}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-50 sm:text-5xl text-balance">
            KIMANA CLUSTER PORTAL
          </h1>

          <p className="mx-auto max-w-2xl text-base text-emerald-100/90 sm:text-lg text-balance leading-relaxed">
            One secure, organized place for approved cluster information, activities, resources and community coordination.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-400 px-6 py-2.5 text-sm font-bold text-emerald-950 shadow-md hover:bg-emerald-300 transition active:scale-98"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('/login')}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-400 px-6 py-2.5 text-sm font-bold text-emerald-950 shadow-md hover:bg-emerald-300 transition active:scale-98"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onNavigate('/request-access')}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-900/70 px-6 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-800/80 transition active:scale-98"
                >
                  <span>Request Access</span>
                </button>
              </>
            )}
          </div>

          {/* Trust Principles Row */}
          <div className="pt-8 border-t border-emerald-800/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-emerald-200/90">
            <div className="flex items-center justify-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Permission Enforced</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Shield className="h-4 w-4 text-teal-300" />
              <span className="font-medium">PostgreSQL RLS</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Approved Information</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Users className="h-4 w-4 text-amber-300" />
              <span className="font-medium">Multi-Cluster Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principle & Information Governance */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Information Governance
            </span>
            <h2 className="text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl">
              An Information and Coordination Platform
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              The Kimana Cluster Portal supports existing administrative arrangements and does not invent authorities,
              policies, official schedules, or organizational decisions. Administrators control what information enters
              the system and what is released to verified members or the public.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-emerald-900/5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Public Information</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                General community announcements, public gatherings, and cluster overview visible to all visitors.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                <span>Member Information</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Study circles, devotional meetings, youth groups, and approved educational materials for verified members.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-800" />
                <span>Administrative Oversight</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access request reviews, locality assignments, audit trails, and document approvals under strict RLS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Localities Directory */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <MapPin className="h-3.5 w-3.5" />
            <span>Localities in {primaryCluster?.name}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl">
            Coordinated Community Localities
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Community activities are organized across designated localities. Private personal details are never exposed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {localities.map((loc) => (
            <div
              key={loc.id}
              className="rounded-xl border border-emerald-900/10 bg-white p-5 shadow-xs transition hover:border-emerald-600/30 hover:shadow-sm"
            >
              <h3 className="text-base font-bold text-emerald-950">{loc.name}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {loc.description || 'Active coordination locality'}
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-900/5 flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </span>
                <span className="text-emerald-900/60">Kimana</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Access Request Prompt */}
      {!isAuthenticated && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
          <div className="rounded-2xl bg-gradient-to-r from-[#022c22] to-[#064e3b] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-emerald-500/20">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-bold sm:text-xl text-emerald-50">Are you a Kimana community member?</h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl">
                Submit an access request to view cluster study circles, children&apos;s classes, devotional meetings,
                and approved resources. Requests are carefully reviewed by cluster administrators.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/request-access')}
              className="min-h-[44px] whitespace-nowrap rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-emerald-950 shadow-sm hover:bg-emerald-300 transition active:scale-98"
            >
              Request Access
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
