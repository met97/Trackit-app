<!-- in questo caso si utilizza lo <script setup> per consentire l'utilizzo
della libreria Pinia, per la gestione dell'utente a livello globale -->
<script setup lang="ts">
// import generali
import { ref, Ref, onMounted } from "vue";
import axios from "axios";

//import types
import { Show, Director, Genre, Episode, UserEpisode } from "../types";

// import della rotta
import { useRoute } from "vue-router";
const route = useRoute();

// import Pinia
import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();

// data
const { activeUser } = storeToRefs(userStore);
const showData: Ref<Show[]> = ref([]);
const directorData: Ref<Director[]> = ref([]);
const genresData: Ref<Genre[]> = ref([]);
const episodesData: Ref<Episode[]> = ref([]);
const seasonsData: Ref<number[]> = ref([]);
const seenEpisodes: Ref<UserEpisode[]> = ref([]);
const seasonProgress: Ref<number | undefined> = ref(undefined);

// methods
//fetch data
const getShowData = async () => {
	try {
		const response = await axios.get("/api/show/" + route.params.id);
		showData.value = response.data;
	} catch (error) {
		console.error("Errore in getShowData: ", error);
	}
};
const getDirector = async () => {
	try {
		const response = await axios.get("/api/director/" + route.params.id);
		directorData.value = response.data;
	} catch (error) {
		console.error("Errore in getDirector: ", error);
	}
};
const getGenres = async () => {
	try {
		const response = await axios.get("/api/genres/" + route.params.id);
		genresData.value = response.data;
	} catch (error) {
		console.error("Errore in getGenres: ", error);
	}
};
const getEpisodes = async () => {
	try {
		const response = await axios.get("/api/episodes/" + route.params.id);
		episodesData.value = response.data;
		seasonsData.value = getSeasons(episodesData.value);
	} catch (error) {
		console.error("Errore in getEpisodes: ", error);
	}
};
const getSeasons = (episodes: Episode[]) => {
	const uniqueSeasons = new Set();
	episodes.forEach(episode => uniqueSeasons.add(episode.season_num));
	return Array.from(uniqueSeasons) as number[]; // Convert Set to an array
};
const getSeenEps = async () => {
	try {
		const response = await axios.get(
			"/api/user/seenepisodes/" + activeUser.value?.id + "/" + route.params.id
		);
		seenEpisodes.value = response.data;
	} catch (error) {
		console.error("Errore in getSeenEps: ", error);
	}
};
const getSeasonProgress = (season: number) => {
	const progress: number =
		(seenEpisodes.value.filter(episode => episode.season_num === season)
			.length *
			100) /
		episodesData.value.filter(episode => episode.season_num === season).length;
	seasonProgress.value = Math.round(progress);
	return Math.round(progress);
};

// insert/update data
const addToWishlist = async () => {
	try {
		axios.get(
			"/api/addtowishlist/" + activeUser.value?.id + "/" + route.params.id
		);
	} catch (error) {
		console.log("Errore in addToWishlist: ", error);
	}
};
const addToCompleted = async () => {
	try {
		axios.get(
			"/api/addtocompleted/" + activeUser.value?.id + "/" + route.params.id
		);
	} catch (error) {
		console.error("Errore in addToCompleted: ", error);
	}
};
const isEpisodeSeen = (ep_id: number) => {
	if (
		seenEpisodes.value.some(seenEpisode => seenEpisode.episode_id === ep_id)
	) {
		return true;
	} else {
		return false;
	}
};
const setEpisodeSeen = async (season_id: number, ep_id: number) => {
	try {
		if (isEpisodeSeen(ep_id) === false) {
			await axios.get(
				"/api/setepisodeseen/" +
					activeUser.value?.id +
					"/" +
					route.params.id +
					"/" +
					season_id +
					"/" +
					ep_id
			);
		} else {
			await axios.get(
				"/api/setepisodeunseen/" +
					activeUser.value?.id +
					"/" +
					route.params.id +
					"/" +
					season_id +
					"/" +
					ep_id
			);
		}
	} catch (error) {
		console.error("Errore in setEpisodeSeen: ", error);
	}
};
const updateSeenEps = async (
	season_num: number,
	season_id: number,
	ep_id: number
) => {
	try {
		await setEpisodeSeen(season_id, ep_id);
		await getSeenEps();
		getSeasonProgress(season_num);
	} catch (error) {
		console.log("Errore in updateSeenEps: ", error);
	}
};

