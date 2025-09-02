// Drawing utility functions for CAD operations

/**
 * Draw a point on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Point color
 * @param {number} size - Point size
 */
export const drawPoint = (ctx, x, y, color = '#000000', size = 3) => {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Draw a line on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {string} color - Line color
 * @param {number} width - Line width
 */
export const drawLine = (ctx, x1, y1, x2, y2, color = '#000000', width = 2) => {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

/**
 * Draw a polyline on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of point objects with x, y coordinates
 * @param {string} color - Line color
 * @param {number} width - Line width
 */
export const drawPolyline = (ctx, points, color = '#000000', width = 2) => {
  if (points.length < 2) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }

  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

/**
 * Draw a rectangle on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {string} color - Line color
 * @param {number} lineWidth - Line width
 * @param {boolean} filled - Whether to fill the rectangle
 */
export const drawRectangle = (ctx, x, y, width, height, color = '#000000', lineWidth = 2, filled = false) => {
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  if (filled) {
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draw a circle on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} radius - Circle radius
 * @param {string} color - Line color
 * @param {number} lineWidth - Line width
 * @param {boolean} filled - Whether to fill the circle
 */
export const drawCircle = (ctx, x, y, radius, color = '#000000', lineWidth = 2, filled = false) => {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  if (filled) {
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draw a grid on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} gridSize - Grid spacing
 * @param {string} color - Grid color
 * @param {number} lineWidth - Grid line width
 */
export const drawGrid = (ctx, width, height, gridSize = 20, color = '#e0e0e0', lineWidth = 0.5) => {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

/**
 * Snap a point to the nearest grid intersection
 * @param {Object} point - Point object {x, y}
 * @param {number} gridSize - Grid spacing
 * @returns {Object} Snapped point {x, y}
 */
export const snapToGrid = (point, gridSize = 20) => {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  }
}

/**
 * Snap a point to the nearest grid intersection accounting for pan and zoom transformations
 * @param {Object} point - Point object {x, y} in world coordinates
 * @param {number} gridSize - Grid spacing in world coordinates
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 * @returns {Object} Snapped point {x, y} in world coordinates
 */
export const snapToTransformedGrid = (point, gridSize = 20, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  // Calculate the effective grid size in screen coordinates
  const screenGridSize = gridSize * zoomLevel

  // Transform the point to screen coordinates
  const screenX = point.x * zoomLevel + panOffset.x
  const screenY = point.y * zoomLevel + panOffset.y

  // Snap to grid in screen coordinates
  const snappedScreenX = Math.round(screenX / screenGridSize) * screenGridSize
  const snappedScreenY = Math.round(screenY / screenGridSize) * screenGridSize

  // Transform back to world coordinates
  return {
    x: (snappedScreenX - panOffset.x) / zoomLevel,
    y: (snappedScreenY - panOffset.y) / zoomLevel
  }
}

/**
 * Snap a point to existing points within a tolerance
 * @param {Object} point - Point to snap
 * @param {Array} existingPoints - Array of existing points
 * @param {number} tolerance - Snap tolerance in pixels
 * @returns {Object|null} Snapped point or null if no snap found
 */
export const snapToPoints = (point, existingPoints, tolerance = 10) => {
  for (const existingPoint of existingPoints) {
    const distance = calculateDistance(point, existingPoint)
    if (distance <= tolerance) {
      return existingPoint
    }
  }
  return null
}

/**
 * Snap a point to lines within a tolerance
 * @param {Object} point - Point to snap
 * @param {Array} lines - Array of line objects {start: {x,y}, end: {x,y}}
 * @param {number} tolerance - Snap tolerance in pixels
 * @returns {Object|null} Snapped point or null if no snap found
 */
export const snapToLines = (point, lines, tolerance = 10) => {
  for (const line of lines) {
    const snappedPoint = snapToLine(point, line.start, line.end, tolerance)
    if (snappedPoint) {
      return snappedPoint
    }
  }
  return null
}

/**
 * Snap a point to a specific line
 * @param {Object} point - Point to snap
 * @param {Object} lineStart - Line start point
 * @param {Object} lineEnd - Line end point
 * @param {number} tolerance - Snap tolerance in pixels
 * @returns {Object|null} Snapped point or null if no snap found
 */
export const snapToLine = (point, lineStart, lineEnd, tolerance = 10) => {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D

  if (lenSq === 0) return null

  let param = dot / lenSq

  // Clamp to line segment
  param = Math.max(0, Math.min(1, param))

  const snappedX = lineStart.x + param * C
  const snappedY = lineStart.y + param * D

  const distance = calculateDistance(point, { x: snappedX, y: snappedY })

  if (distance <= tolerance) {
    return { x: snappedX, y: snappedY }
  }

  return null
}

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Distance in pixels
 */
export const calculateDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  )
}

/**
 * Calculate angle between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Angle in radians
 */
export const calculateAngle = (point1, point2) => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x)
}

