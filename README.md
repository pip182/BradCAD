# BradCAD - Simple CAD Drawing App

A modern, web-based CAD drawing application built with Quasar Framework and Vue.js. This application provides basic polyline drawing and dimensioning functionality with a clean, intuitive interface.

## Features

### Drawing Tools
- **Select Tool**: Navigate and interact with the canvas
- **Polyline Tool**: Draw connected line segments by clicking points
- **Dimension Tool**: Measure distances between two points with automatic dimension lines

### Drawing Features
- **Real-time Drawing**: See your lines appear as you draw
- **Multiple Colors**: Choose from 8 predefined colors
- **Adjustable Line Width**: Line thickness from 1px to 10px
- **Point Visualization**: Visual markers at each polyline vertex

### Dimensioning Features
- **Automatic Distance Calculation**: Real-time distance measurement in pixels
- **Professional Arrowheads**: Clean arrowhead indicators at dimension endpoints
- **Centered Text**: Dimension text automatically positioned at line midpoint

### Canvas Management
- **Undo/Redo**: Full history support with undo and redo functionality
- **Clear Canvas**: Reset the entire drawing area
- **State Persistence**: Drawing history maintained during session

### User Interface
- **Modern Toolbar**: Clean, organized tool selection and settings
- **Status Bar**: Real-time information about current tool and mouse position
- **Color Picker**: Easy color selection with visual preview
- **Responsive Design**: Works on different screen sizes

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cad-drawing-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:9000`

### Building for Production

```bash
npm run build
```

## Usage

### Drawing Polylines
1. Select the "Polyline" tool from the toolbar
2. Click on the canvas to place points
3. Each click adds a new point connected to the previous one
4. The polyline is drawn in real-time as you add points

### Adding Dimensions
1. Select the "Dimension" tool from the toolbar
2. Click to set the first point of the dimension
3. Click again to set the second point
4. The dimension line with distance measurement will appear automatically

### Customizing Appearance
- Use the line width slider to adjust stroke thickness
- Click the color button to open the color picker
- Select from 8 predefined colors

### Managing Your Drawing
- Use the "Undo" button to step back through your drawing history
- Use the "Redo" button to restore undone actions
- Use the "Clear" button to reset the entire canvas

## Technical Architecture

### Project Structure
```
src/
├── components/
│   └── CADCanvas.vue          # Main drawing canvas component
├── stores/
│   └── cad-store.js           # Pinia store for state management
├── utils/
│   └── drawing-utils.js       # Reusable drawing utility functions
├── pages/
│   └── IndexPage.vue          # Main page component
└── ...
```

### Key Technologies
- **Quasar Framework**: Vue.js framework for building responsive web apps
- **Pinia**: State management for Vue applications
- **HTML5 Canvas**: 2D drawing API for graphics rendering
- **Vue 3 Composition API**: Modern Vue.js development approach

### Design Principles
- **DRY (Don't Repeat Yourself)**: Utility functions and store patterns eliminate code duplication
- **Separation of Concerns**: Drawing logic, state management, and UI components are clearly separated
- **Reusability**: Drawing utilities can be easily extended for new features
- **Maintainability**: Clean, well-documented code structure

## Future Enhancements

Potential features for future development:
- **Shape Tools**: Rectangle, circle, and polygon drawing
- **Text Annotation**: Add text labels to drawings
- **Layer Management**: Organize drawing elements in layers
- **Export Options**: Save drawings as PNG, SVG, or DXF
- **Grid System**: Snap-to-grid functionality
- **Measurement Units**: Support for different units (mm, cm, inches)
- **Zoom and Pan**: Navigate large drawings
- **Selection and Editing**: Modify existing drawing elements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Quasar Framework](https://quasar.dev/)
- Icons provided by [Material Design Icons](https://materialdesignicons.com/)
- Drawing utilities inspired by professional CAD applications
