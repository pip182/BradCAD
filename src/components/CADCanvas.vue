<template>
  <div class="cad-container" tabindex="0" @keydown="handleKeyDown">

    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        :width="cadStore.canvasWidth"
        :height="cadStore.canvasHeight"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @click="onClick"
        @contextmenu="onContextMenu"
        @wheel="onWheel"
        class="cad-canvas"
      ></canvas>
      <canvas
        ref="overlayRef"
        :width="cadStore.canvasWidth"
        :height="cadStore.canvasHeight"
        class="overlay-canvas"
      ></canvas>

      <!-- Status bar -->
      <div class="status-bar">
        <div class="status-left">
          <span>Tool: {{ cadStore.currentTool }}</span>
          <span v-if="cadStore.currentTool === 'polyline' && cadStore.polylinePoints.length > 0">
            | Points: {{ cadStore.polylinePoints.length }}
          </span>
          <span v-if="cadStore.mousePosition && cadStore.mousePosition.x !== null">
            | Mouse: ({{ Math.round(cadStore.mousePosition.x) }}, {{ Math.round(cadStore.mousePosition.y) }})
          </span>
          <span v-if="snappedPosition && snappedPosition.x !== null">
            | Snapped: ({{ Math.round(snappedPosition.x) }}, {{ Math.round(snappedPosition.y) }})
          </span>
          <span>| Zoom: {{ Math.round(cadStore.zoomLevel * 100) }}%</span>
        </div>

        <!-- Command Line -->
        <div class="command-line">
          <span class="command-prompt">{{ commandPrompt }}</span>
          <q-input
            v-model="commandInput"
            @keyup.enter="submitCommand"
            @keyup.esc="cancelCommand"
            @keydown="handleCommandKeydown"
            dense
            outlined
            class="command-input"
            :placeholder="commandPlaceholder"
            ref="commandInputRef"
            autofocus
          />
        </div>

        <div class="status-right">
          <span class="keyboard-hints">
            Press H for help
          </span>
        </div>
      </div>
    </div>



    <!-- Error Dialog -->
    <ErrorDialog />

    <!-- Help Dialog -->
    <q-dialog v-model="showHelp">
      <q-card style="min-width: 600px; max-width: 800px;">
        <q-card-section>
          <div class="text-h6">Keyboard Shortcuts</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <h6>Tools</h6>
              <ul>
                <li><strong>V</strong> - Select/Pan tool</li>
                <li><strong>P</strong> - Polyline tool</li>
                <li><strong>L</strong> - Line tool</li>
                <li><strong>R</strong> - Rectangle tool</li>
                <li><strong>C</strong> - Circle tool</li>
                <li><strong>D</strong> - Dimension tool</li>
              </ul>
            </div>
            <div class="col-6">
              <h6>Actions</h6>
              <ul>
                <li><strong>Ctrl+Z</strong> - Undo</li>
                <li><strong>Ctrl+Y</strong> - Redo</li>
                <li><strong>Ctrl+Del</strong> - Clear canvas</li>
                <li><strong>G</strong> - Toggle grid</li>
                <li><strong>S</strong> - Toggle grid snapping</li>
                <li><strong>Esc</strong> - Cancel current operation</li>
                <li><strong>F5</strong> - Refresh canvas</li>
              </ul>
            </div>
          </div>
          <div class="row q-mt-md">
            <div class="col-12">
              <h6>Tips</h6>
              <ul>
                <li>Use snapping to align objects precisely</li>
                <li>Enter exact measurements in the command line (default units: inches)</li>
                <li>Left-click to start drawing, right-click to stop/cancel</li>
                <li>Use the command line in the status bar for precise input</li>
                <li>Press F5 or click Refresh to clear any visual artifacts</li>
                <li><strong>Pan:</strong> Select tool (V) + drag to pan around the canvas</li>
                <li><strong>Zoom:</strong> Mouse wheel to zoom in/out at cursor position</li>
              </ul>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showHelp = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useCADStore } from '../stores/cad-store.js'
