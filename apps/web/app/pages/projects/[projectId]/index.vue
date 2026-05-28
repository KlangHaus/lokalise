<script setup lang="ts">
const route = useRoute();
const api = useApi();
const projectId = route.params.projectId as string;

const { data: projectData } = await useAsyncData(`project-${projectId}`, () =>
	api.getProject(projectId),
);

const project = computed(() => projectData.value?.project);

const showImport = ref(false);

async function onImported() {
	showImport.value = false;
	// Force refresh of translation table
	await refreshNuxtData();
}

// Export
const exportLocale = ref("en");
const showExport = ref(false);

async function handleExport() {
	try {
		const data = await api.exportTranslations(projectId, exportLocale.value);
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${project.value?.slug || "translations"}-${exportLocale.value}.json`;
		a.click();
		URL.revokeObjectURL(url);
		showExport.value = false;
	} catch (e) {
		console.error("Export failed", e);
	}
}
</script>

<template>
	<div class="p-8" v-if="project">
		<!-- Header -->
		<div class="flex items-center gap-3 mb-8">
			<NuxtLink to="/projects" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
				<UIcon name="i-lucide-arrow-left" />
			</NuxtLink>
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ project.name }}</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400">{{ project.slug }}</p>
			</div>
		</div>

		<!-- Project Info Card -->
		<UCard class="mb-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-6">
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Source Language</p>
						<p class="font-medium text-gray-900 dark:text-white">{{ project.sourceLocale }}</p>
					</div>
					<div class="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">API Key</p>
						<code class="text-xs font-mono text-gray-700 dark:text-gray-300">{{ project.apiKey.substring(0, 16) }}...</code>
					</div>
				</div>
				<NuxtLink :to="`/projects/${projectId}/settings`">
					<UButton variant="outline" icon="i-lucide-settings">
						Settings
					</UButton>
				</NuxtLink>
			</div>
		</UCard>

		<!-- Actions Card -->
		<UCard class="mb-6">
			<template #header>
				<div class="flex items-center justify-between">
					<div>
						<h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<UIcon name="i-lucide-wrench" />
							Actions
						</h2>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Import and export translations</p>
					</div>
					<div class="flex items-center gap-2">
						<UButton variant="outline" icon="i-lucide-upload" @click="showImport = true">
							Import
						</UButton>
						<UButton variant="outline" icon="i-lucide-download" @click="showExport = true">
							Export
						</UButton>
					</div>
				</div>
			</template>
		</UCard>

		<!-- Translations Card -->
		<UCard>
			<template #header>
				<h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<UIcon name="i-lucide-languages" />
					Translations
				</h2>
			</template>
			<TranslationTable :project-id="projectId" />
		</UCard>

		<ImportModal
			:open="showImport"
			:project-id="projectId"
			@close="showImport = false"
			@imported="onImported"
		/>

		<!-- Export Modal -->
		<UModal :open="showExport" @close="showExport = false">
			<template #header>
				<h3 class="text-lg font-semibold">Export Translations</h3>
			</template>
			<form @submit.prevent="handleExport" class="p-4 space-y-4">
				<UFormField label="Locale">
					<UInput v-model="exportLocale" placeholder="en" required />
				</UFormField>
				<div class="flex justify-end gap-2">
					<UButton variant="ghost" @click="showExport = false">Cancel</UButton>
					<UButton type="submit">Download JSON</UButton>
				</div>
			</form>
		</UModal>
	</div>
</template>
