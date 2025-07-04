// Settings Manager Class for Mandelbrot Explorer
var SettingsManager = {
	storageKey: 'mandelbrotExplorer_settings',
	
	saveSettings: function(explorer) {
		try {
			var settings = {
				startX: explorer.startX,
				startY: explorer.startY,
				endX: explorer.endX,
				endY: explorer.endY,
				maxIterations_2d: explorer.maxIterations_2d,
				maxIterations_3d: explorer.maxIterations_3d,
				cloudResolution: explorer.cloudResolution,
				randomizeCloudStepping: explorer.randomizeCloudStepping,
				dualZ: explorer.dualZ,
				dualZMultiplier: explorer.dualZMultiplier,
				particleSize: explorer.particleSize,
				particleFilter: explorer.particleFilter,
				cloudLengthFilter: explorer.cloudLengthFilter,
				cloudIterationFilter: explorer.cloudIterationFilter,
				juliaC: explorer.juliaC,
				initialZ: explorer.initialZ,
				escapingZ: explorer.escapingZ,
				iterationCycleTime: explorer.iterationCycleTime,
				iterationCycleFrame: explorer.iterationCycleFrame,
				targetFrameRate: explorer.targetFrameRate,
				onlyShortened: explorer.onlyShortened,
				onlyFull: explorer.onlyFull,
				selectedPalette: explorer.palette ? explorer.palette.name || 'palette2' : 'palette2',
				// Camera and controls state
				cameraState: this.getCameraState(explorer),
				controlsState: this.getControlsState(explorer)
			};
			
			localStorage.setItem(this.storageKey, JSON.stringify(settings));
			console.log('Settings saved to localStorage');
		} catch (e) {
			console.error('Failed to save settings:', e);
		}
	},
	
	loadSettings: function(explorer) {
		try {
			var savedSettings = localStorage.getItem(this.storageKey);
			if (savedSettings) {
				var settings = JSON.parse(savedSettings);
				
				// Apply saved settings
				for (var key in settings) {
					if (explorer.hasOwnProperty(key) && settings[key] !== null && settings[key] !== undefined) {
						explorer[key] = settings[key];
					}
				}
				
				// Handle palette separately since it's an object
				if (settings.selectedPalette && palettes[settings.selectedPalette]) {
					explorer.palette = palettes[settings.selectedPalette];
				}
				
				// Restore camera and controls state
				if (settings.cameraState) {
					this.restoreCameraState(explorer, settings.cameraState);
				}
				if (settings.controlsState) {
					this.restoreControlsState(explorer, settings.controlsState);
				}
				
				console.log('Settings loaded from localStorage');
				return true;
			}
		} catch (e) {
			console.error('Failed to load settings:', e);
		}
		return false;
	},
	
	clearSettings: function() {
		try {
			localStorage.removeItem(this.storageKey);
			console.log('Settings cleared from localStorage');
		} catch (e) {
			console.error('Failed to clear settings:', e);
		}
	},
	
	// Get current camera state
	getCameraState: function(explorer) {
		if (explorer.threeRenderer && explorer.threeRenderer.camera) {
			var camera = explorer.threeRenderer.camera;
			return {
				position: {
					x: camera.position.x,
					y: camera.position.y,
					z: camera.position.z
				},
				rotation: {
					x: camera.rotation.x,
					y: camera.rotation.y,
					z: camera.rotation.z
				},
				fov: camera.fov,
				aspect: camera.aspect,
				near: camera.near,
				far: camera.far
			};
		}
		return null;
	},
	
	// Get current controls state
	getControlsState: function(explorer) {
		if (explorer.threeRenderer && explorer.threeRenderer.controls) {
			var controls = explorer.threeRenderer.controls;
			return {
				object: {
					position: controls.object && controls.object.position ? {
						x: controls.object.position.x,
						y: controls.object.position.y,
						z: controls.object.position.z
					} : {x:0, y:0, z:0},
					rotation: controls.object && controls.object.rotation ? {
						x: controls.object.rotation.x,
						y: controls.object.rotation.y,
						z: controls.object.rotation.z
					} : {x:0, y:0, z:0}
				},
				target: controls.target ? {
					x: controls.target.x,
					y: controls.target.y,
					z: controls.target.z
				} : {x:0, y:0, z:0},
				// TrackballControls specific properties
				radius: typeof controls.radius !== 'undefined' ? controls.radius : 0,
				zoom: typeof controls.zoom !== 'undefined' ? controls.zoom : 1,
				pan: controls.pan ? {
					x: controls.pan.x,
					y: controls.pan.y
				} : { x: 0, y: 0 }
			};
		}
		return null;
	},
	
	// Restore camera state
	restoreCameraState: function(explorer, cameraState) {
		if (explorer.threeRenderer && explorer.threeRenderer.camera && cameraState) {
			var camera = explorer.threeRenderer.camera;
			
			// Restore position
			if (cameraState.position) {
				camera.position.set(cameraState.position.x, cameraState.position.y, cameraState.position.z);
			}
			
			// Restore rotation
			if (cameraState.rotation) {
				camera.rotation.set(cameraState.rotation.x, cameraState.rotation.y, cameraState.rotation.z);
			}
			
			// Restore camera properties
			if (cameraState.fov !== undefined) camera.fov = cameraState.fov;
			if (cameraState.aspect !== undefined) camera.aspect = cameraState.aspect;
			if (cameraState.near !== undefined) camera.near = cameraState.near;
			if (cameraState.far !== undefined) camera.far = cameraState.far;
			
			// Update projection matrix
			camera.updateProjectionMatrix();
		}
	},
	
	// Restore controls state
	restoreControlsState: function(explorer, controlsState) {
		// TODO: Theres some strangeness when restoring the camera and controls....
		if (explorer.threeRenderer && explorer.threeRenderer.controls && controlsState) {
			var controls = explorer.threeRenderer.controls;
			//// Restore camera position
			//if (controlsState.object && controlsState.object.position && controls.object && controls.object.position) {
			//	controls.object.position.set(
			//		controlsState.object.position.x,
			//		controlsState.object.position.y,
			//		controlsState.object.position.z
			//	);
			//}
			// Restore target
			if (controlsState.target && controls.target) {
				controls.target.set(
					controlsState.target.x,
					controlsState.target.y,
					controlsState.target.z
				);
			}
			// Update controls
			controls.update();
		}
	}
}; 