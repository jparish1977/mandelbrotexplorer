<?php
    class complex {

        //A complex number has a real and imaginary part
        public $real = 0;
        public $imaginary = 0;
        
        public function __construct($real=0, $imaginary=0){
            $this->real = $real;
            $this->imaginary = $imaginary;
        }
        
        //Returns the product of two complex numbers
        public function times($other) {
            $result = new complex();
            $result->real =      ($this->real*$other->real)      - ($this->imaginary*$other->imaginary);
            $result->imaginary = ($this->real*$other->imaginary) + ($this->imaginary*$other->real);
            return $result; 
        }
        
        //Returns the sum of two complex numbers
        public function plus($other) {
            $result = new complex();
            $result->real = $this->real+$other->real;
            $result->imaginary = $this->imaginary+$other->imaginary;
            return $result;
        }
        //Returns the Euclidean distance between the complex number and the origin on the complex plane
        public function magnitude() {
            return sqrt(pow($this->real, 2)+pow($this->imaginary, 2));  
        }
    }

    function getMandelbrotEscapePath($c, $maxIterations=255, $filterRepeating=true){
        $z = new \complex();
        $z->real = 0;
        $z->imaginary = 0;
     
        $iteration = 0;
        $zValues = [];
        $previousZ = $z;
        $quit = false;
        while($z->magnitude() < 2 && $iteration < $maxIterations){
            $iteration++;
            $z = $previousZ->times($previousZ)->plus($c);
            if($filterRepeating && $z->real == $previousZ->real && $z->imaginary == $previousZ->imaginary){
                continue;
            }
            $zValues[] = $z;
        }
                
        return $zValues;
    }

    function getCsWithFullPaths($stepping=0.1,$maxIterations=1024){
        $fullPaths = [];
        $sampleCount = 0;
        for($x = 0; $x <= 2; $x += $stepping){
            for($y = 0; $y <= 2; $y += $stepping){
                if($x != 0 || $y!= 0){
                    $multipliers = [
                        [ 1,  1],
                        [-1,  1],
                        [-1, -1],
                        [ 1, -1]
                    ];
                    
                    foreach($multipliers as $multiplier){
                        $sampleCount++;
                        $path = getMandelbrotEscapePath(new complex($x * $multiplier[0],$y * $multiplier[1]), $maxIterations);
                        if(count($path) == $maxIterations){
                            $fullPaths[] = $path[0];//[0];
                        }
                    }
                }
            }
        }
        echo('sampleCount: ' . $sampleCount . PHP_EOL);
        return $fullPaths;
    }

    function getCsWithNearlyFullPaths($stepping=0.1,$maxIterations=1024){
        $fullPaths = [];
        $sampleCount = 0;
        $pathCounts = [];
        for($x = 0; $x <= 2; $x += $stepping){
            for($y = 0; $y <= 2; $y += $stepping){
                if($x != 0 || $y!= 0){
                    $multipliers = [
                        [ 1,  1],
                        [-1,  1],
                        [-1, -1],
                        [ 1, -1]
                    ];
                    
                    foreach($multipliers as $multiplier){
                        $sampleCount++;
                        $path = getMandelbrotEscapePath(new complex($x * $multiplier[0],$y * $multiplier[1]), $maxIterations);
                        $count = count($path);
                        if(!array_key_exists($count, $pathCounts)){
                            $pathCounts[$count] = [];
                        }
                        $pathCounts[$count][] = $path[0];
                        if($count == $maxIterations-1){
                            $fullPaths[] = $path[0];//[0];
                        }
                    }
                }
            }
        }
        //echo('sampleCount: ' . $sampleCount . PHP_EOL);
        //dd($pathCounts);
        return $fullPaths;
    }
    
count(getCsWithNearlyFullPaths(4/11, 255))

/*
$c = new \complex();
$c->real = 0.25;
$c->imaginary = 0;


getMandelbrotEscapePath($c);

$c = new \complex();
$c->real = 0.25;
$c->imaginary = 0.1;


getMandelbrotEscapePath($c);


$c = new \complex();
$c->real = 0.0625;
$c->imaginary = 0;


getMandelbrotEscapePath($c);


$c = new \complex();
$c->real = 0;
$c->imaginary = 0.0625;


foreach( getMandelbrotEscapePath($c) as $complexNum ){ echo($complexNum->real . ':' . $complexNum->imaginary . ':' . $complexNum->magnitude() . PHP_EOL); };
*/