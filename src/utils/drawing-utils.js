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
