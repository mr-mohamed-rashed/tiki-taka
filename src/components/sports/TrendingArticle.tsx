import { TrendingUp } from 'lucide-react';

interface TrendingArticleProps {
  title: string;
  category: string;
  rank: number;
}

export function TrendingArticle({ title, category, rank }: TrendingArticleProps) {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer group">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">{category}</p>
      </div>
      <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