/**
 * Draw a dimension line with text and arrowheads
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} start - Start point {x, y}
 * @param {Object} end - End point {x, y}
 * @param {string} color - Line color
 * @param {number} width - Line width
 */
export const drawDimension = (ctx, start, end, color = '#000000', width = 2) => {
  if (!start || !end) return

  // Draw dimension line
  drawLine(ctx, start.x, start.y, end.x, end.y, color, width)

  // Calculate distance
  const distance = calculateDistance(start, end)

  // Draw dimension text
  ctx.font = '12px Arial'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  ctx.fillText(`${Math.round(distance)}px`, midX, midY - 15)

  // Draw arrowheads
  drawArrowhead(ctx, start.x, start.y, end.x, end.y, color, width)
  drawArrowhead(ctx, end.x, end.y, start.x, start.y, color, width)
}

/**
 * Draw an arrowhead at a point
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Arrow point X
 * @param {number} y1 - Arrow point Y
 * @param {number} x2 - Line end X
 * @param {number} y2 - Line end Y
 * @param {string} color - Arrow color
 * @param {number} width - Line width
 */
export const drawArrowhead = (ctx, x1, y1, x2, y2, color = '#000000', width = 2) => {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const arrowLength = 10
  const arrowAngle = Math.PI / 6

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(
    x1 - arrowLength * Math.cos(angle - arrowAngle),
    y1 - arrowLength * Math.sin(angle - arrowAngle)
  )
  ctx.moveTo(x1, y1)
  ctx.lineTo(
    x1 - arrowLength * Math.cos(angle + arrowAngle),
    y1 - arrowLength * Math.sin(angle + arrowAngle)
  )
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

/**
 * Get mouse position relative to canvas
 * @param {Event} event - Mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Object} Mouse position {x, y}
 */
export const getMousePos = (event, canvas) => {
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

/**
 * Save canvas state to history
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {ImageData} Canvas image data
 */
export const saveCanvasState = (ctx, width, height) => {
  return ctx.getImageData(0, 0, width, height)
}

/**
 * Restore canvas state from history
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {ImageData} imageData - Canvas image data
 */
export const restoreCanvasState = (ctx, imageData) => {
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Clear the entire canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export const clearCanvas = (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height)
}

/**
 * Set canvas drawing style
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} color - Stroke color
 * @param {number} width - Line width
 */
export const setCanvasStyle = (ctx, color = '#000000', width = 2) => {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

/**
 * Format a number for display with specified precision
 * @param {number} value - Number to format
 * @param {number} precision - Decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, precision = 2) => {
  return Number(value).toFixed(precision)
}

/**
 * Parse user input for numeric values
 * @param {string} input - User input string
 * @returns {number|null} Parsed number or null if invalid
 */
export const parseUserInput = (input) => {
  const parsed = parseFloat(input)
  return isNaN(parsed) ? null : parsed
}

/**
 * Get theme-aware colors
 * @returns {Object} Theme-aware color object
 */
export const getThemeColors = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    grid: isDark ? '#404040' : '#e0e0e0',
    text: isDark ? '#ffffff' : '#000000',
    background: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#404040' : '#dee2e6'
  }
}

/**
 * Draw a theme-aware grid on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} gridSize - Grid cell size
 */
export const drawThemeAwareGrid = (ctx, width, height, gridSize) => {
  const colors = getThemeColors()

  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  ctx.setLineDash([])

  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

/**
 * Draw snap points on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of point objects with x, y coordinates
 * @param {string} color - Point color
 * @param {number} size - Point size
 */
export const drawSnapPoints = (ctx, points, color = '#FF0000', size = 4) => {
  if (!points || points.length === 0) return

  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1

  points.forEach(point => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, size, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  })

  ctx.restore()
}

/**
 * Calculate midpoint of a line
 * @param {Object} start - Start point {x, y}
 * @param {Object} end - End point {x, y}
 * @returns {Object} Midpoint {x, y}
 */
export const calculateMidpoint = (start, end) => {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  }
}

