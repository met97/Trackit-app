import { Request, Response } from "express";
import { connection } from "../utils/db";

export async function getDirectorByShowId(req: Request, res: Response) {
	connection.execute(
		`SELECT d.id, d.name
        FROM tvshow t
        JOIN director d ON t.director = d.id
        WHERE t.id = ?`,
		[req.params.showid],
		function (err, results, fields) {
			res.json(results);
			console.log(results);
		}
	);
}
