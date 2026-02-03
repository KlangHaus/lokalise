export function useApi() {
	const organizationId = useCookie("lokalise-org-id");
	const notify = useNotification();
	const config = useRuntimeConfig();
	const apiUrl = config.public.apiUrl;

	async function apiFetch<T>(
		path: string,
		options: RequestInit = {},
		showToast = true,
	): Promise<T> {
		const headers = new Headers(options.headers);
		headers.set("Content-Type", "application/json");

		if (organizationId.value) {
			headers.set("x-organization-id", organizationId.value);
		}

		// Use direct API URL, not proxy
		const fullUrl = path.startsWith("http") ? path : `${apiUrl}${path}`;

		try {
			const res = await $fetch<T>(fullUrl, {
				...options,
				headers: Object.fromEntries(headers.entries()),
				credentials: "include", // Important for session cookies
			});

			return res;
		} catch (error: any) {
			if (showToast) {
				notify.error(
					"Operation failed",
					error?.data?.message || error?.message || "An error occurred",
				);
			}
			throw error;
		}
	}

	return {
		organizationId,

		// Projects
		getProjects: () => apiFetch<{ projects: any[] }>("/api/v1/projects", {}, false),

		createProject: async (data: { name: string; slug: string; sourceLocale?: string }) => {
			const result = await apiFetch<{ project: any }>("/api/v1/projects", {
				method: "POST",
				body: JSON.stringify(data),
			});
			notify.success("Project created", `${data.name} has been created successfully`);
			return result;
		},

		getProject: (id: string) => apiFetch<{ project: any }>(`/api/v1/projects/${id}`, {}, false),

		deleteProject: async (id: string) => {
			const result = await apiFetch(`/api/v1/projects/${id}`, { method: "DELETE" });
			notify.success("Project deleted", "The project has been deleted");
			return result;
		},

		rotateApiKey: async (id: string) => {
			const result = await apiFetch<{ project: any }>(`/api/v1/projects/${id}/rotate-key`, {
				method: "POST",
			});
			notify.success("API key rotated", "New API key has been generated");
			return result;
		},

		// Locales
		getLocales: (projectId: string) =>
			apiFetch<{ locales: any[] }>(`/api/v1/projects/${projectId}/locales`, {}, false),

		createLocale: async (
			projectId: string,
			data: { code: string; name: string; isSource?: boolean },
		) => {
			const result = await apiFetch<{ locale: any }>(
				`/api/v1/projects/${projectId}/locales`,
				{
					method: "POST",
					body: JSON.stringify(data),
				},
			);
			notify.success("Locale added", `${data.name} (${data.code}) has been added`);
			return result;
		},

		deleteLocale: async (projectId: string, localeId: string) => {
			const result = await apiFetch(`/api/v1/projects/${projectId}/locales/${localeId}`, {
				method: "DELETE",
			});
			notify.success("Locale deleted", "The locale has been removed");
			return result;
		},

		// Keys
		getKeys: (projectId: string, params?: { namespace?: string; search?: string }) => {
			const query = new URLSearchParams();
			if (params?.namespace) query.set("namespace", params.namespace);
			if (params?.search) query.set("search", params.search);
			const qs = query.toString();
			return apiFetch<{ keys: any[] }>(
				`/api/v1/projects/${projectId}/keys${qs ? `?${qs}` : ""}`,
				{},
				false,
			);
		},

		createKey: async (
			projectId: string,
			data: { key: string; namespace?: string; description?: string },
		) => {
			const result = await apiFetch<{ key: any }>(`/api/v1/projects/${projectId}/keys`, {
				method: "POST",
				body: JSON.stringify(data),
			});
			notify.success("Key created", `Translation key "${data.key}" has been created`);
			return result;
		},

		deleteKey: async (projectId: string, keyId: string) => {
			const result = await apiFetch(`/api/v1/projects/${projectId}/keys/${keyId}`, {
				method: "DELETE",
			});
			notify.success("Key deleted", "The translation key has been deleted");
			return result;
		},

		// Translations
		getTranslations: (projectId: string, params?: { namespace?: string }) => {
			const query = new URLSearchParams();
			if (params?.namespace) query.set("namespace", params.namespace);
			const qs = query.toString();
			return apiFetch<{ translations: any[] }>(
				`/api/v1/projects/${projectId}/translations${qs ? `?${qs}` : ""}`,
				{},
				false,
			);
		},

		updateTranslation: async (
			projectId: string,
			keyId: string,
			localeId: string,
			data: { value: string; status?: string },
		) => {
			const result = await apiFetch<{ translation: any }>(
				`/api/v1/projects/${projectId}/translations/${keyId}/${localeId}`,
				{
					method: "PUT",
					body: JSON.stringify(data),
				},
			);
			notify.success("Translation updated", "The translation has been saved");
			return result;
		},

		// Import/Export
		importTranslations: async (
			projectId: string,
			data: {
				locale: string;
				namespace?: string;
				translations: Record<string, unknown>;
				overwrite?: boolean;
			},
		) => {
			const result = await apiFetch<{ created: number; updated: number; total: number }>(
				`/api/v1/projects/${projectId}/import`,
				{
					method: "POST",
					body: JSON.stringify(data),
				},
			);
			notify.success(
				"Import completed",
				`Created: ${result.created}, Updated: ${result.updated}`,
			);
			return result;
		},

		exportTranslations: (
			projectId: string,
			locale: string,
			namespace = "default",
			format = "nested",
		) =>
			apiFetch<Record<string, unknown>>(
				`/api/v1/projects/${projectId}/export?locale=${locale}&namespace=${namespace}&format=${format}`,
				{},
				false,
			),
	};
}
