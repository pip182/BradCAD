<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div class="toolbar-container">
        <q-list dense>
          <q-item-label header> CAD Tools </q-item-label>
        </q-list>

        <!-- Vertical Stacked Tool Groups -->
        <div class="toolbar-vertical">
          <!-- Drawing Tools -->
          <div class="toolbar-section">
            <div class="section-title">Tools</div>
            <div class="tool-grid">
              <q-btn
                @click="setTool('select')"
                :color="currentTool === 'select' ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="pan_tool" size="xs" />
                <div class="tool-label">Select/Pan</div>
                <div class="tool-shortcut">(V)</div>
              </q-btn>

              <q-btn
                @click="setTool('polyline')"
                :color="currentTool === 'polyline' ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="timeline" size="xs" />
                <div class="tool-label">Polyline</div>
                <div class="tool-shortcut">(P)</div>
              </q-btn>

              <q-btn
                @click="setTool('line')"
                :color="currentTool === 'line' ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="show_chart" size="xs" />
                <div class="tool-label">Line</div>
                <div class="tool-shortcut">(L)</div>
              </q-btn>

              <q-btn
                @click="setTool('rectangle')"
                :color="currentTool === 'rectangle' ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="crop_square" size="xs" />
                <div class="tool-label">Rectangle</div>
                <div class="tool-shortcut">(R)</div>
              </q-btn>

              <q-btn
                @click="setTool('circle')"
                :color="currentTool === 'circle' ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="radio_button_unchecked" size="xs" />
                <div class="tool-label">Circle</div>
                <div class="tool-shortcut">(C)</div>
              </q-btn>

              <q-btn
                @click="setTool('dimension')"
                :color="currentTool === 'dimension' ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="straighten" size="xs" />
                <div class="tool-label">Dimension</div>
                <div class="tool-shortcut">(D)</div>
              </q-btn>
            </div>
          </div>

          <!-- Actions -->
          <div class="toolbar-section">
            <div class="section-title">Actions</div>
            <div class="tool-grid">
              <q-btn
                @click="clearCanvas"
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="clear_all" size="xs" />
                <div class="tool-label">Clear</div>
                <div class="tool-shortcut">(Ctrl+Del)</div>
              </q-btn>

              <q-btn
                @click="undo"
                :disable="!canUndo"
                :color="canUndo ? 'grey-6' : 'grey-4'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="undo" size="xs" />
                <div class="tool-label">Undo</div>
                <div class="tool-shortcut">(Ctrl+Z)</div>
              </q-btn>

              <q-btn
                @click="redo"
                :disable="!canRedo"
                :color="canRedo ? 'grey-6' : 'grey-4'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="redo" size="xs" />
                <div class="tool-label">Redo</div>
                <div class="tool-shortcut">(Ctrl+Y)</div>
              </q-btn>

              <q-btn
                @click="refreshCanvas"
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="refresh" size="xs" />
                <div class="tool-label">Refresh</div>
                <div class="tool-shortcut">(F5)</div>
              </q-btn>
            </div>
          </div>

          <!-- Grid & Snap -->
          <div class="toolbar-section">
            <div class="section-title">Grid & Snap</div>
            <div class="tool-grid">
              <q-btn
                @click="toggleGrid"
                :color="showGrid ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="grid_on" size="xs" />
                <div class="tool-label">Grid</div>
                <div class="tool-shortcut">(G)</div>
              </q-btn>

              <q-btn
                @click="toggleSnapToGrid"
                :color="snapToGrid ? 'primary' : 'grey-6'"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="my_location" size="xs" />
                <div class="tool-label">Snap</div>
                <div class="tool-shortcut">(S)</div>
              </q-btn>

              <div class="tool-btn control-btn">
                <q-popup-edit
                  v-model="snapTolerance"
                  :validate="(val) => val >= 1 && val <= 50"
                  @save="setSnapTolerance"
                  buttons
                  label-set="Set"
                  label-cancel="Cancel"
                  :dark="isDarkMode"
                >
                  <div class="column q-gutter-md">
                    <q-input
                      v-model.number="snapTolerance"
                      type="number"
                      dense
                      outlined
                      label="Snap Tolerance"
                      :rules="[val => val >= 1 && val <= 50 || 'Tolerance must be between 1-50']"
                      min="1"
                      max="50"
                      autofocus
                      :dark="isDarkMode"
                    />
                    <q-slider
                      v-model="snapTolerance"
                      :min="1"
                      :max="50"
                      :step="1"
                      color="primary"
                      dense
                      :dark="isDarkMode"
                    />
                  </div>
                </q-popup-edit>
                <q-icon name="adjust" size="xs" color="grey-6" />
                <div class="tool-label">Tolerance</div>
                <div class="tool-value">{{ snapTolerance }}</div>
              </div>

              <div class="tool-btn control-btn">
                <q-popup-edit
                  v-model="gridSize"
                  :validate="(val) => val >= 10 && val <= 100"
                  @save="setGridSize"
                  buttons
                  label-set="Set"
                  label-cancel="Cancel"
                  :dark="isDarkMode"
                >
                  <q-input
                    v-model.number="gridSize"
                    type="number"
                    dense
                    outlined
                    label="Grid Size"
                    :rules="[val => val >= 10 && val <= 100 || 'Size must be between 10-100']"
                    min="10"
                    max="100"
                    autofocus
                    :dark="isDarkMode"
                  />
                </q-popup-edit>
                <q-icon name="tune" size="xs" color="grey-6" />
                <div class="tool-label">Size</div>
                <div class="tool-value">{{ gridSize }}</div>
              </div>
            </div>
          </div>

          <!-- Line Properties -->
          <div class="toolbar-section">
            <div class="section-title">Line</div>
            <div class="tool-grid">
              <div class="tool-btn control-btn">
                <q-popup-edit
                  v-model="lineWidth"
                  :validate="(val) => val >= 1 && val <= 10"
                  @save="setLineWidth"
                  buttons
                  label-set="Set"
                  label-cancel="Cancel"
                  :dark="isDarkMode"
                >
                  <div class="column q-gutter-md">
                    <q-input
                      v-model.number="lineWidth"
                      type="number"
                      dense
                      outlined
                      label="Line Width"
                      :rules="[val => val >= 1 && val <= 10 || 'Width must be between 1-10']"
                      min="1"
                      max="10"
                      autofocus
                      :dark="isDarkMode"
                    />
                    <q-slider
                      v-model="lineWidth"
                      :min="1"
                      :max="10"
                      :step="1"
                      color="primary"
                      dense
                      :dark="isDarkMode"
                    />
                  </div>
                </q-popup-edit>
                <q-icon name="format_size" size="xs" color="grey-6" />
                <div class="tool-label">Width</div>
                <div class="tool-value">{{ lineWidth }}</div>
              </div>

              <q-btn
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-popup-edit
                  v-model="lineColor"
                  @save="setLineColor"
                  buttons
                  label-set="Set"
                  label-cancel="Cancel"
                  :dark="isDarkMode"
                >
                  <q-color
                    v-model="lineColor"
                    format-model="hex"
                    no-header
                    no-footer
                    class="my-picker"
                    :dark="isDarkMode"
                  />
                </q-popup-edit>
                <q-icon name="palette" size="xs" />
                <div class="tool-label">Color</div>
                <div
                  :style="{ backgroundColor: lineColor, width: '12px', height: '12px', borderRadius: '2px', border: '1px solid #ccc' }"
                ></div>
              </q-btn>
            </div>
          </div>

          <!-- Zoom -->
          <div class="toolbar-section">
            <div class="section-title">Zoom</div>
            <div class="tool-grid">
              <q-btn
                @click="zoomIn"
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="zoom_in" size="xs" />
                <div class="tool-label">Zoom In</div>
                <div class="tool-shortcut">(Wheel)</div>
              </q-btn>

              <q-btn
                @click="zoomOut"
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="zoom_out" size="xs" />
                <div class="tool-label">Zoom Out</div>
                <div class="tool-shortcut">(Wheel)</div>
              </q-btn>

              <q-btn
                @click="resetZoom"
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon name="refresh" size="xs" />
                <div class="tool-label">Reset</div>
                <div class="tool-shortcut">(1:1)</div>
              </q-btn>
            </div>
          </div>

          <!-- Theme -->
          <div class="toolbar-section">
            <div class="section-title">Theme</div>
            <div class="tool-grid">
              <q-btn
                @click="toggleTheme"
                color="grey-6"
                flat
                dense
                size="sm"
                class="tool-btn"
              >
                <q-icon :name="themeIcon" size="xs" />
                <div class="tool-label">{{ themeLabel }}</div>
                <div class="tool-shortcut">Light/Dark</div>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>


  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCADStore } from '../stores/cad-store.js'