/**
 * Get all snap points from vector objects with different types
 * @param {Array} vectorObjects - Array of vector objects
 * @returns {Object} Object containing different types of snap points
 */
export const getAllSnapPoints = (vectorObjects) => {
  const snapPoints = {
    endpoints: [],
    midpoints: [],
    centers: [],
    corners: []
  }

  vectorObjects.forEach(obj => {
    if (obj.type === 'line') {
      // Line endpoints
      snapPoints.endpoints.push(obj.start, obj.end)
      // Line midpoint
      snapPoints.midpoints.push(calculateMidpoint(obj.start, obj.end))
    } else if (obj.type === 'rectangle') {
      // Rectangle corners
      const corners = [
        { x: obj.x, y: obj.y },
        { x: obj.x + obj.width, y: obj.y },
        { x: obj.x + obj.width, y: obj.y + obj.height },
        { x: obj.x, y: obj.y + obj.height }
      ]
      snapPoints.corners.push(...corners)
      // Rectangle center
      snapPoints.centers.push({
        x: obj.x + obj.width / 2,
        y: obj.y + obj.height / 2
      })
    } else if (obj.type === 'circle') {
      // Circle center
      snapPoints.centers.push({ x: obj.x, y: obj.y })
    }
  })

  return snapPoints
}

/**
 * Get snap points within proximity of mouse position
 * @param {Object} mousePos - Mouse position {x, y}
 * @param {Object} snapPoints - Object containing different types of snap points
 * @param {number} proximity - Proximity threshold in pixels
 * @returns {Object} Snap points within proximity, organized by type
 */
export const getSnapPointsInProximity = (mousePos, snapPoints, proximity = 50) => {
  const nearbySnaps = {
    endpoints: [],
    midpoints: [],
    centers: [],
    corners: [],
    grid: []
  }

  // Check endpoints
  snapPoints.endpoints?.forEach(point => {
    if (calculateDistance(mousePos, point) <= proximity) {
      nearbySnaps.endpoints.push({ ...point, type: 'endpoint' })
    }
  })

  // Check midpoints
  snapPoints.midpoints?.forEach(point => {
    if (calculateDistance(mousePos, point) <= proximity) {
      nearbySnaps.midpoints.push({ ...point, type: 'midpoint' })
    }
  })

  // Check centers
  snapPoints.centers?.forEach(point => {
    if (calculateDistance(mousePos, point) <= proximity) {
      nearbySnaps.centers.push({ ...point, type: 'center' })
    }
  })

  // Check corners
  snapPoints.corners?.forEach(point => {
    if (calculateDistance(mousePos, point) <= proximity) {
      nearbySnaps.corners.push({ ...point, type: 'corner' })
    }
  })

  return nearbySnaps
}

/**
 * Get grid snap points within proximity
 * @param {Object} mousePos - Mouse position {x, y}
 * @param {number} gridSize - Grid size
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 * @param {number} proximity - Proximity threshold in pixels
 * @returns {Array} Grid snap points within proximity
 */
