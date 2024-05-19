import { Request, Response } from "express";
import { connection } from "../utils/db";
import { RowDataPacket } from "mysql2";
import { promisify } from "util";

interface Season {
	id: number;
	show_id: number;
	season_num: number;
	episodes: number;
}
interface Episode {
	id: number;
	season_id: number;
	season_num: number;
	ep_num: number;
	ep_title: string;
}
interface ShowHasGenre {
	show_id: number;
	genre: string;
}

export async function uploadNewShow(req: Request, res: Response) {
	const {
		image,
		title,
		description,
		year,
		country,
		director,
		seasons,
		episodes,
		genre,
		season,
		episode,
	} = req.body;

	let risultatoQuery: any; //contenitore per valutare i risultati degli inserimenti

	connection.beginTransaction(function (err) {
		if (err) {
			connection.rollback(() => {
				console.error(err);
				res
					.status(500)
					.json({ message: "Errore avvio transazione uploadNewShow" });
			});
		} else {
			/** TROVO GLI ID DA UTILIZZARE */
			connection.execute<RowDataPacket[]>(
				`
				SELECT
					@tvshow_id := IFNULL(MAX(tvshow.id), 0) + 1 AS next_tvshow_id,
					@season_id := IFNULL(MAX(season.id), 0) + 1 AS next_season_id,
					@episode_id := IFNULL(MAX(episode.id), 0) + 1 AS next_episode_id,
					@director_id := IFNULL(MAX(director.id), 0) + 1 AS next_director_id
				FROM (
					tvshow, season, episode, director
				);`,
				[],
				(err, results) => {
					if (err) {
						connection.rollback(() => {
							console.error("transaction: errore settaggio @ids: ", err);
							res
								.status(500)
								.json({ message: "Errore avvio transazione uploadNewShow" });
						});
					} else {
						let {
							next_tvshow_id,
							next_season_id,
							next_episode_id,
							next_director_id,
						} = results[0];

						/** INSERISCO REGISTA, SE NON GIÀ ESISTENTE */
						connection.execute(
							`INSERT INTO director (id, name)
							SELECT :directorID AS id, :director AS name
							WHERE NOT EXISTS (
								SELECT 1 FROM director WHERE name = :director
							);`,
							{ director: director, directorID: next_director_id },
							function (err, results) {
								if (err) {
									connection.rollback(() => {
										console.error("Transaction: Errore insert director: ", err);
										res.status(500).json({
											message: "Errore avvio transazione uploadNewShow",
										});
									});
								} else {
									risultatoQuery = results;
									if (risultatoQuery.affectedRows > 0) {
										console.log("director inserito");
									} else if (risultatoQuery.affectedRows == 0) {
									/** DIRECTOR GIÀ ESISTENTE */
										console.log("director già esistente");

										// imposto next_director_id con l'id del director esistente, per le prossime query
										connection.query<RowDataPacket[]>(
											`select director.id
											from director
											where director.name = :director`,
											{ director: director },
											function (err, results) {
												if (err) {
													connection.rollback(() => {
														console.error(err);
														res.status(500).json({
															message:
																"Transaction: errore nella ricerca del director esistente",
														});
													});
												} else {
													next_director_id = results[0].id;
													console.log("1: ", next_director_id);
												}
											}
										);
									}
									console.log("2: ", next_director_id);

									/** INSERISCO SERIE TV, SE NON GIÀ ESISTENTE */
									connection.execute(
										`INSERT INTO tvshow (id, image, title, description, year, country, director, seasons, episodes)
										SELECT :tvshow_id AS id, :image, :title, :description, :year, :country, :directorID AS director, :seasons, :episodes
										WHERE NOT EXISTS (
											SELECT 1 FROM tvshow WHERE title = :title
										);`,
										{
											tvshow_id: next_tvshow_id,
											image: image,
											title: title,
											description: description,
											year: year,
											directorID: next_director_id,
											country: country,
											seasons: seasons,
											episodes: episodes,
										},
										function (err, results) {
											if (err) {
												connection.rollback(() => {
													console.error(err);
													res.status(500).json({
														message: "Transaction: errore inserimento tvshow",
													});
												});
											} else {
												risultatoQuery = results;
												if (risultatoQuery.affectedRows > 0) {
													console.log("tvshow inserita");
												} else if (risultatoQuery.affectedRows == 0) {
													console.log("tvshow già esistente");
													//interruzione
													connection.commit(function (err) {
														res.sendStatus(200);
													});
													return;
												}

												/** DATI STAGIONI */
												const mapSeasonData = season.map((season: Season) => [
													(season.id = next_season_id++),
													(season.show_id = next_tvshow_id),
													season.season_num,
													season.episodes,
												]);
												console.log("mapSeasonData: ", mapSeasonData);

												let mapSeasonIDs: number[][] = [];
												for (let i = 0; i < mapSeasonData.length; i++) {
													mapSeasonIDs.push([
														mapSeasonData[i][2], //season number
														mapSeasonData[i][0], //season id
													]); // [ [seas_num, seas_id], [seas_num, seas_id], ... ]
												}

												console.log("mapSeasonIDs: ", mapSeasonIDs);
												/** INSERISCO STAGIONI */
												connection.query(
													"INSERT INTO season (id, show_id, season_num, episodes) VALUES ?",
													[mapSeasonData],
													function (err, results) {
														if (err) {
															connection.rollback(() => {
																console.error(err);
																res.status(500).json({
																	message:
																		"Transaction: errore inserimento season",
																});
															});
														} else {
															console.log("Stagioni inserite");

															/** DATI EPISODI */
															const mapEpisodeData = episode.map(
																(ep: Episode) => {
																	const foundSeason = mapSeasonIDs.find(
																		season => season[0] === ep.season_num
																	);
																	if (foundSeason) {
																		return [
																			(ep.id = next_episode_id++),
																			(ep.season_id = foundSeason[1]),
																			//ep.season_num,
																			ep.ep_num,
																			ep.ep_title,
																		];
																	}
																}
															);
															console.log("Dati episodi: ", mapEpisodeData);

															connection.query(
																"INSERT INTO episode (id, season_id, ep_num, ep_title) VALUES ?",
																[mapEpisodeData],
																function (err, results) {
																	if (err) {
																		connection.rollback(() => {
																			console.error(err);
																			res.status(500).json({
																				message:
																					"Transaction: errore inserimento episodi",
																			});
																		});
																	} else {
																		console.log("Episodi inseriti");

																		//DATI GENERI
																		const mapGenreData = genre.map(
																			(genre: string) => [genre]
																		);
																		console.log("Generi: ", mapGenreData);

																		connection.query(
																			"INSERT INTO genre (genre) VALUES :genres ON DUPLICATE KEY UPDATE genre = genre;",
																			{ genres: mapGenreData },
																			function (err, results) {
																				if (err) {
																					connection.rollback(() => {
																						console.error(err);
																						res.status(500).json({
																							message:
																								"Transaction: errore inserimento generi",
																						});
																					});
																				} else {
																					console.log("Generi inseriti");

																					// SHOW HAS GENRE
																					let showHasGenre: ShowHasGenre[][] =
																						[];
																					for (
																						let i = 0;
																						i < genre.length;
																						i++
																					) {
																						showHasGenre.push([
																							next_tvshow_id,
																							genre[i],
																						]);
																					}
																					console.log(
																						"showHasGenre: ",
																						showHasGenre
																					);

																					connection.query(
																						`INSERT INTO show_has_genre (show_id, genre)VALUES ?`,
																						[showHasGenre],
																						function (err, results) {
																							if (err) {
																								connection.rollback(() => {
																									console.error(err);
																									res.status(500).json({
																										message:
																											"Transaction: errore inserimento showHasGenre",
																									});
																								});
																							} else {
																								connection.commit(function (
																									err
																								) {
																									res.sendStatus(200);
																								});
																							}
																						}
																					);
																				}
																			}
																		);
																	}
																}
															);
														}
													}
												);
											}
										}
									);
								}
							}
						);
					}
				}
			);
		}
	});
}