import { useThemeStore } from '../stores/theme-store.js'

const cadStore = useCADStore()
const themeStore = useThemeStore()

// Computed properties for theme
const isDarkMode = computed(() => themeStore.isDarkMode)



const leftDrawerOpen = ref(true)

// Computed properties for CAD store
const currentTool = computed(() => cadStore.currentTool)
const canUndo = computed(() => cadStore.canUndo)
const canRedo = computed(() => cadStore.canRedo)
const showGrid = computed(() => cadStore.showGrid)
const snapToGrid = computed(() => cadStore.snapToGrid)
const gridSize = computed(() => cadStore.gridSize)
const lineWidth = computed(() => cadStore.lineWidth)
const lineColor = computed(() => cadStore.lineColor)
const snapTolerance = computed(() => cadStore.snapTolerance)

// Computed properties for theme store
const themeIcon = computed(() => themeStore.themeIcon)
const themeLabel = computed(() => themeStore.themeLabel)

// CAD methods
function setTool(tool) {
  cadStore.setTool(tool)
}

function clearCanvas() {
  // This will be handled by the CADCanvas component
  // We need to emit an event or use a different approach
  window.dispatchEvent(new CustomEvent('cad-clear-canvas'))
}

function undo() {
  window.dispatchEvent(new CustomEvent('cad-undo'))
}

