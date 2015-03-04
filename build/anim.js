(function(window, undefined){


/**
 * @module Anim
 */
var Anim = {
    merge:function(to, from){
        for(var i in from){
            to[i] = from[i];
        }
    }
}
window.Anim = Anim;

})(this);

(function(window, undefined){

var Anim = window.Anim;

/**
 * @module Anim/EventMix
 * @requires Anim
*/
var EventMix = {
    /**
     * 监听事件
     * @param {String} type 事件类型
     * @param {Function} listener
    */
    on:function(type, listener){
        this._listener = this._listener||{};
        this._listener[type] = this._listener[type]||[];
        this._listener[type].push(listener);
    },
    /**
     * 触发事件
     * @param {String} type 事件类型
     * @param {Object} data 
    */
    fire:function(type, data){
        this._listener = this._listener||{};
        var listeners = this._listener[type];
        if(listeners && listeners.length){
            listeners = listeners.slice();
            for(var i = 0, l = listeners.length;i < l;i ++){
                var e = {
                    target:this,
                    type:type
                };
                Anim.merge(e, data||{});
                listeners[i] && listeners[i].call(this, e);
            }
        }
    },
    /**
     * 取消监听
     * @param {String} type 要删除的事件类型, 若不填删除所有事件监听
     * @param {Function} listener 要删除的事件回调函数，若不填删除该类型所有事件监听
    */
    off:function(type, listener){
        if(!type){
            this._listener = {};
        }

        this._listener = this._listener||{};
        var listeners = this._listener[type];
        if(listeners){
            if(listener){
                var index = listeners.indexOf(listener);
                if(index > -1){
                    listeners.splice(index, 1);
                }
            }
            else{
                delete this._listener[type];
            }
        }
    }
};
Anim.EventMix = EventMix;

})(this);

