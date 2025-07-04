/**
 * ThreeJSRenderer - Handles all Three.js rendering concerns
 * Separates 3D rendering logic from mathematical calculations
 */
var ThreeJSRenderer = {
    // Three.js objects
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    
    // Configuration
    rendererOptions: {
        alpha: true,
        precision: "mediump",
        antialias: false,
        preserveDrawingBuffer: true
    },
    
    /**
     * Initialize the Three.js renderer system
     */
    init: function(canvas, options) {
        this.rendererOptions = Object.assign({}, this.rendererOptions, options);
        this.initRenderer(canvas);
        this.initScene();
        if (!this.camera) this.initCamera(options);
        if (!this.controls) this.initControls();
    },
    
    /**
     * Initialize the WebGL renderer
     */
    initRenderer: function(canvas) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: this.rendererOptions.alpha,
            precision: this.rendererOptions.precision,
            antialias: this.rendererOptions.antialias,
            preserveDrawingBuffer: this.rendererOptions.preserveDrawingBuffer
        });
        this.renderer.setClearColor(0x000001, 0);
        this.renderer.setSize(canvas.width, canvas.height);
    },
    
    /**
     * Initialize the scene
     */
    initScene: function() {
        this.scene = new THREE.Scene();
    },
    
    /**
     * Initialize the camera with proper aspect ratio
     */
    initCamera: function(options) {
        // Use canvas pixel aspect ratio for correct proportions
        const canvas = this.renderer ? this.renderer.domElement : (options && options.canvas);
        const aspect = canvas ? (canvas.width / canvas.height) : 1;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.z = 5;
    },
    
    /**
     * Initialize trackball controls
     */
    initControls: function() {
        this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    },
    
    /**
     * Render the scene
     */
    render: function() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    },
    
    /**
     * Update controls (call in animation loop)
     */
    update: function() {
        if (this.controls) {
            this.controls.update();
        }
    },
    
    /**
     * Clear all objects from the scene
     */
    clearScene: function() {
        if (this.scene) {
            while(this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
        }
    },
    
    /**
     * Add a particle system to the scene
     */
    addParticleSystem: function(geometry, material) {
        if (!this.scene) return null;
        
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        return points;
    },
    
    /**
     * Add a line to the scene
     */
    addLine: function(geometry, material) {
        if (!this.scene) return null;
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        return line;
    },
    
    /**
     * Remove an object from the scene
     */
    removeObject: function(object) {
        if (this.scene && object) {
            this.scene.remove(object);
        }
    },
    
    /**
     * Create a particle material with given color and size
     */
    createParticleMaterial: function(color, size, opacity) {
        return new THREE.PointsMaterial({
            color: new THREE.Color(color.R / 255, color.G / 255, color.B / 255),
            size: size || 0,
            transparent: false,
            opacity: opacity || color.A / 255
        });
    },
    
    /**
     * Create a line material
     */
    createLineMaterial: function(color, linewidth) {
        return new THREE.LineBasicMaterial({
            color: new THREE.Color(color.R / 255, color.G / 255, color.B / 255),
            linewidth: linewidth || 1
        });
    },
    
    /**
     * Update camera aspect ratio when viewport changes
     */
    updateCameraAspect: function(startX, endX, startY, endY) {
        if (this.camera && this.renderer) {
            const canvas = this.renderer.domElement;
            const aspect = canvas.width / canvas.height;
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
        }
    },
    
    /**
     * Dispose of resources
     */
    dispose: function() {
        if (this.controls) {
            this.controls.dispose();
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.renderer = null;
    }
}; 