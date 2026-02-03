export function useNotification() {
	const toast = useToast();

	return {
		success: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: "green",
				icon: "i-heroicons-check-circle",
			});
		},

		error: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: "red",
				icon: "i-heroicons-x-circle",
			});
		},

		info: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: "blue",
				icon: "i-heroicons-information-circle",
			});
		},

		warning: (title: string, description?: string) => {
			toast.add({
				title,
				description,
				color: "yellow",
				icon: "i-heroicons-exclamation-triangle",
			});
		},

		loading: (title: string, description?: string) => {
			return toast.add({
				title,
				description,
				color: "gray",
				icon: "i-heroicons-arrow-path",
				timeout: 0, // Don't auto-close
			});
		},

		// Helper to update an existing toast (useful for loading states)
		update: (id: string, options: any) => {
			toast.update(id, options);
		},

		remove: (id: string) => {
			toast.remove(id);
		},
	};
}