import ErrorDialog from './ErrorDialog.vue'
import {
  drawTransformedGrid,
  drawSnapPointsByType,
  getAllSnapPoints,
  getSnapPointsInProximity,
  getGridSnapPointsInProximity,
  drawLineWithConstantWidth,
  drawRectangleWithConstantWidth,
  drawCircleWithConstantWidth,
  drawPolylineWithConstantWidth,
  drawPointWithConstantSize,
  drawAutoCADDimension,
  snapToTransformedGrid,
  snapToPoints,
  snapToLines,
  saveCanvasState,
  restoreCanvasState,
  clearCanvas as clearCanvasUtil,
  setCanvasStyle
} from '../utils/drawing-utils.js'

// Store
const cadStore = useCADStore()

// Component state
const canvasRef = ref(null)
const overlayRef = ref(null)
const showHelp = ref(false)
const snappedPosition = ref(null)
const nearbySnapPoints = ref({})
const commandInputRef = ref(null)
const commandInput = ref('')
const currentCommand = ref(null)
const commandCallback = ref(null)
let ctx = null
let overlayCtx = null

// Drawing state for vector tools
const drawingState = ref({
  startPoint: null,
  endPoint: null,
  width: null,
  height: null,
  radius: null
})

// Pan state
const panState = ref({
  isPanning: false,
  lastMousePos: { x: 0, y: 0 }
})

// Command line computed properties
const commandPrompt = computed(() => {
  if (currentCommand.value) {
    return `${currentCommand.value}:`
  }
  return 'Command:'
})

const commandPlaceholder = computed(() => {
  if (currentCommand.value) {
    switch (currentCommand.value) {
      case 'width':
        return 'Enter width (inches)'
      case 'height':
        return 'Enter height (inches)'
      case 'radius':
        return 'Enter radius (inches)'
      default:
        return 'Enter value'
    }
  }
  return 'Type a command or click to draw'
})

// Keyboard shortcuts mapping
const keyboardShortcuts = {
  'v': () => {
    cadStore.setTool('select')
    updateCursor()
  },
  'p': () => {
    cadStore.setTool('polyline')
    updateCursor()
  },
  'l': () => {
    cadStore.setTool('line')
    updateCursor()
  },
  'r': () => {
    cadStore.setTool('rectangle')
    updateCursor()
  },
  'c': () => {
    cadStore.setTool('circle')
    updateCursor()
  },
  'd': () => {
    cadStore.setTool('dimension')
    updateCursor()
  },
  'g': () => cadStore.toggleGrid(),
  's': () => cadStore.toggleSnapToGrid(),
  'h': () => showHelp.value = true,
  'Escape': () => handleEscape(),
  'f5': () => refreshCanvas(), // Refresh canvas
}

// Update cursor based on current tool
const updateCursor = () => {
  if (canvasRef.value) {
    // Remove any existing cursor styles first
    canvasRef.value.style.cursor = ''

    let cursorType = 'default'
    switch (cadStore.currentTool) {
      case 'select':
        cursorType = 'grab'
        break
      case 'polyline':
      case 'line':
      case 'rectangle':
      case 'circle':
      case 'dimension':
        cursorType = 'crosshair'
        break
      default:
        cursorType = 'default'
    }

    // Set cursor on canvas
    canvasRef.value.style.cursor = cursorType

    // Also set cursor on container to ensure consistency
    const container = canvasRef.value.parentElement
    if (container) {
      container.style.cursor = cursorType
    }

    console.log('Cursor updated to:', cursorType, 'for tool:', cadStore.currentTool)
  }
}

// Methods

const saveState = () => {
  try {
    const imageData = saveCanvasState(ctx, cadStore.canvasWidth, cadStore.canvasHeight)
    cadStore.saveState(imageData)
  } catch (error) {
    console.error('Error saving state:', error)
    cadStore.showErrorDialog('Error saving canvas state')
  }
}

const undo = () => {
  try {
    const imageData = cadStore.undo()
    if (imageData) {
      restoreCanvasState(ctx, imageData)
    }
  } catch (error) {
    console.error('Error undoing:', error)
    cadStore.showErrorDialog('Error undoing action')
  }
}

const redo = () => {
  try {
    const imageData = cadStore.redo()
    if (imageData) {
      restoreCanvasState(ctx, imageData)
    }
  } catch (error) {
    console.error('Error redoing:', error)
    cadStore.showErrorDialog('Error redoing action')
  }
}

