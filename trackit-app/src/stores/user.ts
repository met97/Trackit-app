import { defineStore } from "pinia";
import { User } from "../types";
import axios from "axios";

export const useUserStore = defineStore("user", {
	state: () => {
		return {
			userList: [] as User[],
			activeUser: undefined as User | undefined,
			isAdmin: undefined as boolean | undefined,
		};
	},
	actions: {
		async fetchUsers() {
			try {
				const response = await axios.get("/api/users");
				this.userList = response.data;
			} catch (error) {
				console.error("Errore in fetchUsers: ", error);
			}
		},
		async setActiveUser(userID: number) {
			try {
				this.activeUser = this.userList.find(user => user.id === userID);
				if (this.activeUser?.role === "admin") {
					this.isAdmin = true;
				} else {
					this.isAdmin = false;
				}
			} catch (error) {
				console.error("Errore in setActiveUser: ", error);
			}
		},
	},
});
