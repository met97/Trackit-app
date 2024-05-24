<script lang="ts">
import { defineComponent } from "vue";
// types
import { Show, Genre } from "../types";
// componenti
import show_card from "../components/showCard.vue";
// utilities
import axios from "axios";

export default defineComponent({
	components: {
		show_card,
	},
	data() {
		return {
			datiShow: [] as Show[],
			genreList: [] as Genre[],
			showsByGenre: [] as Show[],
		};
	},
	methods: {
		getShows() {
			axios.get("/api/shows").then(response => (this.datiShow = response.data));
		},
		getGenres() {
			axios
				.get("/api/genres")
				.then(response => (this.genreList = response.data));
		},
		getShowsByGenre(genre: string) {
			axios
				.get("/api/shows/" + genre)
				.then(response => (this.showsByGenre = response.data));
		},
	},
	mounted() {
		this.getShows();
		this.getGenres();
	},
});
</script>

<template>
	<h1>Esplora</h1>

	<!-- Nav tabs -->
	<div class="row mx-0">
		<ul
			class="nav nav-pills flex-nowrap overflow-auto"
			id="genreTabs"
			role="tablist">
			<li class="nav-item" role="presentation">
				<button
					class="nav-link active"
					id="all-tab"
					data-bs-toggle="tab"
					data-bs-target="#all-genres"
					type="button"
					role="tab"
					aria-controls="all-genres"
					tabindex="0">
					Tutto
				</button>
			</li>
			<li v-for="genre in genreList" class="nav-item" role="presentation">
				<button
					class="nav-link"
					:id="genre.genre + '-tab'"
					data-bs-toggle="tab"
					:data-bs-target="'#' + genre.genre"
					type="button"
					role="tab"
					:aria-controls="genre.genre"
					tabindex="0"
					@click.prevent="getShowsByGenre(genre.genre)">
					{{ genre.genre }}
				</button>
			</li>
		</ul>
	</div>

	<!-- Tabs Content -->
	<div class="row mx-0 tab-content">
		<div
			class="row row-cols-1 row-cols-md-2 g-3 tab-pane fade active show"
			id="all-genres"
			role="tabpanel"
			aria-labelledby="all-tab"
			tabindex="0">
			<show_card
				class="d-inline-block"
				v-for="show in datiShow"
				:key="show.id"
				:show_card="show" />
		</div>
		<div
			v-for="genre in genreList"
			:key="genre.genre"
			class="row row-cols-1 row-cols-md-2 g-3 tab-pane fade"
			:id="genre.genre"
			role="tabpanel"
			:aria-labelledby="genre.genre + '-tab'"
			tabindex="0">
			<show_card
				class="d-inline-block"
				v-for="show in showsByGenre"
				:key="show.id"
				:show_card="show" />
		</div>
	</div>
</template>

<style scope lang="scss">
.nav {
	.nav-link {
		color: #f8e559;
		&.active {
			background-color: #521477;
		}
	}
}
</style>
