import { Link } from 'react-router-dom';
import StudioShell from '../../../features/live-studio/studio/app/layout/StudioShell';
import GravityStickerField from '@/shared/components/projects/gravity-sticker-field/GravityStickerField';
import RippleFace from '@/shared/components/projects/ripple-face/RippleFace';
import SparkleWorkletPin from '@/shared/components/projects/sparkle-worklet-pin/SparkleWorkletPin';
import BubbleMouseTrail from '@/shared/components/projects/bubble-mouse-trail/BubbleMouseTrail';
import HolographicCursorTrail from '@/shared/components/projects/holographic-cursor-trail/HolographicCursorTrail';

export default function StudioProjects() {
  const breadcrumbs = [
    { label: 'Errl Hub', to: '/' },
    { label: 'Projects' },
  ];

  return (
    <StudioShell
      title="Projects"
      subtitle="Standalone visual effects wrapped for the Studio runtime. These are framework-free (HTML/CSS/JS) with accessibility/performance guards."
      breadcrumbs={breadcrumbs}
      actions={
        <Link
          to="/"
          className="inline-flex h-9 items-center justify-center rounded-md border border-white/20 px-3 text-sm text-zinc-200 transition-colors hover:bg-white/10"
        >
          Back to Hub
        </Link>
      }
      className="space-y-10"
      navActiveKey="studio"
    >
      <Section title="Gravity Sticker Field">
        <div className="rounded-lg border border-white/10 bg-black/40 p-8">
          <GravityStickerField />
        </div>
      </Section>

      <Section title="Ripple Face">
        <div className="rounded-lg border border-white/10 bg-black/40 p-8">
          <RippleFace />
        </div>
      </Section>

      <Section title="Sparkle Worklet Pin">
        <div className="rounded-lg border border-white/10 bg-black/40 p-8">
          <SparkleWorkletPin />
        </div>
      </Section>

      <Section title="Bubble Mouse Trail">
        <div className="rounded-lg border border-white/10 bg-black/40 p-8">
          <BubbleMouseTrail />
        </div>
      </Section>

      <Section title="Holographic Cursor Trail">
        <div className="rounded-lg border border-white/10 bg-black/40 p-8">
          <HolographicCursorTrail />
        </div>
      </Section>
    </StudioShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {children}
      </div>
    </section>
  );
}