const clearCanvas = () => {
  try {
    // Clear the canvas completely
    clearCanvasUtil(ctx, cadStore.canvasWidth, cadStore.canvasHeight)

    // Reset the store state
    cadStore.resetCanvas()

    // Redraw the grid with transformations
    redrawCanvas()

    // Save the cleared state
    saveState()
  } catch (error) {
    console.error('Error clearing canvas:', error)
    cadStore.showErrorDialog('Error clearing canvas')
  }
}

const redrawCanvas = () => {
  try {
    // Clear canvas completely
    clearCanvasUtil(ctx, cadStore.canvasWidth, cadStore.canvasHeight)

    // Draw grid with proper transformations (no context transformations needed)
    if (cadStore.showGrid) {
      drawTransformedGrid(ctx, cadStore.canvasWidth, cadStore.canvasHeight, cadStore.gridSize, cadStore.panOffset, cadStore.zoomLevel)
    }

    // Draw vector objects with constant line width (no zoom scaling)
    cadStore.vectorObjects.forEach(obj => {
      if (obj.type === 'line') {
        drawLineWithConstantWidth(ctx, obj.start.x, obj.start.y, obj.end.x, obj.end.y, obj.color, obj.lineWidth, cadStore.panOffset, cadStore.zoomLevel)
      } else if (obj.type === 'rectangle') {
        drawRectangleWithConstantWidth(ctx, obj.x, obj.y, obj.width, obj.height, obj.color, obj.lineWidth, obj.filled, cadStore.panOffset, cadStore.zoomLevel)
      } else if (obj.type === 'circle') {
        drawCircleWithConstantWidth(ctx, obj.x, obj.y, obj.radius, obj.color, obj.lineWidth, obj.filled, cadStore.panOffset, cadStore.zoomLevel)
      } else if (obj.type === 'dimension') {
        drawAutoCADDimension(ctx, obj.point1, obj.point2, obj.dimensionLinePos, obj.color, obj.lineWidth, cadStore.panOffset, cadStore.zoomLevel)
      }
    })

    // Draw polyline with constant line width
    if (cadStore.polylinePoints.length > 1) {
      drawPolylineWithConstantWidth(ctx, cadStore.polylinePoints, cadStore.lineColor, cadStore.lineWidth, cadStore.panOffset, cadStore.zoomLevel)
    }

    // Draw polyline points with constant size
    cadStore.polylinePoints.forEach(point => {
      drawPointWithConstantSize(ctx, point.x, point.y, cadStore.lineColor, 3, cadStore.panOffset, cadStore.zoomLevel)
    })

    // Note: Snap points are now rendered on overlay canvas in mouse move event
    // for proximity-based display

    // Reset canvas style after redrawing
    setCanvasStyle(ctx, cadStore.lineColor, cadStore.lineWidth)
  } catch (error) {
    console.error('Error redrawing canvas:', error)
    cadStore.showErrorDialog('Error redrawing canvas')
  }
}

const refreshCanvas = () => {
  try {
    // Force a complete redraw of the canvas
    redrawCanvas()
    saveState()
  } catch (error) {
    console.error('Error refreshing canvas:', error)
    cadStore.showErrorDialog('Error refreshing canvas')
  }
}

// Command line methods
const showCommand = (command, callback) => {
  currentCommand.value = command
  commandCallback.value = callback
  commandInput.value = ''

  // Focus the command input
  nextTick(() => {
    if (commandInputRef.value) {
      commandInputRef.value.focus()
    }
  })
}

const submitCommand = () => {
  if (currentCommand.value && commandCallback.value) {
    const value = commandInput.value.trim()
    if (value !== '') {
      // Convert inches to pixels (assuming 96 DPI)
      const inchesToPixels = (inches) => inches * 96
      const numericValue = parseFloat(value)

      if (!isNaN(numericValue)) {
        const pixelValue = inchesToPixels(numericValue)
        commandCallback.value(pixelValue)
      } else {
        // If not a number, pass the raw value
        commandCallback.value(value)
      }
    }
    clearCommand()
  }
}

const cancelCommand = () => {
  clearCommand()
}

const clearCommand = () => {
  currentCommand.value = null
  commandCallback.value = null
  commandInput.value = ''
}

const handleCommandKeydown = (event) => {
  // Prevent certain keys from interfering with drawing
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelCommand()
  }
}



