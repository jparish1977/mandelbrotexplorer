// http://jsfiddle.net/L0rdzbej/276/

function changeColor( line, options ) {

  var colors = line.geometry.attributes.color.array;
  var segments = line.geometry.attributes.color.count * 3;
  var frequency = 1 /  ( options.steps * segments );
  var color = new THREE.Color();

  for ( var i = 0, l = segments; i < l; i ++ ) {
    color.set ( makeColorGradient( i, frequency, options.phase ) );

    colors[ i * 3 ] = color.r;
    colors[ i * 3 + 1 ] = color.g;
    colors[ i * 3 + 2 ] = color.b;

  }
  
  // update
	line.geometry.attributes[ "color" ].needsUpdate = true;
  
}

// create colored line

function longToByteArray(/*long*/long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

function getColoredBufferLine_jap ( palette, steps, geometry ){
  var vertices = geometry.vertices;
  var segments = geometry.vertices.length;

  // geometry
  var geometry = new THREE.BufferGeometry();

  // material
  var lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

  
  /*
			//var colorIndex = segments;
			//while( colorIndex >= palette.length  ) {
			//	colorIndex -= palette.length;
			//}
			//var color = palette[ colorIndex ];

			//var pMaterial = new THREE.LineBasicMaterial({
			//	color: new THREE.Color( color.R / 255, color.G / 255, color.B / 255 ),
			//	linewidth: 0,
			//	transparent: false,
			//	opacity: color.A/255
			//});
  */
  
  // attributes
  var positions = new Float32Array( segments * 3 ); // 3 vertices per point
  var colors = new Float32Array( segments * 3 );

  var frequency = 1 /  ( steps * segments );
  var color = new THREE.Color();
  /*
  var colorIndex = steps;
  while( colorIndex >= palette.length  ) {
	colorIndex -= palette.length;
  }
	//var color = palette[ colorIndex ];
  var color = new THREE.Color( color.R / 255, color.G / 255, color.B / 255 )
*/
  var x, y, z;

  for ( var i = 0, l = segments; i < l; i ++ ) {

    x = vertices[ i ].x;
    y = vertices[ i ].y;
    z = vertices[ i ].z;

    positions[ i * 3 ] = x;
    positions[ i * 3 + 1 ] = y;
    positions[ i * 3 + 2 ] = z;

	
    var colorIndex = i % 3;
    while( colorIndex >= palette.length  ) {
      colorIndex -= palette.length;
    }

/*****
  var center = 128;
  var width = 127;
	
  var redFrequency, grnFrequency, bluFrequency;
 	grnFrequency = bluFrequency = redFrequency = frequency;
  
  var phase2 = phase + 2;
  var phase3 = phase + 4;

  var red   = Math.sin( redFrequency * i + phase ) * width + center;
  var green = Math.sin( grnFrequency * i + phase2 ) * width + center;
  var blue  = Math.sin( bluFrequency * i + phase3 ) * width + center;

  return parseInt( '0x' + _byte2Hex( red ) + _byte2Hex( green ) + _byte2Hex( blue ) );
*/

//	color.set ( makeColorGradient( i, frequency, phase ) );	
	colorHex = '0x' + _byte2Hex( palette[colorIndex].R ) + _byte2Hex( palette[colorIndex].G ) + _byte2Hex( palette[colorIndex].B );

    color.set ( parseInt(colorHex) );

    colors[ i * 3 ] = color.r;
    colors[ i * 3 + 1 ] = color.g;
    colors[ i * 3 + 2 ] = color.b;

	}
//console.log(colorHex)
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  // line
  var line = new THREE.Line( geometry, lineMaterial );

  return line;
}

function getColoredBufferLine_3 ( geometry, palette ){
  var vertices = geometry.vertices;
  var segments = geometry.vertices.length;

  // geometry
  var geometry = new THREE.BufferGeometry();

  // material
  var lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

  // attributes
  var positions = new Float32Array( segments * 3 ); // 3 vertices per point
  var colors = new Float32Array( segments * 3 );

  //var frequency = 1 /  ( steps * segments );
  //var color = new THREE.Color();

  var x, y, z;

  for ( var i = 0, l = segments; i < l; i ++ ) {

    x = vertices[ i ].x;
    y = vertices[ i ].y;
    z = vertices[ i ].z;

    positions[ i * 3 ] = x;
    positions[ i * 3 + 1 ] = y;
    positions[ i * 3 + 2 ] = z;

//    color.set ( makeColorGradient_2( Math.Floor(i/3), palette ) );
//console.log(makeColorGradient( i, frequency, phase ));

	colorIndex = ( Math.floor(i/3) % palette.length );

    colors[ i * 3 ] = palette[colorIndex].R/255;//color.r;
    colors[ i * 3 + 1 ] = palette[colorIndex].G/255;
    colors[ i * 3 + 2 ] = palette[colorIndex].B/255;

	}

  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  // line
  var line = new THREE.Line( geometry, lineMaterial );

  return line;
}

function getColoredBufferLine_2 ( steps, phase, geometry, baseColorRGB ) {

  var vertices = geometry.vertices;
  var segments = geometry.vertices.length;

  // geometry
  var geometry = new THREE.BufferGeometry();

  // material
  var lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

  // attributes
  var positions = new Float32Array( segments * 3 ); // 3 vertices per point
  var colors = new Float32Array( segments * 3 );

  var frequency = 1 /  ( steps * segments );
  var color = new THREE.Color();

  var x, y, z;

  for ( var i = 0, l = segments; i < l; i ++ ) {

    x = vertices[ i ].x;
    y = vertices[ i ].y;
    z = vertices[ i ].z;

    positions[ i * 3 ] = x;
    positions[ i * 3 + 1 ] = y;
    positions[ i * 3 + 2 ] = z;

    color.set ( makeColorGradient_2( i, frequency, phase, baseColorRGB ) );
//console.log(makeColorGradient( i, frequency, phase ));
    colors[ i * 3 ] = color.r;
    colors[ i * 3 + 1 ] = color.g;
    colors[ i * 3 + 2 ] = color.b;

	}

  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  // line
  var line = new THREE.Line( geometry, lineMaterial );

  return line;

}
// using buffer geometry
function getColoredBufferLine ( steps, phase, geometry ) {

  var vertices = geometry.vertices;
  var segments = geometry.vertices.length;

  // geometry
  var geometry = new THREE.BufferGeometry();

  // material
  var lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

  // attributes
  var positions = new Float32Array( segments * 3 ); // 3 vertices per point
  var colors = new Float32Array( segments * 3 );

  var frequency = 1 /  ( steps * segments );
  var color = new THREE.Color();

  var x, y, z;

  for ( var i = 0, l = segments; i < l; i ++ ) {

    x = vertices[ i ].x;
    y = vertices[ i ].y;
    z = vertices[ i ].z;

    positions[ i * 3 ] = x;
    positions[ i * 3 + 1 ] = y;
    positions[ i * 3 + 2 ] = z;

    color.set ( makeColorGradient( i, frequency, phase ) );

    colors[ i * 3 ] = color.r;
    colors[ i * 3 + 1 ] = color.g;
    colors[ i * 3 + 2 ] = color.b;

	}

  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  // line
  var line = new THREE.Line( geometry, lineMaterial );

  return line;

}

/* COLORS */			 
function makeColorGradient_2 ( i, frequency, phase, baseColorRGB ) {  

  var center = 128;
  var width = 127;
  
  //baseColorRGB.R;//0-255
  //baseColorRGB.G;
  //baseColorRGB.B;
	
  var redFrequency, grnFrequency, bluFrequency;
 	grnFrequency = bluFrequency = redFrequency = frequency;
  
  var phase2 = phase + 2;
  var phase3 = phase + 4;

  var red   = Math.sin( redFrequency * i + phase ) * width + center;
  var green = Math.sin( grnFrequency * i + phase2 ) * width + center;
  var blue  = Math.sin( bluFrequency * i + phase3 ) * width + center;

  red = 255-((red + baseColorRGB.R)%255);
  green = 255-((green + baseColorRGB.G)%255);
  blue = 255-((blue + baseColorRGB.B)%255);

  return parseInt( '0x' + _byte2Hex( red ) + _byte2Hex( green ) + _byte2Hex( blue ) );
}

function makeColorGradient ( i, frequency, phase ) {  

  var center = 128;
  var width = 127;
	
  var redFrequency, grnFrequency, bluFrequency;
 	grnFrequency = bluFrequency = redFrequency = frequency;
  
  var phase2 = phase + 2;
  var phase3 = phase + 4;

  var red   = Math.sin( redFrequency * i + phase ) * width + center;
  var green = Math.sin( grnFrequency * i + phase2 ) * width + center;
  var blue  = Math.sin( bluFrequency * i + phase3 ) * width + center;

  return parseInt( '0x' + _byte2Hex( red ) + _byte2Hex( green ) + _byte2Hex( blue ) );
}

function _byte2Hex (n) {
  var nybHexString = "0123456789ABCDEF";
  return String( nybHexString.substr( ( n >> 4 ) & 0x0F, 1 ) ) + nybHexString.substr( n & 0x0F, 1 );
}