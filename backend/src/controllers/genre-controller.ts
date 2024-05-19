import { Request, Response } from "express";
import { connection } from "../utils/db";

export async function getGenres(req: Request, res: Response) {
	connection.execute(
		"SELECT * FROM genre;",
		[],
		function (err, results, fields) {
			res.json(results);
		}
	);
}

export async function getGenresByShowId(req: Request, res: Response) {
	connection.execute(
		`SELECT g.genre
        FROM genre g
        JOIN show_has_genre shg 
        ON shg.genre = g.genre
        JOIN tvshow t ON shg.show_id = t.id
        JOIN director d ON t.director = d.id
        WHERE t.id = ?`,
		[req.params.showid],
		function (err, results, fields) {
			res.json(results);
			console.log(results);
		}
	);
}
