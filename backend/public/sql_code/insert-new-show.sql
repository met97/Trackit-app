`
START TRANSACTION;

-- Recupera gli ID utilizzabili
SELECT
    @tvshow_id := IFNULL(MAX(tvshow.id), 0) + 1 AS next_tvshow_id,
    @season_id := IFNULL(MAX(season.id), 0) + 1 AS next_season_id,
    @episode_id := IFNULL(MAX(episode.id), 0) + 1 AS next_episode_id,
    @director_id := IFNULL(MAX(director.id), 0) + 1 AS next_director_id
FROM (
    tvshow, season, episode, director
);

-- Inserisce il regista se non esiste già
INSERT INTO director (id, name)
SELECT :directorID AS id, :director AS name
WHERE NOT EXISTS (
    SELECT 1 FROM director WHERE name = :director
);

-- Inserisce i dati della serie
INSERT INTO tvshow (id, image, title, description, year, country, director, seasons, episodes)
SELECT :tvshow_id AS id, :image, :title, :description, :year, :country, @director_id AS director, :seasons, :episodes
WHERE NOT EXISTS (
    SELECT 1 FROM tvshow WHERE title = :title
);

-- Inserisci le informazioni sulle stagioni
INSERT INTO season (id, show_id, season_num, episodes) VALUES ? ;
    
-- Inserisci le informazioni sugli episodi
INSERT INTO episode (id, season_id, ep_num, ep_title) VALUES ? ;

-- Inserimento generi
INSERT INTO genre (genre) VALUES :genres ON DUPLICATE KEY UPDATE genre = genre;

-- Inserimento show_has_genre
INSERT INTO show_has_genre (show_id, genre)VALUES ? ;

-- test
SELECT * from tvshow;
SELECT * FROM director;
SELECT * from season;
SELECT * from episode;
SELECT * from genre;
SELECT * from show_has_genre;

ROLLBACK;
`