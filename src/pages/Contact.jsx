import { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, Send, UserRound } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import { apiUrl } from '@/lib/apiConfig';

export default function Contact() {
  const { t } = useLanguage();
  const { content } =
    /** @type {import("@/lib/useContent").SiteOutletContext} */ (useOutletContext());
  const phone = content?.company_phone || '+4917662538838';
  const phoneDisplay = phone === '+4917662538838' ? '+49 176 62538838' : phone;
  const email = content?.company_email || 'reservations@sovereignmotion.com';
  const whatsapp = content?.whatsapp_number || '+4917662538838';
  const whatsappDisplay = whatsapp === '+4917662538838' ? '+49 176 62538838' : whatsapp;
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;
  const hours = content?.business_hours || t('contact.hoursFallback');

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error(t('contact.allFields')); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) { toast.error(t('contact.invalidEmail')); return; }
    setSending(true);
    try {
      const response = await fetch(apiUrl('/api/contact-messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('CONTACT_SUBMIT_FAILED');
      setSending(false);
      toast.success(t('contact.sent'));
      setForm({ name: '', email: '', message: '' });
    } catch {
      setSending(false);
      toast.error(t('contact.sendFailed'));
    }
  };

  return (
    <div className="pt-32 pb-24 md:pb-40">
      <section className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <span className="text-xs tracking-[0.3em] uppercase text-gold mb-5 block">{t('common.contact')}</span>
          <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.02] max-w-2xl">{t('contact.title')}</h1>
          <p className="mt-5 text-lunar text-lg">{t('contact.subtitle')}</p>
        </Reveal>
      </section>

      <section className="mt-16 mx-auto max-w-6xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-12 lg:gap-20">
        <Reveal>
          <div className="space-y-8">
            <div>
              <h2 className="text-xs tracking-[0.25em] uppercase text-gold mb-5">{t('contact.details')}</h2>
              <ul className="space-y-5">
                <ContactRow icon={Phone} label={t('common.phone')} value={phoneDisplay} href={`tel:${phone}`} />
                <ContactRow icon={UserRound} label={t('contact.managingDirector')} value="Resul Düzgün" />
                <ContactRow icon={Mail} label={t('common.email')} value={email} href={`mailto:${email}`} />
                <ContactRow icon={MessageCircle} label={t('common.whatsapp')} value={whatsappDisplay} href={whatsappUrl} />
                <ContactRow icon={Clock} label={t('contact.hours')} value={hours} />
              </ul>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 h-14 px-4 sm:px-8 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase hover:bg-gold-light transition-colors"
            >
              <MessageCircle size={18} /> {t('contact.whatsappCta')}
            </a>

          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <form onSubmit={submit} className="glass p-6 md:p-10 space-y-6">
            <h2 className="font-display text-3xl text-ivory">{t('contact.sendTitle')}</h2>
            <Field label={t('contact.name')}>
              <input className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label={t('common.email')}>
              <input type="email" className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label={t('contact.message')}>
              <textarea rows={5} className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </Field>
            <button type="submit" disabled={sending} className="w-full h-14 bg-gold text-obsidian text-xs tracking-[0.25em] uppercase hover:bg-gold-light transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {sending ? t('common.sending') : <>{t('contact.sendTitle')} <Send size={16} /></>}
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
  return href ? <li><a href={href} target="_blank" rel="noreferrer" className="flex min-h-11 items-center py-2">{content}</a></li> : <li>{content}</li>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.25em] uppercase text-lunar mb-2">{label}</label>
      {children}
    </div>
  );
}