export const getGridSnapPointsInProximity = (mousePos, gridSize, panOffset, zoomLevel, proximity = 50) => {
  const gridSnaps = []

  // Calculate the effective grid size in screen coordinates
  const screenGridSize = gridSize * zoomLevel

  // Transform mouse position to screen coordinates
  const screenX = mousePos.x * zoomLevel + panOffset.x
  const screenY = mousePos.y * zoomLevel + panOffset.y

  // Find nearby grid intersections
  const gridX = Math.round(screenX / screenGridSize) * screenGridSize
  const gridY = Math.round(screenY / screenGridSize) * screenGridSize

  // Check if the nearest grid point is within proximity
  if (Math.abs(screenX - gridX) <= proximity && Math.abs(screenY - gridY) <= proximity) {
    // Transform back to world coordinates
    const worldX = (gridX - panOffset.x) / zoomLevel
    const worldY = (gridY - panOffset.y) / zoomLevel
    gridSnaps.push({ x: worldX, y: worldY, type: 'grid' })
  }

  return gridSnaps
}

/**
 * Draw snap points with visual distinction based on type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} snapData - Object containing different types of snap points
 */
export const drawSnapPointsByType = (ctx, snapData) => {
  if (!snapData) return

  ctx.save()

  // Draw endpoints (red circles)
  if (snapData.endpoints && snapData.endpoints.length > 0) {
    ctx.fillStyle = '#FF0000'
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    snapData.endpoints.forEach(point => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })
  }

  // Draw midpoints (blue squares)
  if (snapData.midpoints && snapData.midpoints.length > 0) {
    ctx.fillStyle = '#0066FF'
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    snapData.midpoints.forEach(point => {
      ctx.fillRect(point.x - 3, point.y - 3, 6, 6)
      ctx.strokeRect(point.x - 3, point.y - 3, 6, 6)
    })
  }

  // Draw centers (green diamonds)
  if (snapData.centers && snapData.centers.length > 0) {
    ctx.fillStyle = '#00AA00'
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    snapData.centers.forEach(point => {
      ctx.beginPath()
      ctx.moveTo(point.x, point.y - 4)
      ctx.lineTo(point.x + 4, point.y)
      ctx.lineTo(point.x, point.y + 4)
      ctx.lineTo(point.x - 4, point.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })
  }

  // Draw corners (orange triangles)
  if (snapData.corners && snapData.corners.length > 0) {
    ctx.fillStyle = '#FF8800'
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    snapData.corners.forEach(point => {
      ctx.beginPath()
      ctx.moveTo(point.x, point.y - 4)
      ctx.lineTo(point.x + 4, point.y + 4)
      ctx.lineTo(point.x - 4, point.y + 4)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })
  }

  // Draw grid points (gray crosses)
  if (snapData.grid && snapData.grid.length > 0) {
    ctx.strokeStyle = '#888888'
    ctx.lineWidth = 2
    snapData.grid.forEach(point => {
      ctx.beginPath()
      ctx.moveTo(point.x - 6, point.y)
      ctx.lineTo(point.x + 6, point.y)
      ctx.moveTo(point.x, point.y - 6)
      ctx.lineTo(point.x, point.y + 6)
      ctx.stroke()
    })
  }

  ctx.restore()
}

