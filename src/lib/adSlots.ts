// Ad Slots Configuration
// Each slot represents a specific location in the UI with predefined dimensions

export interface AdSlot {
  id: string;
  name: string;
  location: string; // hero, sidebar, news-page, live-page
  width: string;
  height: string;
  description: string;
}

export const LOCATIONS = ['global', 'hero', 'news-page', 'live-page', 'marquee'];

export const AD_SLOTS: AdSlot[] = [
  // Global Floating Ad
  {
    id: 'global-floating',
    name: 'Global Floating Banner',
    location: 'global',
    width: '320px',
    height: '100px',
    description: 'Floating ad displayed on all pages'
  },
  
  // Hero Section Slots
  {
    id: 'hero-sidebar-1',
    name: 'Hero Sidebar 1',
    location: 'hero',
    width: '280px',
    height: 'auto',
    description: 'Sidebar ad on home page hero section'
  },
  {
    id: 'hero-sidebar-2',
    name: 'Hero Sidebar 2',
    location: 'hero',
    width: '280px',
    height: '250px',
    description: 'Secondary sidebar ad on home page'
  },
  {
    id: 'hero-banner',
    name: 'Hero Banner',
    location: 'hero',
    width: '100%',
    height: '120px',
    description: 'Full-width banner on home page'
  },

  // News Page Slots
  {
    id: 'news-sidebar-1',
    name: 'News Sidebar 1',
    location: 'news-page',
    width: '280px',
    height: 'auto',
    description: 'Sidebar ad on news page'
  },
  {
    id: 'news-sidebar-2',
    name: 'News Sidebar 2',
    location: 'news-page',
    width: '280px',
    height: '250px',
    description: 'Secondary sidebar ad on news page'
  },

  // Live Page Slots
  {
    id: 'live-sidebar-1',
    name: 'Live Sidebar 1',
    location: 'live-page',
    width: '280px',
    height: 'auto',
    description: 'Sidebar ad on live matches page'
  },
  {
    id: 'live-sidebar-2',
    name: 'Live Sidebar 2',
    location: 'live-page',
    width: '280px',
    height: '250px',
    description: 'Secondary sidebar ad on live page'
  },

  // Marquee Row
  {
    id: 'marquee-row',
    name: 'Sponsor Marquee Row',
    location: 'marquee',
    width: 'auto',
    height: '60px',
    description: 'Continuous scrolling row of sponsor images'
  },
];

// Helper function to get slots by location
export function getSlotsByLocation(location: string): AdSlot[] {
  return AD_SLOTS.filter(slot => slot.location === location);
}

// Helper function to get slot by ID
export function getSlotById(id: string): AdSlot | undefined {
  return AD_SLOTS.find(slot => slot.id === id);
}
