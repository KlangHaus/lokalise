<script setup lang="ts">
const props = defineProps<{
	value: string;
	status?: string;
}>();

const emit = defineEmits<{
	save: [value: string];
}>();

const editing = ref(false);
const editValue = ref(props.value);

function startEdit() {
	editValue.value = props.value;
	editing.value = true;
}

function save() {
	if (editValue.value !== props.value) {
		emit("save", editValue.value);
	}
	editing.value = false;
}

function cancel() {
	editing.value = false;
	editValue.value = props.value;
}
</script>

<template>
	<div
		class="relative group min-h-[40px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded"
		@click="startEdit"
	>
		<div v-if="!editing" class="px-3 py-2 cursor-pointer">
			<span v-if="value" class="text-sm">{{ value }}</span>
			<span v-else class="text-sm text-gray-400 dark:text-gray-500 italic">Click to add translation...</span>
			<UIcon
				name="i-heroicons-pencil"
				class="absolute right-2 top-2 opacity-0 group-hover:opacity-50 text-gray-400 w-3 h-3"
			/>
		</div>

		<div v-else class="p-1">
			<UTextarea
				v-model="editValue"
				autofocus
				:rows="2"
				size="sm"
				@keydown.enter.meta="save"
				@keydown.escape="cancel"
				@blur="save"
			/>
		</div>
	</div>
</template>
