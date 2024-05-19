<script lang="ts">
import { PropType, defineComponent } from "vue";
import { Show as show_card } from "../types";

export default defineComponent({
	props: {
		show_card: {
			type: Object as PropType<show_card>,
			required: true,
		},
	},
});
</script>

<template>
	<div class="col">
		<div class="card h-100 p-0" style="max-width: 540px">
			<div class="row">
				<div class="col-5 pe-0">
					<router-link :to="'/show/' + show_card.id" class="stretched-link"
						><img
							:src="'/covers/' + show_card.image"
							class="rounded-start"
							:alt="show_card.title"
					/></router-link>
				</div>
				<div class="col-7">
					<div class="card-body px-0 py-2">
						<h5 class="card-title mb-0">{{ show_card.title }}</h5>
						<p id="showcard-desc" class="card-text mb-0">
							{{ show_card.description }}
						</p>
						<p class="card-text">
							<small class="text-body-secondary">{{ show_card.year }}</small>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
#showcard-desc {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}
.card {
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		aspect-ratio: 4/3;
		@media screen and (min-width: 768px) {
			aspect-ratio: 16/9;
		}
	}
}
</style>
