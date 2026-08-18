import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';

const HERO_IMG = '/images/hero-luxury-vehicle.png';

export default function Hero({ content }) {
  const { t } = useLanguage();
  const headline = content?.hero_headline || t('hero.defaultTitle');
  const subheadline = content?.hero_subheadline || t('hero.defaultSubtitle');

  return (
    <section className="relative h-screen min-h-[600px] supports-[height:100svh]:h-svh sm:min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMG}
          alt={t('hero.imageAlt')}
          fittingType="fill"
          className="h-full w-full animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      </div>

      {/* Pinstripe axis */}
      <div className="absolute top-0 bottom-0 left-1/2 hidden lg:block w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent" />

      <div className="relative h-full mx-auto max-w-[1500px] px-6 md:px-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="block text-xs tracking-[0.3em] uppercase text-gold mb-6">LuxDrive</span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-ivory text-shadow-lux">
            {headline}
          </h1>
          <p className="mt-8 text-lg md:text-xl text-lunar max-w-xl leading-relaxed">
            {subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-8 left-6 right-6 glass px-6 py-5 sm:bottom-12 sm:left-auto sm:right-6 sm:max-w-xs sm:px-8 sm:py-6 md:right-12"
        >
          <Link to="/booking" className="group flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs tracking-[0.25em] uppercase text-gold mb-1">VIP Taxi</span>
              <span className="font-display text-2xl text-ivory">{t('common.bookVipTaxi')}</span>
            </div>
            <ChevronRight className="text-gold transition-transform duration-300 group-hover:translate-x-1" size={22} />
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-lunar">{t('hero.scroll')}</span>
        <span className="h-10 w-px bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
}
