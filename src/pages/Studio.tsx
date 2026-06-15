import { useState, useEffect, useRef } from 'react';
import { Video, Users, MessageSquare, Radio, Maximize, Minimize, PanelRightClose, PanelRightOpen, Mic, MicOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Navigation } from '@/components/tikitaka/Navigation';
import { TikiTakaFooter } from '@/components/tikitaka/TikiTakaFooter';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { LiveChat } from '@/components/tikitaka/LiveChat';

export default function Studio() {
  const { lang, dir } = useLanguage();
  const [showChat, setShowChat] = useState(true);
  const [isTheater, setIsTheater] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-SA';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
  }, [isListening]);

  useEffect(() => {
    if (isListening) {
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    } else {
      recognitionRef.current?.stop();
      setTimeout(() => setTranscript(''), 1000);
    }
  }, [isListening]);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navigation />

      <main className={cn("container mx-auto transition-all", isTheater ? "py-0 px-0 min-h-[calc(100vh-64px)]" : "py-10 px-4 lg:px-8 space-y-8 min-h-[70vh]")}>
        {!isTheater && (
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-neon">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h1 className={cn('font-display font-extrabold text-3xl', lang === 'ar' && 'font-arabic')}>
                  {lang === 'ar' ? 'الاستوديو المباشر' : 'Live Studio'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
                  {lang === 'ar' ? 'بث حصري للمتابعين' : 'Exclusive broadcast for followers'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowChat(!showChat)} variant="outline" className="gap-2">
                {showChat ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                {showChat ? (lang === 'ar' ? 'إخفاء الشات' : 'Hide Chat') : (lang === 'ar' ? 'إظهار الشات' : 'Show Chat')}
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <NavLink to="/live">
                  <Radio className="h-4 w-4 text-live" />
                  {lang === 'ar' ? 'العودة للمباريات المباشرة' : 'Back to Live Matches'}
                </NavLink>
              </Button>
            </div>
          </header>
        )}

        <div className={cn("grid gap-6", isTheater ? "grid-cols-1" : (showChat ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"))}>
          <div className={cn("relative transition-all", isTheater ? "h-[calc(100vh-64px)] w-full" : (showChat ? "lg:col-span-2" : "col-span-1"))}>
            <Card className={cn("bg-black overflow-hidden flex flex-col items-center justify-center border-border relative group", isTheater ? "h-full w-full rounded-none" : "aspect-video rounded-xl")}>
              
              {/* Controls Overlay */}
              <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={() => setIsListening(!isListening)} 
                  className={cn("border-none text-white", isListening ? "bg-live hover:bg-live/80" : "bg-black/50 hover:bg-black/80")}
                  title={lang === 'ar' ? "الترجمة الفورية (Captioning)" : "Live Captions"}
                >
                  {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
                </Button>
                {isTheater && (
                  <Button variant="secondary" size="icon" onClick={() => setShowChat(!showChat)} className="bg-black/50 text-white hover:bg-black/80 border-none">
                    {showChat ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="secondary" size="icon" onClick={() => setIsTheater(!isTheater)} className="bg-black/50 text-white hover:bg-black/80 border-none">
                  {isTheater ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <Video className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className={cn('text-xl font-bold text-white mb-2', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? 'البث لم يبدأ بعد' : 'Broadcast not started yet'}
              </h3>
              <p className="text-white/50 text-sm max-w-md text-center px-4">
                {lang === 'ar'
                  ? 'انتظرونا قريباً في بث مباشر وتغطية حصرية. سيتم إشعاركم فور بدء البث.'
                  : 'Stay tuned for our exclusive live broadcast. You will be notified when the stream starts.'}
              </p>

              {/* Live Subtitles Overlay */}
              {transcript && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-[90%] sm:max-w-[70%] z-50 pointer-events-none">
                  <div className="bg-black/75 backdrop-blur-md text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-base sm:text-xl font-arabic font-bold text-center leading-relaxed border border-white/10 shadow-2xl animate-fade-in-up">
                    {transcript}
                  </div>
                </div>
              )}

              {/* Overlay Chat in Theater Mode */}
              {isTheater && showChat && (
                <div className="absolute top-0 right-0 w-full sm:w-[350px] h-full z-40 bg-gradient-to-l from-black/90 via-black/40 to-transparent flex flex-col justify-end p-2 sm:p-4">
                  <LiveChat matchId="studio_live" variant="overlay" />
                </div>
              )}
            </Card>
          </div>

          {!isTheater && showChat && (
            <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="p-4 border-border bg-card/60 backdrop-blur flex-1 flex flex-col min-h-[500px]">
                <h3 className={cn('font-bold text-lg mb-4 flex items-center gap-2', lang === 'ar' && 'font-arabic')}>
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {lang === 'ar' ? 'الدردشة الحية' : 'Live Chat'}
                </h3>
                <div className="flex-1 min-h-0 relative">
                  <div className="absolute inset-0 overflow-y-auto pr-2">
                    <LiveChat matchId="studio_live" />
                  </div>
                </div>
              </Card>

            <Card className="p-6 border-border bg-card/60 backdrop-blur">
              <h3 className={cn('font-bold text-lg mb-4 flex items-center gap-2', lang === 'ar' && 'font-arabic')}>
                <Users className="h-5 w-5 text-primary" />
                {lang === 'ar' ? 'إحصائيات البث' : 'Stream Stats'}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'المشاهدين الآن' : 'Viewers'}</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}</span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </Card>
          </div>
          )}
        </div>
      </main>

      {!isTheater && <TikiTakaFooter />}
    </div>
  );
}
