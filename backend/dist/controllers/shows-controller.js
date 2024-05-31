"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEpisodesByShowId = exports.getShowById = exports.getShowsByGenre = exports.getShows = exports.getRandomShows = void 0;
const db_1 = require("../utils/db");
function getRandomShows(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute("SELECT * from tvshow ORDER BY RAND() LIMIT ?", [req.params.n], function (err, results, fields) {
            res.json(results);
        });
    });
}
exports.getRandomShows = getRandomShows;
function getShows(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute("SELECT * from tvshow", [], function (err, results, fields) {
            res.json(results);
            console.log(results);
        });
    });
}
exports.getShows = getShows;
function getShowsByGenre(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`SELECT shg.show_id as id, shg.genre, t.image, t.title, 
			t.description, t.year, t.country, t.director as director_id, 
    		d.name as director_name, t.seasons, t.episodes
		FROM genre g
		JOIN show_has_genre shg ON shg.genre = g.genre
		JOIN tvshow t ON shg.show_id = t.id
		JOIN director d ON t.director = d.id
		WHERE shg.genre = ?;`, [req.params.genre], function (err, results, fields) {
            res.json(results);
        });
    });
}
exports.getShowsByGenre = getShowsByGenre;
function getShowById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute("SELECT * FROM tvshow t WHERE t.id = ?;", [req.params.id], function (err, results, fields) {
            res.json(results);
        });
    });
}
exports.getShowById = getShowById;
function getEpisodesByShowId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`SELECT 
			e.id as ep_id, t.title, 
            s.id as season_id,
    		s.season_num, 
    		e.ep_num, 
    		e.ep_title
		FROM tvshow t
		JOIN season s ON t.id = s.show_id
		JOIN episode e ON s.id = e.season_id
		WHERE t.id = ?;`, [req.params.showid], function (err, results, fields) {
            res.json(results);
        });
    });
}
exports.getEpisodesByShowId = getEpisodesByShowId;
