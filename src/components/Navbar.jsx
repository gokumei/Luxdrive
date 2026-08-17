import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { label: 'Startseite', to: '/' },
  { label: 'Flotte', to: '/fleet' },
  { label: 'Über uns', to: '/about' },
  { label: 'Kontakt', to: '/contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
          <Link to="/" className="shrink-0 flex items-center" aria-label="LuxDrive Startseite">
            <img
              src="/images/luxdrive-logo-navbar.png"
              alt="LuxDrive VIP Taxi"
              className="h-10 w-36 md:h-11 md:w-40 lg:w-44 object-contain object-left"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm tracking-[0.2em] uppercase text-lunar hover:text-gold transition-colors duration-300 relative"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gold transition-all duration-300 hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/booking"
              className="hidden lg:inline-flex items-center justify-center h-11 px-7 border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-obsidian transition-all duration-300"
            >
              Jetzt VIP Taxi buchen
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-ivory"
              aria-label="Menü öffnen"
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
              <Link to="/" aria-label="LuxDrive Startseite" className="flex items-center">
                <img
                  src="/images/luxdrive-logo-navbar.png"
                  alt="LuxDrive VIP Taxi"
                  className="h-10 w-36 object-contain object-left"
                />
              </Link>
              <button onClick={() => setOpen(false)} className="text-ivory" aria-label="Menü schließen">
                <X size={26} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
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
                    {l.label}
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
                  Jetzt VIP Taxi buchen
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
