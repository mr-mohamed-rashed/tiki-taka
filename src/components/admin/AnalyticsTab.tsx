import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Activity, MousePointerClick, Eye, Clock, ArrowUpRight, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay } from 'date-fns';

interface VisitorEvent {
  id: string;
  action: string;
  page: string;
  time: string;
  ip: string;
  device: string;
  icon: React.ReactNode;
}

export function AnalyticsTab() {
  const { lang } = useLanguage();
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [dailyVisitors, setDailyVisitors] = useState(0);
  const [pageViews, setPageViews] = useState(0);
  const [events, setEvents] = useState<VisitorEvent[]>([]);

  const isAr = lang === 'ar';

  useEffect(() => {
    // 1. Fetch real page views from database
    const fetchAnalytics = async () => {
      const today = startOfDay(new Date()).toISOString();
      
      const { data, count, error } = await supabase
        .from('page_views')
        .select('*', { count: 'exact' })
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setPageViews(count || 0);
        
        // Count unique sessions by grouping by IP or user agent (since we might not have IP easily here without a backend, we just estimate or count total pageviews)
        // Here we just use page views as a proxy for visitors for simplicity if no auth is present
        const uniqueAgents = new Set(data.map(d => d.user_agent));
        setDailyVisitors(uniqueAgents.size);

        // Format latest 5 events for the feed
        const latestEvents = data.slice(0, 5).map(v => ({
          id: v.id,
          action: isAr ? 'زيارة صفحة' : 'Page Visit',
          page: v.path,
          time: new Date(v.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          ip: v.ip_address || 'Unknown',
          device: v.device_type || 'Desktop',
          icon: <Eye className="w-4 h-4 text-blue-500" />
        }));
        setEvents(latestEvents);
      }
    };

    fetchAnalytics();

    // 2. Setup Realtime Presence for Live Visitors
    const channel = supabase.channel('global_visitors');
    
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      // Count unique keys in presence state
      const count = Object.keys(presenceState).length;
      setLiveVisitors(count);
    });

    channel.subscribe();

    // Refresh DB stats every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isAr, lang]);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div>
        <h3 className={cn("text-lg font-bold", isAr && "font-arabic")}>
          {isAr ? 'إحصائيات الزوار المباشرة' : 'Live Visitor Analytics'}
        </h3>
        <p className={cn("text-sm text-muted-foreground", isAr && "font-arabic")}>
          {isAr ? 'تتبع نشاط الزوار على الموقع في الوقت الفعلي' : 'Track real-time visitor activity on the site'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live Visitors Card */}
        <Card className="bg-gradient-card border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium text-muted-foreground flex items-center gap-2", isAr && "font-arabic")}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-live"></span>
              </span>
              {isAr ? 'الزوار في الوقت الحالي' : 'Live Visitors Now'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
              {liveVisitors}
              <span className="text-sm font-medium text-live flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {isAr ? 'مباشر' : 'Live'}
              </span>
            </div>
            <p className={cn("text-xs text-muted-foreground mt-2", isAr && "font-arabic")}>
              {isAr ? 'يتم التحديث فوراً' : 'Updates instantly'}
            </p>
          </CardContent>
        </Card>

        {/* Daily Visitors Card */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium text-muted-foreground flex items-center gap-2", isAr && "font-arabic")}>
              <Users className="w-4 h-4" />
              {isAr ? 'إجمالي زوار اليوم' : 'Total Visitors Today'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
              {dailyVisitors.toLocaleString()}
            </div>
            <p className={cn("text-xs text-muted-foreground mt-2", isAr && "font-arabic")}>
              {isAr ? 'الزوار الفريدين لليوم' : 'Unique visitors today'}
            </p>
          </CardContent>
        </Card>

        {/* Page Views Card */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium text-muted-foreground flex items-center gap-2", isAr && "font-arabic")}>
              <Globe className="w-4 h-4" />
              {isAr ? 'مشاهدات الصفحات' : 'Page Views'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tight">
              {pageViews.toLocaleString()}
            </div>
            <p className={cn("text-xs text-muted-foreground mt-2", isAr && "font-arabic")}>
              {isAr ? 'إجمالي مشاهدات اليوم' : 'Total page views today'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isAr && "font-arabic")}>
            <Clock className="w-5 h-5 text-primary" />
            {isAr ? 'سجل نشاط الزوار المباشر' : 'Live Visitor Activity Feed'}
          </CardTitle>
          <CardDescription className={isAr ? "font-arabic" : ""}>
            {isAr ? 'ماذا يفعل الزوار على موقعك الآن؟' : 'What are your visitors doing right now?'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {events.map((event, i) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {event.icon}
                  </div>
                  
                  {/* Content */}
                  <div className={cn("w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/50", isAr ? 'md:group-odd:text-right md:group-even:text-left' : 'md:group-odd:text-right md:group-even:text-left')}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">{event.time}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{event.device}</Badge>
                    </div>
                    <h4 className={cn("text-sm font-bold text-foreground mb-1", isAr && "font-arabic")}>{event.action}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{event.page}</span>
                      <span className="opacity-60">{event.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
