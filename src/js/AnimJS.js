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