const getSnappedPosition = (pos) => {
  try {
    let snapped = { ...pos }
    let snapType = null

    // Get all available snap points
    const allSnapPoints = getAllSnapPoints(cadStore.vectorObjects)

    // Add polyline points to endpoints
    if (cadStore.polylinePoints.length > 0) {
      allSnapPoints.endpoints.push(...cadStore.polylinePoints)
    }

    // Add dimension points to endpoints
    if (cadStore.dimensionStart) {
      allSnapPoints.endpoints.push(cadStore.dimensionStart)
    }
    if (cadStore.dimensionSecondPoint) {
      allSnapPoints.endpoints.push(cadStore.dimensionSecondPoint)
    }

    // Snap to grid with transformations (highest priority)
    if (cadStore.snapToGrid) {
      const gridSnapped = snapToTransformedGrid(pos, cadStore.gridSize, cadStore.panOffset, cadStore.zoomLevel)
      if (gridSnapped.x !== pos.x || gridSnapped.y !== pos.y) {
        snapped = gridSnapped
        snapType = 'grid'
      }
    }

    // Snap to existing points (endpoints, midpoints, centers, corners)
    if (cadStore.snapToPoints) {
      // Check endpoints
      const endpointSnap = snapToPoints(pos, allSnapPoints.endpoints, cadStore.snapTolerance)
      if (endpointSnap) {
        snapped = endpointSnap
        snapType = 'endpoint'
      }

      // Check midpoints
      if (!snapType) {
        const midpointSnap = snapToPoints(pos, allSnapPoints.midpoints, cadStore.snapTolerance)
        if (midpointSnap) {
          snapped = midpointSnap
          snapType = 'midpoint'
        }
      }

      // Check centers
      if (!snapType) {
        const centerSnap = snapToPoints(pos, allSnapPoints.centers, cadStore.snapTolerance)
        if (centerSnap) {
          snapped = centerSnap
          snapType = 'center'
        }
      }

      // Check corners
      if (!snapType) {
        const cornerSnap = snapToPoints(pos, allSnapPoints.corners, cadStore.snapTolerance)
        if (cornerSnap) {
          snapped = cornerSnap
          snapType = 'corner'
        }
      }
    }

    // Snap to existing lines (lowest priority)
    if (cadStore.snapToLines && !snapType) {
      const lineSnap = snapToLines(pos, cadStore.existingLines, cadStore.snapTolerance)
      if (lineSnap) {
        snapped = lineSnap
        snapType = 'line'
      }
    }

    return { position: snapped, type: snapType }
  } catch (error) {
    console.error('Error getting snapped position:', error)
    return { position: pos, type: null }
  }
}

const handleEscape = () => {
  try {
    // Cancel current drawing operation
    if (drawingState.value.startPoint) {
      drawingState.value.startPoint = null
      redrawCanvas()
    }
    if (cadStore.dimensionStart || cadStore.dimensionSecondPoint || cadStore.dimensionLinePosition) {
      cadStore.clearAllDimensionData()
      redrawCanvas()
    }
    if (cadStore.showInputDialog) {
      cadStore.cancelInput()
    }
  } catch (error) {
    console.error('Error handling escape:', error)
  }
}

const handleKeyDown = (event) => {
  try {
    const key = event.key.toLowerCase()

    // Handle Ctrl combinations
    if (event.ctrlKey) {
      switch (key) {
        case 'z':
          event.preventDefault()
          undo()
          return
        case 'y':
          event.preventDefault()
          redo()
          return
        case 'delete':
          event.preventDefault()
          clearCanvas()
          return
      }
    }

    // Handle single key shortcuts
    if (keyboardShortcuts[key]) {
      event.preventDefault()
      keyboardShortcuts[key]()
    }
  } catch (error) {
    console.error('Error handling keyboard input:', error)
  }
}

