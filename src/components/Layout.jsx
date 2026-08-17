import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSiteContent } from '@/lib/useContent';

export default function Layout() {
  const content = useSiteContent();
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main>
        <Outlet context={{ content }} />
      </main>
      <Footer content={content} />
    </div>
  );
}