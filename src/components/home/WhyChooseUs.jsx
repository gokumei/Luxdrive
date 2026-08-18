import Reveal from '@/components/Reveal';
import { ShieldCheck, Clock, Lock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const PILLARS = [
  { icon: Clock, titleKey: 'home.pillars.punctual' },
  { icon: Lock, titleKey: 'home.pillars.discreet' },
  { icon: Sparkles, titleKey: 'home.pillars.vehicles' },
  { icon: ShieldCheck, titleKey: 'home.pillars.service' }
];

export default function WhyChooseUs() {
  const { t } = useLanguage();
  return (
    <section className="py-24 md:py-40 border-t border-white/5">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">{t('home.whyLabel')}</span>
            <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">{t('home.standardTitle')}</h2>
            <p className="mt-6 text-lunar text-lg leading-relaxed">{t('home.whyBody')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.titleKey} delay={i * 0.1}>
              <div className="bg-obsidian p-8 md:p-10 h-full group hover:bg-secondary transition-colors duration-500">
                <p.icon className="text-gold mb-6" size={28} strokeWidth={1.25} />
                <h3 className="font-display text-2xl text-ivory">{t(p.titleKey)}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
