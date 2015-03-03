;(function(){
    var ua = navigator.userAgent;
    var cssVendor = /webkit/i.test(ua)?"webkit":/firefox/i.test(ua)?"Moz":/msie/i.test(ua)?"ms":/opera/i.test(ua)?"O":"webkit";

    /**
     * displayBridge
     * 显示对象桥梁，可以重写适配不同的渲染库
    */
    var displayBridge = {
        /**
         * 生成容器
         * @param {Number} width
         * @param {Number} height
        */
        createContainer:function(width, height){
            var container = document.createElement("div");
            container.style.width = width + "px";
            container.style.height = height + "px";
            container.style.position = "relative";
            container.style.overflow = "hidden";
            container.className = "flashAnimContainer";
            return container;
        },
        /**
         * 生成显示对象
         * @param {Image} image 图片
         * @param {Array} rect 图片区域, 格式:[x, y, width, height]
        */
        createDisplay:function(image, rect){
            var display = document.createElement("div");
            var style = display.style;
            style.width = rect[2] + "px";
            style.height = rect[3] + "px";
            style.background = "url(" + image.src + ") no-repeat";
            style.backgroundPosition = "-" + rect[0] + "px -" + rect[1] + "px";
            style.position = "absolute";
            style.left = "0px";
            style.top = "0px";
            return display;
        },
        /**
         * 将显示对象加到容器中
         * @param {Container} container
         * @param {Display} display
         * @param {Number} index 层级，0为最下层，默认加到最上层
        */
        addDisplay:function(container, display, index){
            if(index === undefined){
                index = container.children?container.children.length:0;
            }
            display.style.zIndex = index;
            container.appendChild(display);
        },
        /**
         * 渲染显示对象
         * @param {Display} display
         * @param {Object} data 显示对象属性
         * @param {Number} data.x x位移
         * @param {Number} data.y y位移
         * @param {Number} data.originX 中心点x
         * @param {Number} data.originY 中心点y
         * @param {Number} data.scaleX x方向缩放
         * @param {Number} data.scaleY y方向缩放
         * @param {Number} data.rotation 角度，角度制
         * @param {Number} data.alpha 范围0-100, 0为完全透明, 100完全不透明
        */
        renderDisplay:function(display, data){
            var style = display.style;
            style[cssVendor + "TransformOrigin"] = display.originX + "px " + display.originY + "px";
            style.opacity = data.alpha * .01;
            style[cssVendor + "Transform"] = 
            "translate3d(" + (data.x - data.originX) + "px," + (data.y - data.originY) + "px,0px) " + 
            "rotate3d(0,0,1," + data.rotation + "deg) " + 
            "scale3d(" + data.scaleX + "," + data.scaleY + ",1" + ")";
        }
    };
    window.Anim = window.Anim||{};
    Anim.domBridge = displayBridge;
})();