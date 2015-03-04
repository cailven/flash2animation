/**
 * @module Anim/hiloBridge
 * @requires Anim
 * 显示对象桥梁，可以重写适配不同的渲染库
*/
var hiloBridge = {
    /**
     * 生成容器
     * @param {Number} width
     * @param {Number} height
    */
    createContainer:function(width, height){
        var container = new Hilo.Container({
            width:width,
            height:height
        });
        return container;
    },
    /**
     * 生成显示对象
     * @param {Image} image 图片
     * @param {Array} rect 图片区域, 格式:[x, y, width, height]
    */
    createDisplay:function(image, rect){
        var display = new Hilo.Bitmap({
            image:image,
            rect:rect
        });
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
            index = container.children.length;
        }
        container.addChildAt(display, index);
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
        display.x = data.x;
        display.y = data.y;
        display.scaleX = data.scaleX;
        display.scaleY = data.scaleY;
        display.pivotX = data.originX;
        display.pivotY = data.originY;
        display.rotation = data.rotation;
        display.alpha = data.alpha * 0.01;
    }
};