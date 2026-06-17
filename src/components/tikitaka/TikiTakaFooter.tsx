import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { t, T } from '@/lib/i18n';
import { EditableSiteText } from '@/components/tikitaka/EditableSiteText';
import { LayoutGrid } from 'lucide-react';

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
    { icon: <XIcon />, href: 'https://twitter.com' },
    { icon: <YouTubeIcon />, href: 'https://youtube.com' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com' },
  ];

  const policyLinks = [
    { label: <EditableSiteText settingKey="footer_policy_1" fallbackEn="Privacy Policy" fallbackAr="سياسة الخصوصية" />, href: '#' },
    { label: <EditableSiteText settingKey="footer_policy_2" fallbackEn="Terms of Service" fallbackAr="شروط الخدمة" />, href: '#' },
  ];

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-primary/20">
      <div className="w-full px-6 md:px-12 lg:px-16">
        {/* Top Section */}
        <div className="pt-14 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Neon Info Card */}
          <div className={`lg:col-span-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative overflow-hidden rounded-2xl p-[2px] z-10 group shadow-neon hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] transition-shadow duration-500">
              {/* Rotating background */}
              <div className="absolute inset-[-50%] z-[-2] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_70%,hsl(var(--primary))_100%)] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Inner Card content */}
              <div className="absolute inset-[2px] z-[-1] bg-[#0d1017]/95 backdrop-blur-xl rounded-[calc(1rem-2px)]" />

              {/* Content */}
              <div className="relative p-6 md:p-8 flex flex-col items-center text-center space-y-6">
                <p className="text-[#A1A1AA] text-base leading-relaxed hover:text-[#D4D4D8] transition-colors duration-300">
                  <EditableSiteText settingKey="footer_statement" fallbackEn={T.footerStatement.en} fallbackAr={T.footerStatement.ar} multiline />
                </p>
                
                {/* Animated Tiki-Taka Text */}
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-4xl tracking-wide animate-text-neon select-none">
                    <span className="text-white">TIKI</span>
                    <span className="text-primary">-TAKA</span>
                  </span>
                </div>

                <div className="w-full h-[1px] bg-white/10 my-2"></div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className={`flex flex-1 items-center bg-[#18181B] rounded-lg overflow-hidden transition-all duration-300 w-full ${focused ? 'ring-2 ring-primary/50 shadow-neon' : 'hover:bg-[#1F1F23]'}`}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder={t('footerEmail', lang)}
                      className="bg-transparent px-4 py-3 text-white text-sm placeholder-[#52525B] focus:outline-none w-full min-w-[150px]"
                    />
                    <button className="group flex items-center gap-2 px-4 py-3 text-white text-sm font-medium hover:text-primary transition-all duration-300 whitespace-nowrap bg-white/5 hover:bg-white/10">
                      <EditableSiteText settingKey="footer_subscribe" fallbackEn={T.footerSubscribe.en} fallbackAr={T.footerSubscribe.ar} />
                      <span className="group-hover:scale-110 transition-transform duration-300"><ArrowIcon /></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {socialLinks.map((s, i) => (
                      <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:-translate-y-1 hover:shadow-neon hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-10">
            {columns.map((col, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <h3 className="text-white font-semibold text-base mb-4">{col.title}</h3>
                <ul className="space-y-2.5">
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

      {/* Giant Brand + Bottom bar */}
      <div className="relative min-h-[200px] md:min-h-[280px] flex flex-col">
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '600ms' }}>
          <span className="font-display font-bold" style={{ fontSize: '15vw', color: '#1C1C1E', lineHeight: 0.85, whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
            TIKI-TAKA
          </span>
        </div>

        {/* Baseline */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="w-full px-6 md:px-12 lg:px-16">
            <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
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
                  <a key={i} href={l.href} className="text-[#71717A] text-sm hover:text-white hover:underline underline-offset-4 transition-all duration-200">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
