<script lang="ts">
import { defineComponent } from "vue";
import { Show } from "../types";
import featured_card from "../components/featuredCard.vue";
import show_card from "../components/showCard.vue";
import axios from "axios";

export default defineComponent({
	components: {
		featured_card,
		show_card,
	},
	data() {
		return {
			featuredShow: [] as Show[],
			suggestedShow: [] as Show[],
		};
	},
	methods: {
		getFeaturedList() {
			axios
				.get("/api/randshows/4")
				.then(response => (this.featuredShow = response.data));
		},
		getSuggestedList() {
			axios
				.get("/api/randshows/10")
				.then(response => (this.suggestedShow = response.data));
		},
	},
	mounted() {
		this.getFeaturedList();
		this.getSuggestedList();
	},
});
</script>

<template>
	<h1>Per Te</h1>
	<!-- In Evidenza -->
	<div class="row mx-0">
		<h2>In evidenza</h2>
		<ul class="list-unstyled row row-cols-2 row-cols-lg-4 g-3 mt-0">
			<li v-for="show in featuredShow" :key="show.id">
				<featured_card :featured_card="show" />
			</li>
		</ul>
	</div>
	<!-- Suggeriti -->
	<div class="row mx-0">
		<h2>Suggeriti</h2>
		<ul class="list-unstyled row row-cols-1 row-cols-md-2 g-3 mt-0">
			<li v-for="show in suggestedShow" :key="show.id">
				<show_card :show_card="show" />
			</li>
		</ul>
	</div>
</template>

<style scoped lang="scss"></style>
