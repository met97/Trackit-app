<script setup lang="ts">
import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { userList } = storeToRefs(userStore);
</script>

<template>
	<div
		class="modal fade"
		id="UserModal"
		tabindex="-1"
		aria-labelledby="UserModalLabel"
		aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="UserModalLabel">Scegli utente</h1>
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div v-for="user in userList" :key="user.id">
						<h2
							class="fs-5 btn"
							@click="userStore.setActiveUser(user.id)"
							data-bs-dismiss="modal">
							{{ user.username }}
						</h2>
						<p>User ID: {{ user.id }} - Ruolo: {{ user.role }}</p>
						<hr />
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
