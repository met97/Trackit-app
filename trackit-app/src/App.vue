<!-- script setup abilita le composition API di vue
così da poter utilizzare la libreria Pinia per la gestione di uno store globale -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import userModal from "./components/userModal.vue";

//istanziamento e inizializzazione dello userStore
import { useUserStore } from "./stores/user";
const userStore = useUserStore();

const loginButton = ref<HTMLButtonElement | null>(null);

const fetchUsers = async () => {
	try {
		userStore.fetchUsers();
	} catch (error) {
		console.error("Errore fetchUsers in App.vue: ", error);
	}
};
const triggerLogin = async () => {
	if (!userStore.activeUser && loginButton.value) {
		loginButton.value.click();
	}
};

onMounted(async () => {
	fetchUsers();
	triggerLogin();
});
</script>

<template>
	<div class="container-fluid mx-0 px-0">
		<nav class="navbar sticky-top navbar-expand-md bg-body-tertiary mb-3">
			<div class="container-fluid">
				<router-link to="/" class="navbar-brand">Trackit</router-link>
				<!-- modal button -->
				<button
					type="button"
					class="navbar-text d-md-none btn text-truncate"
					data-bs-toggle="modal"
					data-bs-target="#UserModal">
					{{
						userStore.activeUser
							? `Utente: ${userStore.activeUser.username}`
							: "Login"
					}}
				</button>
				<!-- nav toggle button -->
				<button
					class="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNavAltMarkup"
					aria-controls="navbarNavAltMarkup"
					aria-expanded="false"
					aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
				<!-- nav menu -->
				<div class="collapse navbar-collapse" id="navbarNavAltMarkup">
					<div class="navbar-nav">
						<router-link to="/" class="nav-link">Home</router-link>
						<router-link to="/explore" class="nav-link">Esplora</router-link>
						<router-link to="/profile" class="nav-link">Profilo</router-link>
					</div>
				</div>
				<!-- modal button -->
				<button
					ref="loginButton"
					type="button"
					class="navbar-text d-none d-md-inline btn"
					data-bs-toggle="modal"
					data-bs-target="#UserModal">
					{{
						userStore.activeUser
							? `Utente: ${userStore.activeUser.username}`
							: "Login"
					}}
				</button>
			</div>
		</nav>
		<!---->
		<!-- modal body -->
		<user-modal />
		<!-- CONTENT -->
		<div class="container">
			<router-view />
		</div>
	</div>
</template>
