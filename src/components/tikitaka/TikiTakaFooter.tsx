import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { t, T } from '@/lib/i18n';
import { EditableSiteText } from '@/components/tikitaka/EditableSiteText';
import { ShareMenu } from '@/components/tikitaka/ShareMenu';
import { LayoutGrid } from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);
const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.4-2.42 5.92-1.48 1.48-3.47 2.32-5.56 2.34-2.06.02-4.1-.81-5.56-2.27-1.54-1.54-2.41-3.66-2.45-5.83-.04-2.18.84-4.29 2.4-5.83 1.52-1.5 3.55-2.33 5.66-2.35 1.04-.01 2.08.16 3.08.51v4.11c-.53-.25-1.1-.38-1.68-.4-1.12-.03-2.22.4-3.03 1.18-.84.81-1.3 1.94-1.33 3.1-.03 1.15.38 2.29 1.14 3.12.8.87 1.95 1.34 3.15 1.35 1.25.01 2.47-.48 3.36-1.37.89-.89 1.39-2.11 1.4-3.37.04-4.8.02-9.6.02-14.4z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export function TikiTakaFooter() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(id);
  }, []);

  const columns = [
    {
      title: <EditableSiteText settingKey="footer_col1_title" fallbackEn="Sections" fallbackAr="الأقسام" />,
      links: [
        { label: <EditableSiteText settingKey="footer_col1_link1" fallbackEn={T.home.en} fallbackAr={T.home.ar} />, href: '/' },
        { label: <EditableSiteText settingKey="footer_col1_link2" fallbackEn={T.worldCupNews.en} fallbackAr={T.worldCupNews.ar} />, href: '/news' },
        { label: <EditableSiteText settingKey="footer_col1_link3" fallbackEn={T.groups.en} fallbackAr={T.groups.ar} />, href: '/groups' },
        { label: <EditableSiteText settingKey="footer_col1_link4" fallbackEn={T.standings.en} fallbackAr={T.standings.ar} />, href: '/standings' },
        { label: <EditableSiteText settingKey="footer_col1_link5" fallbackEn={T.liveMatches.en} fallbackAr={T.liveMatches.ar} />, href: '/live' },
      ],
    },
    {
      title: <EditableSiteText settingKey="footer_col2_title" fallbackEn="Coverage" fallbackAr="التغطية" />,
      links: [
        { label: <EditableSiteText settingKey="footer_col2_link1" fallbackEn="Live Scores" fallbackAr="النتائج المباشرة" />, href: '/live' },
        { label: <EditableSiteText settingKey="footer_col2_link2" fallbackEn="Fixtures" fallbackAr="المواعيد" />, href: '/live' },
        { label: <EditableSiteText settingKey="footer_col2_link3" fallbackEn="Top Scorers" fallbackAr="الهدافون" />, href: '/standings' },
        { label: <EditableSiteText settingKey="footer_col2_link4" fallbackEn="Highlights" fallbackAr="الملخصات" />, href: '/' },
      ],
    },
    {
      title: <EditableSiteText settingKey="footer_col3_title" fallbackEn="Company" fallbackAr="الشركة" />,
      links: [
        { label: <EditableSiteText settingKey="footer_col3_link1" fallbackEn="About" fallbackAr="عن الموقع" />, href: '#' },
        { label: <EditableSiteText settingKey="footer_col3_link2" fallbackEn="Contact" fallbackAr="تواصل معنا" />, href: '#' },
        { label: <EditableSiteText settingKey="footer_col3_link3" fallbackEn="Privacy" fallbackAr="الخصوصية" />, href: '#' },
        { label: <EditableSiteText settingKey="footer_col3_link4" fallbackEn="Terms" fallbackAr="الشروط" />, href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <TikTokIcon />, href: 'https://tiktok.com' },
    { icon: <FacebookIcon />, href: 'https://facebook.com' },
    { icon: <YouTubeIcon />, href: 'https://youtube.com' },
  ];

  const policyLinks = [
    { label: <EditableSiteText settingKey="footer_policy_1" fallbackEn="Privacy Policy" fallbackAr="سياسة الخصوصية" />, href: '/privacy-policy' },
    { label: <EditableSiteText settingKey="footer_policy_2" fallbackEn="Terms of Service" fallbackAr="شروط الخدمة" />, href: '/terms-of-service' },
  ];

  return (
    <div className="relative w-full mt-20 group overflow-hidden border-t border-primary/20">
      {/* Rotating background for the entire footer */}
      <div className="absolute inset-[-100%] z-0 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_70%,hsl(var(--primary))_100%)] opacity-30 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-[2px] z-0 bg-[#0A0A0A]" />

      <footer className="relative z-10 w-full pt-16 pb-0">
        <div className="w-full px-6 md:px-12 lg:px-16 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column: Description, Socials, Subscribe, Big Text */}
            <div className={`lg:col-span-7 flex flex-col justify-start space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[#A1A1AA] text-lg leading-relaxed hover:text-[#D4D4D8] transition-colors duration-300 max-w-xl">
                <EditableSiteText settingKey="footer_statement" fallbackEn={T.footerStatement.en} fallbackAr={T.footerStatement.ar} multiline />
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
                <div className="flex items-center gap-2 shrink-0">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="w-11 h-11 rounded-full bg-[#18181B] text-white flex items-center justify-center hover:scale-110 hover:-translate-y-1 hover:shadow-neon hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                      {s.icon}
                    </a>
                  ))}
                  <div className="h-6 w-[1px] bg-white/10 mx-2" />
                  <ShareMenu />
                </div>

                <div className={`flex flex-1 items-center bg-[#18181B] rounded-lg overflow-hidden transition-all duration-300 w-full ${focused ? 'ring-2 ring-primary/50 shadow-neon' : 'hover:bg-[#1F1F23]'}`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={t('footerEmail', lang)}
                    className="bg-transparent px-4 py-3 text-white text-sm placeholder-[#52525B] focus:outline-none w-full min-w-[130px]"
                  />
                  <button className="group flex items-center gap-2 px-4 py-3 text-white text-sm font-medium hover:text-primary transition-all duration-300 whitespace-nowrap bg-white/5 hover:bg-white/10">
                    <EditableSiteText settingKey="footer_subscribe" fallbackEn={T.footerSubscribe.en} fallbackAr={T.footerSubscribe.ar} />
                    <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300"><ArrowIcon /></span>
                  </button>
                </div>
              </div>

              {/* Big TIKI-TAKA text */}
              <div className={`w-full flex justify-start pt-4 transition-all duration-1000 delay-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <span className="font-display font-black text-6xl sm:text-7xl md:text-[90px] tracking-tighter animate-text-sweep select-none leading-none">
                  TIKI-TAKA
                </span>
              </div>
            </div>

            {/* Right Column: Links */}
            <div className="lg:col-span-5 flex flex-col justify-start pt-2">
              <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full justify-items-end text-right">
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + i * 100}ms` }}
                  >
                    <h3 className="text-white font-semibold text-base mb-4">{col.title}</h3>
                    <ul className="space-y-3">
                      {col.links.map((link, j) => (
                        <li key={j}>
                          <NavLink to={link.href} className="text-[#71717A] text-sm hover:text-primary hover:-translate-x-1 inline-block transition-all duration-200">
                            {link.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Baseline */}
        <div className="w-full px-6 md:px-12 lg:px-16 bg-[#0A0A0A]/80 backdrop-blur-sm border-t border-white/5 relative z-10">
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <p className="text-[#71717A] text-sm"><EditableSiteText settingKey="footer_copyright" fallbackEn={T.footerCopyright.en} fallbackAr={T.footerCopyright.ar} /></p>
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 text-[#52525B] text-xs font-medium hover:text-primary transition-colors duration-200"
              >
                <LayoutGrid className="h-3 w-3" />
                {lang === 'ar' ? 'أدمن' : 'Admin'}
              </NavLink>
            </div>
            <div className="flex items-center gap-6">
              {policyLinks.map((l, i) => (
                <NavLink key={i} to={l.href} className="text-[#71717A] text-sm hover:text-white hover:underline underline-offset-4 transition-all duration-200">
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        
        {/* Neon Snakes */}
        <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden pointer-events-none z-0">
          <style>
            {`
              @keyframes snake-move {
                0% { stroke-dashoffset: 2000; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { stroke-dashoffset: 0; opacity: 0; }
              }
              @keyframes snake-move-reverse {
                0% { stroke-dashoffset: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { stroke-dashoffset: 2000; opacity: 0; }
              }
            `}
          </style>
          <svg className="w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 1000 100">
            {/* Group 1: Moving Right */}
            <path d="M-200 40 C 0 10, 200 90, 400 50 S 800 10, 1000 50 S 1400 90, 1600 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.8" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 5px hsl(var(--primary)))', strokeDasharray: '60 1940', animation: 'snake-move 10s linear infinite' }} />
            <path d="M-200 60 C 50 90, 150 10, 350 40 S 650 90, 850 50 S 1250 10, 1500 60" fill="none" stroke="#34d399" strokeWidth="0.5" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 4px #34d399)', strokeDasharray: '40 1960', animation: 'snake-move 12s linear infinite 2s' }} />
            <path d="M-200 30 C 100 0, 300 80, 500 40 S 900 0, 1100 40 S 1500 80, 1700 30" fill="none" stroke="#10b981" strokeWidth="0.6" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 6px #10b981)', strokeDasharray: '80 1920', animation: 'snake-move 15s linear infinite 1s' }} />
            <path d="M-200 70 C 150 100, 250 20, 450 60 S 750 100, 950 60 S 1350 20, 1600 70" fill="none" stroke="#6ee7b7" strokeWidth="0.4" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 3px #6ee7b7)', strokeDasharray: '30 1970', animation: 'snake-move 9s linear infinite 3s' }} />
            <path d="M-200 50 C 200 20, 400 80, 600 50 S 1000 20, 1200 50 S 1600 80, 1800 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.7" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary)))', strokeDasharray: '50 1950', animation: 'snake-move 14s linear infinite 4s' }} />
            
            {/* Group 2: Moving Left */}
            <path d="M-200 45 C 50 15, 250 85, 450 45 S 850 15, 1050 45 S 1450 85, 1650 45" fill="none" stroke="#059669" strokeWidth="0.5" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 5px #059669)', strokeDasharray: '45 1955', animation: 'snake-move-reverse 11s linear infinite' }} />
            <path d="M-200 65 C 100 95, 200 15, 400 45 S 700 95, 900 55 S 1300 15, 1550 65" fill="none" stroke="#34d399" strokeWidth="0.6" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 4px #34d399)', strokeDasharray: '35 1965', animation: 'snake-move-reverse 13s linear infinite 2s' }} />
            <path d="M-200 35 C 150 5, 350 85, 550 45 S 950 5, 1150 45 S 1550 85, 1750 35" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.4" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 3px hsl(var(--primary)))', strokeDasharray: '25 1975', animation: 'snake-move-reverse 16s linear infinite 1s' }} />
            <path d="M-200 75 C 200 105, 300 25, 500 65 S 800 105, 1000 65 S 1400 25, 1650 75" fill="none" stroke="#10b981" strokeWidth="0.7" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 6px #10b981)', strokeDasharray: '70 1930', animation: 'snake-move-reverse 10s linear infinite 3s' }} />
            <path d="M-200 55 C 250 25, 450 85, 650 55 S 1050 25, 1250 55 S 1650 85, 1850 55" fill="none" stroke="#6ee7b7" strokeWidth="0.5" pathLength="2000"
                  style={{ filter: 'drop-shadow(0 0 4px #6ee7b7)', strokeDasharray: '55 1945', animation: 'snake-move-reverse 14s linear infinite 5s' }} />
          </svg>
        </div>

      </footer>
    </div>
  );
}
