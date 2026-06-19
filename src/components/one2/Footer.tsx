import { CircleDot, Twitter, Youtube, Instagram, Facebook } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <CircleDot className="h-7 w-7 text-primary" strokeWidth={2.5} />
              <span className="font-display font-extrabold text-2xl">
                <span className="text-foreground">TIKI</span>
                <span className="text-primary">-TAKA</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Live World Cup scores, fixtures, standings, and 2D match tracking - all in one place.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Youtube, Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4 uppercase text-sm tracking-wider">Sections</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><NavLink to="/" className="hover:text-primary transition-colors">Home</NavLink></li>
              <li><NavLink to="/news" className="hover:text-primary transition-colors">World Cup News</NavLink></li>
              <li><NavLink to="/standings" className="hover:text-primary transition-colors">Standings</NavLink></li>
              <li><NavLink to="/live" className="hover:text-primary transition-colors">Live Matches</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4 uppercase text-sm tracking-wider">Coverage</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Fixtures</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Results</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Top Scorers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Highlights</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4 uppercase text-sm tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
          &copy; 2026 One2. All rights reserved. World Cup data updates every 60 seconds.
        </div>
      </div>
    </footer>
  );
}
