INSERT INTO tournament_stats (id, total_goals, yellow_cards, red_cards, matches_played)
VALUES (1, 142, 210, 15, 48)
ON CONFLICT (id) DO UPDATE 
SET total_goals = 142, yellow_cards = 210, red_cards = 15, matches_played = 48;

INSERT INTO player_stats (player_name, team_name, goals, assists, motm_awards)
VALUES 
('Kylian Mbappe', 'France', 5, 2, 3),
('Harry Kane', 'England', 4, 1, 2),
('Vinicius Jr', 'Brazil', 3, 3, 2),
('Lionel Messi', 'Argentina', 3, 4, 3),
('Jude Bellingham', 'England', 3, 1, 1)
ON CONFLICT (player_name, team_name) DO UPDATE
SET goals = EXCLUDED.goals, assists = EXCLUDED.assists, motm_awards = EXCLUDED.motm_awards;
