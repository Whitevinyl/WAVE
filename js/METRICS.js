

//-------------------------------------------------------------------------------------------
//  METRICS
//-------------------------------------------------------------------------------------------

function metrics() {

    // GET DISPLAY DIMENSIONS //
    ratio = getPixelRatio();
    width = window.innerWidth * ratio;
    height = window.innerHeight * ratio;
    dx = width / 2;
    dy = height / 2;

    // DEVICE CHECK //
    if (height > (width * 1.05)) {
        device = "mobile";
    } else if (height > (width * 0.65)) {
        device = "tablet";
    } else {
        device = "desktop";
    }
    console.log(device);

    var u;

    if (device=="mobile") {
        u = width * 2.6;
        units = (u/1000);
    } else {
        u = height * 1.8;
        units = (u/800);
    }


    // SET CANVAS DIMENSIONS //
    canvas.width  = width;
    canvas.height = height;

    if (wave) wave.resize();
}


//-------------------------------------------------------------------------------------------
//  PIXEL RATIO
//-------------------------------------------------------------------------------------------

function getPixelRatio() {
    var dpr = window.devicePixelRatio || 1;
    var bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
}