(function(window, undefined){


var animID = 0;
var baseStyleID = "baseAnimStyle";
/**
 * @module Anim/AnimCSS
*/
var AnimCSS = {
    /**
     * @method build 
     * @param {Object} cfg
     * @param {Object} cfg.data 导出的动画数据
     * @param {String} cfg.image 图片地址
     * @param {HTMLElement} cfg.container 动画的容器，默认为document.body
     * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
     * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
    */
    build:function(cfg){
        var that = this;
        var data = cfg.data;
        var image = cfg.image;
        var elems = [];
        if(data && image){
            var container = cfg.container||document.body;
            var fps = cfg.fps||data.stage.fps;
            var time = cfg.time||"infinite";

            var animContainer = document.createElement("div");
            animContainer.className = "flashAnimContainer";
            animContainer.style.position = "relative";
            animContainer.style.width = cfg.data.stage.width + "px";
            animContainer.style.height = cfg.data.stage.height + "px";
            animContainer.style.overflow = "hidden";
            container.appendChild(animContainer);

            data.layers.forEach(function(layer, index){
                var elem = that._parseLayer(animContainer, layer, image, index, data.texture, fps, time);
                if(elem){
                    elems.push(elem);
                }   
            });
        }

        var baseStyleElem = document.getElementById(baseStyleID);
        if(!baseStyleElem){
            this.createStyle(' \
                .flashAnim{ \
                    position:absolute; \
                    left:0px; \
                    top:0px; \
                    -webkit-animation-fill-mode: both !important; \
                    -Moz-animation-fill-mode: both !important; \
                    animation-fill-mode: both !important; \
                } \
            ', baseStyleID);
        }

        return {
            play:function(){
                elems.forEach(function(elem){
                    var animName = elem.getAttribute("data-anim");
                    elem.className = "flashAnim";
                    setTimeout(function(){
                        elem.className = animName + " flashAnim"
                    }, 100);
                    elem.style[that.getCSSVendor() + "AnimationPlayState"] = "running";
                });
            },
            stop:function(){
                elems.forEach(function(elem){
                    var animName = elem.getAttribute("data-anim");
                    elem.className = "flashAnim";
                    setTimeout(function(){
                        elem.className = animName + " flashAnim"
                    }, 100);
                    elem.style[that.getCSSVendor() + "AnimationPlayState"] = "paused";
                });
            },
            pause:function(){
                elems.forEach(function(elem){
                    elem.style[that.getCSSVendor() + "AnimationPlayState"] = "paused";
                });
            },
            resume:function(){
                elems.forEach(function(elem){
                    elem.style[that.getCSSVendor() + "AnimationPlayState"] = "running";
                });
            }
        }
    },
    /**
     * @method _parseLayer
     * @param {HTMLElement} container
     * @param {Object} layerData 层数据
     * @param {String} image 图片地址
     * @param {Number} index 层级
     * @param {Object} texture 图片数据
     * @param {Number} fps 帧频 
     * @param {Number} time 播放次数
    */
    _parseLayer:function(container, layerData, image, index, texture, fps, time){
        var that = this;
        var cssVendor = that.getCSSVendor();
        var frames = layerData.frames;
        if(!frames || frames.length == 0){
            console.warn("no frames:", layerData.name);
            return;
        }

        var duration = frames.reduce(function(item, next){
            return {
                duration:item.duration + next.duration
            }
        }).duration;

        var styles = [];
        var t = 0;
        var r = 0;
        var lastStyle;
        var imgData = texture[layerData.image];
        if(!imgData){
            console.warn("no image data! ","layerName:"+ layerData.name, " imageName:"+layerData.image);
            return;
        }

        frames.forEach(function(frame, i){
            var timingCss = "";
            var useStep = false;
            if(useStep){
                timingCss = "-" + cssVendor + "-animation-timing-function:step-end;\n";
            }
            else if(lastStyle && !lastStyle.tween){
                lastStyle.num = t/duration*100 - .0001;
                styles.push(lastStyle);
            };

            var elem = frame.elem;
            if(elem){            
                styles.push({
                    x:elem.x - elem.originX,
                    y:elem.y - elem.originY,
                    scaleX:elem.scaleX,
                    scaleY:elem.scaleY,
                    rotation:elem.rotation,
                    originX:elem.originX,
                    originY:elem.originY,
                    tween:frame.tween,
                    num:t/duration*100,
                    alpha:elem.alpha * .01,
                    timing:frame.tween?"":timingCss
                });
            }
            else{
                styles.push({
                    num:t/duration*100,
                    scaleX:1,
                    scaleY:1,
                    alpha:0,
                    rotation:0,
                    x:0,
                    y:0,
                    originX:0,
                    originY:0,
                    tween:false,
                    timing:timingCss
                });
            }

            lastStyle = that.merge({}, styles[styles.length-1]);
            t+=frame.duration;
        });

        var endStyle = that.merge({}, styles[styles.length-1]);
        endStyle.num = 100;
        endStyle.timing = "";
        styles.push(endStyle);
        
        var elemData = {
            width:imgData.w,
            height:imgData.h,
            imgX:imgData.x,
            imgY:imgData.y,
            index:100-index,
            duration:duration/fps,
            image:image
        };
        var animName = layerData.name + (animID++);
        that.addStyle(styles, elemData, animName, time);
        var elem = document.createElement("div");
        elem.className = animName + " flashAnim";   
        elem.setAttribute("data-anim", animName);  
        elem.setAttribute("data-layer", layerData.name);       
        container.appendChild(elem);

        return elem;
    },
    /**
     * @method addStyle
     * @param {Array} styles
     * @param {Object} elemData
     * @param {String} animName
    */
    addStyle:function(styles, elemData, animName, time){
        var that = this;
        var cssVendor = that.getCSSVendor();
        var keyTpl = '\n\
            @-{cssVendor}-keyframes {anim}{\n\
            {content}\n\
            }\n\
            .{anim}{\n\
                width:{width}px;\n\
                height:{height}px;\n\
                background:url({image}) no-repeat;\n\
                background-position:-{imgX}px -{imgY}px;\n\
                z-index:{index};\n\
                -{cssVendor}-animation:{anim} {duration}s linear 0s {time};\n\
            }\n\
            ';

        var percentTpl = '\
            {num}% {\n\
                opacity:{alpha};\n\
                -{cssVendor}-transform:translate3d({x}px, {y}px, 0px) rotateZ({rotation}deg) scale3d({scaleX}, {scaleY}, 1);\n\
                -{cssVendor}-transform-origin:{originX}px {originY}px;\n\
                {timing}\
            }\n';

        var content = "";
        styles.forEach(function(s){
            s.cssVendor = cssVendor;
            content += that.renderTpl(percentTpl, s);
        });
        var style = that.renderTpl(keyTpl, that.merge({
            time:time,
            anim:animName,
            content:content,
            cssVendor:cssVendor
        },elemData));

        this.createStyle(style, "flashAnimStyle_" + animName);
    },
    createStyle:function(content, id){
        var styleElem = document.createElement("style");
        styleElem.innerHTML = content;
        styleElem.id = id;
        document.getElementsByTagName("head")[0].appendChild(styleElem);
    },
    /**
     * @method 获取css前缀
    */
    getCSSVendor:function(){
        if(this._cssVendor){
            return this._cssVendor;
        }
        var userAgent = navigator.userAgent;
        this._cssVendor = /webkit/i.test(userAgent)?"webkit":/firefox/i.test(userAgent)?"Moz":/msie/i.test(userAgent)?"ms":/opera/i.test(userAgent)?"O":"webkit";
        return this._cssVendor;
    },
    /**
     * @method merge
     * @param {Object} to
     * @param {Object} from
    */
    merge:function(to, from){
        for(var i in from){
            to[i] = from[i];
        }
        return to;
    },
    /**
     * @method renderTpl 替换模板
     * @param {String} tpl
     * @param {Object} data
    */
    renderTpl:function(tpl, data){
        data = data||{};
        for(var i in data){
            var reg = new RegExp("{" + i + "}", "g");
            tpl = tpl.replace(reg, data[i]);
        }
        return tpl;
    }
};
Anim.AnimCSS = AnimCSS;

})(this);

