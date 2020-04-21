/** escapingZ to get the eye 1000cloud res  16iterations filter iteratios > 12
currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
useZ = currentZ - previousZ;
useZ;
*/
/** valley of the elephants turnd inside out....
currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
useZ = currentZ - previousZ;
useX = escapePath[pathIndex-1][0] + ((escapePath[pathIndex][0]/currentZ) * currentZ);
useY = escapePath[pathIndex-1][1] + ((escapePath[pathIndex][1]/currentZ) * currentZ);
escapePath[pathIndex][0] = useX;
escapePath[pathIndex][1] = useY;
useZ;


useZ = abs(z(n)) - abs(z(n-1);
useX = z(n-1)[x] + ((z(n)[x]/abs(z(n))) * abs(z(n)));
useY = z(n-1)[y] + ((z(n)[y]/abs(z(n))) * abs(z(n)));
z(n)[0] = useX;
z(n)[1] = useY;
useZ;
*/

/** stuffed in the corner
currentZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
previousZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);
useX = escapePath[pathIndex][0] + (escapePath[pathIndex][0] * (escapePath[pathIndex][0]/Math.sqrt(currentZ)));
useY = escapePath[pathIndex][1] + (escapePath[pathIndex][1] * (escapePath[pathIndex][1]/Math.sqrt(currentZ)));
useZ = mandelbrotExplorer.getAbsoluteValueOfComplexNumber([useX, useY]) - previousZ;
escapePath[pathIndex][0] = useX;
escapePath[pathIndex][1] = useY;
useZ;
*/

/*
// this is a neat flower.....
newX = pathIndex > 0 ? newX - escapePath[0][0] : 0;
newY = pathIndex > 0 ? newY - escapePath[0][1] : 0;
*/
/*
I need to add a way of mapping the particles displayed in the current scene 
back to their initial x,y.
*/


/*
Preturbation: somehting where each iteration is slowed by the previous iteratyions in the same frame
*/
var STR_PAD_LEFT = 1;
var STR_PAD_RIGHT = 2;
var STR_PAD_BOTH = 3;

