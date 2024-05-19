import { Request, Response } from "express";
import { connection } from "../utils/db";

export async function getRandomShows(req: Request, res: Response) {
	connection.execute(
		"SELECT * from tvshow ORDER BY RAND() LIMIT ?",
		[req.params.n],
		function (err, results, fields) {
			res.json(results);
		}
	);
}

export async function getShows(req: Request, res: Response) {
	connection.execute(
		"SELECT * from tvshow",
		[],
		function (err, results, fields) {
			res.json(results);
			console.log(results);
		}
	);
}

export async function getShowsByGenre(req: Request, res: Response) {
	connection.execute(
		`SELECT shg.show_id, shg.genre, t.image, t.title, 
			t.description, t.year, t.country, t.director as director_id, 
    		d.name as director_name, t.seasons, t.episodes
		FROM genre g
		JOIN show_has_genre shg ON shg.genre = g.genre
		JOIN tvshow t ON shg.show_id = t.id
		JOIN director d ON t.director = d.id
		WHERE shg.genre = ?;`,
		[req.params.genre],
		function (err, results, fields) {
			res.json(results);
		}
	);
}

export async function getShowById(req: Request, res: Response) {
	connection.execute(
		"SELECT * FROM tvshow t WHERE t.id = ?;",
		[req.params.id],
		function (err, results, fields) {
			res.json(results);
		}
	);
}

export async function getEpisodesByShowId(req: Request, res: Response) {
	connection.execute(
		`SELECT 
			e.id as ep_id, t.title, 
            s.id as season_id,
    		s.season_num, 
    		e.ep_num, 
    		e.ep_title
		FROM tvshow t
		JOIN season s ON t.id = s.show_id
		JOIN episode e ON s.id = e.season_id
		WHERE t.id = ?;`,
		[req.params.showid],
		function (err, results, fields) {
			res.json(results);
		}
	);
}
