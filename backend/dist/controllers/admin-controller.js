"use strict";
/**
 * DOPO L'INSERIMENTO DEL DIRECTOR
 * IL CODICE È DUPLICATO PER FAR FRONTE ALLE DUE CASISTICHE
 * SE AVANZA TEMPO, TROVARE ALTERNATIVA
 */
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
exports.uploadNewShow = void 0;
const db_1 = require("../utils/db");
function uploadNewShow(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { image, title, description, year, country, director, seasons, episodes, genre, season, episode, } = req.body;
        let risultatoQuery; //contenitore per valutare i risultati degli inserimenti
        db_1.connection.beginTransaction(function (err) {
            if (err) {
                db_1.connection.rollback(() => {
                    console.error(err);
                    res
                        .status(500)
                        .json({ message: "Errore avvio transazione uploadNewShow" });
                });
            }
            else {
                /** TROVO GLI ID DA UTILIZZARE */
                db_1.connection.execute(`
				SELECT
					@tvshow_id := IFNULL(MAX(tvshow.id), 0) + 1 AS next_tvshow_id,
					@season_id := IFNULL(MAX(season.id), 0) + 1 AS next_season_id,
					@episode_id := IFNULL(MAX(episode.id), 0) + 1 AS next_episode_id,
					@director_id := IFNULL(MAX(director.id), 0) + 1 AS next_director_id
				FROM (
					tvshow, season, episode, director
				);`, [], (err, results) => {
                    if (err) {
                        db_1.connection.rollback(() => {
                            console.error("transaction: errore settaggio @ids: ", err);
                            res
                                .status(500)
                                .json({ message: "Errore avvio transazione uploadNewShow" });
                        });
                    }
                    else {
                        let { next_tvshow_id, next_season_id, next_episode_id, next_director_id, } = results[0];
                        /** INSERISCO REGISTA, SE NON GIÀ ESISTENTE */
                        db_1.connection.execute(`INSERT INTO director (id, name)
							SELECT :directorID AS id, :director AS name
							WHERE NOT EXISTS (
								SELECT 1 FROM director WHERE name = :director
							);`, { director: director, directorID: next_director_id }, function (err, results) {
                            if (err) {
                                db_1.connection.rollback(() => {
                                    console.error("Transaction: Errore insert director: ", err);
                                    res.status(500).json({
                                        message: "Errore avvio transazione uploadNewShow",
                                    });
                                });
                            }
                            else {
                                risultatoQuery = results;
                                /** DIRECTOR NON GIÀ ESISTENTE */
                                if (risultatoQuery.affectedRows > 0) {
                                    console.log("director inserito");
                                    /** INSERISCO SERIE TV, SE NON GIÀ ESISTENTE */
                                    db_1.connection.execute(`INSERT INTO tvshow (id, image, title, description, year, country, director, seasons, episodes)
										SELECT :tvshow_id AS id, :image, :title, :description, :year, :country, :directorID AS director, :seasons, :episodes
										WHERE NOT EXISTS (
											SELECT 1 FROM tvshow WHERE title = :title
										);`, {
                                        tvshow_id: next_tvshow_id,
                                        image: image,
                                        title: title,
                                        description: description,
                                        year: year,
                                        directorID: next_director_id,
                                        country: country,
                                        seasons: seasons,
                                        episodes: episodes,
                                    }, function (err, results) {
                                        if (err) {
                                            db_1.connection.rollback(() => {
                                                console.error(err);
                                                res.status(500).json({
                                                    message: "Transaction: errore inserimento tvshow",
                                                });
                                            });
                                        }
                                        else {
                                            risultatoQuery = results;
                                            if (risultatoQuery.affectedRows > 0) {
                                                console.log("tvshow inserita");
                                            }
                                            else if (risultatoQuery.affectedRows == 0) {
                                                console.log("tvshow già esistente");
                                                //interruzione
                                                db_1.connection.commit(function (err) {
                                                    res.sendStatus(200);
                                                });
                                                return;
                                            }
                                            /** DATI STAGIONI */
                                            const mapSeasonData = season.map((season) => [
                                                (season.id = next_season_id++),
                                                (season.show_id = next_tvshow_id),
                                                season.season_num,
                                                season.episodes,
                                            ]);
                                            console.log("mapSeasonData: ", mapSeasonData);
                                            let mapSeasonIDs = [];
                                            for (let i = 0; i < mapSeasonData.length; i++) {
                                                mapSeasonIDs.push([
                                                    mapSeasonData[i][2], //season number
                                                    mapSeasonData[i][0], //season id
                                                ]); // [ [seas_num, seas_id], [seas_num, seas_id], ... ]
                                            }
                                            console.log("mapSeasonIDs: ", mapSeasonIDs);
                                            /** INSERISCO STAGIONI */
                                            db_1.connection.query("INSERT INTO season (id, show_id, season_num, episodes) VALUES ?", [mapSeasonData], function (err, results) {
                                                if (err) {
                                                    db_1.connection.rollback(() => {
                                                        console.error(err);
                                                        res.status(500).json({
                                                            message: "Transaction: errore inserimento season",
                                                        });
                                                    });
                                                }
                                                else {
                                                    console.log("Stagioni inserite");
                                                    /** DATI EPISODI */
                                                    const mapEpisodeData = episode.map((ep) => {
                                                        const foundSeason = mapSeasonIDs.find(season => season[0] === ep.season_num);
                                                        if (foundSeason) {
                                                            return [
                                                                (ep.id = next_episode_id++),
                                                                (ep.season_id = foundSeason[1]),
                                                                //ep.season_num,
                                                                ep.ep_num,
                                                                ep.ep_title,
                                                            ];
                                                        }
                                                    });
                                                    console.log("Dati episodi: ", mapEpisodeData);
                                                    db_1.connection.query("INSERT INTO episode (id, season_id, ep_num, ep_title) VALUES ?", [mapEpisodeData], function (err, results) {
                                                        if (err) {
                                                            db_1.connection.rollback(() => {
                                                                console.error(err);
                                                                res.status(500).json({
                                                                    message: "Transaction: errore inserimento episodi",
                                                                });
                                                            });
                                                        }
                                                        else {
                                                            console.log("Episodi inseriti");
                                                            //DATI GENERI
                                                            const mapGenreData = genre.map((genre) => [genre]);
                                                            console.log("Generi: ", mapGenreData);
                                                            db_1.connection.query("INSERT INTO genre (genre) VALUES :genres ON DUPLICATE KEY UPDATE genre = genre;", { genres: mapGenreData }, function (err, results) {
                                                                if (err) {
                                                                    db_1.connection.rollback(() => {
                                                                        console.error(err);
                                                                        res.status(500).json({
                                                                            message: "Transaction: errore inserimento generi",
                                                                        });
                                                                    });
                                                                }
                                                                else {
                                                                    console.log("Generi inseriti");
                                                                    // SHOW HAS GENRE
                                                                    let showHasGenre = [];
                                                                    for (let i = 0; i < genre.length; i++) {
                                                                        showHasGenre.push([
                                                                            next_tvshow_id,
                                                                            genre[i],
                                                                        ]);
                                                                    }
                                                                    console.log("showHasGenre: ", showHasGenre);
                                                                    db_1.connection.query(`INSERT INTO show_has_genre (show_id, genre)VALUES ?`, [showHasGenre], function (err, results) {
                                                                        if (err) {
                                                                            db_1.connection.rollback(() => {
                                                                                console.error(err);
                                                                                res.status(500).json({
                                                                                    message: "Transaction: errore inserimento showHasGenre",
                                                                                });
                                                                            });
                                                                        }
                                                                        else {
                                                                            db_1.connection.commit(function (err) {
                                                                                res.sendStatus(200);
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                                else if (risultatoQuery.affectedRows == 0) {
                                    /** DIRECTOR GIÀ ESISTENTE */
                                    console.log("director già esistente");
                                    // imposto next_director_id con l'id del director esistente, per le prossime query
                                    db_1.connection.query(`select director.id
											from director
											where director.name = :director`, { director: director }, function (err, results) {
                                        if (err) {
                                            db_1.connection.rollback(() => {
                                                console.error(err);
                                                res.status(500).json({
                                                    message: "Transaction: errore nella ricerca del director esistente",
                                                });
                                            });
                                        }
                                        else {
                                            next_director_id = results[0].id;
                                            console.log("1: ", next_director_id);
                                            /** INSERISCO SERIE TV, SE NON GIÀ ESISTENTE */
                                            db_1.connection.execute(`INSERT INTO tvshow (id, image, title, description, year, country, director, seasons, episodes)
										SELECT :tvshow_id AS id, :image, :title, :description, :year, :country, :directorID AS director, :seasons, :episodes
										WHERE NOT EXISTS (
											SELECT 1 FROM tvshow WHERE title = :title
										);`, {
                                                tvshow_id: next_tvshow_id,
                                                image: image,
                                                title: title,
                                                description: description,
                                                year: year,
                                                directorID: next_director_id,
                                                country: country,
                                                seasons: seasons,
                                                episodes: episodes,
                                            }, function (err, results) {
                                                if (err) {
                                                    db_1.connection.rollback(() => {
                                                        console.error(err);
                                                        res.status(500).json({
                                                            message: "Transaction: errore inserimento tvshow",
                                                        });
                                                    });
                                                }
                                                else {
                                                    risultatoQuery = results;
                                                    if (risultatoQuery.affectedRows > 0) {
                                                        console.log("tvshow inserita");
                                                    }
                                                    else if (risultatoQuery.affectedRows == 0) {
                                                        console.log("tvshow già esistente");
                                                        //interruzione
                                                        db_1.connection.commit(function (err) {
                                                            res.sendStatus(200);
                                                        });
                                                        return;
                                                    }
                                                    /** DATI STAGIONI */
                                                    const mapSeasonData = season.map((season) => [
                                                        (season.id = next_season_id++),
                                                        (season.show_id = next_tvshow_id),
                                                        season.season_num,
                                                        season.episodes,
                                                    ]);
                                                    console.log("mapSeasonData: ", mapSeasonData);
                                                    let mapSeasonIDs = [];
                                                    for (let i = 0; i < mapSeasonData.length; i++) {
                                                        mapSeasonIDs.push([
                                                            mapSeasonData[i][2], //season number
                                                            mapSeasonData[i][0], //season id
                                                        ]); // [ [seas_num, seas_id], [seas_num, seas_id], ... ]
                                                    }
                                                    console.log("mapSeasonIDs: ", mapSeasonIDs);
                                                    /** INSERISCO STAGIONI */
                                                    db_1.connection.query("INSERT INTO season (id, show_id, season_num, episodes) VALUES ?", [mapSeasonData], function (err, results) {
                                                        if (err) {
                                                            db_1.connection.rollback(() => {
                                                                console.error(err);
                                                                res.status(500).json({
                                                                    message: "Transaction: errore inserimento season",
                                                                });
                                                            });
                                                        }
                                                        else {
                                                            console.log("Stagioni inserite");
                                                            /** DATI EPISODI */
                                                            const mapEpisodeData = episode.map((ep) => {
                                                                const foundSeason = mapSeasonIDs.find(season => season[0] === ep.season_num);
                                                                if (foundSeason) {
                                                                    return [
                                                                        (ep.id = next_episode_id++),
                                                                        (ep.season_id = foundSeason[1]),
                                                                        //ep.season_num,
                                                                        ep.ep_num,
                                                                        ep.ep_title,
                                                                    ];
                                                                }
                                                            });
                                                            console.log("Dati episodi: ", mapEpisodeData);
                                                            db_1.connection.query("INSERT INTO episode (id, season_id, ep_num, ep_title) VALUES ?", [mapEpisodeData], function (err, results) {
                                                                if (err) {
                                                                    db_1.connection.rollback(() => {
                                                                        console.error(err);
                                                                        res.status(500).json({
                                                                            message: "Transaction: errore inserimento episodi",
                                                                        });
                                                                    });
                                                                }
                                                                else {
                                                                    console.log("Episodi inseriti");
                                                                    //DATI GENERI
                                                                    const mapGenreData = genre.map((genre) => [genre]);
                                                                    console.log("Generi: ", mapGenreData);
                                                                    db_1.connection.query("INSERT INTO genre (genre) VALUES :genres ON DUPLICATE KEY UPDATE genre = genre;", { genres: mapGenreData }, function (err, results) {
                                                                        if (err) {
                                                                            db_1.connection.rollback(() => {
                                                                                console.error(err);
                                                                                res.status(500).json({
                                                                                    message: "Transaction: errore inserimento generi",
                                                                                });
                                                                            });
                                                                        }
                                                                        else {
                                                                            console.log("Generi inseriti");
                                                                            // SHOW HAS GENRE
                                                                            let showHasGenre = [];
                                                                            for (let i = 0; i < genre.length; i++) {
                                                                                showHasGenre.push([
                                                                                    next_tvshow_id,
                                                                                    genre[i],
                                                                                ]);
                                                                            }
                                                                            console.log("showHasGenre: ", showHasGenre);
                                                                            db_1.connection.query(`INSERT INTO show_has_genre (show_id, genre)VALUES ?`, [showHasGenre], function (err, results) {
                                                                                if (err) {
                                                                                    db_1.connection.rollback(() => {
                                                                                        console.error(err);
                                                                                        res
                                                                                            .status(500)
                                                                                            .json({
                                                                                            message: "Transaction: errore inserimento showHasGenre",
                                                                                        });
                                                                                    });
                                                                                }
                                                                                else {
                                                                                    db_1.connection.commit(function (err) {
                                                                                        res.sendStatus(200);
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}
exports.uploadNewShow = uploadNewShow;
