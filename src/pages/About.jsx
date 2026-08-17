import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Crown, Plane, Briefcase, Calendar, Heart, Lock, Clock } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Image } from '@/components/ui/image';
import { useOutletContext } from 'react-router-dom';

const ABOUT_IMG = '/images/about-luxury-interior.png';

const PILLARS = [
  { icon: ShieldCheck, title: 'Professionelle Fahrer', body: 'Unsere Fahrer stehen für einen professionellen, respektvollen und diskreten Service.' },
  { icon: Crown, title: 'Hochwertige VIP-Fahrzeuge', body: 'Unsere Premium-Fahrzeuge bieten hohen Komfort, Sauberkeit und ein gepflegtes Reiseerlebnis.' },
  { icon: Plane, title: 'Flughafentransfers', body: 'Zuverlässige Abholung und komfortable Transfers zum und vom Flughafen.' },
  { icon: Briefcase, title: 'Geschäftsfahrten', body: 'Professionelle VIP-Fahrten für Termine, Meetings und geschäftliche Reisen.' },
  { icon: Calendar, title: 'Events', body: 'Komfortable und zuverlässige Transfers für Veranstaltungen und besondere Anlässe.' },
  { icon: Heart, title: 'Hochzeiten', body: 'Stilvolle Fahrten für Hochzeiten und besondere Momente.' },
  { icon: Lock, title: 'Diskretion', body: 'Privatsphäre, Respekt und ein diskreter Umgang stehen bei jeder Fahrt im Mittelpunkt.' },
  { icon: Clock, title: 'Pünktlichkeit', body: 'Wir planen jede Fahrt sorgfältig und legen höchsten Wert auf eine zuverlässige Abholung und Ankunft.' }
];

export default function About() {
  const { content } =
    /** @type {import("@/lib/useContent").SiteOutletContext} */ (useOutletContext());
  const title = content?.about_title || 'Premium-Service. Persönlich. Zuverlässig.';
  const body = content?.about_body || 'LuxDrive steht für professionelle VIP Taxi Services mit höchstem Anspruch an Komfort, Pünktlichkeit und Diskretion. Ob Flughafentransfer, Geschäftstermin oder Event – wir sorgen für eine komfortable und zuverlässige Fahrt.';

  return (
    <div className="pt-32 pb-24 md:pb-40">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={ABOUT_IMG} alt="Hochwertige Verarbeitung im VIP-Fahrzeuginnenraum" fittingType="fill" className="h-full w-full" />
          <div className="absolute inset-0 bg-obsidian/75" />
        </div>
        <div className="relative h-full mx-auto max-w-[1500px] px-6 md:px-12 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-gold mb-5 block">Über LuxDrive</span>
            <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.02] max-w-2xl">{title}</h1>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <Reveal>
            <p className="text-lunar text-xl md:text-2xl leading-[1.7] font-display">{body}</p>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-[1500px] px-6 md:px-12 py-24 md:py-32">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">Warum LuxDrive</span>
              <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">Der LuxDrive Standard</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 0.08}>
                <div className="bg-obsidian p-8 md:p-10 h-full hover:bg-secondary transition-colors duration-500">
                  <p.icon className="text-gold mb-5" size={26} strokeWidth={1.25} />
                  <h3 className="font-display text-xl text-ivory mb-3">{p.title}</h3>
                  <p className="text-lunar text-sm leading-relaxed">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-ivory leading-[1.05] mb-8">Planen Sie Ihre Fahrt</h2>
            <Link to="/booking" className="inline-flex items-center justify-center h-14 px-10 bg-gold text-obsidian text-xs tracking-[0.25em] uppercase hover:bg-gold-light transition-colors">
              Jetzt VIP Taxi buchen
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
