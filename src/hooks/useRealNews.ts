import { useQuery } from '@tanstack/react-query';
import type { ArticleCategory } from '@/components/sports/ArticleCard';

export interface RSSItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure?: {
    link?: string;
    type?: string;
    thumbnail?: string;
  };
  categories: string[];
}

export interface RSSFeed {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: RSSItem[];
}

export function useRealNews(lang: string = 'en') {
  return useQuery({
    queryKey: ['real-news', lang],
    queryFn: async () => {
      const feedUrl = lang === 'ar'
        ? 'https://news.google.com/rss/search?q=كأس+العالم+كرة+القدم&hl=ar&gl=EG&ceid=EG:ar'
        : 'https://news.google.com/rss/search?q=world+cup+football&hl=en-US&gl=US&ceid=US:en';

      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: RSSFeed = await response.json();
      if (data.status !== 'ok') {
        throw new Error('Failed to parse RSS feed');
      }

      return data.items;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function formatForTicker(items: RSSItem[] = [], lang: string): { tag: string; text: string }[] {
  if (items.length === 0) return [];

  return items.slice(0, 10).map((item) => ({
    tag: lang === 'ar' ? 'أخبار' : 'NEWS',
    text: item.title.split(' - ')[0] || item.title,
  }));
}

export function formatForCards(items: RSSItem[] = [], lang: string) {
  if (items.length === 0) return [];

  return items.map((item, index) => {
    const categories: ArticleCategory[] = ['match', 'team', 'transfer', 'tournament'];
    const category = categories[index % categories.length];

    let summary = item.description.replace(/<[^>]*>?/gm, '').trim();
    if (summary.length > 120) summary = `${summary.substring(0, 120)}...`;
    if (!summary) summary = item.title;

    const date = new Date(item.pubDate);
    const dateText = Number.isNaN(date.getTime())
      ? 'Recently'
      : new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

    return {
      id: item.guid || String(index),
      title: item.title.split(' - ')[0] || item.title,
      summary,
      category,
      date: dateText,
      readTime: '3 min read',
      link: item.link,
    };
  });
}
