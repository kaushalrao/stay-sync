"use client";

import React from 'react';
import { Loader2, Sparkles, Hand, Settings, Wrench, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TypewriterEffect } from '@components/ui/TypewriterEffect';
import { useApp } from '@components/providers/AppProvider';
import { FeatureCard } from '@components/FeatureCard';

export default function HomePage() {
  const { user, loading } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 size={48} className="animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-start md:justify-center min-h-[60vh] md:min-h-[70vh] gap-4 md:gap-12 animate-fade-in max-w-7xl mx-auto w-full px-4 py-8 md:py-10 selection:bg-indigo-500/30">

      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen" />

      <div className="text-center space-y-4 md:space-y-6 max-w-3xl relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-medium text-indigo-300 uppercase tracking-wider shadow-lg backdrop-blur-md mb-6 animate-[fadeIn_0.5s_ease-out]">
          <Sparkles size={12} className="text-indigo-400" />
          <span>The Host Operating System</span>
        </div>

        <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter drop-shadow-sm flex flex-col gap-2 md:gap-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 h-[1.3em] pb-2">
            <TypewriterEffect words={["Simplify Hospitality", "Guest Greeting", "Track Maintenance"]} />
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-xl font-light leading-relaxed max-w-2xl mx-auto px-4 mt-2 mb-4">
          Modern tools for seamless hospitality management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-6xl mx-auto relative z-10">

        <FeatureCard
          href="/greeter"
          color="indigo"
          label="Communication"
          title={<>Guest<br />Greeting</>}
          description="Create personalized welcome messages instantly."
          icon={Hand}
          iconRotation="rotate-12"
          iconHoverRotation="group-hover:rotate-6"
        />

        <FeatureCard
          href="/maintenance"
          color="rose"
          label="Operations"
          title={<>Issue<br />Tracker</>}
          description="Log and monitor property maintenance tasks."
          icon={Wrench}
          iconRotation=""
          iconHoverRotation="group-hover:-rotate-12"
        />

        <FeatureCard
          href="/guests"
          color="orange"
          label="CRM"
          title={<>Guest<br />Directory</>}
          description="Manage your guest history and details."
          icon={Users}
          iconRotation="-rotate-12"
          iconHoverRotation="group-hover:rotate-0"
        />

        <FeatureCard
          href="/settings"
          color="cyan"
          label="System"
          title={<>App<br />Config</>}
          description="Manage properties and templates."
          icon={Settings}
          iconRotation=""
          iconHoverRotation="group-hover:rotate-12"
        />

      </div>
    </div>
  );
}