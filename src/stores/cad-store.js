import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCADStore = defineStore('cad', () => {
  // Canvas state
  const canvasWidth = ref(1200)
  const canvasHeight = ref(800)
  const zoomLevel = ref(1)
  const zoomMin = 0.1
  const zoomMax = 10
  
  // Tool state
  const currentTool = ref('select')
  const lineWidth = ref(2)
  const lineColor = ref('#000000')
  
  // Grid settings
  const gridSize = ref(20)
  const showGrid = ref(true)
  const snapToGrid = ref(true)
  const snapToPoints = ref(true)
  const snapToLines = ref(true)
  const snapTolerance = ref(10)
  
  // Drawing state
  const isDrawing = ref(false)
  const polylinePoints = ref([])
  const dimensionStart = ref(null)
  const mousePosition = ref({ x: null, y: null })
  
  // Vector objects
  const vectorObjects = ref([])
  const selectedObjects = ref([])
  
  // Input state
  const userInput = ref('')
  const showInputDialog = ref(false)
  const inputPrompt = ref('')
  const inputCallback = ref(null)
  
  // History for undo/redo with limits
  const history = ref([])
  const historyIndex = ref(-1)
  const MAX_HISTORY_SIZE = 50
  
  // Error state
  const errorMessage = ref('')
  const showError = ref(false)
  
  // Color options
  const colorOptions = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080'
  ]
  
  // Computed properties
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  
  // Get all existing points for snapping
  const existingPoints = computed(() => {
    try {
      const points = []
      
      // Add polyline points
      points.push(...polylinePoints.value)
      
      // Add dimension points
      if (dimensionStart.value) {
        points.push(dimensionStart.value)
      }
      
      // Add vector object points
      vectorObjects.value.forEach(obj => {
        if (obj.type === 'line') {
          points.push(obj.start, obj.end)
        } else if (obj.type === 'rectangle') {
          points.push(
            { x: obj.x, y: obj.y },
            { x: obj.x + obj.width, y: obj.y },
            { x: obj.x + obj.width, y: obj.y + obj.height },
            { x: obj.x, y: obj.y + obj.height }
          )
        } else if (obj.type === 'circle') {
          points.push({ x: obj.x, y: obj.y })
        }
      })
      
      return points
    } catch (error) {
      console.error('Error computing existing points:', error)
      showErrorDialog('Error computing existing points')
      return []
    }
  })
  
  // Get all existing lines for snapping
  const existingLines = computed(() => {
    try {
      const lines = []
      
      // Add polyline segments
      for (let i = 1; i < polylinePoints.value.length; i++) {
        lines.push({
          start: polylinePoints.value[i - 1],
          end: polylinePoints.value[i]
        })
      }
      
      // Add vector object lines
      vectorObjects.value.forEach(obj => {
        if (obj.type === 'line') {
          lines.push({ start: obj.start, end: obj.end })
        } else if (obj.type === 'rectangle') {
          // Rectangle edges
          lines.push(
            { start: { x: obj.x, y: obj.y }, end: { x: obj.x + obj.width, y: obj.y } },
            { start: { x: obj.x + obj.width, y: obj.y }, end: { x: obj.x + obj.width, y: obj.y + obj.height } },
            { start: { x: obj.x + obj.width, y: obj.y + obj.height }, end: { x: obj.x, y: obj.y + obj.height } },
            { start: { x: obj.x, y: obj.y + obj.height }, end: { x: obj.x, y: obj.y } }
          )
        }
      })
      
      return lines
    } catch (error) {
      console.error('Error computing existing lines:', error)
      showErrorDialog('Error computing existing lines')
      return []
    }
  })
  
  // Error handling
  const showErrorDialog = (message) => {
    errorMessage.value = message
    showError.value = true
    setTimeout(() => {
      showError.value = false
      errorMessage.value = ''
    }, 3000)
  }
  
  const clearError = () => {
    showError.value = false
    errorMessage.value = ''
  }
  
  // Actions
  const setTool = (tool) => {
    try {
      currentTool.value = tool
      if (tool !== 'polyline') {
        polylinePoints.value = []
      }
      if (tool !== 'dimension') {
        dimensionStart.value = null
      }
    } catch (error) {
      console.error('Error setting tool:', error)
      showErrorDialog('Error setting tool')
    }
  }
  
  const setLineWidth = (width) => {
    try {
      if (width >= 1 && width <= 20) {
        lineWidth.value = width
      }
    } catch (error) {
      console.error('Error setting line width:', error)
      showErrorDialog('Error setting line width')
    }
  }
  
  const setLineColor = (color) => {
    try {
      lineColor.value = color
    } catch (error) {
      console.error('Error setting line color:', error)
      showErrorDialog('Error setting line color')
    }
  }
  
  const setMousePosition = (x, y) => {
    try {
      mousePosition.value = { x, y }
    } catch (error) {
      console.error('Error setting mouse position:', error)
    }
  }
  
  const addPolylinePoint = (point) => {
    try {
      polylinePoints.value.push(point)
    } catch (error) {
      console.error('Error adding polyline point:', error)
      showErrorDialog('Error adding polyline point')
    }
  }
  
  const clearPolylinePoints = () => {
    try {
      polylinePoints.value = []
    } catch (error) {
      console.error('Error clearing polyline points:', error)
      showErrorDialog('Error clearing polyline points')
    }
  }
  
  const setDimensionStart = (point) => {
    try {
      dimensionStart.value = point
    } catch (error) {
      console.error('Error setting dimension start:', error)
      showErrorDialog('Error setting dimension start')
    }
  }
  
  const clearDimensionStart = () => {
    try {
      dimensionStart.value = null
    } catch (error) {
      console.error('Error clearing dimension start:', error)
      showErrorDialog('Error clearing dimension start')
    }
  }
  
  const setIsDrawing = (drawing) => {
    try {
      isDrawing.value = drawing
    } catch (error) {
      console.error('Error setting drawing state:', error)
      showErrorDialog('Error setting drawing state')
    }
  }
  
  // Grid and snapping actions
  const setGridSize = (size) => {
    try {
      // Add validation for grid size
      if (size >= 5 && size <= 100) {
        gridSize.value = size
      }
    } catch (error) {
      console.error('Error setting grid size:', error)
      showErrorDialog('Error setting grid size')
    }
  }
  
  const toggleGrid = () => {
    try {
      showGrid.value = !showGrid.value
    } catch (error) {
      console.error('Error toggling grid:', error)
      showErrorDialog('Error toggling grid')
    }
  }
  
  const toggleSnapToGrid = () => {
    try {
      snapToGrid.value = !snapToGrid.value
    } catch (error) {
      console.error('Error toggling snap to grid:', error)
      showErrorDialog('Error toggling snap to grid')
    }
  }
  
  const toggleSnapToPoints = () => {
    try {
      snapToPoints.value = !snapToPoints.value
    } catch (error) {
      console.error('Error toggling snap to points:', error)
      showErrorDialog('Error toggling snap to points')
    }
  }
  
  const toggleSnapToLines = () => {
    try {
      snapToLines.value = !snapToLines.value
    } catch (error) {
      console.error('Error toggling snap to lines:', error)
      showErrorDialog('Error toggling snap to lines')
    }
  }
  
  const setSnapTolerance = (tolerance) => {
    try {
      // Add validation for snap tolerance
      if (tolerance >= 1 && tolerance <= 50) {
        snapTolerance.value = tolerance
      }
    } catch (error) {
      console.error('Error setting snap tolerance:', error)
      showErrorDialog('Error setting snap tolerance')
    }
  }
  
  // Vector object actions
  const addVectorObject = (object) => {
    try {
      vectorObjects.value.push(object)
    } catch (error) {
      console.error('Error adding vector object:', error)
      showErrorDialog('Error adding vector object')
    }
  }
  
  const removeVectorObject = (index) => {
    try {
      vectorObjects.value.splice(index, 1)
    } catch (error) {
      console.error('Error removing vector object:', error)
      showErrorDialog('Error removing vector object')
    }
  }
  
  const clearVectorObjects = () => {
    try {
      vectorObjects.value = []
    } catch (error) {
      console.error('Error clearing vector objects:', error)
      showErrorDialog('Error clearing vector objects')
    }
  }
  
  const selectObject = (index) => {
    try {
      selectedObjects.value = [index]
    } catch (error) {
      console.error('Error selecting object:', error)
      showErrorDialog('Error selecting object')
    }
  }
  
  const clearSelection = () => {
    try {
      selectedObjects.value = []
    } catch (error) {
      console.error('Error clearing selection:', error)
      showErrorDialog('Error clearing selection')
    }
  }
  
  // Input dialog actions
  const showInput = (prompt, callback) => {
    try {
      inputPrompt.value = prompt
      inputCallback.value = callback
      showInputDialog.value = true
      userInput.value = ''
    } catch (error) {
      console.error('Error showing input dialog:', error)
      showErrorDialog('Error showing input dialog')
    }
  }
  
  const submitInput = () => {
    try {
      if (inputCallback.value) {
        inputCallback.value(userInput.value)
      }
      showInputDialog.value = false
      inputCallback.value = null
    } catch (error) {
      console.error('Error submitting input:', error)
      showErrorDialog('Error submitting input')
    }
  }
  
  const cancelInput = () => {
    try {
      showInputDialog.value = false
      inputCallback.value = null
      userInput.value = ''
    } catch (error) {
      console.error('Error canceling input:', error)
      showErrorDialog('Error canceling input')
    }
  }
  
  const saveState = (imageData) => {
    try {
      // Implement history limits
      if (history.value.length >= MAX_HISTORY_SIZE) {
        // Remove oldest state
        history.value.shift()
        historyIndex.value = Math.max(0, historyIndex.value - 1)
      }
      
      history.value = history.value.slice(0, historyIndex.value + 1)
      history.value.push(imageData)
      historyIndex.value++
    } catch (error) {
      console.error('Error saving state:', error)
      showErrorDialog('Error saving state')
    }
  }
  
  const undo = () => {
    try {
      if (canUndo.value) {
        historyIndex.value--
        return history.value[historyIndex.value]
      }
      return null
    } catch (error) {
      console.error('Error undoing:', error)
      showErrorDialog('Error undoing action')
      return null
    }
  }
  
  const redo = () => {
    try {
      if (canRedo.value) {
        historyIndex.value++
        return history.value[historyIndex.value]
      }
      return null
    } catch (error) {
      console.error('Error redoing:', error)
      showErrorDialog('Error redoing action')
      return null
    }
  }
  
  const clearHistory = () => {
    try {
      history.value = []
      historyIndex.value = -1
    } catch (error) {
      console.error('Error clearing history:', error)
      showErrorDialog('Error clearing history')
    }
  }
  
  const resetCanvas = () => {
    try {
      clearPolylinePoints()
      clearDimensionStart()
      clearVectorObjects()
      clearSelection()
      setIsDrawing(false)
      setMousePosition(null, null)
    } catch (error) {
      console.error('Error resetting canvas:', error)
      showErrorDialog('Error resetting canvas')
    }
  }
  
  // Zoom methods
  const zoomIn = () => {
    try {
      const newZoom = Math.min(zoomLevel.value * 1.2, zoomMax)
      zoomLevel.value = newZoom
    } catch (error) {
      console.error('Error zooming in:', error)
      showErrorDialog('Error zooming in')
    }
  }
  
  const zoomOut = () => {
    try {
      const newZoom = Math.max(zoomLevel.value / 1.2, zoomMin)
      zoomLevel.value = newZoom
    } catch (error) {
      console.error('Error zooming out:', error)
      showErrorDialog('Error zooming out')
    }
  }
  
  const setZoom = (level) => {
    try {
      const newZoom = Math.max(zoomMin, Math.min(level, zoomMax))
      zoomLevel.value = newZoom
    } catch (error) {
      console.error('Error setting zoom:', error)
      showErrorDialog('Error setting zoom')
    }
  }
  
  const resetZoom = () => {
    try {
      zoomLevel.value = 1
    } catch (error) {
      console.error('Error resetting zoom:', error)
      showErrorDialog('Error resetting zoom')
    }
  }
  
  return {
    // State
    canvasWidth,
    canvasHeight,
    zoomLevel,
    zoomMin,
    zoomMax,
    currentTool,
    lineWidth,
    lineColor,
    gridSize,
    showGrid,
    snapToGrid,
    snapToPoints,
    snapToLines,
    snapTolerance,
    isDrawing,
    polylinePoints,
    dimensionStart,
    mousePosition,
    vectorObjects,
    selectedObjects,
    userInput,
    showInputDialog,
    inputPrompt,
    history,
    historyIndex,
    colorOptions,
    errorMessage,
    showError,
    
    // Computed
    canUndo,
    canRedo,
    existingPoints,
    existingLines,
    
    // Actions
    setTool,
    setLineWidth,
    setLineColor,
    setMousePosition,
    addPolylinePoint,
    clearPolylinePoints,
    setDimensionStart,
    clearDimensionStart,
    setIsDrawing,
    setGridSize,
    toggleGrid,
    toggleSnapToGrid,
    toggleSnapToPoints,
    toggleSnapToLines,
    setSnapTolerance,
    addVectorObject,
    removeVectorObject,
    clearVectorObjects,
    selectObject,
    clearSelection,
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
    showInput,
    submitInput,
    cancelInput,
    saveState,
    undo,
    redo,
    clearHistory,
    resetCanvas,
    showErrorDialog,
    clearError
  }
})
