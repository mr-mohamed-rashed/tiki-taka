import { useLanguage } from '@/context/LanguageContext';
import { useTopScorers, useResults } from '@/hooks/useFootballData';
import { Card } from '@/components/ui/card';
import { Trophy, Star, ShieldAlert, Award, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTeams } from '@/lib/footballData';

const PLAYER_PHOTOS: Record<string, string> = {
  'ليونيل ميسي': 'https://api.fifa.com/api/v3/picture/players/2026/302061',
  'Lionel Messi': 'https://api.fifa.com/api/v3/picture/players/2026/302061',
  'الكسندر اساك': 'https://api.fifa.com/api/v3/picture/players/2026/410065',
  'Alexander Isak': 'https://api.fifa.com/api/v3/picture/players/2026/410065',
  'كيليان مبابي': 'https://api.fifa.com/api/v3/picture/players/2026/410183',
  'Kylian Mbappe': 'https://api.fifa.com/api/v3/picture/players/2026/410183',
  'محمد صلاح': 'https://api.fifa.com/api/v3/picture/players/2026/356581',
  'Mohamed Salah': 'https://api.fifa.com/api/v3/picture/players/2026/356581',
  'كريستيانو رونالدو': 'https://api.fifa.com/api/v3/picture/players/2026/201200',
  'Cristiano Ronaldo': 'https://api.fifa.com/api/v3/picture/players/2026/201200',
  'لويس دياز': 'https://api.fifa.com/api/v3/picture/players/2026/422204',
  'Luis Diaz': 'https://api.fifa.com/api/v3/picture/players/2026/422204',
  'أشرف حكيمي': 'https://api.fifa.com/api/v3/picture/players/2026/410423',
  'Achraf Hakimi': 'https://api.fifa.com/api/v3/picture/players/2026/410423'
};

const getPlayerPhoto = (name: string) => {
  return PLAYER_PHOTOS[name] || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`;
};

const getTeamFlag = (teamName: string) => {
  const allTeams = Object.values(getTeams());
  const match = allTeams.find(
    t => t.name.toLowerCase() === teamName.toLowerCase() || 
         (teamName.includes('مصر') && t.id === 'EGY') ||
         (teamName.includes('أرجنتين') && t.id === 'ARG') ||
         (teamName.includes('سويد') && t.id === 'SWE') ||
         (teamName.includes('فرنسا') && t.id === 'FRA') ||
         (teamName.includes('مغرب') && t.id === 'MAR')
  );
  return match?.flag || `https://flagcdn.com/w160/un.png`;
};

