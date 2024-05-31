<script setup lang="ts">
import { Ref, ref, onMounted } from "vue";
import { LastIDs } from "../types";
import axios from "axios";

const initialized: Ref<boolean> = ref(false);
const newShowContent: Ref<string> = ref("");
const lastIDs: Ref<LastIDs[] | undefined> = ref([]);
const uploadTest = ref();

// import Pinia
import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();

const { isAdmin } = storeToRefs(userStore);

const uploadNewShow = async () => {
	try {
		const response = await axios.post(
			"/api/admin/upload",
			newShowContent.value,
			{
				headers: { "Content-Type": "application/json" },
			}
		);
		uploadTest.value = response.data;
		initialized.value = true;
	} catch (err) {
		console.error("errore in uploadNewShow: ", err);
	}
};

onMounted(async () => {});
</script>

<template>
	<div v-if="isAdmin" class="container-fluid">
		<div class="row"><h1>Admin Dashboard</h1></div>
		<div class="row">
			<div class="col-12">
				<h2>Aggiungi nuova Serie TV</h2>
				<form id="newShowForm" class="mb-3">
					<label for="newShowInput" class="form-label"
						>Inserire i dettagli della nuova serie in formato JSON</label
					>
					<textarea
						v-model="newShowContent"
						class="form-control"
						id="newShowInput"
						rows="20"
						placeholder="Inserire i dettagli qui"></textarea>
				</form>
				<button
					type="submit"
					class="btn btn-primary mb-3"
					@click="uploadNewShow()">
					Aggiungi al database
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-upload"
						viewBox="0 0 16 16">
						<path
							d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
						<path
							d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
					</svg>
				</button>
				<p>initialized: {{ initialized }}</p>
			</div>

			<div class="col-12" v-if="initialized">
				json: {{ newShowContent }}
				<p v-for="lastid in lastIDs">
					tvshow last id: {{ lastid.tvshow_last_id }} <br />
					season last id: {{ lastid.season_last_id }} <br />
					episode last id: {{ lastid.episode_last_id }} <br />
					director last id: {{ lastid.director_last_id }} <br />
					transaction response: {{}}
				</p>
			</div>
		</div>
	</div>
	<div v-else>Accesso negato</div>
</template>
