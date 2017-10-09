
//-------------------------------------------------------------------------------------------
//  INIT
//-------------------------------------------------------------------------------------------

function LandscapeBackground() {
    this.simplex = null;
    this.yOff = 0;
    this.res = new Point(Math.floor(width/(60*units)),28);
    this.resMult = 18;
    this.scaleDiv = 17;
    this.yRange = 80*units;
    this.dataRes = new Point(this.res.x,this.res.y*this.resMult);
    this.layers = [];
    this.data = [];
    this.data2 = [];
    this.size = new Point(width, height * 1.5);

    this.intensity = tombola.rangeFloat(0,1);
    this.weave = 0;
    this.particles = [];

    this.generate();
}

LandscapeBackground.prototype.generate = function() {
    this.simplex = new SimplexNoise();
    this.yOff = 0;
    this.yRange = 80*units;
    this.size = new Point(width, height * 1.5);
    this.layers = [];
    this.data = [];
    this.data2 = [];
    this.particles = [];
    var i;

    // create data //
    for (i=0; i<this.dataRes.y; i++) {
        var d = [];
        var d2 = [];
        for (var h=0; h<this.dataRes.x; h++) {
            d.push( this.simplex.noise(h/this.scaleDiv, (i/(this.scaleDiv*this.resMult))) );
            d2.push( this.simplex.noise(100 + (h/(this.scaleDiv/2)), 100 + (i/((this.scaleDiv/2)*this.resMult))) );
        }
        this.data.push(d);
        this.data2.push(d2);
    }

    // create layers //
    for (i=0; i<this.res.y; i++) {
        var pos = new Point(dx, dy - (this.size.y/2) + ((this.size.y/this.res.y) * i));
        var data = this.data[i * this.resMult];
        var data2 = this.data2[i * this.resMult];
        this.layers.push( new LandscapeLayer(pos, data, data2));
    }

    // create particles //
    for (i=0; i<160; i++) {
        pos = new Point(Math.random()*width, Math.random()*height);
        var vector = new Vector(tombola.rangeFloat(-1.5,1.5), tombola.rangeFloat(-0.2,0.2));
        var size = tombola.rangeFloat(0.15,0.95);
        this.particles.push( new WaterParticle(pos, vector, size));
    }

};


LandscapeBackground.prototype.resize = function() {
    var i;
    this.yRange = 80*units;
    this.size = new Point(width, height * 1.5);
    var lastX = this.dataRes.x;
    this.dataRes.x = this.res.x = Math.floor(width / (60*units));

    if (this.dataRes.x > lastX) {
        // reset data //
        this.yOff = 0;
        this.layers = [];
        this.data = [];
        this.data2 = [];
        var i;

        // create data //
        for (i=0; i<this.dataRes.y; i++) {
            var d = [];
            var d2 = [];
            for (var h=0; h<this.dataRes.x; h++) {
                d.push( this.simplex.noise(h/this.scaleDiv, (i/(this.scaleDiv*this.resMult))) );
                d2.push( this.simplex.noise(100 + (h/(this.scaleDiv/2)), 100 + (i/((this.scaleDiv/2)*this.resMult))) );
            }
            this.data.push(d);
            this.data2.push(d2);
        }

        // create layers //
        for (i=0; i<this.res.y; i++) {
            var pos = new Point(dx, dy - (this.size.y/2) + ((this.size.y/this.res.y) * i));
            var data = this.data[i * this.resMult];
            var data2 = this.data2[i * this.resMult];
            this.layers.push( new LandscapeLayer(pos, data, data2));
        }

    }

    for (i=0; i<this.res.y; i++) {
        this.layers[i].pos = new Point(dx, dy - (this.size.y/2) + ((this.size.y/this.res.y) * i));
    }
};


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------


