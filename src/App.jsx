import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Fleet from '@/pages/Fleet';
import Booking from '@/pages/Booking';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { LanguageProvider } from '@/i18n/LanguageContext';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <LanguageProvider><UserNotRegisteredError /></LanguageProvider>;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<LanguageProvider><Layout /></LanguageProvider>}>
        <Route path="/" element={<Home />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking/:vehicle" element={<Booking />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<LanguageProvider><Login /></LanguageProvider>} />
      <Route path="/register" element={<LanguageProvider><Register /></LanguageProvider>} />
      <Route path="/forgot-password" element={<LanguageProvider><ForgotPassword /></LanguageProvider>} />
      <Route path="/reset-password" element={<LanguageProvider><ResetPassword /></LanguageProvider>} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin" element={<AdminLanguageBoundary><AdminDashboard /></AdminLanguageBoundary>} />
      </Route>
      <Route path="*" element={<LanguageProvider><PageNotFound /></LanguageProvider>} />
    </Routes>
  );
};

function AdminLanguageBoundary({ children }) {
  useEffect(() => {
    document.documentElement.lang = 'de';
  }, []);
  return children;
}


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster theme="dark" position="top-right" toastOptions={{ style: { background: '#141414', border: '1px solid rgba(212,175,55,0.25)', color: '#F5F5F7' } }} />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
