;(function(){
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
     * @class AnimJS
     * @property {Array} elems 元素
     * @property {Number} timeScale 时间缩放
     * @property {display} display 显示容器
     * @property {Boolean} _isPlay 是否播放
    */
    function AnimJS(data){
        this.elems = data.elems||[];
        this.timeScale = data.timeScale||1;
        this.display = data.display;
        this._isPlay = false;

        this._elemDict = {};
        for(var i = 0, l = this.elems.length;i < l;i ++){
            this._elemDict[this.elems[i].name] = this.elems[i];
        }
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
                var elems = this.elems;
                for(var i = this.elems.length - 1;i >= 0;i --){
                    elems[i].tick(dt);
                }
            }
        },
        /**
         * 跳转到第几帧播放
         * @param {Number} frameNum 跳转的帧数，默认第0帧
        */
        play:function(frameNum){
            this._gotoFrame(frameNum);
            this._isPlay = true;
        },
        /**
         * 跳转到第几帧停止
         * @param {Number} frameNum 跳转的帧数，默认第0帧
        */
        stop:function(frameNum){
            this._gotoFrame(frameNum);
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
         * 跳转到第几帧
         * @param {Number} frameNum 跳转的帧数，默认第0帧
        */
        _gotoFrame:function(frameNum){
            frameNum = frameNum || 0;
            for(var i = this.elems.length - 1;i >= 0;i --){
                this.elems[i].gotoFrame(frameNum);
            }
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
     * @param {DisplayBridge} bridge 显示对象桥梁
     * @return {AnimJS}
    */
    AnimJS.build = function(cfg, bridge){
        var that = this;
        var data = cfg.data;
        var image = new Image();
        image.src = cfg.image;
        if(data){
            var fps = cfg.fps||data.stage.fps;
            var time = cfg.time||0;

            var container = bridge.createContainer(data.stage.width, data.stage.height);
            var elems = [];
            var layers = data.layers;
            for(var i = layers.length - 1;i >= 0;i --){
                var elem = that._parseLayer(bridge, container, layers[i], image, data.texture, fps, time);
                if(elem){
                    elems.push(elem);
                }
            }
            
            var anim = new AnimJS({
                timeScale:1,
                display:container,
                elems:elems
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
     * @param {Number} fps 帧频 
     * @param {Number} time 播放次数
    */
    AnimJS._parseLayer = function(bridge, container, layer, image, texture, fps, time){
        var frames = layer.frames;
        if(frames && frames.length && layer.image){
            var t = 0;
            var frameTime = 1000/fps;
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
            elem.initNextFrame();
            return elem;
        }
        else{
            console.warn("no frames:" + layer.name);
        }
    };

    /**
     * @property {Bridge} bridge
     * @property {Display} display
     * @property {Array} frames
     * @property {Number} frameTime
     * @property {Object} layer
     * @property {String} name
     * @param {Object} data
    */
    function AnimElem(data){
        this._currentTime = 0;
        this._currentIndex = -1;
        this.bridge = data.bridge;
        this.display = data.display;
        this.frames = data.frames;
        this.layer = data.layer;
        this.frameTime = data.frameTime;
        this.name = data.name;
    }

    AnimElem.prototype = {
        constructor:AnimElem,
        /**
         * @param {Object} data
        */
        _render:function(data){
            if(data){
                this.bridge.renderDisplay(this.display, data);
            }
            else{
                this.bridge.renderDisplay(this.display, zeroData);
            }
        },
        /**
         * @param {Number} dt
        */
        tick:function(dt){
            this._currentTime += dt;
            if(this._currentTime >= this._currentFrame.duration){
                this._currentTime = this._currentTime - this._currentFrame.duration;
                this.initNextFrame();
                return;
            }

            if(this._currentFrame.tween && this._nextFrame && this._nextFrame.elem){
                var t = this._currentTime/this._currentFrame.duration;
                var deltaData = {};
                for(var i in this._currentFrame.elem){
                    deltaData[i] = this._currentFrame.elem[i] + t * (this._nextFrame.elem[i] - this._currentFrame.elem[i]);
                }
                this._render(deltaData);
            }
            else{
                this._render(this._currentFrame.elem);
            }
        },
        /**
         * 跳转到某帧
         * @param {Number} frameNum
        */
        gotoFrame:function(frameNum){
            var frames = this.frames;
            var startTime = frameNum * this.frameTime;
            for(var i = 0, l = frames.length;i < l;i ++){
                var frame = frames[i];
                if(frame.endTime > startTime){
                    this._currentIndex = i - 1;
                    this._currentTime = startTime - frame.startTime;
                    this.initNextFrame();
                    return true;
                }
            }
            console.warn("no frameNum:" + this.layer.name + "->" +  frameNum);
        },
        /**
         * 初始化下一帧
        */
        initNextFrame:function(){
            var frames = this.frames;
            this._currentIndex ++;
            if(this._currentIndex >= frames.length){
                this._currentIndex = 0;
            }
            this._currentFrame = frames[this._currentIndex];
            this._nextFrame = frames[this._currentIndex + 1];
            this.tick(0);
        }
    };

    window.Anim = window.Anim || {};
    Anim.js = AnimJS;
})();