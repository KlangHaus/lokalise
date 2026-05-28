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

// Stats
const totalUsers = computed(() => users.value.length);
const superAdmins = computed(() => users.value.filter((u: any) => u.isSuperAdmin).length);
const regularUsers = computed(() => users.value.filter((u: any) => !u.isSuperAdmin).length);

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
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage users and invitations</p>
			</div>
			<UButton icon="i-lucide-user-plus" @click="showInviteModal = true">
				Invite User
			</UButton>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<UCard>
				<div class="flex items-center gap-4">
					<div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
						<UIcon name="i-lucide-users" class="text-2xl text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalUsers }}</p>
					</div>
				</div>
			</UCard>

			<UCard>
				<div class="flex items-center gap-4">
					<div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
						<UIcon name="i-lucide-shield-check" class="text-2xl text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Super Admins</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{{ superAdmins }}</p>
					</div>
				</div>
			</UCard>

			<UCard>
				<div class="flex items-center gap-4">
					<div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
						<UIcon name="i-lucide-user" class="text-2xl text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Regular Users</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{{ regularUsers }}</p>
					</div>
				</div>
			</UCard>
		</div>

		<!-- Info Card -->
		<UCard class="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
			<div class="flex items-start gap-3">
				<UIcon name="i-lucide-info" class="text-blue-600 dark:text-blue-400 mt-0.5" />
				<div>
					<p class="text-sm font-medium text-blue-900 dark:text-blue-100">User Management</p>
					<p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
						Only super admins can invite new users. Invited users will receive an email with instructions to set up their account.
					</p>
				</div>
			</div>
		</UCard>

		<!-- Users Table -->
		<UCard>
			<template #header>
				<h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<UIcon name="i-lucide-users" />
					All Users
				</h2>
			</template>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-200 dark:border-gray-700">
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
								Name
							</th>
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
								Email
							</th>
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
								Role
							</th>
							<th class="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
								Created
							</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="user in users"
							:key="user.id"
							class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
						>
							<td class="py-3 px-4">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
										<span class="text-sm font-medium text-gray-600 dark:text-gray-300">
											{{ user.name[0].toUpperCase() }}
										</span>
									</div>
									<span class="font-medium text-gray-900 dark:text-white">{{ user.name }}</span>
								</div>
							</td>
							<td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
								{{ user.email }}
							</td>
							<td class="py-3 px-4 text-sm">
								<UBadge :color="user.isSuperAdmin ? 'primary' : 'gray'" variant="subtle" size="sm">
									<UIcon :name="user.isSuperAdmin ? 'i-lucide-shield-check' : 'i-lucide-user'" class="mr-1" />
									{{ user.isSuperAdmin ? "Super Admin" : "User" }}
								</UBadge>
							</td>
							<td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
								{{ new Date(user.createdAt).toLocaleDateString() }}
							</td>
							<td class="py-3 px-4">
								<UButton
									v-if="!user.isSuperAdmin"
									icon="i-lucide-trash-2"
									variant="ghost"
									color="error"
									size="xs"
									@click="deleteUser(user.id, user.name)"
								/>
							</td>
						</tr>

						<tr v-if="users.length === 0">
							<td colspan="5" class="text-center py-12">
								<div class="inline-flex flex-col items-center">
									<div class="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
										<UIcon name="i-lucide-users" class="text-2xl text-gray-400" />
									</div>
									<p class="text-gray-500 dark:text-gray-400">No users found</p>
								</div>
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