LandscapeBackground.prototype.update = function() {

    this.yOff ++;
    this.weave = this.simplex.noise(this.yOff/100,0);
    this.intensity = (1 + this.simplex.noise(0,1000 + (this.yOff/200)))/2;


    var yScale = 1.5;
    if (device=='mobile') {
        yScale = 1.1;
    }
    this.size.y = height * (yScale + (yScale * this.intensity));

    // update data //
    this.data.shift();
    this.data2.shift();
    var d = [];
    var d2 = [];
    for (var i=0; i<this.dataRes.x; i++) {
        d.push( this.simplex.noise(i/this.scaleDiv, ((this.dataRes.y + this.yOff)/(this.scaleDiv*this.resMult) )) );
        d2.push( this.simplex.noise(100 + (i/(this.scaleDiv/2)) + (this.weave), 100 + ((this.dataRes.y + this.yOff)/((this.scaleDiv/2)*this.resMult) )) );
    }
    this.data.push(d);
    this.data2.push(d2);

    for (i=0; i<this.res.y; i++) {
        this.layers[i].pos.y = dy - (this.size.y/2) + ((this.size.y/this.res.y) * i);
        this.layers[i].data = this.data[i * this.resMult];
        this.layers[i].data2 = this.data2[i * this.resMult];
    }

};


//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------


LandscapeBackground.prototype.draw = function(ctx) {
    ctx.globalAlpha = 1;
    ctx.lineJoin = "round";

    var lineHeight = this.yRange;
    var pad = 0.5 * units;
    var ripple = -this.intensity * (lineHeight/3);


    var xDiv = this.size.x/this.res.x;
    var yDiv = this.size.y/this.res.y;
    var yGutter = (this.size.y - height)/2;
    var highlight = color.blend2( bgCol, hCol, 20);


    // layer loop //
    var length = this.res.y;
    for (var i=1; i<length; i++) {
        var pl = this.layers[i-1];
        var l = this.layers[i];
        var sx = l.pos.x - (width/2);
        var xd = width / (this.res.x-1);


        // data loop //
        for (var h=0; h<this.res.x; h++) {

            // fill //
            var d = (l.pos.y + (l.data[h] * lineHeight)) - (pl.pos.y + (pl.data[h] * lineHeight)); // tri height
            var p = (d / (this.yRange/2)) * 100; // percent
            var col = color.blend2(  bgCol, highlight, 100 - p );

            // white tint //
            var xPos = sx + (xd * h);
            var yPos = l.pos.y + (l.data[h] * lineHeight) + (l.data2[h] * ripple);

            if (xPos > (dx - (120*units)) && xPos < (dx + (120*units))) {

                if (yPos > (dy + (50*units)) && yPos < (dy + (200*units))) {
                    d = (dy + (125*units)) - yPos;
                    var d2 = dx - xPos;
                    if (d<0) d = -d;
                    if (d2<0) d2 = -d2;

                    p = ((1 - (d / (75*units))) * (1 - (d2 / (120*units)) )) * 12; // brightness
                    col = color.blend2(col,cols[0],p);
                }
            }

            // DRAW TRIANGLES //
            color.fill(ctx, col );
            if ((i%2==0 && h%2!==0) || (i%2!==0 && h%2==0)) {
                ctx.beginPath();
                if (h>0) {
                    ctx.moveTo(sx + (xd * (h-1)) - pad, pl.pos.y + (pl.data[h-1] * lineHeight) + (pl.data2[h-1] * ripple) - pad);
                } else {
                    ctx.moveTo(sx + (xd * h), pl.pos.y + (pl.data[h] * lineHeight) + (pl.data2[h] * ripple) - pad);
                }
                ctx.lineTo(sx + (xd * h), l.pos.y + (l.data[h] * lineHeight) + (l.data2[h] * ripple) + pad);
                if (h<this.res.x-1) {
                    ctx.lineTo(sx + (xd * (h+1)) + pad, pl.pos.y + (pl.data[h+1] * lineHeight) + (pl.data2[h+1] * ripple) - pad);
                }
                else {
                    ctx.lineTo(sx + (xd * h), pl.pos.y + (pl.data[h] * lineHeight) + (pl.data2[h] * ripple) - pad);
                }
                ctx.closePath();
                ctx.fill();
            }
            else {
                ctx.beginPath();
                if (h>0) {
                    ctx.moveTo(sx + (xd * (h-1)) - pad, l.pos.y + (l.data[h-1] * lineHeight) + (l.data2[h-1] * ripple) + pad);
                } else {
                    ctx.moveTo(sx + (xd * h), l.pos.y + (l.data[h] * lineHeight) + (l.data2[h] * ripple) + pad);
                }
                ctx.lineTo(sx + (xd * h), pl.pos.y + (pl.data[h] * lineHeight) + (pl.data2[h] * ripple) - pad);
                if (h<this.res.x-1) {
                    ctx.lineTo(sx + (xd * (h+1)) + pad, l.pos.y + (l.data[h+1] * lineHeight) + (l.data2[h+1] * ripple) + pad);
                }
                else {
                    ctx.lineTo(sx + (xd * h), l.pos.y + (l.data[h] * lineHeight) + (l.data2[h] * ripple) + pad);
                }
                ctx.closePath();
                ctx.fill();
            }

        }

    }
    ctx.lineJoin = "miter";


    // DRAW PARTICLES //
    color.fill(ctx,cols[0]);
    length = this.particles.length;
    for (i=0; i<length; i++) {

        var gridX = Math.floor(this.particles[i].pos.x / xDiv);
        var gridY = Math.floor((yGutter + (this.particles[i].pos.y)) / yDiv);
        gridY = valueInRange(gridY,0,this.res.y-1);

        var yOff = (this.layers[gridY].data[gridX] * lineHeight) + (this.layers[gridY].data2[gridX] * ripple);
        this.particles[i].update(yOff);
        this.particles[i].draw(ctx);
    }

};


