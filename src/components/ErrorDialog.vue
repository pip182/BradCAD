<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-negative">
          <q-icon name="error" color="negative" class="q-mr-sm" />
          Error
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>

      <q-card-section>
        <div class="text-body1">{{ message }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useCADStore } from '../stores/cad-store.js'

const cadStore = useCADStore()

// Computed properties
const show = computed(() => cadStore.showError)
const message = computed(() => cadStore.errorMessage)

// Methods
const close = () => {
  cadStore.clearError()
}
</script>

<style scoped>
.q-card {
  border-left: 4px solid #f44336;
}
</style>
