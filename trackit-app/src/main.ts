import { createApp } from "vue";

// import style
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import "./styles/custom.scss";

// import modules
import App from "./App.vue";
import HomeVue from "./pages/Home.vue";
import ExploreVue from "./pages/Explore.vue";
import ProfileVue from "./pages/Profile.vue";
import ShowDetailVue from "./pages/ShowDetail.vue";
import AdminDashboardVue from "./pages/AdminDashboard.vue";

//import del router
import { createRouter, createWebHistory, Router } from "vue-router";

//istanziamento router
const router: Router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: HomeVue },
		{ path: "/explore", component: ExploreVue },
		{ path: "/profile", component: ProfileVue },
		{ path: "/show/:id", component: ShowDetailVue },
		{ path: "/admin/dashboard", component: AdminDashboardVue },
	],
});

// import e istanziamento Pinia, store library
// per gestione stato utenti
import { createPinia, Pinia } from "pinia";

const pinia: Pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
