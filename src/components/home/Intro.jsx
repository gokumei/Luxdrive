import Reveal from '@/components/Reveal';
import { Image } from '@/components/ui/image';

const ABOUT_IMG = '/images/about-luxury-interior.png';

export default function Intro({ content }) {
  const title = content?.about_title || 'Premium-Service. Persönlich. Zuverlässig.';
  const body = content?.about_body || 'LuxDrive steht für professionelle VIP Taxi Services mit höchstem Anspruch an Komfort, Pünktlichkeit und Diskretion. Ob Flughafentransfer, Geschäftstermin oder Event – wir sorgen für eine komfortable und zuverlässige Fahrt.';

  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <Reveal>
          <div className="relative">
            <div className="absolute -top-4 -left-4 h-full w-full border border-gold/20" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src={ABOUT_IMG} alt="Detail eines hochwertigen VIP-Fahrzeuginnenraums" fittingType="fill" className="h-full w-full" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <span className="text-xs tracking-[0.3em] uppercase text-gold mb-6 block">Über LuxDrive</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory leading-[1.05] mb-8">{title}</h2>
          <p className="text-lunar text-lg leading-[1.8] mb-8">{body}</p>
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 pt-6 border-t border-white/5">
            <div>
              <div className="font-display text-2xl text-gold">Pünktlich</div>
              <div className="text-xs tracking-[0.2em] uppercase text-lunar mt-1">Zuverlässige Planung</div>
            </div>
            <div className="hidden md:block h-10 w-px bg-white/10" />
            <div>
              <div className="font-display text-2xl text-gold">Komfortabel</div>
              <div className="text-xs tracking-[0.2em] uppercase text-lunar mt-1">Hochwertige VIP-Fahrzeuge</div>
            </div>
            <div className="hidden md:block h-10 w-px bg-white/10" />
            <div>
              <div className="font-display text-2xl text-gold">Diskret</div>
              <div className="text-xs tracking-[0.2em] uppercase text-lunar mt-1">Professioneller Service</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
