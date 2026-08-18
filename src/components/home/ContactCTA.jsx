import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';

const CTA_IMG = '/images/contact-cta-luxury-vehicle.png';

export default function ContactCTA() {
  const { t } = useLanguage();
  return (
    <section className="relative h-[60vh] min-h-[420px] overflow-hidden border-t border-white/5">
      <div className="absolute inset-0">
        <Image src={CTA_IMG} alt={t('home.ctaImageAlt')} fittingType="fill" className="h-full w-full" />
        <div className="absolute inset-0 bg-obsidian/70" />
      </div>
      <div className="relative h-full mx-auto max-w-[1500px] px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl md:text-6xl lg:text-7xl text-ivory leading-[1.05] max-w-3xl"
        >
          {t('home.ctaTitle')}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-10"
        >
          <Link
            to="/booking"
            className="group inline-flex w-full max-w-sm items-center justify-center gap-3 h-14 px-4 sm:w-auto sm:px-10 bg-gold text-obsidian text-xs tracking-[0.25em] uppercase hover:bg-gold-light transition-colors duration-300"
          >
            {t('common.bookVipTaxi')}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
