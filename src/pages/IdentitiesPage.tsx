import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';

import IdentityWheel from '@/components/identities/IdentityWheel';
import IdentityDetailSheet from '@/components/identities/IdentityDetailSheet';

import { ARCHETYPES } from '@/constants/archetypes';
import { IDENTITY_LIMITS } from '@/constants/limits';
import { useIdentityStore } from '@/store/identityStore';
import type { ArchetypeTemplate } from '@/types/identity';
import { useAuthStore } from '@/store/authStore';

const IdentitiesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const identities = useIdentityStore((s) => s.identities);

  const [selectedTemplate, setSelectedTemplate] = useState<ArchetypeTemplate | null>(
    null
  );

  const boundTemplateIds = useMemo(
    () => identities.map((i) => i.templateId),
    [identities]
  );

  const bindingForSelected = useMemo(() => {
    if (!selectedTemplate) return null;
    return identities.find((i) => i.templateId === selectedTemplate.id) ?? null;
  }, [selectedTemplate, identities]);

  const handleSelect = useCallback((template: ArchetypeTemplate) => {
    setSelectedTemplate(template);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
        <ParticleBackground />
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-16 relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to bind identities</h1>
          <p className="text-slate-400">
            Your anchors persist across devices only when you&apos;re signed in.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      <ParticleBackground />
      <Header />
      <NavMenu />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h1
            className="text-4xl md:text-5xl font-bold text-white uppercase tracking-[0.18em]"
            style={{
              textShadow:
                '2px 0 0 rgba(0, 255, 255, 0.3), -2px 0 0 rgba(217, 70, 239, 0.3), 0 0 24px rgba(168,85,247,0.35)',
            }}
          >
            Identities
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">
            Choose your anchors &mdash; up to {IDENTITY_LIMITS.MAX_ACTIVE} at a time
          </p>
          <p className="mt-4 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Scroll the wheel. Tap an archetype to inspect its ladder and bind it.
            The ones you bind become today&apos;s non-negotiable tasks.
          </p>
        </motion.div>

        <div
          className="mt-8 rounded-3xl border border-purple-500/20 bg-slate-950/50 backdrop-blur-sm relative overflow-hidden"
          style={{
            boxShadow:
              '0 0 40px -10px rgba(76, 29, 149, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.05)',
          }}
        >
          <IdentityWheel
            templates={ARCHETYPES}
            boundTemplateIds={boundTemplateIds}
            onSelect={handleSelect}
          />
        </div>

        {/* Currently bound summary */}
        <div className="mt-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3 text-center">
            Your Anchors &mdash; {identities.length} / {IDENTITY_LIMITS.MAX_ACTIVE}
          </h2>
          {identities.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              No identities bound yet.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {identities.map((identity) => {
                const template = ARCHETYPES.find((t) => t.id === identity.templateId);
                if (!template) return null;
                return (
                  <button
                    key={identity.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/40 bg-slate-900/70 hover:bg-slate-900 text-sm transition-colors"
                  >
                    <span className="text-lg leading-none">{template.glyph}</span>
                    <span className="text-white font-semibold">{template.name}</span>
                    <span className="text-xs font-mono text-cyan-200/70 uppercase tracking-[0.18em]">
                      Lv {identity.level}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <IdentityDetailSheet
        template={selectedTemplate}
        binding={bindingForSelected}
        boundCount={identities.length}
        isOpen={Boolean(selectedTemplate)}
        onClose={handleCloseSheet}
      />
    </div>
  );
};

export default IdentitiesPage;