function redo() {
  window.dispatchEvent(new CustomEvent('cad-redo'))
}

function refreshCanvas() {
  window.dispatchEvent(new CustomEvent('cad-refresh-canvas'))
}

function toggleGrid() {
  cadStore.toggleGrid()
}

function toggleSnapToGrid() {
  cadStore.toggleSnapToGrid()
}

function setGridSize(size) {
  cadStore.setGridSize(size)
}

function setSnapTolerance(tolerance) {
  cadStore.setSnapTolerance(tolerance)
}

function setLineWidth(width) {
  cadStore.setLineWidth(width)
}

function setLineColor(color) {
  cadStore.setLineColor(color)
}

function toggleTheme() {
  themeStore.toggleTheme()
}

// Zoom methods
function zoomIn() {
  cadStore.zoomIn()
}

function zoomOut() {
  cadStore.zoomOut()
}

function resetZoom() {
  cadStore.resetZoom()
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Initialize theme on mount
onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style scoped>
.tool-value {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 2px;
}

.my-picker {
  width: 200px;
}

/* Dark mode text improvements */
.dark .q-item-label {
  color: var(--text-primary) !important;
}

.dark .q-item-label.caption {
  color: #b0b0b0 !important;
  opacity: 0.9;
}

/* Light mode caption text */
.q-item .q-item-label.caption {
  color: #666 !important;
}

/* Vertical Stacked Toolbar Layout */
.toolbar-container {
  padding: 8px;
}

.toolbar-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.toolbar-section {
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 8px;
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  min-height: 50px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.tool-btn:hover {
  background-color: var(--bg-hover);
  transform: translateY(-1px);
}

.tool-btn .q-icon {
  margin-bottom: 2px;
}

.tool-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 1px;
  text-align: center;
  line-height: 1.2;
}

.tool-shortcut {
  font-size: 8px;
  color: var(--text-muted);
  text-align: center;
  opacity: 0.7;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  min-height: 50px;
  border-radius: 4px;
  transition: all 0.2s ease;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}

.control-btn:hover {
  background-color: var(--bg-hover);
}

.control-btn .q-icon {
  margin-bottom: 2px;
}

.control-btn .tool-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tool-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