var paletteColors = {
	"lightyellow1":			{"R": 255, "G": 255, "B": 204, "A": 255},
 	"lightyellow2":			{"R": 255, "G": 255, "B": 153, "A": 255},
 	"lightyellow3":			{"R": 255, "G": 255, "B": 102, "A": 255},
 	"lightyellow4":			{"R": 255, "G": 255, "B": 51, "A": 255},
 	"yellow":				{"R": 255, "G": 255, "B": 0, "A": 255},
 	"darkyellow1":			{"R": 204, "G": 204, "B": 0, "A": 255},
 	"darkyellow2":			{"R": 153, "G": 153, "B": 0, "A": 255},
 	"darkyellow3":			{"R": 102, "G": 102, "B": 0, "A": 255},
 	"darkyellow4":			{"R": 51, "G": 51, "B": 0, "A": 255},
 	"lawngreen":			{"R": 124, "G": 252, "B": 0, "A": 255},
 	"chartreuse":			{"R": 127, "G": 255, "B": 0, "A": 255},
 	"limegreen":			{"R": 50, "G": 205, "B": 50, "A": 255},
 	"lime":					{"R": 0, "G": 255, "B": 0, "A": 255},
 	"forestgreen":			{"R": 34, "G": 139, "B": 34, "A": 255},
 	"green": 				{"R": 0, "G": 128, "B": 0, "A": 255},
 	"darkgreen":			{"R": 0, "G": 100, "B": 0, "A": 255},
 	"springgreen": 			{"R": 0, "G": 255, "B": 127, "A": 255},
 	"greenyellow": 			{"R": 173, "G": 255, "B": 47, "A": 255},
 	"yellowgreen": 			{"R": 154, "G": 205, "B": 50, "A": 255},
 	"mediumspringgreen":	{"R": 0, "G": 250, "B": 154, "A": 255},
 	"lightgreen":			{"R": 144, "G": 238, "B": 144, "A": 255},
 	"palegreen":			{"R": 152, "G": 251, "B": 152, "A": 255},
 	"darkseagreen":			{"R": 143, "G": 188, "B": 143, "A": 255},
 	"mediumseagreen":		{"R": 60, "G": 179, "B": 113, "A": 255},
 	"lightseagreen":		{"R": 32, "G": 178, "B": 170, "A": 255},
 	"seagreen":				{"R": 46, "G": 139, "B": 87, "A": 255},
 	"olive":				{"R": 128, "G": 128, "B": 0, "A": 255},
 	"darkolivegreen":		{"R": 85, "G": 107, "B": 47, "A": 255},
 	"olivedrab":			{"R": 107, "G": 142, "B": 35, "A": 255},
 	"aliceblue":			{"R": 240, "G": 248, "B": 255, "A": 255},
 	"lavender":				{"R": 230, "G": 230, "B": 250, "A": 255},
 	"powderblue":			{"R": 176, "G": 224, "B": 230, "A": 255},
 	"lightblue":			{"R": 173, "G": 216, "B": 230, "A": 255},
 	"lightskyblue":			{"R": 135, "G": 206, "B": 250, "A": 255},
 	"skyblue":				{"R": 135, "G": 206, "B": 235, "A": 255},
 	"deepskyblue":			{"R": 0, "G": 191, "B": 255, "A": 255},
 	"lightsteelblue":		{"R": 176, "G": 196, "B": 222, "A": 255},
 	"dodgerblue":			{"R": 30, "G": 144, "B": 255, "A": 255},
 	"cornflowerblue":		{"R": 100, "G": 149, "B": 237, "A": 255},
 	"steelblue":			{"R": 70, "G": 130, "B": 180, "A": 255},
 	"cadetblue":			{"R": 95, "G": 158, "B": 160, "A": 255},
 	"mediumslateblue":		{"R": 123, "G": 104, "B": 238, "A": 255},
 	"slateblue":			{"R": 106, "G": 90, "B": 205, "A": 255},
 	"darkslateblue":		{"R": 72, "G": 61, "B": 139, "A": 255},
 	"royalblue":			{"R": 65, "G": 105, "B": 225, "A": 255},
 	"blue":					{"R": 0, "G": 0, "B": 255, "A": 255},
 	"mediumblue":			{"R": 0, "G": 0, "B": 205, "A": 255},
 	"darkblue":				{"R": 0, "G": 0, "B": 139, "A": 255},
 	"navy":					{"R": 0, "G": 0, "B": 128, "A": 255},
 	"midnightblue":			{"R": 25, "G": 25, "B": 112, "A": 255},
 	"blueviolet":			{"R": 138, "G": 43, "B": 226, "A": 255},
 	"indigo":				{"R": 75, "G": 0, "B": 130, "A": 255},
 	"lightsalmon":			{"R": 255, "G": 160, "B": 122, "A": 255},
 	"salmon":				{"R": 250, "G": 128, "B": 114, "A": 255},
 	"darksalmon":			{"R": 233, "G": 150, "B": 122, "A": 255},
 	"lightcoral":			{"R": 240, "G": 128, "B": 128, "A": 255},
 	"indianred":			{"R": 205, "G": 92, "B": 92, "A": 255},
 	"crimson":				{"R": 220, "G": 20, "B": 60, "A": 255},
 	"firebrick":			{"R": 178, "G": 34, "B": 34, "A": 255},
 	"red":					{"R": 255, "G": 0, "B": 0, "A": 255},
 	"darkred":				{"R": 139, "G": 0, "B": 0, "A": 255},
 	"maroon":				{"R": 128, "G": 0, "B": 0, "A": 255},
 	"tomato":				{"R": 255, "G": 99, "B": 71, "A": 255},
 	"orangered":			{"R": 255, "G": 69, "B": 0, "A": 255},
 	"palevioletred":		{"R": 219, "G": 112, "B": 147, "A": 255},
};
var palettes = {
	"palette1": [
		{"B": 15, "R": 10, "G":  5, "A":255},
		{"R": 15, "G": 10, "B":  5, "A":255},
		{"G": 15, "B": 10, "R":  5, "A":255},
		{"B": 30, "R": 20, "G": 10, "A":255},
		{"R": 30, "G": 20, "B": 10, "A":255},
		{"G": 30, "B": 20, "R": 10, "A":255},
		{"B": 45, "R": 30, "G": 15, "A":255},
		{"R": 45, "G": 30, "B": 15, "A":255},
		{"G": 45, "B": 30, "R": 15, "A":255},
		{"B": 60, "R": 40, "G": 20, "A":255},
		{"R": 60, "G": 40, "B": 20, "A":255},
		{"G": 60, "B": 40, "R": 20, "A":255},
		{"B": 75, "R": 50, "G": 25, "A":255},
		{"R": 75, "G": 50, "B": 25, "A":255},
		{"G": 75, "B": 50, "R": 25, "A":255},
		{"B": 90, "R": 60, "G": 30, "A":255},
		{"R": 90, "G": 60, "B": 30, "A":255},
		{"G": 90, "B": 60, "R": 30, "A":255},
		{"B":105, "R": 70, "G": 35, "A":255},
		{"R":105, "G": 70, "B": 35, "A":255},
		{"G":105, "B": 70, "R": 35, "A":255},
		{"B":120, "R": 80, "G": 40, "A":255},
		{"R":120, "G": 80, "B": 40, "A":255},
		{"G":120, "B": 80, "R": 40, "A":255},
		{"B":135, "R": 90, "G": 45, "A":255},
		{"R":135, "G": 90, "B": 45, "A":255},
		{"G":135, "B": 90, "R": 45, "A":255},
		{"B":150, "R":100, "G": 50, "A":255},
		{"R":150, "G":100, "B": 50, "A":255},
		{"G":150, "B":100, "R": 50, "A":255},
		{"B":165, "R":110, "G": 55, "A":255},
		{"R":165, "G":110, "B": 55, "A":255},
		{"G":165, "B":110, "R": 55, "A":255},
		{"B":170, "R":120, "G": 60, "A":255},
		{"R":170, "G":120, "B": 60, "A":255},
		{"G":170, "B":120, "R": 60, "A":255},
		{"B":185, "R":130, "G": 65, "A":255},
		{"R":185, "G":130, "B": 65, "A":255},
		{"G":185, "B":130, "R": 65, "A":255},
		{"B":200, "R":140, "G": 70, "A":255},
		{"R":200, "G":140, "B": 70, "A":255},
		{"G":200, "B":140, "R": 70, "A":255},
		{"B":215, "R":150, "G": 75, "A":255},
		{"R":215, "G":150, "B": 75, "A":255},
		{"G":215, "B":150, "R": 75, "A":255},
		{"B":230, "R":160, "G": 80, "A":255},
		{"R":230, "G":160, "B": 80, "A":255},
		{"G":230, "B":160, "R": 80, "A":255},
		{"B":245, "R":170, "G": 85, "A":255},
		{"R":245, "G":170, "B": 85, "A":255},
		{"G":245, "B":170, "R": 85, "A":255}
	],
	"palette2": [
		{"R":  30, "G":  25, "B":  20, "A":255},
		{"R":  60, "G":  50, "B":  40, "A":255},
		{"R":  90, "G":  75, "B":  60, "A":255},
		{"R": 120, "G": 100, "B":  80, "A":255},
		{"R": 150, "G": 125, "B": 100, "A":255},
		{"R": 180, "G": 150, "B": 120, "A":255},
		{"R": 210, "G": 175, "B": 140, "A":255},
		{"R": 240, "G": 200, "B": 160, "A":255},
		{"R":  15, "G": 225, "B": 180, "A":255},
		
		{"R":  45, "G": 250, "B": 200, "A":255},
		{"R":  75, "G":  20, "B": 220, "A":255},
		{"R": 105, "G":  45, "B": 240, "A":255},
		{"R": 135, "G":  60, "B":   5, "A":255},
		{"R": 165, "G":  85, "B":  25, "A":255},
		{"R": 195, "G": 110, "B":  45, "A":255},
		{"R": 225, "G": 135, "B":  65, "A":255},
		{"R": 255, "G": 160, "B":  85, "A":255},
		{"R":  30, "G": 185, "B": 105, "A":255},
		
		{"R":  60, "G": 210, "B": 125, "A":255},
		{"R":  90, "G": 235, "B": 145, "A":255},
		{"R": 120, "G":   5, "B": 165, "A":255},
		{"R": 150, "G":  30, "B": 185, "A":255},
		{"R": 180, "G":  55, "B": 205, "A":255},
		{"R": 210, "G":  80, "B": 225, "A":255},
		{"R": 240, "G": 105, "B": 245, "A":255},
		{"R":  15, "G": 130, "B":  10, "A":255},
		{"R":  45, "G": 155, "B":  30, "A":255}
		
	],
	"palette3": [
		{"R":  30, "G":  0, "B":  0, "A":255},
		{"R":  45, "G":  0, "B":  0, "A":255},
		{"R":  60, "G":  0, "B":  0, "A":255},
		{"R":  75, "G":  0, "B":  0, "A":255},
		{"R":  90, "G":  0, "B":  0, "A":255},
		{"R": 105, "G":  0, "B":  0, "A":255},
		{"R": 120, "G":  0, "B":  0, "A":255},
		{"R": 135, "G":  0, "B":  0, "A":255},
		{"R": 150, "G":  0, "B":  0, "A":255},
		{"R": 165, "G":  0, "B":  0, "A":255},
		{"R": 180, "G":  0, "B":  0, "A":255},
		{"R": 195, "G":  0, "B":  0, "A":255},
		{"R": 210, "G":  0, "B":  0, "A":255},
		{"R": 225, "G":  0, "B":  0, "A":255},
		{"R": 240, "G":  0, "B":  0, "A":255},
		{"R": 255, "G":  0, "B":  0, "A":255}
	],
	"palette4": [
		{"R":  30, "G":128, "B":  0, "A":255},
		{"R": 255, "G":255, "B":  0, "A":255},
		{"R":  45, "G":120, "B":  0, "A":255},
		{"R": 240, "G":240, "B":  0, "A":255},
		{"R":  60, "G":112, "B":  0, "A":255},
		{"R": 225, "G":225, "B":  0, "A":255},
		{"R":  75, "G":105, "B":  0, "A":255},
		{"R": 210, "G":210, "B":  0, "A":255},
		{"R":  90, "G": 97, "B":  0, "A":255},
		{"R": 195, "G":195, "B":  0, "A":255},
		{"R": 105, "G": 48, "B":  0, "A":255},
		{"R": 180, "G":180, "B":  0, "A":255},
		{"R": 120, "G": 24, "B":  0, "A":255},
		{"R": 165, "G":165, "B":  0, "A":255},
		{"R": 135, "G": 12, "B":  0, "A":255},
		{"R": 150, "G":150, "B":  0, "A":255},
		{"R": 150, "G":  6, "B":  0, "A":255},
		{"R": 135, "G":135, "B":  0, "A":255},
		{"R": 165, "G":  3, "B":  0, "A":255},
		{"R": 120, "G":120, "B":  0, "A":255},
		{"R": 180, "G":  2, "B":  0, "A":255},
		{"R": 105, "G":105, "B":  0, "A":255},
		{"R": 195, "G":  1, "B":  0, "A":255},
		{"R":  90, "G": 90, "B":  0, "A":255},
		{"R": 210, "G":  0, "B":  0, "A":255},
		{"R":  75, "G": 75, "B":  0, "A":255},
		{"R": 225, "G":  0, "B":  0, "A":255},
		{"R":  60, "G": 60, "B":  0, "A":255},
		{"R": 240, "G":  0, "B":  0, "A":255},
		{"R":  45, "G": 45, "B":  0, "A":255},
		{"R": 255, "G":  0, "B":  0, "A":255},
		{"R":   0, "G":  0, "B":128, "A":255}
	],
	"palette5": [
		{"R":  30, "G":  0, "B":  0, "A":255},
		{"R":  45, "G": 15, "B": 15, "A":255},
		{"R":  60, "G":  0, "B":  0, "A":255},
		{"R":  75, "G": 30, "B": 30, "A":255},
		{"R":  90, "G":  0, "B":  0, "A":255},
		{"R": 105, "G": 45, "B": 45, "A":255},
		{"R": 120, "G":  0, "B":  0, "A":255},
		{"R": 135, "G": 60, "B": 60, "A":255},
		{"R": 150, "G":  0, "B":  0, "A":255},
		{"R": 165, "G": 75, "B": 75, "A":255},
		{"R": 180, "G":  0, "B":  0, "A":255},
		{"R": 195, "G": 90, "B": 90, "A":255},
		{"R": 210, "G":  0, "B":  0, "A":255},
		{"R": 225, "G":105, "B":105, "A":255},
		{"R": 240, "G":  0, "B":  0, "A":255},
		{"R": 255, "G":120, "B":120, "A":255}
	],
	"Ginger": [
		{"R": 247, "G":255, "B":0, "A":255},
		{"R": 0, "G":255, "B":0, "A":255},
		{"R": 0, "G":0, "B":255, "A":255},
		{"R": 255, "G":0, "B":0, "A":255},
	],
	"palette6": [
		{"R": 0, "G":0, "B":0, "A":255},
		{"G": 0, "B":0, "R":205, "A":255},
		{"B": 0, "G":0, "R":210, "A":255},
		{"R": 0, "G":0, "B":215, "A":255},
		{"R": 0, "B":0, "G":220, "A":255},
		{"B": 0, "R":0, "G":10, "A":255},
		{"R": 0, "B":0, "G":15, "A":255},
		{"G": 0, "B":0, "R":20, "A":255},
		{"R": 0, "B":0, "G":145, "A":255},
		{"G": 0, "R":0, "B":150, "A":255},
		{"R": 0, "B":0, "G":155, "A":255},
		{"R": 0, "B":0, "G":160, "A":255},
		{"G": 0, "R":0, "B":165, "A":255},
		{"G": 0, "B":0, "R":170, "A":255},
		{"R": 0, "B":0, "G":175, "A":255},
		{"B": 0, "R":0, "G":25, "A":255},
		{"R": 0, "G":0, "B":30, "A":255},
		{"R": 0, "B":0, "G":35, "A":255},
		{"G": 0, "B":0, "R":40, "A":255},
		{"B": 0, "G":0, "R":55, "A":255},
		{"R": 0, "B":0, "G":50, "A":255},
		{"G": 0, "B":0, "R":55, "A":255},
		{"B": 0, "G":0, "R":60, "A":255},
		{"G": 0, "R":0, "B":65, "A":255},
		{"R": 0, "B":0, "G":70, "A":255},
		{"B": 0, "R":0, "G":75, "A":255},
		{"G": 0, "B":0, "R":5, "A":255},
		{"B": 0, "R":0, "G":250, "A":255},
		{"G": 0, "R":0, "B":255, "A":255},
		{"B": 0, "R":0, "G":130, "A":255},
		{"R": 0, "G":0, "B":135, "A":255},
		{"G": 0, "B":0, "R":140, "A":255},
		{"B": 0, "G":0, "R":90, "A":255},
		{"R": 0, "G":0, "B":95, "A":255},
		{"B": 0, "R":0, "G":100, "A":255},
		{"G": 0, "R":0, "B":105, "A":255},
		{"B": 0, "G":0, "R":110, "A":255},
		{"G": 0, "R":0, "B":115, "A":255},
		{"B": 0, "R":0, "G":120, "A":255},
		{"B": 0, "G":0, "R":125, "A":255},
		{"R": 0, "B":0, "G":200, "A":255},
		{"G": 0, "B":0, "R":80, "A":255},
		{"R": 0, "G":0, "B":85, "A":255},
		{"G": 0, "R":0, "B":240, "A":255},
		{"R": 0, "G":0, "B":245, "A":255},
		{"B": 0, "G":0, "R":225, "A":255},
		{"B": 0, "G":0, "R":230, "A":255},
		{"R": 0, "B":0, "G":235, "A":255},
		{"G": 0, "R":0, "B":180, "A":255},
		{"B": 0, "G":0, "R":185, "A":255},
		{"G": 0, "B":0, "R":190, "A":255},
		{"G": 0, "R":0, "B":195, "A":255},
		
		
	],
	"namedColorsish": [
		paletteColors.lightyellow1,
		paletteColors.lightyellow2,
		paletteColors.lightyellow3,
		paletteColors.lightyellow4,
		paletteColors.yellow,
		paletteColors.darkyellow1,
		paletteColors.darkyellow2,
		paletteColors.darkyellow3,
		paletteColors.darkyellow4,
		paletteColors.lawngreen,
		paletteColors.chartreuse,
		paletteColors.limegreen,
		paletteColors.lime,
		paletteColors.forestgreen,
		paletteColors.green,
		paletteColors.darkgreen,
		paletteColors.springgreen,
		paletteColors.greenyellow,
		paletteColors.yellowgreen,
		paletteColors.mediumspringgreen,
		paletteColors.lightgreen,
		paletteColors.palegreen,
		paletteColors.darkseagreen,
		paletteColors.mediumseagreen,
		paletteColors.lightseagreen,
		paletteColors.seagreen,
		paletteColors.olive,
		paletteColors.darkolivegreen,
		paletteColors.olivedrab,
		paletteColors.aliceblue,
		paletteColors.lavender,
		paletteColors.powderblue,
		paletteColors.lightblue,
		paletteColors.lightskyblue,
		paletteColors.skyblue,
		paletteColors.deepskyblue,
		paletteColors.lightsteelblue,
		paletteColors.dodgerblue,
		paletteColors.cornflowerblue,
		paletteColors.steelblue,
		paletteColors.cadetblue,
		paletteColors.mediumslateblue,
		paletteColors.slateblue,
		paletteColors.darkslateblue,
		paletteColors.royalblue,
		paletteColors.blue,
		paletteColors.mediumblue,
		paletteColors.darkblue,
		paletteColors.navy,
		paletteColors.midnightblue,
		paletteColors.blueviolet,
		paletteColors.indigo,
		paletteColors.lightsalmon,
		paletteColors.salmon,
		paletteColors.darksalmon,
		paletteColors.lightcoral,
		paletteColors.indianred,
		paletteColors.crimson,
		paletteColors.firebrick,
		paletteColors.red,
		paletteColors.darkred,
		paletteColors.maroon,
		paletteColors.tomato,
		paletteColors.orangered,
		paletteColors.palevioletred,
	],
	"rainbow": [{"R":128,"G":243,"B":32,"A":255},{"R":166,"G":223,"B":12,"A":255},{"R":200,"G":193,"B":2,"A":255},{"R":227,"G":158,"B":3,"A":255},{"R":246,"G":121,"B":16,"A":255},{"R":255,"G":83,"B":38,"A":255},{"R":252,"G":50,"B":69,"A":255},{"R":238,"G":24,"B":105,"A":255},{"R":214,"G":7,"B":143,"A":255},{"R":182,"G":1,"B":179,"A":255},{"R":146,"G":6,"B":211,"A":255},{"R":108,"G":22,"B":236,"A":255},{"R":72,"G":48,"B":251,"A":255},{"R":41,"G":81,"B":255,"A":255},{"R":17,"G":117,"B":247,"A":255},{"R":4,"G":155,"B":229,"A":255},{"R":1,"G":191,"B":202,"A":255},{"R":10,"G":221,"B":169,"A":255},{"R":30,"G":242,"B":131,"A":255},{"R":58,"G":253,"B":93,"A":255},{"R":93,"G":254,"B":59,"A":255},{"R":130,"G":243,"B":31,"A":255},{"R":168,"G":221,"B":11,"A":255},{"R":201,"G":192,"B":2,"A":255},{"R":229,"G":156,"B":4,"A":255},{"R":247,"G":118,"B":17,"A":255},{"R":255,"G":81,"B":40,"A":255},{"R":251,"G":49,"B":71,"A":255},{"R":237,"G":23,"B":107,"A":255},{"R":212,"G":7,"B":145,"A":255},{"R":180,"G":1,"B":181,"A":255},{"R":144,"G":7,"B":213,"A":255}],
	"variable_rainbow": [],
	get buildRainbow(){
		if(this.variable_rainbow.length == 0){
			var result = [];
			var frequency = .3;
			for (var i = 0; i < 32; ++i){
			   red   = Math.round( (Math.sin(frequency*i + 0) * 127 + 128) % 255, 0);
			   green = Math.round( (Math.sin(frequency*i + 2) * 127 + 128) % 255, 0);
			   blue  = Math.round( (Math.sin(frequency*i + 4) * 127 + 128) % 255, 0);

			   result.push({"R": red, "G": green, "B": blue, "A": 255});
			}
			
			this.variable_rainbow = result;
		}

		return this.variable_rainbow;
	},
	"getColorIndex": function(colorPalette, color){
		for( var index = 0; index < colorPalette.length; index++ ){
			if(    colorPalette[index].R == color.R 
				&& colorPalette[index].G == color.G 
				&& colorPalette[index].B == color.B 
				&& colorPalette[index].A == color.A )
			{
				return index;
			}
		}
		
		return -1;
	}
};

