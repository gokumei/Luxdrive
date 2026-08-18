import Reveal from '@/components/Reveal';
import VehicleCard from '@/components/fleet/VehicleCard';
import { useVehicles } from '@/lib/useContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { localizeVehicle } from '@/i18n/dbContent';

export default function Fleet() {
  const { language, t } = useLanguage();
  const { vehicles, loading } = useVehicles();
  const localizedVehicles = vehicles.map((vehicle) => localizeVehicle(vehicle, language));

  return (
    <div className="pt-32 pb-24 md:pb-40">
      <section className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <span className="text-xs tracking-[0.3em] uppercase text-gold mb-5 block">{t('common.fleet')}</span>
          <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.02] max-w-3xl">
            {t('fleet.title')}
          </h1>
          <p className="mt-6 text-lunar text-lg max-w-xl leading-relaxed">
            {t('fleet.intro')}
          </p>
        </Reveal>
      </section>

      <section className="mt-16 md:mt-24 mx-auto max-w-[1500px] px-6 md:px-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {localizedVehicles.map((v, i) => (
              <Reveal key={v.id} delay={(i % 2) * 0.1}>
                <VehicleCard vehicle={v} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
