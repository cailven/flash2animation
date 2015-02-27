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
     * @module anim
    */
    var animJS = {
        _anims:[],
        /**
         * @method build 
         * @param {Object} cfg
         * @param {Object} cfg.data 导出的动画数据
         * @param {String} cfg.image 图片地址
         * @param {Container} cfg.container 动画的容器
         * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
         * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
         * @param {DisplayBridge} bridge 显示对象桥梁
        */
        build:function(cfg, bridge){
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
                    var elem = that.parseLayer(bridge, container, layers[i], image, data.texture, fps, time);
                    if(elem){
                        elems.push(elem);
                    }
                }
                
                var anim = {
                    display:container,
                    timeScale:1,
                    elems:elems,
                    tick:function(dt){
                        dt *= this.timeScale;
                        var elems = this.elems;
                        for(var i = this.elems.length - 1;i >= 0;i --){
                            elems[i].tick(dt);
                        }
                    }
                };

                if(cfg.container){
                    bridge.addDisplay(cfg.container, container);
                }
                this._anims.push(anim);
                return anim;
            }
        },
        /**
         * @method parseLayer
         * @param {Stage} container
         * @param {Object} layer 层数据
         * @param {String} image 图片地址
         * @param {Object} texture 图片数据
         * @param {Number} fps 帧频 
         * @param {Number} time 播放次数
        */
        parseLayer:function(bridge, container, layer, image, texture, fps, time){
            var frames = layer.frames;
            if(frames && frames.length && layer.image){
                for(var i = 0, l = frames.length; i < l;i ++){
                    frames[i].duration *= 1000/fps;
                }

                var imgRect = texture[layer.image];
                var display = bridge.createDisplay(image, [imgRect.x, imgRect.y, imgRect.w, imgRect.h]);
                bridge.addDisplay(container, display);

                var elem = {
                    _currentTime:0,
                    _currentIndex:-1,
                    display:display,
                    _render:function(data){
                        if(data){
                            bridge.renderDisplay(display, data);
                        }
                        else{
                            bridge.renderDisplay(display, zeroData);
                        }
                    },
                    tick:function(dt){
                        this._currentTime += dt;
                        if(this._currentTime >= this._currentFrame.duration){
                            this._currentTime = this._currentTime - this._currentFrame.duration;
                            this.gotoNextFrame();
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
                    gotoNextFrame:function(){
                        this._currentIndex ++;
                        if(this._currentIndex >= frames.length){
                            this._currentIndex = 0;
                        }
                        this._currentFrame = frames[this._currentIndex];
                        this._nextFrame = frames[this._currentIndex + 1];
                        this.tick(0);
                    }
                };
                elem.gotoNextFrame();
                return elem;
            }
            else{
                console.warn("no frames:" + layer.name);
            }
        },
        /**
         * 
         * @param {Number} dt 时间间隔，单位毫秒
        */
        tick:function(dt){
            var anims = this._anims;
            for(var i = anims.length - 1;i >= 0;i --){
                anims[i].tick(dt);
            }
        }
    };

    window.Anim = window.Anim || {};
    Anim.js = animJS;
})();