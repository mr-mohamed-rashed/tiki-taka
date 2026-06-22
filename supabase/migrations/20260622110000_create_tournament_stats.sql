CREATE TABLE tournament_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_goals INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    motm_awards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_name, team_name)
);

-- RLS
ALTER TABLE tournament_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for tournament_stats" ON tournament_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for player_stats" ON player_stats FOR SELECT USING (true);

CREATE POLICY "Service role full access tournament_stats" ON tournament_stats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access player_stats" ON player_stats FOR ALL USING (auth.role() = 'service_role');

-- Insert default row for tournament_stats
INSERT INTO tournament_stats (id, total_goals, yellow_cards, red_cards, matches_played) VALUES (1, 0, 0, 0, 0) ON CONFLICT DO NOTHING;
