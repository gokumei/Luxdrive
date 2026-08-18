import { Link } from 'react-router-dom';
import { Users, Briefcase, ArrowUpRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import Reveal from '@/components/Reveal';
import { useVehicles } from '@/lib/useContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { localizeVehicle } from '@/i18n/dbContent';

export default function FleetPreview() {
  const { language, t } = useLanguage();
  const { vehicles } = useVehicles();
  const featured = vehicles.slice(0, 3).map((vehicle) => localizeVehicle(vehicle, language));

  return (
    <section className="py-24 md:py-40 border-t border-white/5">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">{t('common.fleet')}</span>
              <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">{t('fleet.title')}</h2>
              <p className="mt-5 text-lunar text-lg">{t('home.fleetSubtitle')}</p>
            </div>
            <Link to="/fleet" className="group inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-lunar hover:text-gold transition-colors">
              {t('home.viewFleet')} <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.12}>
              <Link to={`/booking/${encodeURIComponent(v.name)}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {v.image_url && (
                    <Image src={v.image_url} alt={v.name} fittingType="fill" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-4 text-xs text-lunar mb-3">
                      <span className="flex items-center gap-1.5"><Users size={13} /> {v.passenger_capacity}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={13} /> {v.luggage_capacity}</span>
                    </div>
                    <h3 className="font-display text-2xl text-ivory group-hover:text-gold transition-colors">{v.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="text-xs tracking-[0.2em] uppercase text-lunar">{t('fleet.startingAt')}</span>
                  <span className="font-display text-2xl text-gold">${v.starting_price}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
