import { Users, Briefcase, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatPrice } from '@/lib/formatPrice';

export default function VehicleCard({ vehicle }) {
  const { language, t } = useLanguage();
  return (
    <div className="group glass overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {vehicle.image_url && (
          <Image src={vehicle.image_url} alt={vehicle.name} fittingType="fill" className="h-full w-full transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
        {!vehicle.available && (
          <div className="absolute top-4 right-4 bg-obsidian/80 border border-white/10 px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-lunar">
            {t('fleet.unavailable')}
          </div>
        )}
        {vehicle.category && (
          <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.25em] uppercase text-gold">
            {vehicle.category}
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="font-display text-2xl md:text-3xl text-ivory mb-2">{vehicle.name}</h3>
        {vehicle.description && <p className="text-lunar text-sm leading-relaxed mb-6">{vehicle.description}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-lunar text-sm">
            <Users size={16} className="text-gold" /> {t('fleet.passengers', { count: vehicle.passenger_capacity })}
          </div>
          <div className="flex items-center gap-2 text-lunar text-sm">
            <Briefcase size={16} className="text-gold" /> {t('fleet.luggage', { count: vehicle.luggage_capacity })}
          </div>
        </div>

        {vehicle.features && vehicle.features.length > 0 && (
          <ul className="space-y-2 mb-8">
            {vehicle.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-lunar text-sm">
                <Check size={14} className="text-gold" /> {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="block text-[10px] tracking-[0.25em] uppercase text-lunar mb-1">{t('fleet.startingAt')}</span>
            <span className="font-display text-3xl text-gold">{formatPrice(vehicle.starting_price, language)}</span>
          </div>
          <Link
            to={`/booking/${encodeURIComponent(vehicle.name)}`}
            className={`inline-flex w-full items-center justify-center h-12 px-4 sm:w-auto sm:px-6 text-xs tracking-[0.2em] uppercase transition-all duration-300 ${
              vehicle.available
                ? 'border border-gold/40 text-gold hover:bg-gold hover:text-obsidian'
                : 'border border-white/10 text-lunar pointer-events-none opacity-50'
            }`}
          >
            {t('fleet.bookVehicle')}
          </Link>
        </div>
      </div>
    </div>
  );
}
