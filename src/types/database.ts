export interface ManualMatch {
  id: string;
  competition: string;
  stage: string;
  date: string;
  status: 'upcoming' | 'live' | 'finished';
  home_team_id: string;
  home_team_name: string;
  home_team_flag: string;
  home_score: number;
  away_team_id: string;
  away_team_name: string;
  away_team_flag: string;
  away_score: number;
  venue: string;
  minute: string | null;
  highlight_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title_ar: string;
  title_en: string;
  content_ar: string | null;
  content_en: string | null;
  image_url: string | null;
  source: string | null;
  status: 'active' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
}
