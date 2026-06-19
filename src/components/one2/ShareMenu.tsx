import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';

export function ShareMenu({ url, title = 'Tiki Taka Live' }: { url?: string, title?: string }) {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 transition-colors">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-elevated">
        <DropdownMenuLabel>{lang === 'ar' ? 'مشاركة البث عبر' : 'Share Stream via'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center gap-3">
            <Facebook className="h-4 w-4 text-blue-500" />
            Facebook
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center gap-3">
            <Twitter className="h-4 w-4 text-sky-400" />
            Twitter
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href={`https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center gap-3">
            <MessageCircle className="h-4 w-4 text-green-500" />
            WhatsApp
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            Telegram
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer flex items-center gap-3">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
