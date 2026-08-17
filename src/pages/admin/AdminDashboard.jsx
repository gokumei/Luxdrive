import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { CalendarClock, Car, FileText, LogOut, ShieldAlert } from 'lucide-react';
import BookingsManager from '@/components/admin/BookingsManager';
import FleetManager from '@/components/admin/FleetManager';
import ContentManager from '@/components/admin/ContentManager';

const TABS = [
  { key: 'bookings', label: 'Buchungen', icon: CalendarClock },
  { key: 'fleet', label: 'Flotte', icon: Car },
  { key: 'content', label: 'Inhalte', icon: FileText }
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('bookings');

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-obsidian"><div className="w-8 h-8 border-4 border-white/10 border-t-gold rounded-full animate-spin" /></div>;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian px-6">
        <div className="text-center max-w-sm">
          <ShieldAlert className="mx-auto text-gold mb-5" size={40} strokeWidth={1.25} />
          <h1 className="font-display text-3xl text-ivory mb-3">Zugriff eingeschränkt</h1>
          <p className="text-lunar mb-8">Dieser Bereich ist ausschließlich für den Betreiber vorgesehen. Ihr Konto verfügt nicht über Administratorrechte.</p>
          <Link to="/" className="inline-flex h-12 px-8 items-center bg-gold text-obsidian text-xs tracking-[0.2em] uppercase">Zur Startseite</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 bg-secondary/50 p-6 lg:min-h-screen flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <span className="h-[1px] w-6 bg-gold" />
          <span className="font-display text-lg tracking-[0.2em] text-ivory uppercase">LuxDrive</span>
        </div>

        <nav className="flex lg:flex-col gap-2 flex-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors whitespace-nowrap ${tab === t.key ? 'bg-gold/10 text-gold border-l-2 border-gold' : 'text-lunar hover:text-ivory'}`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block mt-8 pt-6 border-t border-white/10">
          <div className="text-xs text-lunar mb-1">Angemeldet als</div>
          <div className="text-sm text-ivory truncate mb-4">{user.email}</div>
          <button onClick={() => logout()} className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-lunar hover:text-gold">
            <LogOut size={14} /> Abmelden
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-ivory">{TABS.find((item) => item.key === tab)?.label}</h1>
          <p className="text-lunar text-sm mt-1">
            {tab === 'bookings' && 'Alle Buchungen anzeigen, durchsuchen und verwalten.'}
            {tab === 'fleet' && 'Fahrzeuge hinzufügen, bearbeiten und verwalten.'}
            {tab === 'content' && 'Website-Texte, Kontaktdaten und Kundenbewertungen bearbeiten.'}
          </p>
        </div>
        {tab === 'bookings' && <BookingsManager />}
        {tab === 'fleet' && <FleetManager />}
        {tab === 'content' && <ContentManager />}
      </main>
    </div>
  );
}
