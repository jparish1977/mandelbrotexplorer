// Mandelbrot Explorer Presets
// This file contains all preset configurations for the Mandelbrot Explorer

var mandelbrotExplorerPresets = {
	"cloudLengthFilter": {
		"iteration8": {
			func: function(pathIndex, iteration, escapePath){
				return escapePath.length == 8;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "escapePath.length == 8";
			}
		},
		"iterationDecimation": {
			func: function(pathIndex, iteration, escapePath){
				return escapePath.length % 10 == 0;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "escapePath.length % 10 == 0";
			}
		},
		"maxIterations": {
			func: function(pathIndex, iteration, escapePath){
				return escapePath.length == mandelbrotExplorer.maxIterations_3d || escapePath.shortened;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "escapePath.length == mandelbrotExplorer.maxIterations_3d || escapePath.shortened";
			}
		},
		"theMeat": {
			func: function(pathIndex, iteration, escapePath){
				return escapePath.length > parseInt( mandelbrotExplorer.maxIterations_3d * .1 )
					&& escapePath.length < parseInt( mandelbrotExplorer.maxIterations_3d * .9 )
					&& escapePath.length > 5;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "escapePath.length > parseInt( mandelbrotExplorer.maxIterations_3d * .1 )"
					+ "&& escapePath.length < parseInt( mandelbrotExplorer.maxIterations_3d * .9 )"
					+ "&& escapePath.length  > 5";
			}
		}
	},
	"cloudIterationFilter": {
		"default": {
			func: function(pathIndex, iteration, escapePath){
				return iteration > 8;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration > 8";
			}
		},
		"maxIterations": {
			func: function(pathIndex, iteration, escapePath){
				return iteration == mandelbrotExplorer.maxIterations_3d;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration == mandelbrotExplorer.maxIterations_3d";
			}
		},
		"lessThan9": {
			func: function(pathIndex, iteration, escapePath){
				return iteration < 9;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration < 9";
			}
		},
		"evenIterations": {
			func: function(pathIndex, iteration, escapePath){
				return iteration % 2 == 0;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration % 2 == 0";
			}
		},
		"oddIterations": {
			func: function(pathIndex, iteration, escapePath){
				return iteration % 2 == 1;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration % 2 == 1";
			}
		},
		"firstHalf": {
			func: function(pathIndex, iteration, escapePath){
				return iteration <= mandelbrotExplorer.maxIterations_3d / 2;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration <= mandelbrotExplorer.maxIterations_3d / 2";
			}
		},
		"secondHalf": {
			func: function(pathIndex, iteration, escapePath){
				return iteration > mandelbrotExplorer.maxIterations_3d / 2;
			},
			getCodeString: function(pathIndex, iteration, escapePath){
				return "iteration > mandelbrotExplorer.maxIterations_3d / 2";
			}
		}
	},
	"particleSize": {
		"default": {
			func: function(index, iterationParticles){
				return mandelbrotExplorer.xScale_3d/mandelbrotExplorer.maxIterations_3d;
			},
			getCodeString: function(index, iterationParticles){
				return "mandelbrotExplorer.xScale_3d/mandelbrotExplorer.maxIterations_3d";
			}
		},
		"zero": {
			func: function(index, iterationParticles){
				return 0;
			},
			getCodeString: function(index, iterationParticles){
				return "0";
			}
		},
		"indexBased": {
			func: function(index, iterationParticles){
				return index/mandelbrotExplorer.iterationParticles.length;
			},
			getCodeString: function(index, iterationParticles){
				return "index/mandelbrotExplorer.iterationParticles.length";
			}
		},
		"constant": {
			func: function(index, iterationParticles){
				return 0.1;
			},
			getCodeString: function(index, iterationParticles){
				return "0.1";
			}
		},
		"scaleBased": {
			func: function(index, iterationParticles){
				return mandelbrotExplorer.xScale_3d;
			},
			getCodeString: function(index, iterationParticles){
				return "mandelbrotExplorer.xScale_3d";
			}
		}
	},
	"dualZMultiplier": {
		"default": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				return [escapePath[pathIndex][0], escapePath[pathIndex][1], z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "newX = escapePath[pathIndex][0];\nnewY = escapePath[pathIndex][1];\nnewZ = z * -1;";
			}
		},
		"addPrevious": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				if(pathIndex > 0) {
					return [newX + escapePath[pathIndex-1][0], newY + escapePath[pathIndex-1][1], z * -1];
				}
				return [newX, newY, z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "if(pathIndex > 0) {\n  newX += escapePath[pathIndex-1][0];\n  newY += escapePath[pathIndex-1][1];\n}\nnewZ = z * -1;";
			}
		},
		"subtractPrevious": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				var prevIndex = pathIndex > 1 ? pathIndex - 1 : 0;
				return [newX + escapePath[prevIndex][0] * -1, newY + escapePath[prevIndex][1] * -1, z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "var prevIndex = pathIndex > 1 ? pathIndex - 1 : 0;\nnewX += escapePath[prevIndex][0] * -1;\nnewY += escapePath[prevIndex][1] * -1;\nnewZ = z * -1;";
			}
		},
		"mirrorX": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				return [newX * -1, newY, z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "newX = newX * -1;\nnewY = newY;\nnewZ = z * -1;";
			}
		},
		"mirrorY": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				return [newX, newY * -1, z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "newX = newX;\nnewY = newY * -1;\nnewZ = z * -1;";
			}
		},
		"mirrorBoth": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				return [newX * -1, newY * -1, z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "newX = newX * -1;\nnewY = newY * -1;\nnewZ = z * -1;";
			}
		},
		"flower": {
			func: function(pathIndex, iteration, escapePath, newX, newY, z){
				if(pathIndex > 0) {
					newX = newX - escapePath[0][0];
					newY = newY - escapePath[0][1];
				}
				return [newX, newY, z * -1];
			},
			getCodeString: function(pathIndex, iteration, escapePath, newX, newY, z){
				return "if(pathIndex > 0) {\n  newX = newX - escapePath[0][0];\n  newY = newY - escapePath[0][1];\n}\nnewZ = z * -1;";
			}
		}
	},
	"particleFilter": {
		"xRange": {
			func: function(newX, newY, particleVector){
				return (newX > 0.24 && newX < 0.26);
			},
			getCodeString: function(newX, newY, particleVector){
				return "(newX > 0.24 && newX < 0.26)";
			}
		},
		"xOrYRange": {
			func: function(newX, newY, particleVector){
				return (newX > 0.24 && newX < 0.26) || (newY > 0.24 && newY < 0.26);
			},
			getCodeString: function(newX, newY, particleVector){
				return "(newX > 0.24 && newX < 0.26) || (newY > 0.24 && newY < 0.26)";
			}
		},
		"distanceFromOrigin": {
			func: function(newX, newY, particleVector){
				return (mandelbrotExplorer.getAbsoluteValueOfComplexNumber([newX, newY]) > 0.24 && mandelbrotExplorer.getAbsoluteValueOfComplexNumber([newX, newY]) < 0.26);
			},
			getCodeString: function(newX, newY, particleVector){
				return "(mandelbrotExplorer.getAbsoluteValueOfComplexNumber([newX, newY]) > 0.24 && mandelbrotExplorer.getAbsoluteValueOfComplexNumber([newX, newY]) < 0.26)";
			}
		},
		"positiveX": {
			func: function(newX, newY, particleVector){
				return newX > 0;
			},
			getCodeString: function(newX, newY, particleVector){
				return "newX > 0";
			}
		},
		"positiveY": {
			func: function(newX, newY, particleVector){
				return newY > 0;
			},
			getCodeString: function(newX, newY, particleVector){
				return "newY > 0";
			}
		},
		"withinUnitCircle": {
			func: function(newX, newY, particleVector){
				return mandelbrotExplorer.getAbsoluteValueOfComplexNumber([newX, newY]) < 1;
			},
			getCodeString: function(newX, newY, particleVector){
				return "mandelbrotExplorer.getAbsoluteValueOfComplexNumber([newX, newY]) < 1";
			}
		}
	},
	"juliaC": {
		"mandelbrot":	"[0,0]",
		"strange1":		"[(c[0]*-1)+c[1],0]",
		"strange2":		"[(c[0]*-1)-c[1],(c[1]*-1)-c[0]]",
		"julia01":		"[-1.037,0.17]",
		"julia02":		"[-0.52,0.57]",
		"julia03":		"[0.295,0.55]",
		"julia04":		"[-0.624,0.435]",
		"julia05":		"[.285,0]",
		"julia06":		"[.285,0.01]",
		"julia07":		"[0.45,0.1428]",
		"julia08":		"[-0.70176,-0.3842]",
		"julia09":		"[-0.835,-0.2321]",
		"julia10":		"[-0.8,0.156]",
		"julia11":		"[-.62772,.42193]",
		"julia12":		"[-.74434,-.10772]",
		"julia13":		"[.233,.53780]",
		"julia14":		"[.03515,-.07467]",
		"julia15":		"[-.67319,.34442]",
		"julia16":		"[-.74543,.11301]",
		
		"julia17":		"[0.37,0.16]",
		"julia18":		"[−0.50,−0.56]",
		"julia19":		"[−0.25,0]",
		"julia20":		"[0,1]",
		"julia21":		"[−1.5,0]",
		"julia22":		"[−0.75,0.25]",
		"julia23":		"[−0.8,0.15]",
		"julia24":		"[−1,0]",
		"julia25":		"[-0.79,0.14]",
		"julia26":		"[0.35,0.11]",
		"julia27":		"[-0.25,0.64]",
		"julia28":		"[0,-0.66]",
		"julia29":		"[-0.039,0.695]",
		"julia30":		"[-0.1,0.651]",
		"julia31":		"[-0.74543,0.11301]"
	},
	"mandelbrot": {
		"escapingZ": {
			"currentZLessPreviousZ_percentOfMax3D": {
				func: function(escapePath, pathIndex){
					return ((pathIndex + 1)/mandelbrotExplorer.maxIterations_3d)*(mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]));
				},
				getCodeString: function(escapePath, pathIndex){
					return "return ((pathIndex + 1)/mandelbrotExplorer.maxIterations_3d)*(mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]));";
				}
			},
			"currentZLessPreviousZ": {
				func: function(escapePath, pathIndex){
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);";
				}
			},
			"alternatingPathOrigin": {
				func: function(escapePath, pathIndex){
					return (pathIndex % 2 == 0 ? 1 : -1) * mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "return (pathIndex % 2 == 0 ? 1 : -1) * mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);";
				}
			},
			pathOriginAndSkewedByPrevious: {
				func: function(escapePath, pathIndex){
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber((escapePath.length == 1 ? escapePath[0] : [escapePath[pathIndex][0] + escapePath[pathIndex-1][0],escapePath[pathIndex][1] + escapePath[pathIndex-1][1]]));
				},
				getCodeString: function(escapePath, pathIndex){
					return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber((escapePath.length == 1 ? escapePath[0] : [escapePath[pathIndex][0] + escapePath[pathIndex-1][0],escapePath[pathIndex][1] + escapePath[pathIndex-1][1]]));";
				}
			},
			previousPathZ: {
				func: function(escapePath, pathIndex){
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex - 1]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex - 1]);";
				}
			},
			pathEnd: {
				func: function(escapePath, pathIndex){
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);";
				}
			},
			pathOrigin: {
				func: function(escapePath, pathIndex){
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);";
				}
			},
			currentPathZ: {
				func: function(escapePath, pathIndex){
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
				},
				getCodeString: function(){
					return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);";
				}
			},
			"valleyOfElephantsInsideOut": {
				func: function(escapePath, pathIndex){
					if(pathIndex > 0) {
						var currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
						var previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
						var useZ = currentZ - previousZ;
						var useX = escapePath[pathIndex-1][0] + ((escapePath[pathIndex][0]/currentZ) * currentZ);
						var useY = escapePath[pathIndex-1][1] + ((escapePath[pathIndex][1]/currentZ) * currentZ);
						escapePath[pathIndex][0] = useX;
						escapePath[pathIndex][1] = useY;
						return useZ;
					}
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "if(pathIndex > 0) {\n  currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);\n  previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);\n  useZ = currentZ - previousZ;\n  useX = escapePath[pathIndex-1][0] + ((escapePath[pathIndex][0]/currentZ) * currentZ);\n  useY = escapePath[pathIndex-1][1] + ((escapePath[pathIndex][1]/currentZ) * currentZ);\n  escapePath[pathIndex][0] = useX;\n  escapePath[pathIndex][1] = useY;\n  return useZ;\n}\nreturn mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);";
				}
			},
			"valleyOfElephantsInverted": {
				func: function(escapePath, pathIndex){
					if(pathIndex > 0) {
						var currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
						var previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
						var useZ = previousZ - currentZ;
						var useX = escapePath[pathIndex-1][0] + ((escapePath[pathIndex][0]/currentZ) * currentZ);
						var useY = escapePath[pathIndex-1][1] + ((escapePath[pathIndex][1]/currentZ) * currentZ);
						escapePath[pathIndex][0] = useX;
						escapePath[pathIndex][1] = useY;
						return useZ;
					}
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "if(pathIndex > 0) {\n  currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);\n  previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);\n  useZ = previousZ - currentZ;\n  useX = escapePath[pathIndex-1][0] + ((escapePath[pathIndex][0]/currentZ) * currentZ);\n  useY = escapePath[pathIndex-1][1] + ((escapePath[pathIndex][1]/currentZ) * currentZ);\n  escapePath[pathIndex][0] = useX;\n  escapePath[pathIndex][1] = useY;\n  return useZ;\n}\nreturn mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);";
				}
			},
			"stuffedInTheCorner": {
				func: function(escapePath, pathIndex){
					if(pathIndex > 0) {
						var currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
						var previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
						var useX = escapePath[pathIndex][0] + (escapePath[pathIndex][0] * (escapePath[pathIndex][0]/Math.sqrt(currentZ)));
						var useY = escapePath[pathIndex][1] + (escapePath[pathIndex][1] * (escapePath[pathIndex][1]/Math.sqrt(currentZ)));
						var useZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber([useX, useY]) - previousZ;
						escapePath[pathIndex][0] = useX;
						escapePath[pathIndex][1] = useY;
						return useZ;
					}
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
				},
				getCodeString: function(escapePath, pathIndex){
					return "if(pathIndex > 0) {\n  currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);\n  previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);\n  useX = escapePath[pathIndex][0] + (escapePath[pathIndex][0] * (escapePath[pathIndex][0]/Math.sqrt(currentZ)));\n  useY = escapePath[pathIndex][1] + (escapePath[pathIndex][1] * (escapePath[pathIndex][1]/Math.sqrt(currentZ)));\n  useZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber([useX, useY]) - previousZ;\n  escapePath[pathIndex][0] = useX;\n  escapePath[pathIndex][1] = useY;\n  return useZ;\n}\nreturn mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);";
				}
			},

		},
	},
	"initialZ": {
		"default": {
			func: function(escapePath){
				return 0;
			},
			getCodeString: function(escapePath){
				return "return 0;";
			}
		},
		"pathOrigin": {
			func: function(escapePath){
				return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);
			},
			getCodeString: function(escapePath){
				return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);";
			}
		},
		"pathEnd": {
			func: function(escapePath){
				return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);
			},
			getCodeString: function(escapePath){
				return "return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);";
			}
		},
		"constant": {
			func: function(escapePath){
				return 0.5;
			},
			getCodeString: function(escapePath){
				return "return 0.5;";
			}
		},
		"pathLength": {
			func: function(escapePath){
				return escapePath.length;
			},
			getCodeString: function(escapePath){
				return "return escapePath.length;";
			}
		},
		"averagePathValue": {
			func: function(escapePath){
				var sum = 0;
				for(var i = 0; i < escapePath.length; i++) {
					sum += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[i]);
				}
				return sum / escapePath.length;
			},
			getCodeString: function(escapePath){
				return "var sum = 0;\nfor(var i = 0; i < escapePath.length; i++) {\n  sum += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[i]);\n}\nreturn sum / escapePath.length;";
			}
		}
	}
}; 