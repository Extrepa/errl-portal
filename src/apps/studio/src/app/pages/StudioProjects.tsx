import { Link } from 'react-router-dom';
import StudioShell from '../../../features/live-studio/studio/app/layout/StudioShell';
import GravityStickerField from '@/apps/projects/gravity-sticker-field/GravityStickerField';
import RippleFace from '@/apps/projects/ripple-face/RippleFace';
import SparkleWorkletPin from '@/apps/projects/sparkle-worklet-pin/SparkleWorkletPin';
import BubbleMouseTrail from '@/apps/projects/bubble-mouse-trail/BubbleMouseTrail';
import HolographicCursorTrail from '@/apps/projects/holographic-cursor-trail/HolographicCursorTrail';

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
        <GravityStickerField />
      </Section>

      <Section title="Ripple Face">
        <RippleFace />
      </Section>

      <Section title="Sparkle Worklet Pin">
        <SparkleWorkletPin />
      </Section>

      <Section title="Bubble Mouse Trail">
        <BubbleMouseTrail />
      </Section>

      <Section title="Holographic Cursor Trail">
        <HolographicCursorTrail />
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