const onMouseDown = (event) => {
  try {
    const pos = getMousePos(event, canvasRef.value)
    const snapResult = getSnappedPosition(pos)
    const snapped = snapResult.position

    // Get raw mouse position for status bar display
    const rect = canvasRef.value.getBoundingClientRect()
    const rawX = event.clientX - rect.left
    const rawY = event.clientY - rect.top

    cadStore.setMousePosition(rawX, rawY)
    snappedPosition.value = snapped

    // Handle pan functionality for select tool
    if (cadStore.currentTool === 'select' && event.button === 0) { // Left click
      panState.value.isPanning = true
      panState.value.lastMousePos = { x: rawX, y: rawY }
      if (canvasRef.value) {
        canvasRef.value.style.cursor = 'grabbing'
        const container = canvasRef.value.parentElement
        if (container) {
          container.style.cursor = 'grabbing'
        }
      }
    } else if (cadStore.currentTool === 'polyline') {
      cadStore.setIsDrawing(true)
      cadStore.addPolylinePoint(snapped)
      // Canvas will be redrawn automatically by the watcher
    } else if (cadStore.currentTool === 'line') {
      drawingState.value.startPoint = snapped
    } else if (cadStore.currentTool === 'rectangle') {
      drawingState.value.startPoint = snapped
    } else if (cadStore.currentTool === 'circle') {
      drawingState.value.startPoint = snapped
    } else if (cadStore.currentTool === 'dimension') {
      if (!cadStore.dimensionStart) {
        // First click - set the first dimension point
        cadStore.setDimensionStart(snapped)
      } else if (!cadStore.dimensionSecondPoint) {
        // Second click - set the second dimension point
        cadStore.setDimensionSecondPoint(snapped)
      }
    }
  } catch (error) {
    console.error('Error in mouse down:', error)
    cadStore.showErrorDialog('Error in mouse down event')
  }
}

