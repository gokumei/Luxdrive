import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import Reveal from '@/components/Reveal';
import { useLanguage } from '@/i18n/LanguageContext';

const API_URL = 'http://localhost:5000/api/testimonials/submit';

export default function ReviewForm() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedReview = review.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast.error(t('reviews.invalidName'));
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error(t('reviews.invalidRating'));
      return;
    }

    if (trimmedReview.length < 10 || trimmedReview.length > 1000) {
      toast.error(t('reviews.invalidReview'));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: trimmedName,
          review: trimmedReview,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error('Review submission failed');
      }

      setName('');
      setReview('');
      setRating(0);
      setHoveredRating(0);
      setSuccess(true);
      toast.success(t('reviews.thanks'));
    } catch (error) {
      console.error('REVIEW SUBMISSION ERROR:', error);
      toast.error(t('reviews.failure'));
    } finally {
      setSubmitting(false);
    }
  };

  const visibleRating = hoveredRating || rating;

  return (
    <section className="py-24 md:py-40 border-t border-white/5 bg-secondary/20">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <Reveal>
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
              {t('reviews.opinion')}
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05]">
              {t('reviews.formTitle')}
            </h2>
            <p className="mt-5 text-lunar text-lg">
              {t('reviews.intro')}
            </p>
            <p className="mt-2 text-lunar/80 text-sm">
              {t('reviews.help')}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={submit} className="glass p-6 md:p-10 space-y-8">
            <div>
              <label htmlFor="review-name" className="block text-[10px] tracking-[0.25em] uppercase text-lunar mb-2">
                {t('reviews.name')}
              </label>
              <input
                id="review-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                autoComplete="name"
                className="w-full bg-transparent border-b border-white/15 focus:border-gold py-3 text-ivory outline-none transition-colors"
              />
            </div>

            <fieldset>
              <legend className="block text-[10px] tracking-[0.25em] uppercase text-lunar mb-3">
                {t('reviews.rating')}
              </legend>
              <div
                className="flex flex-col items-start gap-3"
                onMouseLeave={() => setHoveredRating(0)}
              >
                <div className="flex items-center gap-0">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={value === 1 ? t('reviews.star') : t('reviews.stars', { count: value })}
                      aria-pressed={rating === value}
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onFocus={() => setHoveredRating(value)}
                      onBlur={() => setHoveredRating(0)}
                      className="h-11 w-11 inline-flex items-center justify-center text-lunar hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-sm transition-colors"
                    >
                      <Star
                        size={30}
                        className={value <= visibleRating ? 'fill-gold text-gold' : 'text-lunar'}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <span className="text-sm text-lunar" aria-live="polite">
                    {t('reviews.ratingValue', { count: rating })}
                  </span>
                )}
              </div>
            </fieldset>

            <div>
              <label htmlFor="review-text" className="block text-[10px] tracking-[0.25em] uppercase text-lunar mb-2">
                {t('reviews.review')}
              </label>
              <textarea
                id="review-text"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                minLength={10}
                maxLength={1000}
                required
                rows={5}
                placeholder={t('reviews.placeholder')}
                className="w-full bg-transparent border border-white/15 focus:border-gold p-4 text-ivory placeholder:text-lunar/60 outline-none resize-none transition-colors"
              />
            </div>

            {success && (
              <div className="border border-gold/30 bg-gold/5 p-5" role="status">
                <p className="text-gold font-medium">{t('reviews.thanks')}</p>
                <p className="text-lunar text-sm mt-1">
                  {t('reviews.moderation')}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-gold text-obsidian text-xs tracking-[0.25em] uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('reviews.submitting') : t('reviews.submit')}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
