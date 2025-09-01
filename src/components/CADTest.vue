<template>
  <div class="cad-test">
    <h3>CAD Drawing App Test</h3>
    <p>Status: {{ status }}</p>
    <div class="test-results">
      <div v-for="(test, index) in tests" :key="index" class="test-item">
        <span :class="test.passed ? 'passed' : 'failed'">
          {{ test.passed ? '✓' : '✗' }}
        </span>
        {{ test.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCADStore } from '../stores/cad-store.js'

const status = ref('Initializing...')
const tests = ref([])

onMounted(() => {
  const cadStore = useCADStore()
  
  // Test 1: Store initialization
  tests.value.push({
    name: 'CAD Store Initialization',
    passed: !!cadStore
  })
  
  // Test 2: Default tool state
  tests.value.push({
    name: 'Default Tool State',
    passed: cadStore.currentTool === 'select'
  })
  
  // Test 3: Line width state
  tests.value.push({
    name: 'Line Width State',
    passed: cadStore.lineWidth === 2
  })
  
  // Test 4: Color state
  tests.value.push({
    name: 'Color State',
    passed: cadStore.lineColor === '#000000'
  })
  
  // Test 5: Canvas dimensions
  tests.value.push({
    name: 'Canvas Dimensions',
    passed: cadStore.canvasWidth === 1200 && cadStore.canvasHeight === 800
  })
  
  // Test 6: Color options
  tests.value.push({
    name: 'Color Options Available',
    passed: cadStore.colorOptions.length === 8
  })
  
  // Test 7: Undo/Redo state
  tests.value.push({
    name: 'Undo/Redo State',
    passed: !cadStore.canUndo && !cadStore.canRedo
  })
  
  status.value = 'Tests completed'
})
</script>

<style scoped>
.cad-test {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 20px;
}

.test-results {
  margin-top: 15px;
}

.test-item {
  margin: 8px 0;
  font-family: monospace;
}

.passed {
  color: #4caf50;
  font-weight: bold;
}

.failed {
  color: #f44336;
  font-weight: bold;
}
</style>
