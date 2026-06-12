import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  excerpt: string;
  category: string;
  image: string;
  timestamp: string;
}

export function HeroSection({ title, excerpt, category, image, timestamp }: HeroSectionProps) {
  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-lg">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
        <Badge className="bg-primary text-primary-foreground mb-4">
          {category}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-4 max-w-3xl text-white/90">
          {excerpt}
        </p>
        <div className="flex items-center text-sm text-white/80">
          <Clock className="h-4 w-4 mr-2" />
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
