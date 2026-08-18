import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, MapPin, Calendar, Clock, Users, Luggage, Plane, Baby, Handshake, RefreshCw, GitBranch } from 'lucide-react';

import { useVehicles } from '@/lib/useContent';
import { Image } from '@/components/ui/image';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import { localizeVehicle } from '@/i18n/dbContent';
import { apiUrl } from '@/lib/apiConfig';

const STEP_KEYS = ['booking.steps.journey', 'booking.steps.vehicle', 'booking.steps.contact'];

export default function BookingForm({ presetVehicle, onSuccess }) {
  const { language, t } = useLanguage();
  const { vehicles } = useVehicles();
  const available = vehicles.filter((v) => v.available).map((vehicle) => localizeVehicle(vehicle, language));
  const steps = STEP_KEYS.map(t);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pickup_location: '', destination: '', date: '', time: '',
    passengers: 1, suitcases: 0,
    vehicle: presetVehicle || '',
    first_name: '', last_name: '', email: '', phone_number: '',
    flight_number: '', special_requests: '',
    child_seat: false, meet_greet: false, return_journey: false, extra_stops: false
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedVehicle = vehicles.find((v) => v.name === form.vehicle);
  const estimatedPrice = selectedVehicle
    ? selectedVehicle.starting_price
      + (form.return_journey ? selectedVehicle.starting_price : 0)
      + (form.child_seat ? 15 : 0)
      + (form.meet_greet ? 25 : 0)
      + (form.extra_stops ? 40 : 0)
    : null;

  const validateStep = () => {
    if (step === 0) {
      if (!form.pickup_location || !form.destination || !form.date || !form.time)
        return t('booking.errors.journeyRequired');
    }
    if (step === 1 && !form.vehicle) return t('booking.errors.vehicleRequired');
    if (step === 2) {
      if (!form.first_name || !form.last_name || !form.email || !form.phone_number)
        return t('booking.errors.contactRequired');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return t('booking.errors.invalidEmail');
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(s + 1, 2));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
  console.log("SUBMIT CLICKED");

  const err = validateStep();
  if (err) {
    toast.error(err);
    return;
  }

  setSubmitting(true);

  try {
    const vehicle = vehicles.find((v) => v.name === form.vehicle);

    if (!vehicle) {
      throw new Error("VEHICLE_REQUIRED");
    }

    console.log("Sending booking...");

    const response = await fetch(apiUrl("/api/bookings"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicle_id: vehicle.id,
        customer_name: `${form.first_name} ${form.last_name}`.trim(),
        customer_email: form.email,
        customer_phone: form.phone_number,
        pickup_location: form.pickup_location,
        dropoff_location: form.destination,
        pickup_date: form.date,
        pickup_time: form.time,
        passengers: Number(form.passengers),
        special_requests: form.special_requests,
      }),
    });

    console.log("Response status:", response.status);

    await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error("BOOKING_SUBMIT_FAILED");
    }

    toast.success(t('booking.successToast'));
    onSuccess();
  } catch (err) {
    console.error("FETCH ERROR:", err);
    toast.error(
      err.message === "VEHICLE_REQUIRED"
        ? t('booking.errors.vehicleRequired')
        : t('booking.errors.generic')
    );
  } finally {
    setSubmitting(false);
  }
};

  const inputCls = 'w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory placeholder:text-lunar/60 outline-none transition-colors text-base';
  const labelCls = 'block text-[10px] tracking-[0.25em] uppercase text-lunar mb-2';
  console.log("THIS IS THE BOOKING FORM FILE");
  return (

    <div className="glass p-6 md:p-10">
      {/* Stepper */}
      <div className="mb-5 md:hidden" aria-live="polite">
        <span className="block text-[10px] tracking-[0.25em] uppercase text-lunar">
          {t('booking.progress', { current: step + 1, total: steps.length })}
        </span>
        <span className="mt-1 block font-display text-xl text-ivory">{steps[step]}</span>
      </div>
      <div className="flex items-center justify-between mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs border transition-all duration-300 ${i <= step ? 'bg-gold border-gold text-obsidian' : 'border-white/15 text-lunar'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span className={`text-xs tracking-[0.2em] uppercase hidden md:inline ${i <= step ? 'text-ivory' : 'text-lunar'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-4 ${i < step ? 'bg-gold' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="journey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Field id="booking-pickup" icon={MapPin} label={t('booking.pickup')}>
                <input id="booking-pickup" autoComplete="street-address" className={inputCls} value={form.pickup_location} onChange={(e) => set('pickup_location', e.target.value)} placeholder={t('booking.pickupPlaceholder')} />
              </Field>
              <Field id="booking-destination" icon={MapPin} label={t('booking.destination')}>
                <input id="booking-destination" autoComplete="off" className={inputCls} value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder={t('booking.destinationPlaceholder')} />
              </Field>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Field id="booking-date" icon={Calendar} label={t('booking.pickupDate')}>
                <input id="booking-date" type="date" className={inputCls} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </Field>
              <Field id="booking-time" icon={Clock} label={t('booking.pickupTime')}>
                <input id="booking-time" type="time" className={inputCls} value={form.time} onChange={(e) => set('time', e.target.value)} />
              </Field>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Field id="booking-passengers" icon={Users} label={t('booking.passengers')}>
                <input id="booking-passengers" type="number" inputMode="numeric" min="1" className={inputCls} value={form.passengers} onChange={(e) => set('passengers', e.target.value)} />
              </Field>
              <Field id="booking-suitcases" icon={Luggage} label={t('booking.luggage')}>
                <input id="booking-suitcases" type="number" inputMode="numeric" min="0" className={inputCls} value={form.suitcases} onChange={(e) => set('suitcases', e.target.value)} />
              </Field>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="fleet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {available.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => set('vehicle', v.name)}
                  className={`group relative overflow-hidden text-left border transition-all duration-300 ${form.vehicle === v.name ? 'border-gold' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className="aspect-[4/3] bg-secondary">
                    {v.image_url && <Image src={v.image_url} alt={v.name} fittingType="fill" className="h-full w-full" />}
                  </div>
                  <div className="p-4">
                    <div className="font-display text-lg text-ivory">{v.name}</div>
                    <div className="text-xs text-lunar mt-1">{t('fleet.passengers', { count: v.passenger_capacity })} · {t('fleet.luggagePieces', { count: v.luggage_capacity })}</div>
                    <div className="text-gold font-display text-xl mt-2">${v.starting_price}</div>
                  </div>
                  {form.vehicle === v.name && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gold flex items-center justify-center"><Check size={14} className="text-obsidian" /></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Field id="booking-first-name" label={t('booking.firstName')}><input id="booking-first-name" autoComplete="given-name" className={inputCls} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} /></Field>
              <Field id="booking-last-name" label={t('booking.lastName')}><input id="booking-last-name" autoComplete="family-name" className={inputCls} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} /></Field>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Field id="booking-email" label={t('common.email')}><input id="booking-email" type="email" inputMode="email" autoComplete="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
              <Field id="booking-phone" label={t('booking.phone')}><input id="booking-phone" type="tel" inputMode="tel" autoComplete="tel" className={inputCls} value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} /></Field>
            </div>
            <Field id="booking-flight-number" icon={Plane} label={t('booking.flight')}><input id="booking-flight-number" type="text" autoComplete="off" className={inputCls} value={form.flight_number} onChange={(e) => set('flight_number', e.target.value)} /></Field>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Toggle icon={Baby} label={t('booking.childSeat')} active={form.child_seat} onClick={() => set('child_seat', !form.child_seat)} />
              <Toggle icon={Handshake} label={t('booking.meetGreet')} active={form.meet_greet} onClick={() => set('meet_greet', !form.meet_greet)} />
              <Toggle icon={RefreshCw} label={t('booking.returnJourney')} active={form.return_journey} onClick={() => set('return_journey', !form.return_journey)} />
              <Toggle icon={GitBranch} label={t('booking.additionalStops')} active={form.extra_stops} onClick={() => set('extra_stops', !form.extra_stops)} />
            </div>

            <Field id="booking-special-requests" label={t('booking.specialRequests')}><textarea id="booking-special-requests" rows={3} className={inputCls + ' resize-none'} value={form.special_requests} onChange={(e) => set('special_requests', e.target.value)} /></Field>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="text-left self-start sm:self-auto">
          <span className="block text-[10px] tracking-[0.25em] uppercase text-lunar">{t('booking.estimatedPrice')}</span>
          <span className="font-display text-3xl text-gold">{estimatedPrice ? `$${estimatedPrice}` : '—'}</span>
        </div>
        <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:items-center">
          {step > 0 && (
            <button onClick={back} className="h-12 w-full px-6 text-xs tracking-[0.2em] uppercase text-lunar hover:text-ivory border border-white/10 transition-colors inline-flex items-center justify-center gap-2 sm:w-auto">
              <ChevronLeft size={16} /> {t('common.back')}
            </button>
          )}
          {step < 2 ? (
            <button onClick={next} className="h-12 w-full px-8 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light transition-colors inline-flex items-center justify-center gap-2 sm:w-auto">
              {t('common.continue')} <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="h-12 w-full px-5 sm:px-8 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 sm:w-auto">
              {submitting ? t('booking.submitting') : t('common.bookVipTaxi')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   id: string,
 *   icon?: React.ElementType,
 *   label: React.ReactNode,
 *   children: React.ReactNode
 * }} props
 */
function Field({ id, icon: Icon, label, children }) {
  const labelCls = 'block text-[10px] tracking-[0.25em] uppercase text-lunar mb-2';
  return (
    <div>
      <label htmlFor={id} className={labelCls + ' flex items-center gap-2'}>
        {Icon && <Icon size={12} className="text-gold" />} {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-4 border transition-all duration-300 ${active ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'}`}
    >
      <Icon size={16} className={active ? 'text-gold' : 'text-lunar'} />
      <span className={`text-sm ${active ? 'text-ivory' : 'text-lunar'}`}>{label}</span>
      <span className={`ml-auto h-4 w-4 rounded-full border flex items-center justify-center ${active ? 'bg-gold border-gold' : 'border-white/20'}`}>
        {active && <Check size={10} className="text-obsidian" />}
      </span>
    </button>
  );
}
