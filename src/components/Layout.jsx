import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSiteContent } from '@/lib/useContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { localizeSiteContent } from '@/i18n/dbContent';

export default function Layout() {
  const content = useSiteContent();
  const { language } = useLanguage();
  const localizedContent = localizeSiteContent(content, language);
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main>
        <Outlet context={{ content: localizedContent }} />
      </main>
      <Footer content={localizedContent} />
    </div>
  );
}
