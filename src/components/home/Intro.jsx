import Reveal from '@/components/Reveal';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';

const ABOUT_IMG = '/images/about-luxury-interior.png';

export default function Intro({ content }) {
  const { t } = useLanguage();
  const title = content?.about_title || t('home.aboutDefaultTitle');
  const body = content?.about_body || t('home.aboutDefaultBody');

  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <Reveal>
          <div className="relative">
            <div className="absolute -top-4 -left-4 h-full w-full border border-gold/20" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src={ABOUT_IMG} alt={t('home.interiorAlt')} fittingType="fill" className="h-full w-full" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <span className="text-xs tracking-[0.3em] uppercase text-gold mb-6 block">{t('home.aboutLabel')}</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory leading-[1.05] mb-8">{title}</h2>
          <p className="text-lunar text-lg leading-[1.8] mb-8">{body}</p>
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 pt-6 border-t border-white/5">
            <div>
              <div className="font-display text-2xl text-gold">{t('home.punctual')}</div>
              <div className="text-xs tracking-[0.2em] uppercase text-lunar mt-1">{t('home.reliablePlanning')}</div>
            </div>
            <div className="hidden md:block h-10 w-px bg-white/10" />
            <div>
              <div className="font-display text-2xl text-gold">{t('home.comfortable')}</div>
              <div className="text-xs tracking-[0.2em] uppercase text-lunar mt-1">{t('home.premiumVehicles')}</div>
            </div>
            <div className="hidden md:block h-10 w-px bg-white/10" />
            <div>
              <div className="font-display text-2xl text-gold">{t('home.discreet')}</div>
              <div className="text-xs tracking-[0.2em] uppercase text-lunar mt-1">{t('home.professionalService')}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
