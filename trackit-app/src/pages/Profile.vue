<script setup lang="ts">
import { Ref, ref, onMounted, watch } from "vue";
// import componenti
import featured_card from "../components/featuredCard.vue";
import userModal from "../components/userModal.vue";
// import types
import { Show } from "../types";
// other imports
import axios from "axios";

// import Pinia
import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();

const { activeUser, isAdmin } = storeToRefs(userStore);
const wishlisted: Ref<Show[]> = ref([]);
const inProgress: Ref<Show[]> = ref([]);
const completed: Ref<Show[]> = ref([]);

const getWishlisted = async () => {
	try {
		const response = await axios.get(
			"/api/user/wishlisted/" + activeUser.value?.id
		);
		wishlisted.value = response.data;
	} catch (error) {
		console.error("Errore in getWishlisted: ", error);
	}
};
const getInProgress = async () => {
	try {
		const response = await axios.get(
			"/api/user/inprogress/" + activeUser.value?.id
		);
		inProgress.value = response.data;
	} catch (error) {
		console.error("Errore in getInProgress: ", error);
	}
};
const getCompleted = async () => {
	try {
		const response = await axios.get(
			"/api/user/completed/" + activeUser.value?.id
		);
		completed.value = response.data;
	} catch (error) {
		console.error("Errore in getCompleted: ", error);
	}
};

onMounted(async () => {
	getWishlisted();
	getInProgress();
	getCompleted();
});

watch(activeUser, async newUser => {
	if (newUser) {
		try {
			getWishlisted();
			getInProgress();
			getCompleted();
		} catch (error) {
			console.error("Errore nella watch di profile.vue: ", error);
		}
	}
});
</script>

<template>
	<div class="container-fluid" :key="activeUser?.id">
		<!-- DEBUG INFO -->
		<!--<p>active user: {{ activeUser }}</p>
		<p>active user id: {{ activeUser?.id }}</p>
		<p>isadmin: {{ isAdmin }}</p>-->

		<h1>Profilo</h1>
		<!-- Change User -->
		<div class="row">
			<button
				type="button"
				class="col-5 mx-auto btn btn-primary"
				data-bs-toggle="modal"
				data-bs-target="#UserModal"
				aria-label="change user">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					class="bi bi-person-circle"
					viewBox="0 0 16 16">
					<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
					<path
						fill-rule="evenodd"
						d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
				</svg>
				Change User
			</button>
		</div>
		<!-- Modal -->
		<user-modal />

		<!-- Saved Shows -->
		<div class="row" id="userwishlist">
			<h2>Wishlist</h2>
			<ul class="list-unstyled">
				<div class="row row-cols-2 row-cols-lg-4 g-3 mt-0">
					<featured_card
						v-for="show in wishlisted"
						:key="show.id"
						:featured_card="show" />
				</div>
			</ul>
		</div>
		<div class="row" id="userInProgress">
			<h2>In corso</h2>
			<ul class="list-unstyled">
				<div class="row row-cols-2 row-cols-lg-4 g-3 mt-0">
					<featured_card
						v-for="show in inProgress"
						:key="show.id"
						:featured_card="show" />
				</div>
			</ul>
		</div>
		<div class="row" id="userCompleted">
			<h2>Completati</h2>
			<ul class="list-unstyled">
				<div class="row row-cols-2 row-cols-lg-4 g-3 mt-0">
					<featured_card
						v-for="show in completed"
						:key="show.id"
						:featured_card="show" />
				</div>
			</ul>
		</div>

		<!-- Admin Dashboard -->
		<div v-if="isAdmin" class="row">
			<router-link
				to="/admin/dashboard"
				type="button"
				class="col-5 mx-auto btn btn-primary">
				Admin Dashboard
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					class="bi bi-key-fill"
					viewBox="0 0 16 16">
					<path
						d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2M2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
				</svg>
			</router-link>
		</div>
	</div>
</template>
