import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Mail, MessageCircle, Clock, Send, UserRound } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';

/** @type {import("leaflet").LatLngTuple} */
const MAP_CENTER = [40.7589, -73.9851];

export default function Contact() {
  const { content } =
    /** @type {import("@/lib/useContent").SiteOutletContext} */ (useOutletContext());
  const phone = content?.company_phone || '+4917662538838';
  const phoneDisplay = phone === '+4917662538838' ? '+49 176 62538838' : phone;
  const email = content?.company_email || 'reservations@sovereignmotion.com';
  const whatsapp = content?.whatsapp_number || '+4917662538838';
  const whatsappDisplay = whatsapp === '+4917662538838' ? '+49 176 62538838' : whatsapp;
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;
  const hours = content?.business_hours || '24 Stunden täglich, 7 Tage die Woche, 365 Tage im Jahr';

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Bitte füllen Sie alle Felder aus.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) { toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein.'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Nachricht erhalten. Wir melden uns in Kürze.');
      setForm({ name: '', email: '', message: '' });
    }, 900);
  };

  return (
    <div className="pt-32 pb-24 md:pb-40">
      <section className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <span className="text-xs tracking-[0.3em] uppercase text-gold mb-5 block">Kontakt</span>
          <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.02] max-w-2xl">Kontakt zu LuxDrive</h1>
          <p className="mt-5 text-lunar text-lg">Wir sind für Ihre Fahrt da.</p>
        </Reveal>
      </section>

      <section className="mt-16 mx-auto max-w-[1500px] px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <Reveal>
          <div className="space-y-8">
            <div>
              <h2 className="text-xs tracking-[0.25em] uppercase text-gold mb-5">Kontaktdaten</h2>
              <ul className="space-y-5">
                <ContactRow icon={Phone} label="Telefon" value={phoneDisplay} href={`tel:${phone}`} />
                <ContactRow icon={UserRound} label="Geschäftsführer" value="Resul Düzgün" />
                <ContactRow icon={Mail} label="E-Mail" value={email} href={`mailto:${email}`} />
                <ContactRow icon={MessageCircle} label="WhatsApp" value={whatsappDisplay} href={whatsappUrl} />
                <ContactRow icon={Clock} label="Öffnungszeiten" value={hours} />
              </ul>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 h-14 px-8 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light transition-colors"
            >
              <MessageCircle size={18} /> Über WhatsApp kontaktieren
            </a>

            <div className="h-72 w-full overflow-hidden border border-white/10">
              <MapContainer center={MAP_CENTER} zoom={13} scrollWheelZoom={false} className="h-full w-full" style={{ background: '#0A0A0A' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap &copy; CARTO'
                />
                <Marker position={MAP_CENTER} />
              </MapContainer>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <form onSubmit={submit} className="glass p-6 md:p-10 space-y-6">
            <h2 className="font-display text-3xl text-ivory">Nachricht senden</h2>
            <Field label="Ihr Name">
              <input className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="E-Mail">
              <input type="email" className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Nachricht">
              <textarea rows={5} className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </Field>
            <button type="submit" disabled={sending} className="w-full h-14 bg-gold text-obsidian text-xs tracking-[0.25em] uppercase hover:bg-gold-light transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {sending ? 'Wird gesendet …' : <>Nachricht senden <Send size={16} /></>}
            </button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}

/**
 * @param {{
 *   icon: React.ElementType,
 *   label: React.ReactNode,
 *   value: React.ReactNode,
 *   href?: string
 * }} props
 */
function ContactRow({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-4 group">
      <Icon size={18} className="text-gold mt-1" />
      <div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-lunar mb-1">{label}</div>
        <div className="text-ivory group-hover:text-gold transition-colors">{value}</div>
      </div>
    </div>
  );
  return href ? <li><a href={href} target="_blank" rel="noreferrer" className="block">{content}</a></li> : <li>{content}</li>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.25em] uppercase text-lunar mb-2">{label}</label>
      {children}
    </div>
  );
}