(function(window, undefined){

var Anim = window.Anim;
var EventMix = Anim.EventMix;

var zeroData = {
    alpha:0,
    scaleX:1,
    scaleY:1,
    x:0,
    y:0,
    rotation:0,
    originX:0,
    originY:0
}; 

/**
 * @module Anim/AnimElem
 * @requires Anim
 * @requires Anim/EventMix
 * @property {Bridge} bridge
 * @property {Display} display
 * @property {Array} frames
 * @property {Number} frameTime
 * @property {Object} layer
 * @property {String} name
 * @param {Object} data
*/
function AnimElem(data){
    this._diaplayData = null;
    this._currentTime = 0;
    this._currentIndex = 0;
    this.bridge = data.bridge;
    this.display = data.display;
    this.frames = data.frames;
    this.layer = data.layer;
    this.frameTime = data.frameTime;
    this.name = data.name;

    Anim.merge(this, EventMix);
}

AnimElem.prototype = {
    constructor:AnimElem,
    /**
     * @param {Object} data
    */
    _renderDisplay:function(data){
        if(this._diaplayData !== data){
            this._diaplayData = data;
            if(data){
                this.bridge.renderDisplay(this.display, data);
            }
            else{
                this.bridge.renderDisplay(this.display, zeroData);
            }
        }
    },
    /**
     * 跳转到某时间
     * @param  {Number} time 时间，单位毫秒
     */
    gotoTime:function(time){
        var frames = this.frames;
        var index, deltaTime, currentFrame, nextFrame;
        
        if(time >= this._currentTime){
            index = this._currentIndex;
        }
        else{
            index = 0;
        }
        this._currentTime = time;

        for(var i = index, l = frames.length;i < l;i ++){
            var frame = frames[i];
            if(time <= frame.endTime){
                deltaTime = time - frame.startTime;
                currentFrame = frame;
                nextFrame = frames[i + 1];
                this._currentIndex = i;
                break;
            } 
        }
       
        if(currentFrame.tween && nextFrame && nextFrame.elem){
            var t = deltaTime/currentFrame.duration;
            var deltaData = {};
            for(var i in currentFrame.elem){
                deltaData[i] = currentFrame.elem[i] + t * (nextFrame.elem[i] - currentFrame.elem[i]);
            }
            this._renderDisplay(deltaData);
        }
        else{
            this._renderDisplay(currentFrame.elem);
        }
    },
    /**
     * 跳转到某帧
     * @param {Number} frameNum
    */
    gotoFrame:function(frameNum){
        this.gotoTime(frameNum * this.frameTime);
    },
    /**
     * 获取总时间
    */
    getTotalTime:function(){
        return this.frames[this.frames.length - 1].endTime;
    }
};
Anim.AnimElem = AnimElem;

})(this);