var mandelbrotExplorer = {
	"useRenderer": THREE.WebGLRenderer,
	"onlyShortened": false,
	"onlyFull": false,
	"startX": 				-2,
	"endX": 				2,
	"startY": 				2,
	"endY": 				-2,
	"maxIterations_2d": 	32,
	"maxIterations_3d": 	31,
	"zoomFactor": 			0.15,
	"xOffset": 				null,
	"yOffset": 				null,
	"canvas_2d": 			null,
	"xScale_2d": 			null,
	"yScale_2d": 			null,
	"canvas_3d": 			null,
	"xScale_3d": 			null,
	"yScale_3d": 			null,
	"randomizeCloudStepping": false,
	"cloudResolution":		150,
	"dualZ": false,
	"dualZMultiplier": "-1;\n//newX += escapePath[pathIndex-1][0];newY += escapePath[pathIndex-1][1];z *= -1;",//-1,
	"particleSize": "0;//index/mandelbrotExplorer.iterationParticles.length",
	"cloudLengthFilter":	"",//"escapePath.length == mandelbrotExplorer.maxIterations_3d - 1",//"escapePath.length > 8",
	//"cloudLengthFilterPresets": {
	"presets": {
		"cloudLengthFilter": {
			"iteration8": 			"escapePath.length == 8",
			"iterationDecimation":	"escapePath.length % 10 == 0",
			"maxIterations":		"escapePath.length == mandelbrotExplorer.maxIterations_3d",
			"theMeat":				"escapePath.length > parseInt( mandelbrotExplorer.maxIterations_3d * .1 )"
							   + "&& escapePath.length < parseInt( mandelbrotExplorer.maxIterations_3d * .9 )"
							   + "&& escapePath.length  > 5"
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
				"currentZLessPreviousZ_percentOfMax3D": "((pathIndex + 1)/mandelbrotExplorer.maxIterations_3d)*(mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]));",
				"currentZLessPreviousZ": 			"mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);",
				"alternatingPathOrigin": 			"zDirection * mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);",
				pathOriginAndSkewedByPrevious: function(escapePath, pathIndex){
					this.toString = function(escapePath, pathIndex){
						return "mandelbrotExplorer.getAbsoluteValueOfComplexNumber((escapePath.length == 1 ? escapePath[0] : [escapePath[pathIndex][0] + escapePath[pathIndex-1][0],escapePath[pathIndex][1] + escapePath[pathIndex-1][1]]));";
					}
					
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber((escapePath.length == 1 ? escapePath[0] : [escapePath[pathIndex][0] + escapePath[pathIndex-1][0],escapePath[pathIndex][1] + escapePath[pathIndex-1][1]]));
				},
				previousPathZ: function(escapePath, pathIndex){
					this.toString = function(escapePath, pathIndex){
						return "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex - 1]);";
					}
					
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex - 1]);
				},
				pathEnd: function(){
					this.toString = function(escapePath, pathIndex){
						return "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);";
					}
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);
				},
				pathOrigin: function(escapePath, pathIndex){
					this.toString = function(escapePath, pathIndex){
						return "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);";
					}
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[0]);
				},
				currentPathZ: function(escapePath, pathIndex){
					this.toString = function(){
						return "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);";
					}
					
					return mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
				}
			},
		}
	},
	"cloudIterationFilter":	"",//"iteration > 8",//"iteration == mandelbrotExplorer.maxIterations_3d",//"iteration < 9",
	"particleSystems": 		[],//[iterationIndex][THREE.ParticleSystem]
	"lines": 		[],//[iterationIndex][THREE.]
	"iterationParticles": [],//[iterationIndex]{particles: THREE.Geometry}      
