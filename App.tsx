import React from 'react';
import { HashRouter, Routes, Route, Outlet, useParams, Navigate, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { StatisticsService } from './services/StatisticsService';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LiberstatusPage from './pages/LiberstatusPage';
import ContributionsPage from './pages/ContributionsPage';
import ReportsPage from './pages/ReportsPage';
import AdminConsolePage from './pages/AdminConsolePage';
import USSDPage from './pages/USSDPage';
import { useTranslation } from 'react-i18next';
import { Territory, User, ROLES } from './types';
import LanguageSwitcher from './components/LanguageSwitcher';
import EventTicker from './components/EventTicker';
import ErrorBoundary from './utils/ErrorBoundary';

// FIX: Made children optional to resolve a potential toolchain/type-inference issue.
const ProtectedRoute = ({ children, role }: { children?: React.ReactNode, role: string }) => {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== role) {
    // FIX: Changed "home" to "../home" for correct relative navigation from a nested route.
    return <Navigate to="../home" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/ussd" element={<USSDPage />} />
            <Route path="/app/:territoryId" element={<AppLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="liberstatus" element={<LiberstatusPage />} />
              <Route path="contributions" element={<ContributionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="admin" element={
                <ProtectedRoute role={ROLES.admin}>
                  <AdminConsolePage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </DataProvider>
  );
}

const ChurchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const USSDIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM12 6h.01M12 10h.01M12 14h.01" /></svg>

const NavLink: React.FC<{ to: string; children: React.ReactNode; external?: boolean; territoryId?: string }> = ({ to, children, external, territoryId }) => {
  if (external) {
    return (
      <a 
        href={to} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-vatican-white hover:bg-vatican-white/20"
      >
        {children}
      </a>
    );
  }
  
  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const activeClasses = "bg-vatican-gold text-swiss-guard-blue font-bold";
  const inactiveClasses = "text-vatican-white hover:bg-vatican-white/20";
  
  const fullPath = territoryId ? `/app/${territoryId}/${to}` : to;

  return (
    <RouterNavLink
      to={fullPath}
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </RouterNavLink>
  );
};

const MessageTicker = () => {
  const message = "Aina mamelona sy manamafy ny fifandraisan'ny fianakaviana amin'Andriamanitra ny vavaka";
  return (
    <div className="message-ticker-wrap">
      <div className="message-ticker-move">
        <span className="message-ticker-item">{message}</span>
        <span className="message-ticker-item">{message}</span> {/* Duplicate for seamless loop */}
      </div>
    </div>
  );
};


const AppLayout = () => {
  const { territoryId } = useParams<{ territoryId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, signOut, openLoginModal } = useAuth();
  const { appData } = useData();
  const [territory, setTerritory] = React.useState<Territory | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [upcomingEvents, setUpcomingEvents] = React.useState<any[]>([]);

  // FIX: Moved large constant inside component to avoid potential top-level parsing issues.
  const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/wAARCAJAAkADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VXV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIydLT1NXW19jZ2uLj5OXm5+jp6vLz9PX2+Pn6v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA-";

  React.useEffect(() => {
    if (territoryId) {
      const foundTerritory = StatisticsService.findTerritoryById(territoryId, appData.territories.archdioceses);
      setTerritory(foundTerritory);
      const events = StatisticsService.getUpcomingEvents(territoryId, appData.territories.archdioceses);
      setUpcomingEvents(events);
    }
    setLoading(false);
  }, [territoryId, appData]);

  type NavLinkItem = {
    to: string;
    label: string;
    external?: boolean;
  };

  const baseNavLinks: NavLinkItem[] = [
    { to: 'home', label: t('navigation.home') },
    { to: 'liberstatus', label: t('navigation.liberstatus') },
    { to: 'contributions', label: t('navigation.contributions') },
    { to: 'reports', label: t('navigation.reports') },
  ];
  
  const navLinks = [...baseNavLinks];

  if (currentUser && currentUser.role === ROLES.admin) {
    navLinks.push({ 
      to: 'admin', 
      label: t('navigation.adminConsole'),
      external: false 
    });
  }


  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-xl font-semibold">{t('common.loading')}</div></div>;
  }

  if (!territory) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-xl font-semibold text-red-500">{t('common.territoryNotFound')}</div></div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <nav className="bg-swiss-guard-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-12 w-12" src={logoBase64} alt="Liberstatus Logo" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navLinks.map(link => (
                    <NavLink key={link.to} to={link.to} external={!!link.external} territoryId={territoryId}>{link.label}</NavLink>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/')} 
                  title="Change Parish"
                  className="p-1 rounded-full text-vatican-gold hover:text-vatican-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-swiss-guard-blue focus:ring-white"
                >
                  <ChurchIcon />
                </button>
                {currentUser && (
                  <button 
                    onClick={() => navigate('/ussd')} 
                    title="USSD Platform"
                    className="p-1 rounded-full text-vatican-gold hover:text-vatican-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-swiss-guard-blue focus:ring-white"
                  >
                    <USSDIcon />
                  </button>
                )}
               <LanguageSwitcher />
               <span className="text-sm text-vatican-white/80">{t('common.welcome')}, {currentUser?.username || 'Guest'}</span>
               {currentUser ? (
                  <button onClick={signOut} className="text-vatican-white hover:text-vatican-gold text-sm font-medium">{t('common.signOut')}</button>
                ) : (
                  <button onClick={openLoginModal} className="text-vatican-white hover:text-vatican-gold text-sm font-medium">{t('common.signIn')}</button>
                )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Adjust padding for two tickers */}
          <div className="pb-24">
            <ErrorBoundary>
              <Outlet context={{ territory, currentUser }} />
            </ErrorBoundary>
          </div>
        </div>
      </main>
      <MessageTicker />
      <EventTicker events={upcomingEvents} />
    </div>
  );
};


export default App;