const onMouseMove = (event) => {
  try {
    // Get raw mouse position for status bar display
    const rect = canvasRef.value.getBoundingClientRect()
    const rawX = event.clientX - rect.left
    const rawY = event.clientY - rect.top

    // Handle pan functionality
    if (panState.value.isPanning && cadStore.currentTool === 'select') {
      const deltaX = rawX - panState.value.lastMousePos.x
      const deltaY = rawY - panState.value.lastMousePos.y

      // Update pan offset
      cadStore.addPanOffset(deltaX, deltaY)

      // Update last mouse position
      panState.value.lastMousePos = { x: rawX, y: rawY }

      // Redraw canvas with new pan offset
      redrawCanvas()
      return
    }

    const pos = getMousePos(event, canvasRef.value)
    const snapResult = getSnappedPosition(pos)
    const snapped = snapResult.position

    cadStore.setMousePosition(rawX, rawY)
    snappedPosition.value = snapped

    // Clear overlay canvas
    if (overlayCtx) {
      overlayCtx.clearRect(0, 0, cadStore.canvasWidth, cadStore.canvasHeight)
    }

    // Update nearby snap points for proximity-based rendering
    if (cadStore.snapToPoints || cadStore.snapToGrid) {
      const allSnapPoints = getAllSnapPoints(cadStore.vectorObjects)

      // Add polyline points to endpoints
      if (cadStore.polylinePoints.length > 0) {
        allSnapPoints.endpoints.push(...cadStore.polylinePoints)
      }

      // Add dimension points to endpoints
      if (cadStore.dimensionStart) {
        allSnapPoints.endpoints.push(cadStore.dimensionStart)
      }
      if (cadStore.dimensionSecondPoint) {
        allSnapPoints.endpoints.push(cadStore.dimensionSecondPoint)
      }

      // Get nearby snap points
      const nearbySnaps = getSnapPointsInProximity(pos, allSnapPoints, cadStore.snapTolerance * 2)

      // Add grid snap points if grid snapping is enabled
      if (cadStore.snapToGrid) {
        const gridSnaps = getGridSnapPointsInProximity(pos, cadStore.gridSize, cadStore.panOffset, cadStore.zoomLevel, cadStore.snapTolerance * 2)
        nearbySnaps.grid = gridSnaps
      }

      nearbySnapPoints.value = nearbySnaps

      // Draw nearby snap points on overlay
      if (overlayCtx && Object.values(nearbySnaps).some(points => points.length > 0)) {
        overlayCtx.save()
        overlayCtx.translate(cadStore.panOffset.x, cadStore.panOffset.y)
        overlayCtx.scale(cadStore.zoomLevel, cadStore.zoomLevel)
        drawSnapPointsByType(overlayCtx, nearbySnaps)
        overlayCtx.restore()
      }
    }

    // Update dimension line position for AutoCAD-style dimensioning
    if (cadStore.currentTool === 'dimension' && cadStore.dimensionStart && cadStore.dimensionSecondPoint) {
      cadStore.setDimensionLinePosition(snapped)
    }

    // Only draw preview if we're actively drawing something
    if (drawingState.value.startPoint || cadStore.dimensionStart) {
      // Redraw main canvas to show preview
      redrawCanvas()

      // Draw preview based on current tool with constant line width
      if (cadStore.currentTool === 'line' && drawingState.value.startPoint) {
        drawLineWithConstantWidth(ctx, drawingState.value.startPoint.x, drawingState.value.startPoint.y, snapped.x, snapped.y, cadStore.lineColor, cadStore.lineWidth, cadStore.panOffset, cadStore.zoomLevel)
      } else if (cadStore.currentTool === 'rectangle' && drawingState.value.startPoint) {
        const width = snapped.x - drawingState.value.startPoint.x
        const height = snapped.y - drawingState.value.startPoint.y
        drawRectangleWithConstantWidth(ctx, drawingState.value.startPoint.x, drawingState.value.startPoint.y, width, height, cadStore.lineColor, cadStore.lineWidth, false, cadStore.panOffset, cadStore.zoomLevel)
      } else if (cadStore.currentTool === 'circle' && drawingState.value.startPoint) {
        const radius = Math.sqrt(
          Math.pow(snapped.x - drawingState.value.startPoint.x, 2) +
          Math.pow(snapped.y - drawingState.value.startPoint.y, 2)
        )
        drawCircleWithConstantWidth(ctx, drawingState.value.startPoint.x, drawingState.value.startPoint.y, radius, cadStore.lineColor, cadStore.lineWidth, false, cadStore.panOffset, cadStore.zoomLevel)
      } else if (cadStore.currentTool === 'dimension' && cadStore.dimensionStart && cadStore.dimensionSecondPoint && cadStore.dimensionLinePosition) {
        // Draw AutoCAD-style dimension preview
        drawAutoCADDimension(ctx, cadStore.dimensionStart, cadStore.dimensionSecondPoint, cadStore.dimensionLinePosition, cadStore.lineColor, cadStore.lineWidth, cadStore.panOffset, cadStore.zoomLevel)
      } else if (cadStore.currentTool === 'dimension' && cadStore.dimensionStart && !cadStore.dimensionSecondPoint) {
        // Show preview line from first point to mouse
        drawLineWithConstantWidth(ctx, cadStore.dimensionStart.x, cadStore.dimensionStart.y, snapped.x, snapped.y, cadStore.lineColor, cadStore.lineWidth, cadStore.panOffset, cadStore.zoomLevel)
      }
    }

    // Note: Snap indicators are now handled by the proximity-based snap point rendering above
  } catch (error) {
    console.error('Error in mouse move:', error)
  }
}

const onMouseUp = () => {
  try {
    // Handle pan state
    if (panState.value.isPanning) {
      panState.value.isPanning = false
      if (canvasRef.value) {
        canvasRef.value.style.cursor = 'grab'
        const container = canvasRef.value.parentElement
        if (container) {
          container.style.cursor = 'grab'
        }
      }
    }

    if (cadStore.currentTool === 'polyline') {
      cadStore.setIsDrawing(false)
    }
  } catch (error) {
    console.error('Error in mouse up:', error)
  }
}

const onContextMenu = (event) => {
  // Prevent the default context menu
  event.preventDefault()
}

const onWheel = (event) => {
  try {
    event.preventDefault()

    // Get mouse position before zoom
    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Calculate world coordinates before zoom
    const worldX = (mouseX - cadStore.panOffset.x) / cadStore.zoomLevel
    const worldY = (mouseY - cadStore.panOffset.y) / cadStore.zoomLevel

    const delta = event.deltaY
    let newZoom

    if (delta < 0) {
      // Zoom in
      newZoom = Math.min(cadStore.zoomLevel * 1.2, cadStore.zoomMax)
    } else {
      // Zoom out
      newZoom = Math.max(cadStore.zoomLevel / 1.2, cadStore.zoomMin)
    }

    // Update zoom level
    cadStore.setZoom(newZoom)

    // Adjust pan offset to zoom to mouse cursor position
    const newPanX = mouseX - worldX * newZoom
    const newPanY = mouseY - worldY * newZoom
    cadStore.setPanOffset(newPanX, newPanY)

    // Redraw canvas with new zoom level and pan offset
    redrawCanvas()
  } catch (error) {
    console.error('Error in wheel event:', error)
  }
}