/*
	this.iterationParticles[iterationIndex] = {"particles": new THREE.Geometry()};
					}
					var newX = escapePath[pathIndex][0];
					var newY = escapePath[pathIndex][1];
					var particleVector = new THREE.Vector3(newX, newY, z);
					this.iterationParticles[iterationIndex].particles.vertices.push(particleVector);
*/
	"particleCoords":	[],//[iterationIndex][X1,Y1,Z1,X2,Y2,Y3,...]
	"particleLimit": 		100000000,
	"cycleTime": 			10,
	"continueColorCycle": 	false,
	"continueIterationCycle": false,
	"iterationCycleFrame":  100,
	"renderer": 			null,
	"scene": 				null,
	"camera": 				null,
	"controls": 			null,
	"palette":				palettes.palette2,
	"particleFilter":		null,//"(newX > 0.24 && newX < 0.26)",
	"initialZ":				"[0,0];\r\n//this.getAbsoluteValueOfComplexNumber(escapePath[0]);\r\n//this.getAbsoluteValueOfComplexNumber(escapePath[escapePath.length - 1]);",
	"escapingZ":			"//[currentZLessPreviousZ_percentOfMax3D, currentZLessPreviousZ, alternatingPathOrigin, pathOriginAndSkewedByPrevious, pathOrigin, previousPathZ, pathEnd]\r\n"
							+ "//mandelbrotExplorer.presets.mandelbrot.escapingZ.previousPathZ(escapePath, pathIndex)\r\n"
							+ "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);",
	//"escapingZ":			"((pathIndex + 1)/this.maxIterations_3d)*(this.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - this.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]));\r\n//this.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - this.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1]);\r\n//zDirection * this.getAbsoluteValueOfComplexNumber(escapePath[0]);\r\n//this.getAbsoluteValueOfComplexNumber((escapePath.length == 1 ? escapePath[0] : [escapePath[pathIndex][0] + escapePath[pathIndex-1][0],escapePath[pathIndex][1] + escapePath[pathIndex-1][1]]));\r\n//this.getAbsoluteValueOfComplexNumber(escapePath[0]);\r\n//this.getAbsoluteValueOfComplexNumber(escapePath[pathIndex - 1]);",
	"nextCycleIteration":	1,
	"iterationCycleTime":	parseInt(1000/30),
	"juliaC":				  "[0,0];\r\n"
						  + "//[(c[0]*-1)+c[1],0];\r\n"
						  + "//[(c[0]*-1)-c[1],(c[1]*-1)-c[0]];\r\n"
						  + "//[-1.037,0.17];\r\n"
						  + "//[-0.52,0.57];\r\n"
						  + "//[0.295,0.55];\r\n"
						  + "//[-0.624,0.435];\r\n"
						  + "//[.285,0];\r\n"
						  + "//[.285,0.01];\r\n"
						  + "//[0.45,0.1428];\r\n"
						  + "//[-0.70176,-0.3842];\r\n"
						  + "//[-0.835,-0.2321];\r\n"
						  + "//[-0.8,0.156];\r\n"
						  + "//[-.62772,.42193];\r\n"
						  + "//[-.74434,-.10772];\r\n"
						  + "//[.233,.53780];\r\n"
						  + "//[.03515,-.07467];\r\n"
						  + "//[-.67319,.34442];\r\n"
						  + "//[-.74543,.11301];\r\n",
	"_cloudIterationCyclerId": null,
	"drawMandelbrot": function(params) {
		this.assignParams( params );
		var canvasContext = this.canvas_2d.getContext("2d");
		var canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);
		this.xScale_2d = Math.abs( this.startX - this.endX ) / this.canvas_2d.width;
		this.yScale_2d = Math.abs( this.startY - this.endY ) / this.canvas_2d.height;
		this.xOffset = 0 - ( this.startX / this.xScale_2d );
		this.yOffset = this.startY / this.yScale_2d;
		// FIX THIS
