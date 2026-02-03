<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
});

const { isSuperAdmin } = useAdmin();
const notify = useNotification();

// Redirect if not superadmin
if (!isSuperAdmin.value) {
	navigateTo("/projects");
}

// State
const showInviteModal = ref(false);
const inviteEmail = ref("");
const inviteName = ref("");
const inviteLoading = ref(false);

// Fetch users
const { data: usersData, refresh } = await useAsyncData("admin-users", async () => {
	const res = await $fetch("/api/admin/users");
	return res;
});

const users = computed(() => usersData.value?.users || []);

// Invite user
async function inviteUser() {
	if (!inviteEmail.value || !inviteName.value) {
		notify.error("Missing fields", "Please provide email and name");
		return;
	}

	inviteLoading.value = true;
	try {
		await $fetch("/api/admin/users/invite", {
			method: "POST",
			body: JSON.stringify({
				email: inviteEmail.value,
				name: inviteName.value,
			}),
		});

		notify.success("User invited", `An invitation has been sent to ${inviteEmail.value}`);
		inviteEmail.value = "";
		inviteName.value = "";
		showInviteModal.value = false;
		await refresh();
	} catch (e: any) {
		notify.error("Failed to invite user", e.data?.message || e.message);
	} finally {
		inviteLoading.value = false;
	}
}

// Delete user
async function deleteUser(userId: string, userName: string) {
	if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;

	try {
		await $fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
		notify.success("User deleted", `${userName} has been removed`);
		await refresh();
	} catch (e: any) {
		notify.error("Failed to delete user", e.data?.message || e.message);
	}
}
</script>

<template>
	<div class="p-8 max-w-6xl mx-auto">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
				<p class="text-sm text-gray-500 mt-1">Manage users and invitations</p>
			</div>
			<UButton icon="i-heroicons-user-plus" @click="showInviteModal = true">
				Invite User
			</UButton>
		</div>

		<!-- Users Table -->
		<UCard>
			<template #header>
				<h2 class="font-semibold">All Users</h2>
			</template>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
								Name
							</th>
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
								Email
							</th>
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
								Role
							</th>
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
								Created
							</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="user in users"
							:key="user.id"
							class="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
						>
							<td class="py-3 px-4">
								<div class="flex items-center gap-2">
									<span class="font-medium">{{ user.name }}</span>
									<UBadge v-if="user.isSuperAdmin" color="primary" size="xs">Super Admin</UBadge>
								</div>
							</td>
							<td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
								{{ user.email }}
							</td>
							<td class="py-3 px-4 text-sm">
								<UBadge :color="user.isSuperAdmin ? 'primary' : 'gray'" variant="subtle">
									{{ user.isSuperAdmin ? "Super Admin" : "User" }}
								</UBadge>
							</td>
							<td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
								{{ new Date(user.createdAt).toLocaleDateString() }}
							</td>
							<td class="py-3 px-4">
								<UButton
									v-if="!user.isSuperAdmin"
									icon="i-heroicons-trash"
									variant="ghost"
									color="error"
									size="xs"
									@click="deleteUser(user.id, user.name)"
								/>
							</td>
						</tr>

						<tr v-if="users.length === 0">
							<td colspan="5" class="text-center py-8 text-gray-400">
								No users found
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</UCard>

		<!-- Invite Modal -->
		<UModal :open="showInviteModal" @close="showInviteModal = false">
			<template #header>
				<h3 class="text-lg font-semibold">Invite User</h3>
			</template>

			<form @submit.prevent="inviteUser" class="p-4 space-y-4">
				<UFormField label="Name">
					<UInput v-model="inviteName" placeholder="John Doe" required autofocus />
				</UFormField>

				<UFormField label="Email">
					<UInput v-model="inviteEmail" type="email" placeholder="john@example.com" required />
				</UFormField>

				<div class="flex justify-end gap-2">
					<UButton variant="ghost" @click="showInviteModal = false">Cancel</UButton>
					<UButton type="submit" :loading="inviteLoading">Send Invitation</UButton>
				</div>
			</form>
		</UModal>
	</div>
</template>