// Get mouse position accounting for zoom level and pan offset
const getMousePos = (event, canvas) => {
  const rect = canvas.getBoundingClientRect()
  const rawX = event.clientX - rect.left
  const rawY = event.clientY - rect.top

  // Transform coordinates to account for zoom level and pan offset
  return {
    x: (rawX - cadStore.panOffset.x) / cadStore.zoomLevel,
    y: (rawY - cadStore.panOffset.y) / cadStore.zoomLevel
  }
}

const onClick = (event) => {
  try {
    const pos = getMousePos(event, canvasRef.value)
    const snapResult = getSnappedPosition(pos)
    const snapped = snapResult.position

    // Left click to start drawing
    if (event.button === 0) { // Left click
      if (cadStore.currentTool === 'polyline' && !cadStore.isDrawing) {
        cadStore.addPolylinePoint(snapped)
        // Canvas will be redrawn automatically by the watcher
      } else if (cadStore.currentTool === 'line' && drawingState.value.startPoint) {
        const endPoint = snapped
        cadStore.addVectorObject({
          type: 'line',
          start: drawingState.value.startPoint,
          end: endPoint,
          color: cadStore.lineColor,
          lineWidth: cadStore.lineWidth
        })
        drawingState.value.startPoint = null
        saveState()
      } else if (cadStore.currentTool === 'rectangle' && drawingState.value.startPoint) {
        // Show command for width
        showCommand('width', (userWidth) => {
          if (userWidth <= 0) {
            alert('Width must be positive')
            return
          }

          // Show command for height
          showCommand('height', (userHeight) => {
            if (userHeight <= 0) {
              alert('Height must be positive')
              return
            }

            cadStore.addVectorObject({
              type: 'rectangle',
              x: drawingState.value.startPoint.x,
              y: drawingState.value.startPoint.y,
              width: userWidth,
              height: userHeight,
              color: cadStore.lineColor,
              lineWidth: cadStore.lineWidth,
              filled: false
            })
            drawingState.value.startPoint = null
            // Canvas will be redrawn automatically by the watcher
            saveState()
          })
        })
      } else if (cadStore.currentTool === 'circle' && drawingState.value.startPoint) {
        // Show command for radius
        showCommand('radius', (userRadius) => {
          if (userRadius <= 0) {
            alert('Radius must be positive')
            return
          }

          cadStore.addVectorObject({
            type: 'circle',
            x: drawingState.value.startPoint.x,
            y: drawingState.value.startPoint.y,
            radius: userRadius,
            color: cadStore.lineColor,
            lineWidth: cadStore.lineWidth,
            filled: false
          })
          drawingState.value.startPoint = null
          // Canvas will be redrawn automatically by the watcher
          saveState()
        })
      } else if (cadStore.currentTool === 'dimension' && cadStore.dimensionStart && cadStore.dimensionSecondPoint && cadStore.dimensionLinePosition) {
        // Final click - place the dimension
        cadStore.addVectorObject({
          type: 'dimension',
          point1: cadStore.dimensionStart,
          point2: cadStore.dimensionSecondPoint,
          dimensionLinePos: cadStore.dimensionLinePosition,
          color: cadStore.lineColor,
          lineWidth: cadStore.lineWidth
        })
        cadStore.clearAllDimensionData()
        redrawCanvas()
        saveState()
      }
    }
    // Right click to stop drawing
    else if (event.button === 2) { // Right click
      if (cadStore.currentTool === 'polyline' && cadStore.isDrawing) {
        cadStore.setIsDrawing(false)
        // Complete the polyline
        if (cadStore.polylinePoints.length > 1) {
          cadStore.addVectorObject({
            type: 'polyline',
            points: [...cadStore.polylinePoints],
            color: cadStore.lineColor,
            lineWidth: cadStore.lineWidth
          })
          cadStore.clearPolylinePoints()
          // Canvas will be redrawn automatically by the watcher
          saveState()
        }
      }
      // Cancel current operation
      if (drawingState.value.startPoint) {
        drawingState.value.startPoint = null
        redrawCanvas()
      }
      if (cadStore.dimensionStart || cadStore.dimensionSecondPoint || cadStore.dimensionLinePosition) {
        cadStore.clearAllDimensionData()
        redrawCanvas()
      }
      clearCommand()
    }
  } catch (error) {
    console.error('Error in click:', error)
    cadStore.showErrorDialog('Error in click event')
  }
}