var repeatCheck = function(zValues, z, lastZ){
	var test = zValues.filter(function(testZ){
		return z[0] != testZ[0] && z[1] != testZ[1];
	});
	return zValues.length != test.length;
};
		//var juliaC = eval(this.juliaC);
		for( var xValue = this.startX, imageX = 0; imageX < this.canvas_2d.width; xValue += this.xScale_2d, imageX++ ){
			for( var yValue = this.startY, imageY = 0; imageY < this.canvas_2d.height; yValue -= this.yScale_2d, imageY++ ){
				var c = [xValue, yValue];
				var juliaC = eval(this.juliaC);
				var color;
				if( this.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
					color = this.getJuliaEscapePathLengthColor( juliaC, c, this.maxIterations_2d, null, true, repeatCheck );				
				}
				else{
					color = this.getJuliaEscapePathLengthColor( c, juliaC, this.maxIterations_2d, null, true, repeatCheck );				
				}
				this.setPixel( canvasImageData, imageX, imageY, color );
			}
		}
		canvasContext.putImageData(canvasImageData,0,0);
	},
	"clearMandelbrotCloud": function(){
		for( var index = this.particleSystems.length - 1; index >= 0; index-- ){
			if(!this.particleSystems[index]){continue;}
			this.scene.remove(this.particleSystems[index]);
			this.particleSystems[index] = null;
			delete this.particleSystems[index];
		}
		
		this.particleSystems = [];
	},
	"drawMandelbrotCloud": function( params ) {
		console.time("drawMandelbrotCloud");
		mandelbrotExplorer.assignParams( params );
		var resumeIterationCycle = mandelbrotExplorer.continueIterationCycle;
		mandelbrotExplorer.continueIterationCycle = false;
		
		if( mandelbrotExplorer.renderer == null )	{
			mandelbrotExplorer.renderer = new mandelbrotExplorer.useRenderer({canvas: mandelbrotExplorer.canvas_3d,  alpha: true, precision: "mediump", "antialias": false});
			
			mandelbrotExplorer.renderer.setClearColor( 0x000001, 0 );	
		}
		
		if( mandelbrotExplorer.scene == null ) {
			mandelbrotExplorer.scene = new THREE.Scene();
		}
		else {
			mandelbrotExplorer.clearMandelbrotCloud();
		}
		
		if(mandelbrotExplorer.camera == null){
			mandelbrotExplorer.camera = new THREE.PerspectiveCamera( 45, Math.abs(mandelbrotExplorer.startX - mandelbrotExplorer.endX) / Math.abs(mandelbrotExplorer.startY - mandelbrotExplorer.endY), .1, 1000 );
			mandelbrotExplorer.camera.position.z = 5;
		}
		
		if(mandelbrotExplorer.controls == null){
			mandelbrotExplorer.controls = new THREE.TrackballControls( mandelbrotExplorer.camera, mandelbrotExplorer.renderer.domElement );
		}
		
		
		mandelbrotExplorer.iterationParticles = [];
		mandelbrotExplorer.particleSystems = [];
		
		var cloudResolutions = [];
		if(mandelbrotExplorer.cloudResolution.toString().indexOf(",") !== -1){
			console.log("Split the resolution....");
			cloudResolutions = mandelbrotExplorer.cloudResolution.split(",");
		}
		else{
			cloudResolutions.push(mandelbrotExplorer.cloudResolution);
		}
				
		cloudResolutions.forEach(function(useResolution){
			mandelbrotExplorer.xScale_3d = Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / useResolution;
			mandelbrotExplorer.yScale_3d = Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / useResolution;
			
			// FUCKING FIX THIS
			//var juliaC = eval(mandelbrotExplorer.juliaC);
			console.time("drawMandelbrotCloud: Generating particles");
			for( var x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += (mandelbrotExplorer.xScale_3d) ) {
				for( var y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= (mandelbrotExplorer.yScale_3d) ) {
					var c = [x,y];
					var juliaC = eval(mandelbrotExplorer.juliaC);
					if(mandelbrotExplorer.randomizeCloudStepping){
						var getRandomArbitrary = function(min, max) {
						  return Math.random() * (max - min) + min;
						}
						var xAdjust = mandelbrotExplorer.xScale_3d / 2;
						var yAdjust = mandelbrotExplorer.yScale_3d / 2;
						c[0] = getRandomArbitrary(x - xAdjust, x + xAdjust);
						c[1] = getRandomArbitrary(y - yAdjust, y + yAdjust);
					}
	var repeatCheck = function(zValues, z, lastZ){
		var test = zValues.filter(function(testZ){
			return z[0] != testZ[0] && z[1] != testZ[1];
		});
		return zValues.length != test.length;
	};
					//var escapePath = mandelbrotExplorer.getMandelbrotEscapePath( c, mandelbrotExplorer.maxIterations_3d );
					var escapePath;
					if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
						escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
					}
					else{
						escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
					}

	if((mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
	   (mandelbrotExplorer.onlyFull && escapePath.shortened)){continue;}

					// FIX THIS STUPID SHIT
					var z = eval(mandelbrotExplorer.initialZ);
					var accumulatedZ = 0;
					var averageOfAccumulatedZ = 0;

					escapePath.forEach(function(pathValue, pathIndex, source){
	//console.log(pathValue.fpe)
						accumulatedZ += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
						averageOfAccumulatedZ = accumulatedZ / (pathIndex + 1)
						var iteration = pathIndex + 1;
						
						// COME THE FUCK ON, FIX THIS SHIT!
						if( mandelbrotExplorer.cloudLengthFilter.length > 0 && eval( mandelbrotExplorer.cloudLengthFilter ) == false ) return true;
						if( mandelbrotExplorer.cloudIterationFilter.length > 0 && eval( mandelbrotExplorer.cloudIterationFilter ) == false ) return true;
						var direction = [1,1];
						if(pathIndex > 0){
							direction[0] = escapePath[pathIndex][0] > escapePath[pathIndex-1][0] ? -1 : 1;
							direction[1] = escapePath[pathIndex][1] > escapePath[pathIndex-1][1] ? -1 : 1;
						}
						// this isn't right.... zDirection...
						var zDirection = direction[0] * direction[1];
						
						if( pathIndex != 0 ) {
							// FIX THE FUCK OUT OF THIS!
							z = eval( mandelbrotExplorer.escapingZ );
						}
						
						var iterationIndex = parseInt(pathIndex);
						
						if( typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined" ) {
							mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": new THREE.Geometry()};
						}
						var newX = escapePath[pathIndex][0];
						var newY = escapePath[pathIndex][1];

						var particleVector = new THREE.Vector3(newX, newY, z);
						if(mandelbrotExplorer.particleFilter){
							// FIX THE FUCK OUT OF THIS!
							var allowed = eval( mandelbrotExplorer.particleFilter );
							if( !allowed ){
								return true;
							}
						}

						mandelbrotExplorer.iterationParticles[iterationIndex].particles.vertices.push(particleVector);
						if(mandelbrotExplorer.dualZ){

						var dualZMultiplier = eval(mandelbrotExplorer.dualZMultiplier);
							var particleVector = new THREE.Vector3(dualZMultiplier * newX, dualZMultiplier * newY, dualZMultiplier * z);
							mandelbrotExplorer.iterationParticles[iterationIndex].particles.vertices.push(particleVector);
						}
					});
				}
			}
			console.timeEnd("drawMandelbrotCloud: Generating particles");

			console.time("drawMandelbrotCloud: Applying palette");
			for( var index in mandelbrotExplorer.iterationParticles ) {
				var colorIndex = index;
				while( colorIndex >= mandelbrotExplorer.palette.length  ) {
					colorIndex -= mandelbrotExplorer.palette.length;
				}
				var color = mandelbrotExplorer.palette[ colorIndex ];
				
				var size = mandelbrotExplorer.particleSize ? eval(mandelbrotExplorer.particleSize): 0;//mandelbrotExplorer.xScale_3dmandelbrotExplorer.xScale_3d >= 0.1 ? 0 : mandelbrotExplorer.xScale_3d/2;//mandelbrotExplorer.iterationParticles[index].fpe / mandelbrotExplorer.xScale_3d;

				var pMaterial = new THREE.PointsMaterial({
					color: new THREE.Color( color.R / 255, color.G / 255, color.B / 255 ),
					size: size,//0,
					transparent: false,
					opacity: color.A/255
				});

				mandelbrotExplorer.particleSystems[index] = new THREE.Points(
					mandelbrotExplorer.iterationParticles[parseInt(index)].particles,
					pMaterial);
			}
		});
		console.timeEnd("drawMandelbrotCloud: Applying palette");
		mandelbrotExplorer.iterationParticles = null;

		mandelbrotExplorer.displayCloudParticles();
		mandelbrotExplorer.continueIterationCycle = resumeIterationCycle;
		console.timeEnd("drawMandelbrotCloud");
	},
	"clearMandelbrotsHair": function(){
		for( var index = this.lines.length - 1; index >= 0; index-- ){
			if(!this.lines[index]){continue;}
			this.scene.remove(this.lines[index]);
			this.lines[index] = null;
			delete this.lines[index];
		}
		
		this.lines = [];
	},
	"drawMandelbrotsHair": function( params ) {
		console.time("drawMandelbrotsHair");
		mandelbrotExplorer.assignParams( params );
		var resumeIterationCycle = mandelbrotExplorer.continueIterationCycle;
		mandelbrotExplorer.continueIterationCycle = false;
		
		if( mandelbrotExplorer.renderer == null )	{
			//mandelbrotExplorer.renderer = new THREE.WebGLRenderer({canvas: mandelbrotExplorer.canvas_3d,  alpha: true, precision: "mediump", "antialias": false});
			mandelbrotExplorer.renderer = new mandelbrotExplorer.useRenderer({canvas: mandelbrotExplorer.canvas_3d,  alpha: true, precision: "mediump", "antialias": false});
			mandelbrotExplorer.renderer.setClearColor( 0x000001, 0 );	
		}
		
		if( mandelbrotExplorer.scene == null ) {
			mandelbrotExplorer.scene = new THREE.Scene();
		}
		else {
			mandelbrotExplorer.clearMandelbrotsHair();
		}
		
		if(mandelbrotExplorer.camera == null){
			mandelbrotExplorer.camera = new THREE.PerspectiveCamera( 45, Math.abs(mandelbrotExplorer.startX - mandelbrotExplorer.endX) / Math.abs(mandelbrotExplorer.startY - mandelbrotExplorer.endY), .1, 1000 );
			mandelbrotExplorer.camera.position.z = 5;
		}
		
		if(mandelbrotExplorer.controls == null){
			mandelbrotExplorer.controls = new THREE.TrackballControls( mandelbrotExplorer.camera, mandelbrotExplorer.renderer.domElement );
		}
		
		
		mandelbrotExplorer.iterationParticles = [];
		//mandelbrotExplorer.particleSystems = [];
		mandelbrotExplorer.lines = [];
		mandelbrotExplorer.lineVectors = [];

		var cloudResolutions = [];
		if(mandelbrotExplorer.cloudResolution.toString().indexOf(",") !== -1){
			console.log("Split the resolution....");
			cloudResolutions = mandelbrotExplorer.cloudResolution.split(",");
		}
		else{
			cloudResolutions.push(mandelbrotExplorer.cloudResolution);
		}
		
		cloudResolutions.forEach(function(useResolution){
			mandelbrotExplorer.xScale_3d = Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / cloudResolution;
			mandelbrotExplorer.yScale_3d = Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / cloudResolution;
			
			// FUCKING FIX THIS
			//var juliaC = eval(mandelbrotExplorer.juliaC);
			console.time("drawMandelbrotsHair: Generating particles");
			for( var x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += (mandelbrotExplorer.xScale_3d) ) {
				for( var y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= (mandelbrotExplorer.yScale_3d) ) {
					var c = [x,y];
					var juliaC = eval(mandelbrotExplorer.juliaC);
					if(mandelbrotExplorer.randomizeCloudStepping){
						var getRandomArbitrary = function(min, max) {
						  return Math.random() * (max - min) + min;
						}
						
						c[0] = getRandomArbitrary(x - mandelbrotExplorer.xScale_3d, x + mandelbrotExplorer.xScale_3d);
						c[1] = getRandomArbitrary(y - mandelbrotExplorer.xScale_3d, y + mandelbrotExplorer.xScale_3d);
					}
	var repeatCheck = function(zValues, z, lastZ){
		var test = zValues.filter(function(testZ){
			return z[0] != testZ[0] && z[1] != testZ[1];
		});
		return zValues.length != test.length;
	};
					//var escapePath = mandelbrotExplorer.getMandelbrotEscapePath( c, mandelbrotExplorer.maxIterations_3d );
					var escapePath;
					if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
						escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
					}
					else{
						escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
					}
	if((mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
	   (mandelbrotExplorer.onlyFull && escapePath.shortened)){continue;}
					// FIX THIS STUPID SHIT
					var z = eval(mandelbrotExplorer.initialZ);
					var accumulatedZ = 0;
					var averageOfAccumulatedZ = 0;
					
					var lineVectors = [];
					escapePath.forEach(function(pathValue, pathIndex, source){
						var iteration = pathIndex + 1;
						
						// COME THE FUCK ON, FIX THIS SHIT!
						if( mandelbrotExplorer.cloudLengthFilter.length > 0 && eval( mandelbrotExplorer.cloudLengthFilter ) == false ) return true;
						if( mandelbrotExplorer.cloudIterationFilter.length > 0 && eval( mandelbrotExplorer.cloudIterationFilter ) == false ) return true;
						var direction = [1,1];
						if(pathIndex > 0){
							direction[0] = escapePath[pathIndex][0] > escapePath[pathIndex-1][0] ? -1 : 1;
							direction[1] = escapePath[pathIndex][1] > escapePath[pathIndex-1][1] ? -1 : 1;
						}
						// this isn't right.... zDirection...
						var zDirection = direction[0] * direction[1];
						
						if( pathIndex != 0 ) {
							// FIX THE FUCK OUT OF THIS!
							z = eval( mandelbrotExplorer.escapingZ );
						}
						
						var iterationIndex = parseInt(pathIndex);
						
						if( typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined" ) {
							mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": new THREE.Geometry()};
						}
						var newX = escapePath[pathIndex][0];
						var newY = escapePath[pathIndex][1];
						var particleVector = new THREE.Vector3(newX, newY, z);
						if(mandelbrotExplorer.particleFilter){
							// FIX THE FUCK OUT OF THIS!
							var allowed = eval( mandelbrotExplorer.particleFilter );
							if( !allowed ){
								return true;
							}
						}
						lineVectors.push(particleVector);
					});
					if(lineVectors.length > 1){
						mandelbrotExplorer.lineVectors.push(lineVectors);
					}
				}
			}
			console.timeEnd("drawMandelbrotsHair: Generating particles");
			for(var lineIndex in mandelbrotExplorer.lineVectors){
				var currentLine = mandelbrotExplorer.lineVectors[lineIndex];
				//console.log(currentLine.getPoints().length);
				//var colorIndex = currentLine.length;
				//while( colorIndex >= mandelbrotExplorer.palette.length  ) {
				//	colorIndex -= mandelbrotExplorer.palette.length;
				//}
				//var color = mandelbrotExplorer.palette[ colorIndex ];

				//var pMaterial = new THREE.LineBasicMaterial({
				//	color: new THREE.Color( color.R / 255, color.G / 255, color.B / 255 ),
				//	linewidth: 0,
				//	transparent: false,
				//	opacity: color.A/255
				//});
	/*			
				var geometry = new THREE.Geometry();
				var curve = new THREE.CatmullRomCurve3(currentLine, false, 'chordal', );
				geometry.vertices = curve.getPoints(50);

				
				//gradientline.js
				var steps = 0.2;
				var phase = 1.5;
				//Create the final object to add to the scene
				var coloredLine = getColoredBufferLine( steps, phase, geometry )
				//var coloredLine = getColoredBufferLine_jap( mandelbrotExplorer.palette, currentLine.length, geometry );
				
				
				this.scene.add(coloredLine);
				this.lines.push(coloredLine);
	*/
				// Create a spline....
	//			var curve = new THREE.SplineCurve( currentLine );

				
				var colorIndex = currentLine.length;
				while( colorIndex >= mandelbrotExplorer.palette.length  ) {
					colorIndex -= mandelbrotExplorer.palette.length;
				}
				var color = mandelbrotExplorer.palette[ colorIndex ];
				//new THREE.Color( color.R / 255, color.G / 255, color.B / 255 )
	/*			
				
				var curve = new THREE.CatmullRomCurve3( currentLine )
				//var path = new THREE.Path( curve.getPoints( 50 ) );		
				//var geometry = path.createPointsGeometry( 50 );
				var geometry = curve.getPoints( currentLine.length );
				var material = new THREE.LineBasicMaterial( { color : new THREE.Color( color.R / 255, color.G / 255, color.B / 255 ) } );

				// Create the final object to add to the scene
				var splineObject = new THREE.Line( geometry, material );
				
				this.scene.add(splineObject);
				this.lines.push(splineObject);
	*/
				var geometry = new THREE.Geometry();
				var curve = new THREE.CatmullRomCurve3(currentLine, false, 'chordal' );
				geometry.vertices = curve.getPoints(50);
	//			var pMaterial = new THREE.LineBasicMaterial({
	//				color: new THREE.Color( color.R / 255, color.G / 255, color.B / 255 ),
	//				linewidth: 0,
	//				transparent: false,
	//				opacity: color.A/255
	//			});
	//			var lineObject = new THREE.Line( geometry, pMaterial );
				
				//gradientline.js
				var steps = 0.2;
				var phase = 1.5;
				//Create the final object to add to the scene
				var coloredLine = getColoredBufferLine_2( steps, phase, geometry, color );
				var coloredLine = getColoredBufferLine_3(geometry, mandelbrotExplorer.palette );
				
				this.scene.add(coloredLine);
				this.lines.push(coloredLine);
			}
		});
		//var useResolution = mandelbrotExplorer.cloudResolution;
		
		
		console.timeEnd("drawMandelbrotsHair");
	},
	"displayCloudParticles": function() {
		mandelbrotExplorer.particleCount = 0;
		//var vertexCounts = [];
		
		for( var index = this.particleSystems.length - 1; index >= 0; index-- ){
			if(!this.particleSystems[index]){continue;}
			var iteration = index + 1;
			this.scene.remove(this.particleSystems[index]);

			if( mandelbrotExplorer.particleCount + this.particleSystems[index].geometry.vertices.length <= this.particleLimit ){
				mandelbrotExplorer.particleCount += this.particleSystems[index].geometry.vertices.length;
				this.scene.add(this.particleSystems[index]);
			}
		}
	},
	"getMandelbrotEscapePathLengthColor": function(c, maxIterations, palette){
		if( typeof( palette ) == "undefined" || !palette ){
			palette = this.palette;
		}
		var escapePath = this.getMandelbrotEscapePath(c, maxIterations);
		var index = escapePath.length % palette.length;
		
		return palette[ index ];
	},
	"getJuliaEscapePathLengthColor": function(c, z, maxIterations, palette, bailOnRepeat, repeatCheck){
		if( typeof( palette ) == "undefined" || !palette ){
			palette = this.palette;
		}
		var escapePath = this.getJuliaEscapePath(c, z, maxIterations, bailOnRepeat, repeatCheck);
		var index = escapePath.length % palette.length;
//		if(escapePath.shortened == 0){
//			return {"B": 255, "R": 255, "G":  255, "A":0}
//		}
//		else{
			return palette[ index ];
//		}
		
	},
	"assignParams": function(params) {
		for( var property in params ){
			this[ property ] = params[ property ];
		}
	},
	"setPixel": function( imageData, x, y, c ){
		var i = ((y * imageData.width) + x) * 4;
		if( i + 3 < (imageData.width * imageData.height * 4) ){
			imageData.data[i]=c.R;
			imageData.data[i+1]=c.G;
			imageData.data[i+2]=c.B;
			imageData.data[i+3]=c.A;
		}
	},
	"cycle2dColors": function(){
		var startTime = new Date();
		
		var canvasContext = this.canvas_2d.getContext("2d");
		var canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);

		var index, currentColor, currentColorIndex, nextColorIndex, nextColor
		for( var pixel = 0; pixel < ( canvasImageData.height * canvasImageData.width ); pixel++ ){
			index = pixel * 4;
			currentColor = {
				"R": canvasImageData.data[ index ],
				"G": canvasImageData.data[ index + 1 ],
				"B": canvasImageData.data[ index + 2 ],
				"A": canvasImageData.data[ index + 3 ]
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= this.palette.length ){
				nextColorIndex -= this.palette.length;
			}
			nextColor = this.palette[nextColorIndex];
			
			canvasImageData.data[ index ] = nextColor.R;
			canvasImageData.data[ index + 1 ] = nextColor.G;
			canvasImageData.data[ index + 2 ] = nextColor.B;
			canvasImageData.data[ index + 3 ] = nextColor.A;
		}

		canvasContext.putImageData(canvasImageData,0,0);
		
		this.cycleTime = (new Date()) - startTime;
		if( this.continueColorCycle ){
			setTimeout( function(){mandelbrotExplorer.cycle2dColors();}, this.iterationCycleTime )
		}
	},
	"cycleCloudColors": function(){
		var startTime = new Date();
		var index, currentColor, currentColorIndex, nextColorIndex, nextColor
				
		for( var index = 0; index < this.particleSystems.length; index++ )
		{
			if(!this.particleSystems[index] || !this.particleSystems[index].material){ continue; };
			var materialColor = this.particleSystems[index].material.color;
			
			currentColor = {
				"R": materialColor.r * 255,
				"G": materialColor.g * 255,
				"B": materialColor.b * 255,
				"A": 255
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= this.palette.length )
			{
				nextColorIndex -= this.palette.length;
			}
			nextColor = this.palette[nextColorIndex];
			
			this.particleSystems[index].material.color.setHex(parseInt( "0x" + this.padString( nextColor.R.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.G.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.B.toString(16), 2, "0", STR_PAD_LEFT )
								, 16));
		}
		
		this.cycleTime = (new Date()) - startTime;
		if( this.continueColorCycle )
		{
			setTimeout( function(){mandelbrotExplorer.cycleCloudColors();}, this.iterationCycleTime )
		}
	},
	"cycleCloudIterations": function() {
		var particleCount = 0;
		var foundNext = false;
		var particleSystemsLength = this.particleSystems.length;
		var cycleDirection = 1;
		while( particleSystemsLength > 0 && foundNext == false ){
			for( var index = 0; index < particleSystemsLength; index++ ){
				this.scene.remove( this.particleSystems[index] );
				var iteration = index + 1;
				// FUCKING FIX IT
				if( this.cloudIterationFilter.length > 0 && eval( this.cloudIterationFilter ) == false ) continue;
				
				if( this.particleSystems[index] && 
					iteration >= this.nextCycleIteration - (this.iterationCycleFrame/2) && 
					iteration <= this.nextCycleIteration + (this.iterationCycleFrame/2) 
				  ){
					foundNext = true;
					particleCount += this.particleSystems[index].geometry.vertices.length;
					this.scene.add( this.particleSystems[index] );
				}
			}
			this.nextCycleIteration += cycleDirection;
			
			if(this.nextCycleIteration > this.particleSystems.length || this.nextCycleIteration < 0){
				cycleDirection *= -1;
			}
			
			while( this.nextCycleIteration > this.particleSystems.length )
			{
				this.nextCycleIteration -= this.particleSystems.length;
			}
		}
		
		if( this.continueIterationCycle ){
			this._cloudIterationCyclerId = setTimeout( function(){mandelbrotExplorer.cycleCloudIterations();}, this.iterationCycleTime )
		}
		
	},
	"setPalette": function( newPalette ) {
		var canvasContext = this.canvas_2d.getContext("2d");
		var canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);

		var index, currentColor, currentColorIndex, nextColorIndex, nextColor
		for( var pixel = 0; pixel < ( canvasImageData.height * canvasImageData.width ); pixel++ )
		{
			index = pixel * 4;
			currentColor = {
				"R": canvasImageData.data[ index ],
				"G": canvasImageData.data[ index + 1 ],
				"B": canvasImageData.data[ index + 2 ],
				"A": canvasImageData.data[ index + 3 ]
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= newPalette.length )
			{
				nextColorIndex -= newPalette.length;
			}
			nextColor = newPalette[nextColorIndex];
			
			canvasImageData.data[ index ] = nextColor.R;
			canvasImageData.data[ index + 1 ] = nextColor.G;
			canvasImageData.data[ index + 2 ] = nextColor.B;
			canvasImageData.data[ index + 3 ] = nextColor.A;
		}

		canvasContext.putImageData(canvasImageData,0,0);
		
		for( var index = 0; index < this.particleSystems.length; index++ ){
			if(!this.particleSystems[index]){continue;}
			var materialColor = this.particleSystems[index].material.color;
			
			currentColor = {
				"R": materialColor.r * 255,
				"G": materialColor.g * 255,
				"B": materialColor.b * 255,
				"A": this.particleSystems[index].material.opacity * 255
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= newPalette.length ){
				nextColorIndex -= newPalette.length;
			}
			nextColor = newPalette[nextColorIndex];
			
			this.particleSystems[index].material.color.setHex(parseInt( "0x" + this.padString( nextColor.R.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.G.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.B.toString(16), 2, "0", STR_PAD_LEFT )
								, 16));
		}
		
		this.palette = newPalette;
	},
	"getPixel": function(imageData,x,y){
		var i = ((y * imageData.width) + x) * 4;
		if( i + 3 < imageData.width * imageData.height ){
			return {R:imageData.data[i],
				  G:imageData.data[i+1],
				  B:imageData.data[i+2],
				  A:imageData.data[i+3]}
		}

		return false;
	},
	"getMandelbrotEscapePath": function( c, maxIterations, bailOnRepeat ){
		if(typeof(bailOnRepeat) == "undefined"){
			bailOnRepeat = true;
		}
		
		return this.getJuliaEscapePath( c, [0,0], maxIterations, bailOnRepeat );
	},
	"getJuliaEscapePath": function( c, z, maxIterations, bailOnRepeat, repeatCheck ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		if(typeof(repeatCheck) === "undefined"){
			repeatCheck = function(zValues, z, lastZ){
				return z[0] == lastZ[0] && z[1] == lastZ[1];
			};
		}
		
		var iterations = 0;
		var zValues = Array();
		if( this.getAbsoluteValueOfComplexNumber(z) != 0 ){
			zValues.push(z);
		}
		
		var lastZ = [null, null];
		var limit = 2;
		while( this.getAbsoluteValueOfComplexNumber(z) < limit && iterations < maxIterations ){
			iterations++;
			var zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			var zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];

			
			z.fpe = Math.abs((z[0] - Math.sqrt(Math.pow(z[0], 2))) + (z[1] - Math.sqrt(Math.pow(z[1], 2))));
			
			zValues.push(z);
			
			lastZ = z;
		}

		var fullLength = zValues.length;
		zValues = zValues.filter(function(teztZ, testZIndex, testZValues){
			for ( var zi = 0; zi < testZIndex; zi++ ){
				if(teztZ[0] == testZValues[zi][0] && teztZ[1] == testZValues[zi][1]){
					return false;
				}
			}
			return true;
		})
		zValues.shortened = fullLength - zValues.length;
		return zValues;
	},
	"getJuliaEscapePath_orig": function( c, z, maxIterations, bailOnRepeat, repeatCheck ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		if(typeof(repeatCheck) === "undefined"){
			repeatCheck = function(zValues, z, lastZ){
				return z[0] == lastZ[0] && z[1] == lastZ[1];
			};
		}
		
		var iterations = 0;
		var zValues = Array();
		if( this.getAbsoluteValueOfComplexNumber(z) != 0 ){
			zValues.push(z);
		}
		
		var lastZ = [null, null];
		var limit = 2;
		while( this.getAbsoluteValueOfComplexNumber(z) < limit && iterations < maxIterations ){
			iterations++;
			var zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			var zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];

			/* This isn't right, but it is fun, do something about finding repeating patterns */
			if(bailOnRepeat && repeatCheck(zValues, z, lastZ)){
				iterations = maxIterations;
			}
			else{
				zValues.push(z);
			}
			
			lastZ = z;
		}
		
		return zValues;
	},
	"runJuliaCalc": function( c, z, maxIterations, verbose ){
		if(verbose){console.time("runJuliaCalc");}

		var iterations = 0;
		while( this.getAbsoluteValueOfComplexNumber(z) < 2 && iterations < maxIterations ){
			iterations++;
			var zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			var zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];
		}
		
		if(verbose){console.timeEnd("runJuliaCalc");}
	},
	"getAbsoluteValueOfComplexNumber": function( c ){
		return Math.sqrt( Math.abs( Math.pow(c[0], 2) + Math.pow(c[1],2) ) );
	},
	"padString": function (str, len, pad, dir) {
		if (typeof(len) == "undefined") { var len = 0; }
		if (typeof(pad) == "undefined") { var pad = ' '; }
		if (typeof(dir) == "undefined") { var dir = STR_PAD_RIGHT; }

		if (len + 1 >= str.length) {
			switch (dir){
				case STR_PAD_LEFT:
					str = Array(len + 1 - str.length).join(pad) + str;
					break;

				case STR_PAD_BOTH:
					var right = Math.ceil((padlen = len - str.length) / 2);
					var left = padlen - right;
					str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
					break;

				default:
					str = str + Array(len + 1 - str.length).join(pad);
					break;
			}

		}
		
		return str;
	}
}

