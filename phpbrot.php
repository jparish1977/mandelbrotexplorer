<?php

// phpcs:disable PSR1.Files.SideEffects
// phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace

class Complex
{
    public function __construct(public $real = 0, public $imaginary = 0)
    {
    }

    //Returns the product of two complex numbers
    public function times($other): \Complex
    {
        $result = new Complex();
        $result->real =      ($this->real * $other->real)      - ($this->imaginary * $other->imaginary);
        $result->imaginary = ($this->real * $other->imaginary) + ($this->imaginary * $other->real);
        return $result;
    }

    //Returns the sum of two complex numbers
    public function plus($other): \Complex
    {
        $result = new Complex();
        $result->real = $this->real + $other->real;
        $result->imaginary = $this->imaginary + $other->imaginary;
        return $result;
    }

    //Returns the Euclidean distance between the complex number and the origin on the complex plane
    public function magnitude(): float
    {
        return sqrt($this->real ** 2 + $this->imaginary ** 2);
    }
}

/**
 * @return mixed[]
 */
function getMandelbrotEscapePath($c, $maxIterations = 255, $filterRepeating = true): array
{

    $z = new Complex();
    $z->real = 0;
    $z->imaginary = 0;

    $iteration = 0;
    $zValues = [];
    $previousZ = $z;
    while ($z->magnitude() < 2 && $iteration < $maxIterations) {
        $iteration++;
        $z = $previousZ->times($previousZ)->plus($c);
        if ($filterRepeating && $z->real == $previousZ->real && $z->imaginary == $previousZ->imaginary) {
            continue;
        }

        $zValues[] = $z;
    }

    return $zValues;
}

/**
 * @return mixed[]
 */
function getCsWithFullPaths($stepping = 0.1, $maxIterations = 1024): array
{

    $fullPaths = [];
    $sampleCount = 0;
    for ($x = 0; $x <= 2; $x += $stepping) {
        for ($y = 0; $y <= 2; $y += $stepping) {
            if ($x != 0 || $y != 0) {
                $multipliers = [
                    [ 1,  1],
                    [-1,  1],
                    [-1, -1],
                    [ 1, -1]
                ];
                foreach ($multipliers as $multiplier) {
                    $sampleCount++;
                    $path = getMandelbrotEscapePath(new Complex($x * $multiplier[0], $y * $multiplier[1]), $maxIterations);
                    if (count($path) == $maxIterations) {
                        $fullPaths[] = $path[0];
                    //[0];
                    }
                }
            }
        }
    }

    echo('sampleCount: ' . $sampleCount . PHP_EOL);
    return $fullPaths;
}

/**
 * @return mixed[]
 */
function getCsWithNearlyFullPaths($stepping = 0.1, $maxIterations = 1024): array
{

    $fullPaths = [];
    $sampleCount = 0;
    $pathCounts = [];
    for ($x = 0; $x <= 2; $x += $stepping) {
        for ($y = 0; $y <= 2; $y += $stepping) {
            if ($x != 0 || $y != 0) {
                $multipliers = [
                    [ 1,  1],
                    [-1,  1],
                    [-1, -1],
                    [ 1, -1]
                ];
                foreach ($multipliers as $multiplier) {
                    $sampleCount++;
                    $path = getMandelbrotEscapePath(new Complex($x * $multiplier[0], $y * $multiplier[1]), $maxIterations);
                    $count = count($path);
                    if (!array_key_exists($count, $pathCounts)) {
                        $pathCounts[$count] = [];
                    }

                    $pathCounts[$count][] = $path[0];
                    if ($count == $maxIterations - 1) {
                        $fullPaths[] = $path[0];
                    //[0];
                    }
                }
            }
        }
    }

    //echo('sampleCount: ' . $sampleCount . PHP_EOL);
    //dd($pathCounts);
    return $fullPaths;
}

count(getCsWithNearlyFullPaths(4 / 11, 255));

/*
$c = new Complex();
$c->real = 0.25;
$c->imaginary = 0;


getMandelbrotEscapePath($c);

$c = new Complex();
$c->real = 0.25;
$c->imaginary = 0.1;


getMandelbrotEscapePath($c);


$c = new Complex();
$c->real = 0.0625;
$c->imaginary = 0;


getMandelbrotEscapePath($c);


$c = new Complex();
$c->real = 0;
$c->imaginary = 0.0625;


foreach( getMandelbrotEscapePath($c) as $complexNum ){ echo($complexNum->real . ':' . $complexNum->imaginary . ':' . $complexNum->magnitude() . PHP_EOL); };
*/
