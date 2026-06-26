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

export const LOCATIONS = ['global', 'hero', 'news-page', 'marquee', 'live-popup', 'groups-popup', 'road-popup', 'boot-popup'];

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

  // Popup Slots
  {
    id: 'live-popup-ad',
    name: 'Live Page Popup Ad',
    location: 'live-popup',
    width: '100%',
    height: 'auto',
    description: 'Popup ad overlay on live matches page'
  },
  {
    id: 'groups-popup-ad',
    name: 'Groups Page Popup Ad',
    location: 'groups-popup',
    width: '100%',
    height: 'auto',
    description: 'Popup ad overlay on groups page'
  },
  {
    id: 'road-popup-ad',
    name: 'Road to Final Popup Ad',
    location: 'road-popup',
    width: '100%',
    height: 'auto',
    description: 'Popup ad overlay on roadmap page'
  },
  {
    id: 'boot-popup-ad',
    name: 'Golden Boot Popup Ad',
    location: 'boot-popup',
    width: '100%',
    height: 'auto',
    description: 'Popup ad overlay on golden boot page'
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
