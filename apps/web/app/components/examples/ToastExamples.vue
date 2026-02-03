<template>
	<div class="space-y-4 p-6">
		<h2 class="text-2xl font-bold">Toast Examples</h2>

		<div class="flex flex-wrap gap-2">
			<UButton @click="showSuccess" color="green">Success Toast</UButton>
			<UButton @click="showError" color="red">Error Toast</UButton>
			<UButton @click="showInfo" color="blue">Info Toast</UButton>
			<UButton @click="showWarning" color="yellow">Warning Toast</UButton>
			<UButton @click="showLoading" color="gray">Loading Toast</UButton>
			<UButton @click="showApiCall" color="primary">Simulate API Call</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
const notify = useNotification();

function showSuccess() {
	notify.success("Success!", "Your operation completed successfully");
}

function showError() {
	notify.error("Error occurred", "Something went wrong. Please try again.");
}

function showInfo() {
	notify.info("Information", "Here's some useful information for you");
}

function showWarning() {
	notify.warning("Warning", "Please review this action before proceeding");
}

let loadingToast: any = null;

function showLoading() {
	loadingToast = notify.loading("Processing", "Please wait while we process your request");

	// Simulate completion after 3 seconds
	setTimeout(() => {
		if (loadingToast) {
			notify.remove(loadingToast.id);
			notify.success("Complete", "Processing finished successfully");
		}
	}, 3000);
}

async function showApiCall() {
	const loading = notify.loading("Saving", "Updating your data...");

	try {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Remove loading toast
		notify.remove(loading.id);

		// Show success
		notify.success("Saved", "Your changes have been saved");
	} catch (error) {
		notify.remove(loading.id);
		notify.error("Failed", "Unable to save changes");
	}
}
</script>
