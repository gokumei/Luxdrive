import Reveal from '@/components/Reveal';
import { ShieldCheck, Clock, Lock, Sparkles } from 'lucide-react';

const PILLARS = [
  { icon: Clock, title: 'Pünktlich & zuverlässig' },
  { icon: Lock, title: 'Diskret & professionell' },
  { icon: Sparkles, title: 'Hochwertige VIP-Fahrzeuge' },
  { icon: ShieldCheck, title: 'Service mit Anspruch' }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 md:py-40 border-t border-white/5">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">Warum LuxDrive</span>
            <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">Der LuxDrive Standard</h2>
            <p className="mt-6 text-lunar text-lg leading-relaxed">Professionelle Fahrer, hochwertige VIP-Fahrzeuge und zuverlässiger Service bei jeder Fahrt.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="bg-obsidian p-8 md:p-10 h-full group hover:bg-secondary transition-colors duration-500">
                <p.icon className="text-gold mb-6" size={28} strokeWidth={1.25} />
                <h3 className="font-display text-2xl text-ivory">{p.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
