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
exports.setEpisodeUnseen = exports.setEpisodeSeen = exports.getSeenEps = exports.addToCompleted = exports.addToWishlist = exports.getCompletedShows = exports.getInProgressShows = exports.getWishlistedShows = exports.getUsersData = void 0;
const db_1 = require("../utils/db");
function getUsersData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute("SELECT * FROM user", [], function (err, results, fields) {
            if (err) {
                console.error(err);
                res.status(500).json({ message: "Errore in getUsersData" });
            }
            else {
                res.json(results);
                console.log(results);
            }
        });
    });
}
exports.getUsersData = getUsersData;
function getWishlistedShows(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`SELECT u.*, t.id, t.title, t.image
        from usersaved u
        JOIN tvshow t ON u.show_id = t.id
        WHERE u.user_id = ? AND u.wishlist = 1
        GROUP BY u.show_id;`, [req.params.userid], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ message: "Errore nella chiamata di getWishlistedShows" });
            }
            else {
                res.json(results);
            }
        });
    });
}
exports.getWishlistedShows = getWishlistedShows;
function getInProgressShows(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`SELECT t.*
        FROM tvshow t
        JOIN usersaved u ON t.id = u.show_id
        WHERE u.user_id = ? AND u.seen = 1 AND EXISTS (
          SELECT *
          FROM season s
          INNER JOIN episode e ON s.id = e.season_id
          WHERE s.show_id = t.id
          AND (u.episode_id IS NULL OR e.id > u.episode_id)
          AND e.id NOT IN (
            SELECT episode_id
            FROM usersaved
            WHERE user_id = ? AND show_id = t.id AND seen = 1
          )
        )
        GROUP BY t.title;`, [req.params.userid, req.params.userid], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ message: "Errore nella chiamata di getInProgressShows" });
            }
            else {
                res.json(results);
            }
        });
    });
}
exports.getInProgressShows = getInProgressShows;
function getCompletedShows(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`SELECT t.*
        FROM tvshow t
        JOIN (
            SELECT s.show_id, COUNT(*) AS total_episodes, SUM(u.seen) AS seen_episodes
            FROM season s
            JOIN episode e ON s.id = e.season_id
            LEFT JOIN usersaved u ON s.id = u.season_id 
    	        AND e.id = u.episode_id 
    	        AND u.seen = 1 
    	        AND u.user_id = ?
            GROUP BY s.show_id
        ) AS episode_counts ON t.id = episode_counts.show_id
        WHERE episode_counts.total_episodes = episode_counts.seen_episodes;`, [req.params.userid], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ message: "Errore nella chiamata di getCompletedShows" });
            }
            else {
                res.json(results);
            }
        });
    });
}
exports.getCompletedShows = getCompletedShows;
function addToWishlist(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`INSERT INTO usersaved (user_id, show_id, season_id, episode_id, seen, wishlist)
        SELECT 
            ?, -- user_id
            ?, -- show_id
            s.id AS season_id,
            e.id AS episode_id,
            0 AS seen,
            1 AS wishlist
        FROM season s
        JOIN episode e ON s.id = e.season_id
        WHERE s.show_id = ?
        ON DUPLICATE KEY UPDATE
           seen = VALUES(seen), wishlist = VALUES(wishlist);`, [req.params.userid, req.params.showid, req.params.showid], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ message: "Errore nella chiamata di addToWishlist()" });
            }
            else {
                res.status(200).send("Serie aggiunta correttamente alla wishlist");
            }
        });
    });
}
exports.addToWishlist = addToWishlist;
function addToCompleted(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`INSERT INTO usersaved (user_id, show_id, season_id, episode_id, seen, wishlist)
        SELECT 
            ?, -- user_id
            ?, -- show_id
            s.id AS season_id,
            e.id AS episode_id,
            1 AS seen,
            0 AS wishlist
        FROM season s
        JOIN episode e ON s.id = e.season_id
        WHERE s.show_id = ?
        ON DUPLICATE KEY UPDATE
            seen = VALUES(seen), wishlist = VALUES(wishlist);`, [req.params.userid, req.params.showid, req.params.showid], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ message: "Errore nella chiamata di addToCompleted()" });
            }
            else {
                res.status(200).send("Serie contrassegnata come completa!");
            }
        });
    });
}
exports.addToCompleted = addToCompleted;
function getSeenEps(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`SELECT 
	        u.*, t.title, s.season_num, s.episodes, e.ep_num, e.ep_title
        FROM usersaved u
        JOIN tvshow t ON u.show_id = t.id
        JOIN season s ON u.season_id = s.id
        JOIN episode e ON u.episode_id = e.id
        WHERE u.show_id = ?
        AND u.user_id = ?
        AND u.seen = 1;`, [req.params.showid, req.params.userid], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ messagge: "Errore nella chiamata di getSeenEps()" });
            }
            else {
                res.json(results);
                console.log("SEEN EPS");
                console.log(results);
            }
        });
    });
}
exports.getSeenEps = getSeenEps;
function setEpisodeSeen(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`INSERT INTO usersaved 
        (user_id, show_id, season_id, episode_id, seen, wishlist) 
        VALUES
        (?, ?, ?, ?, 1, 0)
        ON DUPLICATE KEY UPDATE 
        seen = 1, wishlist = 0;`, [
            req.params.userid,
            req.params.showid,
            req.params.seasonid,
            req.params.episodeid,
        ], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ messagge: "Errore nella chiamata di setEpisodeSeen()" });
            }
            else {
                res.status(200).send("episodio settato come visto");
            }
        });
    });
}
exports.setEpisodeSeen = setEpisodeSeen;
function setEpisodeUnseen(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.connection.execute(`INSERT INTO usersaved 
        (user_id, show_id, season_id, episode_id, seen, wishlist) 
        VALUES
        (?, ?, ?, ?, 0, 0)
        ON DUPLICATE KEY UPDATE 
        seen = 0, wishlist = 0;`, [
            req.params.userid,
            req.params.showid,
            req.params.seasonid,
            req.params.episodeid,
        ], function (err, results, fields) {
            if (err) {
                console.error(err);
                res
                    .status(500)
                    .json({ messagge: "Errore nella chiamata di setEpisodeUnseen()" });
            }
            else {
                res.status(200).send("episodio settato come non visto");
            }
        });
    });
}
exports.setEpisodeUnseen = setEpisodeUnseen;
