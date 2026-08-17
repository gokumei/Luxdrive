import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Clock } from 'lucide-react';

export default function Footer({ content }) {
  const phone = content?.company_phone || '+4917662538838';
  const phoneDisplay = phone === '+4917662538838' ? '+49 176 62538838' : phone;
  const email = content?.company_email || 'reservations@sovereignmotion.com';
  const whatsapp = content?.whatsapp_number || '+4917662538838';
  const whatsappDisplay = whatsapp === '+4917662538838' ? '+49 176 62538838' : whatsapp;
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;
  const hours = content?.business_hours || '24/7 · 365 Tage im Jahr';

  return (
    <footer className="relative bg-obsidian border-t border-white/5 overflow-hidden">
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <img
              src="/images/luxdrive-logo-main.png"
              alt="LuxDrive VIP Taxi"
              className="w-60 max-w-full h-auto object-contain object-left"
            />
            <p className="mt-5 text-lunar leading-relaxed text-sm">
              VIP-Fahrten auf höchstem Niveau.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.25em] uppercase text-gold mb-5">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/fleet" className="flex min-h-11 items-center text-lunar hover:text-gold transition-colors">Unsere Premium-Fahrzeuge</Link></li>
              <li><Link to="/about" className="flex min-h-11 items-center text-lunar hover:text-gold transition-colors">Über LuxDrive</Link></li>
              <li><Link to="/booking" className="flex min-h-11 items-center text-lunar hover:text-gold transition-colors">VIP Taxi buchen</Link></li>
              <li><Link to="/contact" className="flex min-h-11 items-center text-lunar hover:text-gold transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.25em] uppercase text-gold mb-5">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li><a href={`tel:${phone}`} className="flex min-h-11 items-center gap-3 py-2 text-lunar hover:text-gold transition-colors"><Phone size={15} className="shrink-0" /> <span className="min-w-0 break-all">{phoneDisplay}</span></a></li>
              <li><a href={`mailto:${email}`} className="flex min-h-11 items-center gap-3 py-2 text-lunar hover:text-gold transition-colors"><Mail size={15} className="shrink-0" /> <span className="min-w-0 break-all">{email}</span></a></li>
              {whatsapp && (
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 py-2 text-lunar hover:text-gold transition-colors">
                    <MessageCircle size={15} className="shrink-0" /> <span className="min-w-0 break-words">WhatsApp · {whatsappDisplay}</span>
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3 py-2 text-lunar"><Clock size={15} className="mt-0.5 shrink-0" /> <span className="min-w-0 break-words">{hours}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-lunar tracking-wide">© {new Date().getFullYear()} LuxDrive. Alle Rechte vorbehalten.</p>
          <p className="text-xs text-lunar tracking-[0.2em] uppercase">LuxDrive – VIP-Fahrten auf höchstem Niveau.</p>
        </div>
      </div>
    </footer>
  );
}