/**
 * Draw a line with constant width regardless of zoom level
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Start X coordinate in world coordinates
 * @param {number} y1 - Start Y coordinate in world coordinates
 * @param {number} x2 - End X coordinate in world coordinates
 * @param {number} y2 - End Y coordinate in world coordinates
 * @param {string} color - Line color
 * @param {number} width - Line width in pixels (constant)
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawLineWithConstantWidth = (ctx, x1, y1, x2, y2, color = '#000000', width = 2, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  ctx.save()

  // Transform world coordinates to screen coordinates
  const screenX1 = x1 * zoomLevel + panOffset.x
  const screenY1 = y1 * zoomLevel + panOffset.y
  const screenX2 = x2 * zoomLevel + panOffset.x
  const screenY2 = y2 * zoomLevel + panOffset.y

  // Draw with constant line width
  ctx.beginPath()
  ctx.moveTo(screenX1, screenY1)
  ctx.lineTo(screenX2, screenY2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw a rectangle with constant line width regardless of zoom level
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate in world coordinates
 * @param {number} y - Y coordinate in world coordinates
 * @param {number} width - Rectangle width in world coordinates
 * @param {number} height - Rectangle height in world coordinates
 * @param {string} color - Line color
 * @param {number} lineWidth - Line width in pixels (constant)
 * @param {boolean} filled - Whether to fill the rectangle
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawRectangleWithConstantWidth = (ctx, x, y, width, height, color = '#000000', lineWidth = 2, filled = false, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  ctx.save()

  // Transform world coordinates to screen coordinates
  const screenX = x * zoomLevel + panOffset.x
  const screenY = y * zoomLevel + panOffset.y
  const screenWidth = width * zoomLevel
  const screenHeight = height * zoomLevel

  // Draw with constant line width
  ctx.beginPath()
  ctx.rect(screenX, screenY, screenWidth, screenHeight)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  if (filled) {
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw a circle with constant line width regardless of zoom level
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X coordinate in world coordinates
 * @param {number} y - Center Y coordinate in world coordinates
 * @param {number} radius - Circle radius in world coordinates
 * @param {string} color - Line color
 * @param {number} lineWidth - Line width in pixels (constant)
 * @param {boolean} filled - Whether to fill the circle
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawCircleWithConstantWidth = (ctx, x, y, radius, color = '#000000', lineWidth = 2, filled = false, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  ctx.save()

  // Transform world coordinates to screen coordinates
  const screenX = x * zoomLevel + panOffset.x
  const screenY = y * zoomLevel + panOffset.y
  const screenRadius = radius * zoomLevel

  // Draw with constant line width
  ctx.beginPath()
  ctx.arc(screenX, screenY, screenRadius, 0, 2 * Math.PI)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  if (filled) {
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw a polyline with constant line width regardless of zoom level
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of point objects with x, y coordinates in world coordinates
 * @param {string} color - Line color
 * @param {number} width - Line width in pixels (constant)
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawPolylineWithConstantWidth = (ctx, points, color = '#000000', width = 2, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  if (points.length < 2) return

  ctx.save()

  // Transform first point to screen coordinates
  const screenX = points[0].x * zoomLevel + panOffset.x
  const screenY = points[0].y * zoomLevel + panOffset.y

  ctx.beginPath()
  ctx.moveTo(screenX, screenY)

  // Draw remaining points
  for (let i = 1; i < points.length; i++) {
    const screenX = points[i].x * zoomLevel + panOffset.x
    const screenY = points[i].y * zoomLevel + panOffset.y
    ctx.lineTo(screenX, screenY)
  }

  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw a point with constant size regardless of zoom level
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate in world coordinates
 * @param {number} y - Y coordinate in world coordinates
 * @param {string} color - Point color
 * @param {number} size - Point size in pixels (constant)
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawPointWithConstantSize = (ctx, x, y, color = '#000000', size = 3, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  ctx.save()

  // Transform world coordinates to screen coordinates
  const screenX = x * zoomLevel + panOffset.x
  const screenY = y * zoomLevel + panOffset.y

  // Draw with constant size
  ctx.beginPath()
  ctx.arc(screenX, screenY, size, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()

  ctx.restore()
}

/**
 * Draw AutoCAD-style dimension with extension lines and dimension line
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} point1 - First dimension point {x, y} in world coordinates
 * @param {Object} point2 - Second dimension point {x, y} in world coordinates
 * @param {Object} dimensionLinePos - Dimension line position {x, y} in world coordinates
 * @param {string} color - Line color
 * @param {number} width - Line width in pixels (constant)
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawAutoCADDimension = (ctx, point1, point2, dimensionLinePos, color = '#000000', width = 2, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  if (!point1 || !point2 || !dimensionLinePos) return

  ctx.save()

  // Transform world coordinates to screen coordinates
  const screenP1X = point1.x * zoomLevel + panOffset.x
  const screenP1Y = point1.y * zoomLevel + panOffset.y
  const screenP2X = point2.x * zoomLevel + panOffset.x
  const screenP2Y = point2.y * zoomLevel + panOffset.y
  const screenDimX = dimensionLinePos.x * zoomLevel + panOffset.x
  const screenDimY = dimensionLinePos.y * zoomLevel + panOffset.y

  // Calculate extension line endpoints
  const lineAngle = Math.atan2(screenP2Y - screenP1Y, screenP2X - screenP1X)
  const perpAngle = lineAngle + Math.PI / 2

  // Calculate perpendicular distance from dimension line to the line between points
  const lineLength = Math.sqrt(Math.pow(screenP2X - screenP1X, 2) + Math.pow(screenP2Y - screenP1Y, 2))
  const perpDistance = ((screenDimX - screenP1X) * (screenP2Y - screenP1Y) - (screenDimY - screenP1Y) * (screenP2X - screenP1X)) / lineLength

  // Calculate extension line start points (projection of dimension line onto the line between points)
  const t1 = ((screenDimX - screenP1X) * (screenP2X - screenP1X) + (screenDimY - screenP1Y) * (screenP2Y - screenP1Y)) / (lineLength * lineLength)
  const t2 = Math.max(0, Math.min(1, t1)) // Clamp to line segment

  const extStartX = screenP1X + t2 * (screenP2X - screenP1X)
  const extStartY = screenP1Y + t2 * (screenP2Y - screenP1Y)

  // Draw extension lines
  ctx.beginPath()
  ctx.moveTo(screenP1X, screenP1Y)
  ctx.lineTo(extStartX, extStartY)
  ctx.moveTo(screenP2X, screenP2Y)
  ctx.lineTo(extStartX, extStartY)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()

  // Draw dimension line (perpendicular to extension lines)
  const dimLineLength = Math.abs(perpDistance)
  const dimLineStartX = extStartX - (perpDistance / Math.abs(perpDistance)) * dimLineLength * Math.cos(perpAngle)
  const dimLineStartY = extStartY - (perpDistance / Math.abs(perpDistance)) * dimLineLength * Math.sin(perpAngle)
  const dimLineEndX = extStartX + (perpDistance / Math.abs(perpDistance)) * dimLineLength * Math.cos(perpAngle)
  const dimLineEndY = extStartY + (perpDistance / Math.abs(perpDistance)) * dimLineLength * Math.sin(perpAngle)

  ctx.beginPath()
  ctx.moveTo(dimLineStartX, dimLineStartY)
  ctx.lineTo(dimLineEndX, dimLineEndY)
  ctx.stroke()

  // Draw arrowheads on dimension line
  drawArrowheadWithConstantSize(ctx, dimLineStartX, dimLineStartY, dimLineEndX, dimLineEndY, color, width)
  drawArrowheadWithConstantSize(ctx, dimLineEndX, dimLineEndY, dimLineStartX, dimLineStartY, color, width)

  // Calculate and draw dimension text
  const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
  ctx.font = '12px Arial'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Position text at the dimension line position
  ctx.fillText(`${Math.round(distance)}px`, screenDimX, screenDimY)

  ctx.restore()
}

/**
 * Draw a dimension line with constant line width regardless of zoom level (legacy function)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} start - Start point {x, y} in world coordinates
 * @param {Object} end - End point {x, y} in world coordinates
 * @param {string} color - Line color
 * @param {number} width - Line width in pixels (constant)
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawDimensionWithConstantWidth = (ctx, start, end, color = '#000000', width = 2, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  if (!start || !end) return

  ctx.save()

  // Transform world coordinates to screen coordinates
  const screenStartX = start.x * zoomLevel + panOffset.x
  const screenStartY = start.y * zoomLevel + panOffset.y
  const screenEndX = end.x * zoomLevel + panOffset.x
  const screenEndY = end.y * zoomLevel + panOffset.y

  // Draw dimension line with constant width
  ctx.beginPath()
  ctx.moveTo(screenStartX, screenStartY)
  ctx.lineTo(screenEndX, screenEndY)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()

  // Calculate distance in world coordinates
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  )

  // Draw dimension text with constant size
  ctx.font = '12px Arial'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const midX = (screenStartX + screenEndX) / 2
  const midY = (screenStartY + screenEndY) / 2

  ctx.fillText(`${Math.round(distance)}px`, midX, midY - 15)

  // Draw arrowheads with constant size
  drawArrowheadWithConstantSize(ctx, screenStartX, screenStartY, screenEndX, screenEndY, color, width)
  drawArrowheadWithConstantSize(ctx, screenEndX, screenEndY, screenStartX, screenStartY, color, width)

  ctx.restore()
}

/**
 * Draw an arrowhead with constant size regardless of zoom level
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Arrow point X in screen coordinates
 * @param {number} y1 - Arrow point Y in screen coordinates
 * @param {number} x2 - Line end X in screen coordinates
 * @param {number} y2 - Line end Y in screen coordinates
 * @param {string} color - Arrow color
 * @param {number} width - Line width in pixels (constant)
 */
