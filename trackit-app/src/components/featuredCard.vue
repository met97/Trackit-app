<script lang="ts">
import { PropType, defineComponent } from "vue";
import { Show as featured_card } from "../types";

export default defineComponent({
	props: {
		featured_card: {
			type: Object as PropType<featured_card>,
			required: true,
		},
	},
});
</script>

<template>
	<div class="cols">
		<div class="card text-bg-dark p-0">
			<router-link :to="'/show/' + featured_card.id" class="stretched-link"
				><img
					:src="'/covers/' + featured_card.image"
					class="card-img"
					alt="image"
			/></router-link>
			<div class="card-img-overlay">
				<h5 class="card-title">{{ featured_card.title }}</h5>
				<p class="card-text d-none">
					{{ featured_card.description }}
				</p>
				<p class="card-text d-none">
					<small>{{ featured_card.year }}</small>
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.card {
	text-align: center;
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		aspect-ratio: 16/9;
		opacity: 40%;
	}
}
</style>