/*
Light yellow1	#FFFFCC	rgb(255,255,204)
Light yellow2	#FFFF99	rgb(255,255,153)
Light yellow3	#FFFF66	rgb(255,255,102)
Light yellow4	#FFFF33	rgb(255,255,51)
Yellow	#FFFF00	rgb(255,255,0)
Dark yellow1	#CCCC00	rgb(204,204,0)
Dark yellow2	#999900	rgb(153,153,0)
Dark yellow3	#666600	rgb(102,102,0)
Dark yellow4	#333300	rgb(51,51,0)
lawngreen	#7CFC00	rgb(124,252,0)
chartreuse	#7FFF00	rgb(127,255,0)
limegreen	#32CD32	rgb(50,205,50)
lime	#00FF00	rgb(0.255.0)
forestgreen	#228B22	rgb(34,139,34)
green	#008000	rgb(0,128,0)
darkgreen	#006400	rgb(0,100,0)
greenyellow	#ADFF2F	rgb(173,255,47)
yellowgreen	#9ACD32	rgb(154,205,50)
springgreen	#00FF7F	rgb(0,255,127)
mediumspringgreen	#00FA9A	rgb(0,250,154)
lightgreen	#90EE90	rgb(144,238,144)
palegreen	#98FB98	rgb(152,251,152)
darkseagreen	#8FBC8F	rgb(143,188,143)
mediumseagreen	#3CB371	rgb(60,179,113)
lightseagreen	#20B2AA	rgb(32,178,170)
seagreen	#2E8B57	rgb(46,139,87)
olive	#808000	rgb(128,128,0)
darkolivegreen	#556B2F	rgb(85,107,47)
olivedrab	#6B8E23	rgb(107,142,35)
aliceblue	#F0F8FF	rgb(240,248,255)
lavender	#E6E6FA	rgb(230,230,250)
powderblue	#B0E0E6	rgb(176,224,230)
lightblue	#ADD8E6	rgb(173,216,230)
lightskyblue	#87CEFA	rgb(135,206,250)
skyblue	#87CEEB	rgb(135,206,235)
deepskyblue	#00BFFF	rgb(0,191,255)
lightsteelblue	#B0C4DE	rgb(176,196,222)
dodgerblue	#1E90FF	rgb(30,144,255)
cornflowerblue	#6495ED	rgb(100,149,237)
steelblue	#4682B4	rgb(70,130,180)
cadetblue	#5F9EA0	rgb(95,158,160)
mediumslateblue	#7B68EE	rgb(123,104,238)
slateblue	#6A5ACD	rgb(106,90,205)
darkslateblue	#483D8B	rgb(72,61,139)
royalblue	#4169E1	rgb(65,105,225)
blue	#0000FF	rgb(0,0,255)
mediumblue	#0000CD	rgb(0,0,205)
darkblue	#00008B	rgb(0,0,139)
navy	#000080	rgb(0,0,128)
midnightblue	#191970	rgb(25,25,112)
blueviolet	#8A2BE2	rgb(138,43,226)
indigo	#4B0082	rgb(75,0,130)
lightsalmon	#FFA07A	rgb(255,160,122)
salmon	#FA8072	rgb(250,128,114)
darksalmon	#E9967A	rgb(233,150,122)
lightcoral	#F08080	rgb(240,128,128)
indianred	#CD5C5C	rgb(205,92,92)
crimson	#DC143C	rgb(220,20,60)
firebrick	#B22222	rgb(178,34,34)
red	#FF0000	rgb(255,0,0)
darkred	#8B0000	rgb(139,0,0)
maroon	#800000	rgb(128,0,0)
tomato	#FF6347	rgb(255,99,71)
orangered	#FF4500	rgb(255,69,0)
palevioletred	#DB7093	rgb(219,112,147)
*/