export function StatsSummaryCard() {
  const { lang } = useLanguage();
  const { data: scorers = [] } = useTopScorers();
  const { data: results = [] } = useResults();

  // 1. Matches Count
  const matchesCount = results.length || 72; // fallback to 72 if no data

  // 2. Goals Count
  const totalGoals = results.length > 0 
    ? results.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0)
    : scorers.reduce((sum, p) => sum + (p.goals ?? 0), 0) || 215; // fallback to 215

  // 3. Top Scorer
  const topScorer = scorers[0] || {
    name: lang === 'ar' ? 'ليونيل ميسي' : 'Lionel Messi',
    team_name: lang === 'ar' ? 'الأرجنتين' : 'Argentina',
    goals: 6
  };

  // 4. Top Playmaker (Sorted by assists)
  const playmakers = [...scorers].sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0));
  const topPlaymaker = playmakers[0] || {
    name: lang === 'ar' ? 'الكسندر اساك' : 'Alexander Isak',
    team_name: lang === 'ar' ? 'السويد' : 'Sweden',
    assists: 3
  };

  const isAr = lang === 'ar';

  return (
    <Card className="overflow-hidden border border-border bg-gradient-card shadow-lg p-5 my-8">
      {/* Title Header bar */}
      <div className="flex items-center justify-between bg-[#1e3a8a] text-white px-5 py-3 rounded-lg mb-6 shadow-md">
        <h3 className={cn("text-lg font-black tracking-wide flex items-center gap-2", isAr && "font-arabic")}>
          <Award className="h-5 w-5 text-primary" />
          {isAr ? 'الإحصائيات العامة للبطولة' : 'Tournament General Statistics'}
        </h3>
        <span className={cn("text-xs bg-white/20 px-3 py-1 rounded-full", isAr && "font-arabic")}>
          {isAr ? 'جميع الإحصائيات' : 'All Stats'}
        </span>
      </div>

      {/* Grid containing the 4 mini-cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Matches count */}
        <div className="flex flex-col justify-center bg-background/40 border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-3 right-3 text-muted-foreground/15 group-hover:scale-110 transition-transform">
            <Trophy className="h-16 w-16" />
          </div>
          <span className={cn("text-sm font-bold text-red-500 mb-1", isAr && "font-arabic")}>
            {isAr ? 'عدد المباريات' : 'Matches Played'}
          </span>
          <span className="text-4xl font-extrabold font-display text-foreground tracking-tight z-10">
            {matchesCount}
          </span>
        </div>

        {/* Card 2: Goals scored */}
        <div className="flex flex-col justify-center bg-background/40 border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-3 right-3 text-muted-foreground/15 group-hover:scale-110 transition-transform">
            <Footprints className="h-16 w-16" />
          </div>
          <span className={cn("text-sm font-bold text-red-500 mb-1", isAr && "font-arabic")}>
            {isAr ? 'الأهداف المسجلة' : 'Goals Scored'}
          </span>
          <span className="text-4xl font-extrabold font-display text-foreground tracking-tight z-10">
            {totalGoals}
          </span>
        </div>

        {/* Card 3: Top Goalscorer */}
        <div className="flex items-center gap-4 bg-background/40 border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <img 
            src={getPlayerPhoto(topScorer.name)} 
            alt={topScorer.name}
            className="w-14 h-14 rounded-xl object-cover bg-muted/50 border border-border/80 shadow-inner" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(topScorer.name)}`;
            }}
          />
          <div className="flex-1 min-w-0">
            <span className={cn("text-[11px] font-bold text-red-500 block mb-0.5", isAr && "font-arabic")}>
              {isAr ? 'هداف البطولة' : 'Top Scorer'}
            </span>
            <span className={cn("text-sm font-extrabold text-foreground truncate block", isAr && "font-arabic")}>
              {topScorer.name}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <img 
                src={getTeamFlag(topScorer.team_name)} 
                alt={topScorer.team_name} 
                className="w-4 h-3.5 object-cover rounded-[2px]" 
              />
              <span className={cn("text-xs text-muted-foreground truncate", isAr && "font-arabic")}>
                {topScorer.team_name}
              </span>
            </div>
          </div>
          <span className="text-3xl font-black font-display text-primary ps-2">
            {topScorer.goals}
          </span>
        </div>

        {/* Card 4: Top Playmaker */}
        <div className="flex items-center gap-4 bg-background/40 border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <img 
            src={getPlayerPhoto(topPlaymaker.name)} 
            alt={topPlaymaker.name}
            className="w-14 h-14 rounded-xl object-cover bg-muted/50 border border-border/80 shadow-inner"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(topPlaymaker.name)}`;
            }}
          />
          <div className="flex-1 min-w-0">
            <span className={cn("text-[11px] font-bold text-red-500 block mb-0.5", isAr && "font-arabic")}>
              {isAr ? 'صانع الأهداف' : 'Top Playmaker'}
            </span>
            <span className={cn("text-sm font-extrabold text-foreground truncate block", isAr && "font-arabic")}>
              {topPlaymaker.name}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <img 
                src={getTeamFlag(topPlaymaker.team_name)} 
                alt={topPlaymaker.team_name} 
                className="w-4 h-3.5 object-cover rounded-[2px]" 
              />
              <span className={cn("text-xs text-muted-foreground truncate", isAr && "font-arabic")}>
                {topPlaymaker.team_name}
              </span>
            </div>
          </div>
          <span className="text-3xl font-black font-display text-primary ps-2">
            {topPlaymaker.assists || topPlaymaker.goals || 3}
          </span>
        </div>
      </div>
    </Card>
  );
}
