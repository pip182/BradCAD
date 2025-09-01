<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ prompt }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="inputValue"
          dense
          autofocus
          @keyup.enter="submit"
          @keyup.esc="cancel"
          :label="prompt"
          type="text"
          class="q-mb-md"
        />
        
        <div class="text-caption text-grey-6">
          Press Enter to confirm, Esc to cancel
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancel" />
        <q-btn flat label="OK" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useCADStore } from '../stores/cad-store.js'

const cadStore = useCADStore()

const inputValue = ref('')

// Computed properties
const show = computed(() => cadStore.showInputDialog)
const prompt = computed(() => cadStore.inputPrompt)

// Methods
const submit = () => {
  // Add basic input validation
  const trimmedInput = inputValue.value.trim()
  if (trimmedInput !== '') {
    cadStore.userInput = trimmedInput
    cadStore.submitInput()
  }
  inputValue.value = ''
}

const cancel = () => {
  cadStore.cancelInput()
  inputValue.value = ''
}

// Watch for dialog opening to focus input
watch(show, (newVal) => {
  if (newVal) {
    // Focus will be handled by autofocus attribute
    inputValue.value = ''
  }
})
</script>

<style scoped>
.q-input {
  font-family: monospace;
}
</style>