onMounted(async () => {
	getShowData();
	getDirector();
	getGenres();
	getEpisodes();
	getSeenEps();
});
</script>

<template>
	<div v-if="showData.length == 1">
		<!-- image -->
		<div class="row">
			<div class="col-12" id="showImage">
				<img
					:src="'/covers/' + showData[0].image"
					class="img-fluid"
					alt="..." />
			</div>
		</div>
		<!-- dettagli -->
		<div class="row row-cols-1 row-cols-md-2 g-3 mt-md-1">
			<div class="col" id="showDetail">
				<div class="row row-cols-1 mx-0">
					<div class="col card px-0">
						<h5 class="card-header">{{ showData[0].title }}</h5>
						<div class="card-body">
							<h6
								v-for="director in directorData"
								:key="director.id"
								class="card-title">
								Regista:
								{{ director.name }}
							</h6>
							<p class="text-body-secondary">
								<span v-for="genre in genresData" :key="genre.genre">
									{{ genre.genre + " " }}
								</span>
							</p>
							<p class="card-text">
								{{ showData[0].description }}
							</p>
							<p class="text-body-secondary">
								{{ showData[0].year }} - {{ showData[0].country }}
							</p>
						</div>
					</div>
					<!-- add to profile -->
					<button
						class="col-8 btn btn-primary mt-3 mx-auto"
						type="button"
						data-bs-toggle="modal"
						data-bs-target="#addToProfileModal">
						Aggiungi al tuo Profilo
					</button>
				</div>
			</div>
			<!-- accordion episodi -->
			<div class="col accordion" id="showEpisodes">
				<!-- accordion HEADER -->
				<div
					v-for="(season, index) in seasonsData"
					:key="season"
					class="accordion-item">
					<h2 class="accordion-header pt-0">
						<button
							class="accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							:data-bs-target="'#collapse' + season"
							aria-expanded="false"
							:aria-controls="'collapse' + season">
							Season {{ season }}
						</button>
						<!---->
						<!-- ATTENZIONE -->
						<!-- OTTIMIZZARE CHIAMATE MULTIPLE -->
						<div
							class="progress"
							role="progressbar"
							aria-label="Example with label"
							:aria-valuenow="getSeasonProgress(season)"
							aria-valuemin="0"
							aria-valuemax="100">
							<div
								class="progress-bar"
								:style="'width: ' + getSeasonProgress(season) + '%'">
								{{ getSeasonProgress(season) }}%
							</div>
						</div>
					</h2>
					<div
						:id="'collapse' + season"
						class="accordion-collapse collapse"
						:class="{ show: index === 0 }"
						data-bs-parent="#showEpisodes">
						<!-- accordion BODY -->
						<div class="accordion-body">
							<ul class="list-group">
								<li
									v-for="episode in episodesData.filter(
										ep => ep.season_num === season
									)"
									:key="episode.ep_id"
									class="list-group-item text-nowrap">
									<input
										class="form-check-input me-1"
										type="checkbox"
										value=""
										:id="'checkboxEpisode' + season + 'x' + episode.ep_num"
										:checked="isEpisodeSeen(episode.ep_id)"
										@click="
											updateSeenEps(season, episode.season_id, episode.ep_id)
										" />
									<label
										class="form-check-label text-wrap"
										:for="'checkboxEpisode' + season + 'x' + episode.ep_num"
										>Episodio {{ season }}x{{ episode.ep_num }} -
										{{ episode.ep_title }}</label
									>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div v-else-if="showData.length > 1">Unexpected number of results</div>
	<div v-else>Loading...</div>

	<!-- Modal Window -->
	<div
		class="modal fade"
		id="addToProfileModal"
		tabindex="-1"
		aria-labelledby="addToProfileModalLabel"
		aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="addToProfileModalLabel">
						Aggiungi al tuo Profilo
					</h1>
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="d-grid gap-2">
						<button
							class="btn btn-primary"
							type="button"
							@click="addToWishlist()"
							data-bs-dismiss="modal">
							Wishlist
						</button>
						<button
							class="btn btn-primary"
							type="button"
							@click="addToCompleted()"
							data-bs-dismiss="modal">
							Completato
						</button>
					</div>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						data-bs-dismiss="modal">
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
