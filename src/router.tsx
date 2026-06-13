/* eslint-disable react-refresh/only-export-components */
import { Outlet, useLocation } from 'react-router-dom';
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
import { GlobalFloatingAd } from './components/tikitaka/GlobalFloatingAd';
import { GoogleAuthGate } from './components/tikitaka/GoogleAuthGate';

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicHome = location.pathname === '/';

  if (isAdminRoute || isPublicHome) {
    return (
      <>
        <Outlet />
        <GlobalFloatingAd />
      </>
    );
  }

  return (
    <GoogleAuthGate
      autoStart
      title="سجل دخولك لمتابعة تيكي تاكا"
      description="أي تنقل داخل الموقع يحتاج تسجيل دخول مجاني بحساب Google لتسجيل الزيارة وحفظ تجربة كأس العالم."
    >
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