export const drawArrowheadWithConstantSize = (ctx, x1, y1, x2, y2, color = '#000000', width = 2) => {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const arrowLength = 10 // Constant arrow length
  const arrowAngle = Math.PI / 6

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(
    x1 - arrowLength * Math.cos(angle - arrowAngle),
    y1 - arrowLength * Math.sin(angle - arrowAngle)
  )
  ctx.moveTo(x1, y1)
  ctx.lineTo(
    x1 - arrowLength * Math.cos(angle + arrowAngle),
    y1 - arrowLength * Math.sin(angle + arrowAngle)
  )
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

/**
 * Draw a theme-aware grid on the canvas accounting for pan and zoom transformations
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {number} gridSize - Grid cell size in world coordinates
 * @param {Object} panOffset - Pan offset {x, y}
 * @param {number} zoomLevel - Current zoom level
 */
export const drawTransformedGrid = (ctx, canvasWidth, canvasHeight, gridSize, panOffset = { x: 0, y: 0 }, zoomLevel = 1) => {
  const colors = getThemeColors()

  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  ctx.setLineDash([])

  // Calculate the visible area in world coordinates
  const worldLeft = -panOffset.x / zoomLevel
  const worldTop = -panOffset.y / zoomLevel
  const worldRight = (canvasWidth - panOffset.x) / zoomLevel
  const worldBottom = (canvasHeight - panOffset.y) / zoomLevel

  // Find the grid lines that intersect with the visible area
  const startX = Math.floor(worldLeft / gridSize) * gridSize
  const endX = Math.ceil(worldRight / gridSize) * gridSize
  const startY = Math.floor(worldTop / gridSize) * gridSize
  const endY = Math.ceil(worldBottom / gridSize) * gridSize

  // Draw vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    const screenX = x * zoomLevel + panOffset.x
    if (screenX >= 0 && screenX <= canvasWidth) {
      ctx.beginPath()
      ctx.moveTo(screenX, 0)
      ctx.lineTo(screenX, canvasHeight)
      ctx.stroke()
    }
  }

  // Draw horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    const screenY = y * zoomLevel + panOffset.y
    if (screenY >= 0 && screenY <= canvasHeight) {
      ctx.beginPath()
      ctx.moveTo(0, screenY)
      ctx.lineTo(canvasWidth, screenY)
      ctx.stroke()
    }
  }
}
