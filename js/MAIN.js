

// INIT //
var canvas;
var ctx;
var stats;

// METRICS //
var width = 0;
var height = 0;
var ratio = 1;
var TAU = 2 * Math.PI;
var units;
var dx, dy;


// INTERACTION //
var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;

// TEXTURE //
var wave;
//color.lowPass = new RGBA(50,45,25,0);
//color.lowPass = new RGBA(0,0,20,0);

// COLORS //
var bgCols = [new RGBA(18,18,28,1),new RGBA(140, 70, 70,1), new RGBA(18,18,28,1), new RGBA(10,10,30,1)];
var cols = [new RGBA(10,212,172,1), new RGBA(255, 250, 150,1), new RGBA(10,232,192,1), new RGBA(30,255,225,1)];


var colMode = 3;

var bgCol = bgCols[colMode];
var hCol = cols[colMode];


color.master = new RGBA(-255,-255,-255,0);
color.lowPass = new RGBA(5, 2, 2, 0);



//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------

function init() {

    // SETUP EXPERIMENT //
    setupExperiment();

    // SETUP CANVAS //
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    // SET CANVAS & DRAWING POSITIONS //
    metrics();

    // INTERACTION //
    setupInteraction();

    // STATS //
    //initStats();

    // GENERATE NOISE LAYER //
    canvasNoise(200, 200, ratio, 0.03, 'noiseLayer');


    // CSS TRANSITION IN //
    var overlay = document.getElementById('overlay');
    overlay.style.top = '0';
    overlay.style.opacity = '1';


    // INIT DISTORTION //
    wave = new LandscapeBackground();


    // START LOOP //
    loop();

    setTimeout( function() {
        colourTo(color.master,15,10,15,0,3);
    },100);
}



function initStats() {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
}


//-------------------------------------------------------------------------------------------
//  MAIN LOOP
//-------------------------------------------------------------------------------------------


function loop() {
    if (stats) stats.begin();
    update();
    draw();
    if (stats) stats.end();
    requestAnimationFrame(loop);
}


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------

function update() {
    if (TWEEN) {
        TWEEN.update();
    }
    if (experiment) {
        experiment.update();
    }
    if (wave) {
        wave.update();
    }
}


//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------

function draw() {
    wave.draw(ctx);
}
