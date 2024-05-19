export interface Show {
	id: number;
	image: string;
	title: string;
	description: string;
	year: number;
	country: string;
	director: number;
	seasons: number;
	episodes: number;
}

export interface Genre {
	genre: string;
}

export interface Director {
	id: number;
	name: string;
}

export interface Episode {
	ep_id: number;
	title: string;
	season_id: number;
	season_num: number;
	ep_num: number;
	ep_title: string;
}

export interface User {
	id: number;
	username: string;
	password: string;
	role: string;
}

export interface UserEpisode {
	user_id: number;
	show_id: number;
	season_id: number;
	episode_id: number;
	seen: boolean;
	wishlist: boolean;
	title: string;
	season_num: number;
	episodes: number;
	ep_num: number;
	ep_title: string;
}

export interface LastIDs {
	tvshow_last_id: number;
	season_last_id: number;
	episode_last_id: number;
	director_last_id: number;
}
