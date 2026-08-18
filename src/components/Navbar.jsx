import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

const LINKS = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.fleet', to: '/fleet' },
  { labelKey: 'nav.about', to: '/about' },
  { labelKey: 'nav.contact', to: '/contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto max-w-[1500px] px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="shrink-0 flex items-center" aria-label={t('common.brandHome')}>
            <img
              src="/images/luxdrive-logo-navbar.png"
              alt={t('accessibility.logoAlt')}
              className="h-10 w-36 md:h-11 md:w-40 lg:w-44 object-contain object-left"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm tracking-[0.2em] uppercase text-lunar hover:text-gold transition-colors duration-300 relative"
              >
                {t(l.labelKey)}
                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gold transition-all duration-300 hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 xl:gap-4">
            <LanguageSelector />
            <Link
              to="/booking"
              className="hidden lg:inline-flex items-center justify-center min-h-11 px-4 xl:px-7 border border-gold/40 text-gold text-xs tracking-[0.15em] xl:tracking-[0.2em] uppercase text-center hover:bg-gold hover:text-obsidian transition-all duration-300"
            >
              {t('common.bookVipTaxi')}
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-11 w-11 inline-flex items-center justify-center text-ivory"
              aria-label={t('nav.openMenu')}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-obsidian flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <Link to="/" aria-label={t('common.brandHome')} className="flex items-center">
                <img
                  src="/images/luxdrive-logo-navbar.png"
                  alt={t('accessibility.logoAlt')}
                  className="h-10 w-36 object-contain object-left"
                />
              </Link>
              <button onClick={() => setOpen(false)} className="h-11 w-11 inline-flex items-center justify-center text-ivory" aria-label={t('nav.closeMenu')}>
                <X size={26} />
              </button>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-start gap-6 py-8 sm:justify-center sm:gap-8">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.6 }}
                >
                  <Link
                    to={l.to}
                    className="font-display text-4xl md:text-5xl text-ivory hover:text-gold transition-colors duration-300"
                  >
                    {t(l.labelKey)}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link
                  to="/booking"
                  className="mt-4 inline-flex items-center justify-center h-12 px-8 bg-gold text-obsidian text-xs tracking-[0.2em] uppercase"
                >
                  {t('common.bookVipTaxi')}
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58, duration: 0.5 }} className="mt-2 flex w-full justify-center px-6">
                <LanguageSelector mobile />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
