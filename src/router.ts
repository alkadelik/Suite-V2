import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/auth",
		component: () => import("./layouts/auth.vue"),
		children: [
			{
				path: "signin",
				component: () => import("./views/auth/signin.vue"),
				meta: { title: "Sign In" },
			},
			{
				path: "signup",
				component: () => import("./views/auth/signup.vue"),
				meta: { title: "Sign Up" },
			},
		],
	},
];

const router = createRouter({
	history: createWebHistory(),
	scrollBehavior() {
		return { left: 0, top: 0 };
	},
	routes,
});

export default router;
