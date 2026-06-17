/* eslint-disable react-refresh/only-export-components */
import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { useAnalytics } from './hooks/useAnalytics';
import { useAuth } from './hooks/useAuth';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import WorldCupNews from './pages/WorldCupNews';
import NewsArticle from './pages/NewsArticle';
import Standings from './pages/Standings';
import LiveMatches from './pages/LiveMatches';
import Results from './pages/Results';
import Groups from './pages/Groups';
import Admin from './pages/Admin';
import Roadmap from './pages/Roadmap';
import Studio from './pages/Studio';
import { GlobalFloatingAd } from './components/tikitaka/GlobalFloatingAd';
import { GoogleAuthGate } from './components/tikitaka/GoogleAuthGate';

const Layout = () => {
  const location = useLocation();
  useAnalytics();
  const { user, signInWithGoogle } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/studio');
  const isPublicHome = location.pathname === '/';

  const handleInterceptClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      signInWithGoogle();
    }
  };

  if (isAdminRoute || isPublicHome) {
    return (
      <div onClickCapture={isPublicHome && !user ? handleInterceptClick : undefined} className={isPublicHome && !user ? 'cursor-pointer' : ''}>
        <ScrollRestoration />
        <div className={isPublicHome && !user ? 'pointer-events-none' : ''}>
          <Outlet />
        </div>
        <GlobalFloatingAd />
      </div>
    );
  }

  return (
    <GoogleAuthGate
      autoStart
      title="سجل دخولك لمتابعة تيكي تاكا"
      description="أي تنقل داخل الموقع يحتاج تسجيل دخول مجاني بحساب Google لتسجيل الزيارة وحفظ تجربة كأس العالم."
    >
      <ScrollRestoration />
      <Outlet />
      <GlobalFloatingAd />
    </GoogleAuthGate>
  );
};

export const routers = [
  {
    element: <Layout />,
    children: [
      { path: '/', name: 'home', element: <Index /> },
      { path: '/news', name: 'news', element: <WorldCupNews /> },
      { path: '/news/:id', name: 'newsArticle', element: <NewsArticle /> },
      { path: '/groups', name: 'groups', element: <Groups /> },
      { path: '/roadmap', name: 'roadmap', element: <Roadmap /> },
      { path: '/standings', name: 'standings', element: <Standings /> },
      { path: '/live', name: 'live', element: <LiveMatches /> },
      { path: '/results', name: 'results', element: <Results /> },
      { path: '/admin', name: 'admin', element: <Admin /> },
      { path: '/studio', name: 'studio', element: <Studio /> },
      { path: '*', name: '404', element: <NotFound /> },
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