(function(window, undefined){

var Anim = window.Anim;
var EventMix = Anim.EventMix;
var AnimElem = Anim.AnimElem;

/**
 * @module Anim/AnimJS
 * @requires Anim
 * @requires Anim/EventMix
 * @requires Anim/AnimElem
 * @class AnimJS
 * @property {Array} elems 元素
 * @property {Number} timeScale 时间缩放
 * @property {display} display 显示容器
 * @property {Boolean} _isPlay 是否播放
*/
function AnimJS(data){
    var that = this;

    this.elems = data.elems||[];
    this.time = data.time;
    this.frameTime = data.frameTime;
    this.timeScale = data.timeScale||1;
    this.display = data.display;
    this._isPlay = false;
    
    this._elemDict = {};
    for(var i = 0, l = this.elems.length;i < l;i ++){
        this._elemDict[this.elems[i].name] = this.elems[i];
    }

    Anim.merge(this, EventMix);

    this._currentTime = 0;
    this._totalTime = this.elems[0].getTotalTime();
}

AnimJS.prototype = {
    constructor:AnimJS,
    /**
     * 需每帧调用
     * @param {Number} dt 
    */
    tick:function(dt){
        if(this._isPlay){
            dt *= this.timeScale;
            
            var time = this._currentTime;
            time += dt;
            if(time > this._totalTime){
                this.fire("animationEnd");
                this.time --;
                if(this.time <= 0){
                    this.pause();
                }
                else{
                    time = this._totalTime - time;
                }
            }

            this.gotoTime(time);
        }
    },
    /**
     * 跳转到第几帧播放
     * @param {Number} frameNum 跳转的帧数，默认第0帧
     * @param {Number} time 播放几次，0为无数次，默认无数次
    */
    play:function(frameNum, time){
        this.gotoFrame(frameNum);
        this._isPlay = true;
        if(this.time !== undefined){
            this.time = time||Infinity;
        }
    },
    /**
     * 跳转到第几帧停止
     * @param {Number} frameNum 跳转的帧数，默认第0帧
    */
    stop:function(frameNum){
        this.gotoFrame(frameNum);
        this._isPlay = false;
    },
    /**
     * 暂停
    */
    pause:function(){
        this._isPlay = false;
    },
    /**
     * 恢复
    */
    resume:function(){
        this._isPlay = true;
    },
    /**
     * 获取某个元素
     * @param {String} name
     * @return {AnimElem} 
    */
    getElem:function(name){
        return this._elemDict[name];
    },
    /**
     * 跳转到某时间
     * @param  {Number} time 时间，单位毫秒，默认第0秒
     */
    gotoTime:function(time){
        var time = time||0;
        if(time > this._totalTime){
            time = this._totalTime;
        }
        this._currentTime = time;
        
        var elems = this.elems;
        for(var i = this.elems.length - 1;i >= 0;i --){
            elems[i].gotoTime(time);
        }
    },
    /**
     * 跳转到第几帧
     * @param {Number} frameNum 跳转的帧数，默认第0帧
    */
    gotoFrame:function(frameNum){
        frameNum = frameNum||0;
        this.gotoTime(frameNum * this.frameTime)
    }
};

AnimJS._anims = [];

/**
 * @method build 
 * @param {Object} cfg
 * @param {Object} cfg.data 导出的动画数据
 * @param {String} cfg.image 图片地址
 * @param {Container} cfg.container 动画的容器
 * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
 * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
 * @param {DisplayBridge} bridge 显示对象桥梁，默认是domBridge
 * @return {AnimJS}
*/
AnimJS.build = function(cfg, bridge){
    var that = this;
    var data = cfg.data;
    var image = new Image();
    image.src = cfg.image;
    bridge = bridge||Anim.domBridge;
    if(data){
        var fps = cfg.fps||data.stage.fps;
        var frameTime = 1000/fps;
        var time = cfg.time||Infinity;

        var container = bridge.createContainer(data.stage.width, data.stage.height);
        var elems = [];
        var layers = data.layers;
        for(var i = layers.length - 1;i >= 0;i --){
            var elem = that._parseLayer(bridge, container, layers[i], image, data.texture, frameTime);
            if(elem){
                elems.push(elem);
            }
        }
        
        var anim = new AnimJS({
            timeScale:1,
            display:container,
            elems:elems,
            time:time,
            frameTime:frameTime
        });

        if(cfg.container){
            bridge.addDisplay(cfg.container, container);
        }
        this._anims.push(anim);
        return anim;
    }
};

/**
 * 
 * @param {Number} dt 时间间隔，单位毫秒
*/
AnimJS.tick = function(dt){
    var anims = this._anims;
    for(var i = anims.length - 1;i >= 0;i --){
        anims[i].tick(dt);
    }
};

/**
 * @method _parseLayer
 * @param {DisplayBridge} bridge
 * @param {Stage} container
 * @param {Object} layer 层数据
 * @param {String} image 图片地址
 * @param {Object} texture 图片数据
 * @param {Number} frameTime 每帧时间，单位毫秒 
 * @param {Number} time 播放次数
*/
AnimJS._parseLayer = function(bridge, container, layer, image, texture, frameTime, time){
    var frames = layer.frames;
    if(frames && frames.length && layer.image){
        var t = 0;
        for(var i = 0, l = frames.length; i < l;i ++){
            frames[i].duration *= frameTime;
            frames[i].startTime = t;
            t += frames[i].duration;
            frames[i].endTime = t;
        }

        var imgRect = texture[layer.image];
        var display = bridge.createDisplay(image, [imgRect.x, imgRect.y, imgRect.w, imgRect.h]);
        bridge.addDisplay(container, display);

        var elem = new AnimElem({
            bridge:bridge,
            display:display,
            frames:frames,
            layer:layer,
            frameTime:frameTime,
            name:layer.name
        });
        elem.gotoTime(0);
        return elem;
    }
    else{
        console.warn("no frames:" + layer.name);
    }
};
Anim.AnimJS = AnimJS;

})(this);

(function(window, undefined){

var Anim = window.Anim;

var ua = navigator.userAgent;
var cssVendor = /webkit/i.test(ua)?"webkit":/firefox/i.test(ua)?"Moz":/msie/i.test(ua)?"ms":/opera/i.test(ua)?"O":"webkit";

/**
 * @module Anim/domBridge
 * @requires Anim
 * 显示对象桥梁，可以重写适配不同的渲染库
*/
var domBridge = {
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
        style[cssVendor + "TransformOrigin"] = data.originX + "px " + data.originY + "px";
        style.opacity = data.alpha * .01;
        style[cssVendor + "Transform"] = 
        "translate3d(" + (data.x - data.originX) + "px," + (data.y - data.originY) + "px,0px) " + 
        "rotate3d(0,0,1," + data.rotation + "deg) " + 
        "scale3d(" + data.scaleX + "," + data.scaleY + ",1" + ")";
    }
};
Anim.domBridge = domBridge;

})(this);
