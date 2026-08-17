import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import Reveal from '@/components/Reveal';

export default function Booking() {
  const { vehicle } = useParams();
  const preset = vehicle ? decodeURIComponent(vehicle) : '';
  const [done, setDone] = useState(false);

  return (
    <div className="pt-24 pb-24 md:pt-32 md:pb-40">
      <section className="mx-auto max-w-3xl px-6 md:px-12">
        <Reveal>
          <span className="text-xs tracking-[0.3em] uppercase text-gold mb-5 block">Buchung</span>
          <h1 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">VIP Taxi buchen</h1>
          <p className="mt-5 text-lunar text-lg leading-relaxed">
            <span className="block text-ivory mb-2">Planen Sie Ihre Fahrt</span>
            Abholort, Ziel und gewünschtes Fahrzeug auswählen – den Rest übernehmen wir.
          </p>
        </Reveal>

        <div className="mt-12">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="glass p-6 sm:p-10 md:p-16 text-center"
            >
              <div className="mx-auto mb-8 h-16 w-16 rounded-full border border-gold flex items-center justify-center">
                <Check size={28} className="text-gold" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-ivory mb-4">Buchungsanfrage erhalten</h2>
              <p className="text-lunar text-lg leading-relaxed max-w-md mx-auto">
                Vielen Dank. Ihre Buchungsanfrage wurde erfolgreich übermittelt. Wir kontaktieren Sie in Kürze zur Bestätigung.
              </p>
              <button
                onClick={() => setDone(false)}
                className="mt-10 h-12 px-8 border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-obsidian transition-all"
              >
                Weitere Fahrt buchen
              </button>
            </motion.div>
          ) : (
            <BookingForm presetVehicle={preset} onSuccess={() => setDone(true)} />
          )}
        </div>
      </section>
    </div>
  );
}
