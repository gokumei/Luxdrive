import Reveal from '@/components/Reveal';
import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '@/lib/useContent';

export default function Testimonials() {
  const testimonials = useTestimonials();

  return (
    <section className="py-24 md:py-40 border-t border-white/5">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">Kundenstimmen</span>
            <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">Das sagen unsere Kunden</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.id || i} delay={i * 0.12}>
              <div className="glass p-8 md:p-10 h-full flex flex-col">
                <Quote className="text-gold/40 mb-6" size={32} />
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating || 5 }).map((_, k) => (
                    <Star key={k} size={14} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="font-display text-xl md:text-2xl text-ivory leading-[1.4] flex-1">"{t.quote}"</p>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="text-ivory text-sm">{t.name}</div>
                  {t.role && <div className="text-lunar text-xs tracking-wide mt-1">{t.role}</div>}
                </div>
              </div>
            </Reveal>
          ))}
          {testimonials.length === 0 && (
            <p className="md:col-span-3 text-center text-lunar">
              Noch keine Kundenbewertungen verfügbar.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
