var matrix = (function(){
    var RAD2DEG = 180/Math.PI;
    var matrix = {
        getScaleX:function(m){
            return Math.sqrt(m.a * m.a + m.b * m.b);
        },
        getScaleY:function(m){
            return Math.sqrt(m.c * m.c + m.d * m.d);
        },
        getRotation:function(m){
            return -Math.atan2(m.c, m.d) * RAD2DEG;
        },
        getOrigin:function(m, transformX, transformY){
            var x = transformX - m.tx;
            var y = transformY - m.ty;
            var originY = (m.a*y - m.b * x)/(m.a*m.d - m.c*m.b);
            var originX = (x - m.c * originY)/m.a;
            return {
                x:originX,
                y:originY
            }
        }
    };

    return matrix;
})();