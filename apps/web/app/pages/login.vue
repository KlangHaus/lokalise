<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { signIn } = useAuth();
const notify = useNotification();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
	error.value = "";
	loading.value = true;
	try {
		const { error: authError } = await signIn(email.value, password.value);
		if (authError) {
			error.value = authError.message || "Login failed";
			notify.error("Login failed", authError.message || "Invalid email or password");
		} else {
			notify.success("Welcome back!", "You have been signed in successfully");
			navigateTo("/projects");
		}
	} catch (e: any) {
		error.value = e.message || "Login failed";
		notify.error("Login failed", e.message || "An error occurred");
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<UCard class="bg-white dark:bg-gray-800">
		<template #header>
			<h2 class="text-xl font-semibold text-center text-gray-900 dark:text-white">Sign In</h2>
		</template>

		<form @submit.prevent="handleSubmit" class="space-y-4">
			<UAlert v-if="error" color="error" :title="error" />

			<UFormField label="Email" class="text-gray-900 dark:text-white">
				<UInput
					v-model="email"
					type="email"
					placeholder="you@example.com"
					required
					autofocus
					class="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				/>
			</UFormField>

			<UFormField label="Password" class="text-gray-900 dark:text-white">
				<UInput
					v-model="password"
					type="password"
					placeholder="••••••••"
					required
					class="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				/>
			</UFormField>

			<UButton type="submit" block :loading="loading">
				Sign In
			</UButton>
		</form>

		<template #footer>
			<p class="text-center text-sm text-gray-500 dark:text-gray-300">
				Need access? Contact your administrator.
			</p>
		</template>
	</UCard>
</template>