// Watchers for automatic canvas redraw
watch(() => cadStore.vectorObjects, () => {
  if (ctx) {
    redrawCanvas()
  }
}, { deep: true })

watch(() => cadStore.polylinePoints, () => {
  if (ctx) {
    redrawCanvas()
  }
}, { deep: true })

watch(() => cadStore.showGrid, () => {
  if (ctx) {
    redrawCanvas()
  }
})

watch(() => cadStore.gridSize, () => {
  if (ctx) {
    redrawCanvas()
  }
})

watch(() => cadStore.lineColor, () => {
  if (ctx) {
    redrawCanvas()
  }
})

watch(() => cadStore.lineWidth, () => {
  if (ctx) {
    redrawCanvas()
  }
})

watch(() => cadStore.currentTool, () => {
  updateCursor()
})

// Initialize canvas
onMounted(() => {
  try {
    const canvas = canvasRef.value
    const overlay = overlayRef.value
    if (!canvas || !overlay) {
      console.error('Canvas elements not found')
      return
    }

    ctx = canvas.getContext('2d')
    overlayCtx = overlay.getContext('2d')
    if (!ctx || !overlayCtx) {
      console.error('Could not get 2D context')
      return
    }

    // Set initial canvas style
    setCanvasStyle(ctx, cadStore.lineColor, cadStore.lineWidth)

    // Set initial cursor based on current tool
    updateCursor()

    // Clear any existing content
    clearCanvasUtil(ctx, cadStore.canvasWidth, cadStore.canvasHeight)

    // Draw initial grid with transformations
    redrawCanvas()

    // Save initial state
    saveState()

    // Add event listeners for MainLayout events
    window.addEventListener('cad-clear-canvas', clearCanvas)
    window.addEventListener('cad-undo', undo)
    window.addEventListener('cad-redo', redo)
    window.addEventListener('cad-refresh-canvas', refreshCanvas)

    // Watch for theme changes and redraw canvas
    const observer = new MutationObserver(() => {
      if (ctx) {
        redrawCanvas()
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Store observer for cleanup
    window.cadThemeObserver = observer
  } catch (error) {
    console.error('Error initializing canvas:', error)
    cadStore.showErrorDialog('Error initializing canvas')
  }
})

// Cleanup
onUnmounted(() => {
  try {
    // Remove event listeners
    window.removeEventListener('cad-clear-canvas', clearCanvas)
    window.removeEventListener('cad-undo', undo)
    window.removeEventListener('cad-redo', redo)
    window.removeEventListener('cad-refresh-canvas', refreshCanvas)

    // Clean up theme observer
    if (window.cadThemeObserver) {
      window.cadThemeObserver.disconnect()
      delete window.cadThemeObserver
    }
  } catch (error) {
    console.error('Error in cleanup:', error)
  }
})
</script>

<style scoped>
.cad-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 20px); /* Account for header height */
  max-height: calc(100vh - 20px);
  overflow: hidden;
  background-color: var(--bg-secondary);
  outline: none; /* Remove focus outline */
  transition: background-color 0.3s ease;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

.cad-canvas {
  border: 2px solid var(--canvas-border);
  background-color: var(--canvas-bg);
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--status-bg);
  color: var(--status-text);
  padding: 8px 16px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  backdrop-filter: blur(4px);
  transition: background-color 0.3s ease;
  gap: 16px;
  z-index: 20;
  flex-shrink: 0;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.status-right {
  display: flex;
  align-items: center;
}

.command-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 300px;
}

.command-prompt {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.command-input {
  flex: 1;
  min-width: 200px;
}

.command-input .q-field__control {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

.command-input .q-field__native {
  color: var(--text-primary) !important;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.keyboard-hints {
  color: var(--text-muted);
  font-style: italic;
}


</style>
