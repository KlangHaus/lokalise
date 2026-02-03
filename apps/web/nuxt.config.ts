// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	modules: ["@nuxt/ui"],

	css: ["~/assets/css/main.css"],

	runtimeConfig: {
		public: {
			apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://localhost:3000",
		},
	},

	// Disable dev proxy - it adds massive latency
	// Use direct API calls instead with CORS
	vite: {
		server: {
			hmr: {
				overlay: false, // Disable error overlay for faster dev
			},
		},
	},
});
