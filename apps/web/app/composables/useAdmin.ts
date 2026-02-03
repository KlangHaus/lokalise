export function useAdmin() {
	const { session } = useAuth();

	const isSuperAdmin = computed(() => {
		return session.value?.data?.user?.isSuperAdmin === true;
	});

	return {
		isSuperAdmin,
	};
}