//-------------------------------------------------------------------------------------------
//  LAYER
//-------------------------------------------------------------------------------------------


function LandscapeLayer(pos,data,data2) {
    this.pos = pos;
    this.data = data;
    this.data2 = data2;
}


//-------------------------------------------------------------------------------------------
//  PARTICLE
//-------------------------------------------------------------------------------------------


function WaterParticle(pos,vector,size) {
    this.pos = pos;
    this.vector = vector;
    this.yOff = 0;
    this.size = size;
    this.alpha = tombola.rangeFloat(0,0.1);
}
WaterParticle.prototype.update = function(yOff) {
    this.pos.x += tombola.rangeFloat(0,this.vector.x);
    this.pos.y += tombola.rangeFloat(0,this.vector.y);

    this.alpha += tombola.rangeFloat(-0.015,0.015);
    this.alpha = valueInRange(this.alpha,0,0.23);

    this.yOff = lerp(this.yOff, yOff, 7);

    if (this.pos.x<0) {
        this.pos.x = width;
    }
    if (this.pos.x>width) {
        this.pos.x = 0;
    }
    if (this.pos.y<0) {
        this.pos.y = height;
    }
    if (this.pos.y>height) {
        this.pos.y = 0;
    }
};
WaterParticle.prototype.draw = function(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y + this.yOff, this.size * units, 0, TAU);
    ctx.closePath();
    ctx.fill();
};


function lerp(current,destination,speed) {
    return current + (((destination-current)/100) * speed);
}

function colourTo(col,r,g,b,a,t) {

    t = t || 1000;

    var cPos = {red: col.R, green: col.G, blue: col.B, alpha: col.A };

    var colTween = new TWEEN.Tween(cPos);
    colTween.to({ red: r, green: g, blue: b, alpha: a  }, t*1000);
    colTween.start();

    colTween.onUpdate(function() {
        col.R = this.red;
        col.G = this.green;
        col.B = this.blue;
        col.A = this.alpha;
    });

    colTween.easing( TWEEN.Easing.Quadratic.InOut );
}
