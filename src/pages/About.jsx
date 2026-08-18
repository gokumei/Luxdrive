import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Crown, Plane, Briefcase, Calendar, Heart, Lock, Clock } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Image } from '@/components/ui/image';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const ABOUT_IMG = '/images/about-luxury-interior.png';

const PILLAR_ICONS = [ShieldCheck, Crown, Plane, Briefcase, Calendar, Heart, Lock, Clock];

export default function About() {
  const { t } = useLanguage();
  const { content } =
    /** @type {import("@/lib/useContent").SiteOutletContext} */ (useOutletContext());
  const title = content?.about_title || t('home.aboutDefaultTitle');
  const body = content?.about_body || t('home.aboutDefaultBody');
  const pillars = PILLAR_ICONS.map((icon, index) => ({ icon, ...t('about.pillars')[index] }));

  return (
    <div className="pt-32 pb-24 md:pb-40">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={ABOUT_IMG} alt={t('about.imageAlt')} fittingType="fill" className="h-full w-full" />
          <div className="absolute inset-0 bg-obsidian/75" />
        </div>
        <div className="relative h-full mx-auto max-w-[1500px] px-6 md:px-12 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-gold mb-5 block">{t('about.label')}</span>
            <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.02] max-w-2xl">{title}</h1>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <Reveal>
            <p className="text-lunar text-xl md:text-2xl leading-[1.7] font-display">{body}</p>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-[1500px] px-6 md:px-12 py-24 md:py-32">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">{t('about.whyLabel')}</span>
              <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">{t('about.standard')}</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 0.08}>
                <div className="bg-obsidian p-8 md:p-10 h-full hover:bg-secondary transition-colors duration-500">
                  <p.icon className="text-gold mb-5" size={26} strokeWidth={1.25} />
                  <h3 className="font-display text-xl text-ivory mb-3">{p.title}</h3>
                  <p className="text-lunar text-sm leading-relaxed">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-ivory leading-[1.05] mb-8">{t('about.plan')}</h2>
            <Link to="/booking" className="inline-flex items-center justify-center h-14 px-10 bg-gold text-obsidian text-xs tracking-[0.25em] uppercase hover:bg-gold-light transition-colors">
              {t('common.bookVipTaxi')}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
